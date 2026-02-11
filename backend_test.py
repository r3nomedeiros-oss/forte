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

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
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

def main():
    print("🚀 Starting Production Control System API Tests")
    print("=" * 60)
    
    # Setup
    tester = ProductionControlAPITester()
    
    # Test basic connectivity
    print("\n📡 Testing Basic API Connectivity...")
    tester.test_root_endpoint()
    
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
    
    if tester.failed_tests:
        print(f"\n❌ FAILED TESTS:")
        for test in tester.failed_tests:
            error_msg = test.get('error', f"Status {test.get('actual')} (expected {test.get('expected')})")
            print(f"   - {test['test']}: {error_msg}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())