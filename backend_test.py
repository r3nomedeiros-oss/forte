import requests
import sys
from datetime import datetime

class ProductionControlAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_variable_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, variable_id=None):
        """Run a single API test"""
        if variable_id:
            url = f"{self.base_url}/{endpoint}/{variable_id}"
        else:
            url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "api/", 200)

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test GET status checks
        success1, _ = self.run_test("Get Status Checks", "GET", "api/status", 200)
        
        # Test POST status check
        test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
        success2, response = self.run_test("Create Status Check", "POST", "api/status", 200, test_data)
        
        return success1 and success2

    def test_auth_endpoints(self):
        """Test authentication endpoints (these should exist for login functionality)"""
        # Test login endpoint (this is what the frontend is trying to use)
        test_login_data = {
            "email": "test@example.com",
            "senha": "testpass123"
        }
        success1, _ = self.run_test("Login Endpoint", "POST", "api/auth/login", 200, test_login_data)
        
        # Test register endpoint
        test_register_data = {
            "nome": "Test User",
            "email": "newuser@example.com", 
            "senha": "testpass123",
            "tipo": "Operador"
        }
        success2, _ = self.run_test("Register Endpoint", "POST", "api/auth/register", 200, test_register_data)
        
        return success1 and success2

    def test_variables_endpoints(self):
        """Test variables management endpoints (turnos, formatos, cores)"""
        print("\n🏷️ Testing Variables Management Endpoints...")
        
        # Test GET /api/variaveis - List all variables (should work even if empty)
        success1, initial_vars = self.run_test("List Variables", "GET", "api/variaveis", 200)
        print(f"   Initial variables count: {len(initial_vars) if isinstance(initial_vars, list) else 0}")
        
        # Test POST /api/variaveis - Create variables
        test_variables = [
            {"tipo": "turno", "nome": "Manhã"},
            {"tipo": "formato", "nome": "30x40"},
            {"tipo": "cor", "nome": "Azul"}
        ]
        
        created_vars = []
        for var_data in test_variables:
            success, response = self.run_test(
                f"Create Variable - {var_data['tipo']}: {var_data['nome']}", 
                "POST", "api/variaveis", 201, var_data
            )
            if success and isinstance(response, dict) and 'id' in response:
                created_vars.append(response)
                self.created_variable_ids.append(response['id'])
            
        # Test duplicate creation (should fail with 400)
        if created_vars:
            duplicate_test = test_variables[0]  # Try to create "Manhã" again
            success_dup, _ = self.run_test(
                f"Create Duplicate Variable - {duplicate_test['tipo']}: {duplicate_test['nome']}", 
                "POST", "api/variaveis", 400, duplicate_test
            )
        else:
            success_dup = False
            self.tests_run += 1  # Count this as a test
            print(f"\n🔍 Testing Create Duplicate Variable...")
            print(f"❌ Failed - No variables were created to test duplicates")
            self.failed_tests.append({
                "test": "Create Duplicate Variable",
                "error": "No variables were created to test duplicates"
            })
            
        # Test GET /api/variaveis again - should now have new variables
        success2, updated_vars = self.run_test("List Variables After Creation", "GET", "api/variaveis", 200)
        
        # Verify we have the expected number of variables
        expected_count = len(initial_vars) + len(created_vars) if isinstance(initial_vars, list) else len(created_vars)
        actual_count = len(updated_vars) if isinstance(updated_vars, list) else 0
        
        if actual_count >= len(created_vars):  # At least the ones we created should be there
            print(f"✅ Variable count verification passed - Found {actual_count} variables")
            count_success = True
        else:
            print(f"❌ Variable count verification failed - Expected at least {len(created_vars)}, got {actual_count}")
            count_success = False
            self.failed_tests.append({
                "test": "Variable Count Verification",
                "expected": f"At least {len(created_vars)}",
                "actual": actual_count
            })
            
        # Test DELETE /api/variaveis/:id - Delete created variables
        delete_success = True
        for var in created_vars:
            if 'id' in var:
                success_del, _ = self.run_test(
                    f"Delete Variable - {var.get('nome', 'Unknown')}", 
                    "DELETE", "api/variaveis", 200, variable_id=var['id']
                )
                if not success_del:
                    delete_success = False
        
        # Final verification - check if variables were deleted
        success3, final_vars = self.run_test("List Variables After Deletion", "GET", "api/variaveis", 200)
        final_count = len(final_vars) if isinstance(final_vars, list) else 0
        
        # Should be back to original count (or close to it)
        if final_count <= len(initial_vars) + 1:  # Allow some tolerance
            print(f"✅ Deletion verification passed - Final count: {final_count}")
            delete_verify_success = True
        else:
            print(f"❌ Deletion verification failed - Expected ~{len(initial_vars)}, got {final_count}")
            delete_verify_success = False
            
        return success1 and len(created_vars) > 0 and success_dup and success2 and count_success and delete_success and success3 and delete_verify_success

def main():
    print("🚀 Starting Production Control System API Tests")
    print("=" * 60)
    
    # Setup
    tester = ProductionControlAPITester()
    
    # Test basic connectivity
    print("\n📡 Testing Basic API Connectivity...")
    tester.test_root_endpoint()
    
    # Test variables endpoints (PRIORITY TEST)
    print("\n🏷️ Testing Variables Management Endpoints...")
    variables_success = tester.test_variables_endpoints()
    
    # Test status endpoints
    print("\n📊 Testing Status Check Endpoints...")
    tester.test_status_endpoints()
    
    # Test auth endpoints (critical for login functionality)
    print("\n🔐 Testing Authentication Endpoints...")
    tester.test_auth_endpoints()
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Variables specific results
    if variables_success:
        print(f"\n✅ VARIABLES ENDPOINTS: ALL TESTS PASSED")
    else:
        print(f"\n❌ VARIABLES ENDPOINTS: TESTS FAILED")
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Status {test.get('actual')} (expected {test.get('expected')})")
            print(f"   - {test['test']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())