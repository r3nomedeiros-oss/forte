from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from datetime import datetime, date, time, timedelta
import uuid
from supabase import create_client
import bcrypt
import jwt
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'chave-secreta-producao-sacolas-2026')

# Supabase
supabase_url = os.environ.get('SUPABASE_URL', 'https://qmhldxyagakxeywkszkq.supabase.co')
supabase_key = os.environ.get('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaGxkeHlhZ2FreGV5d2tzemtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzY4NzYsImV4cCI6MjA4NTY1Mjg3Nn0.BZCpzK6eAR-AnorwIWvHbU_OHVBtwLnENYglwRJkJio')
supabase = create_client(supabase_url, supabase_key)

@app.route('/')
@app.route('/api')
@app.route('/api/')
def root():
    return jsonify({"message": "API de Controle de Produção - Sacolas", "status": "online"})

@app.route('/api/lancamentos', methods=['POST'])
def criar_lancamento():
    try:
        data = request.get_json()
        
        lancamento = {
            "id": str(uuid.uuid4()),
            "data": data['data'],
            "turno": data['turno'],
            "hora": data['hora'],
            "orelha_kg": float(data['orelha_kg'] or 0),
            "aparas_kg": float(data['aparas_kg'] or 0)
        }
        
        supabase.table("lancamentos").insert(lancamento).execute()
        lancamento_id = lancamento['id']
        
        itens = []
        for item in data['itens']:
            item_obj = {
                "id": str(uuid.uuid4()),
                "lancamento_id": lancamento_id,
                "formato": item['formato'],
                "cor": item['cor'],
                "pacote_kg": float(item['pacote_kg'] or 0),
                "producao_kg": float(item['producao_kg'] or 0)
            }
            itens.append(item_obj)
        
        if itens:
            supabase.table("itens_producao").insert(itens).execute()
        
        return jsonify({"success": True, "id": lancamento_id}), 201
    
    except Exception as e:
        print(f"Erro ao criar lançamento: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lancamentos', methods=['GET'])
def listar_lancamentos():
    try:
        # Otimização: buscar tudo de uma vez para evitar N+1 queries
        response = supabase.table("lancamentos").select("*").order("data", desc=True).order("hora", desc=True).execute()
        lancamentos = response.data
        
        if not lancamentos:
            return jsonify([])

        # Buscar todos os itens dos lançamentos listados
        lanc_ids = [l['id'] for l in lancamentos]
        itens_response = supabase.table("itens_producao").select("*").in_("lancamento_id", lanc_ids).execute()
        
        # Agrupar itens por lancamento_id
        itens_por_lanc = {}
        for item in itens_response.data:
            lid = item['lancamento_id']
            if lid not in itens_por_lanc:
                itens_por_lanc[lid] = []
            itens_por_lanc[lid].append(item)
            
        result = []
        for lanc in lancamentos:
            itens = itens_por_lanc.get(lanc['id'], [])
            
            producao_total = sum(float(item['producao_kg'] or 0) for item in itens)
            perdas_total = float(lanc['orelha_kg'] or 0) + float(lanc['aparas_kg'] or 0)
            percentual_perdas = (perdas_total / producao_total * 100) if producao_total > 0 else 0
            
            result.append({
                **lanc,
                'itens': itens,
                'producao_total': round(producao_total, 2),
                'perdas_total': round(perdas_total, 2),
                'percentual_perdas': round(percentual_perdas, 2)
            })
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Erro ao listar lançamentos: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lancamentos/<lancamento_id>', methods=['GET'])
def obter_lancamento(lancamento_id):
    try:
        response = supabase.table("lancamentos").select("*").eq("id", lancamento_id).execute()
        if not response.data:
            return jsonify({"error": "Lançamento não encontrado"}), 404
        
        lancamento = response.data[0]
        itens_response = supabase.table("itens_producao").select("*").eq("lancamento_id", lancamento_id).execute()
        lancamento['itens'] = itens_response.data
        return jsonify(lancamento)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/lancamentos/<lancamento_id>', methods=['PUT'])
def atualizar_lancamento(lancamento_id):
    try:
        data = request.get_json()
        
        lancamento_update = {
            "data": data['data'],
            "turno": data['turno'],
            "hora": data['hora'],
            "orelha_kg": float(data['orelha_kg'] or 0),
            "aparas_kg": float(data['aparas_kg'] or 0)
        }
        
        # Atualizar dados básicos
        supabase.table("lancamentos").update(lancamento_update).eq("id", lancamento_id).execute()
        
        # Deletar itens antigos e inserir novos (abordagem segura)
        supabase.table("itens_producao").delete().eq("lancamento_id", lancamento_id).execute()
        
        itens = []
        for item in data['itens']:
            item_obj = {
                "id": str(uuid.uuid4()),
                "lancamento_id": lancamento_id,
                "formato": item['formato'],
                "cor": item['cor'],
                "pacote_kg": float(item['pacote_kg'] or 0),
                "producao_kg": float(item['producao_kg'] or 0)
            }
            itens.append(item_obj)
        
        if itens:
            supabase.table("itens_producao").insert(itens).execute()
        
        return jsonify({"success": True})
    
    except Exception as e:
        print(f"Erro ao atualizar lançamento: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/lancamentos/<lancamento_id>', methods=['DELETE'])
def deletar_lancamento(lancamento_id):
    try:
        # Itens são deletados automaticamente se houver Cascade no banco, 
        # mas vamos deletar manualmente para garantir.
        supabase.table("itens_producao").delete().eq("lancamento_id", lancamento_id).execute()
        supabase.table("lancamentos").delete().eq("id", lancamento_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/relatorios', methods=['GET'])
def gerar_relatorio():
    try:
        periodo = request.args.get('periodo', 'mensal')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        hoje = datetime.now().date()
        
        if not data_inicio or not data_fim:
            if periodo == 'semanal':
                dias_desde_domingo = (hoje.weekday() + 1) % 7
                data_inicio = (hoje - timedelta(days=dias_desde_domingo)).isoformat()
                data_fim = (hoje + timedelta(days=(6 - dias_desde_domingo))).isoformat()
            elif periodo == 'mensal':
                data_inicio = hoje.replace(day=1).isoformat()
                if hoje.month == 12:
                    data_fim = hoje.replace(day=31).isoformat()
                else:
                    proximo_mes = hoje.replace(month=hoje.month + 1, day=1)
                    data_fim = (proximo_mes - timedelta(days=1)).isoformat()
            elif periodo == 'anual':
                data_inicio = hoje.replace(month=1, day=1).isoformat()
                data_fim = hoje.replace(month=12, day=31).isoformat()
        
        query = supabase.table("lancamentos").select("*")
        if data_inicio and data_fim:
            query = query.gte("data", data_inicio).lte("data", data_fim)
        
        response = query.execute()
        lancamentos = response.data
        
        if not lancamentos:
            return jsonify({
                "producao_total": 0, "perdas_total": 0, "percentual_perdas": 0,
                "dias_produzidos": 0, "media_diaria": 0, "data_inicio": data_inicio, "data_fim": data_fim,
                "por_turno": {
                    "A": {"producao": 0, "perdas": 0, "media_diaria": 0, "percentual_perdas": 0, "dias_produzidos": 0},
                    "B": {"producao": 0, "perdas": 0, "media_diaria": 0, "percentual_perdas": 0, "dias_produzidos": 0},
                    "Administrativo": {"producao": 0, "perdas": 0, "media_diaria": 0, "percentual_perdas": 0, "dias_produzidos": 0}
                }
            })
        
        lanc_ids = [l['id'] for l in lancamentos]
        itens_response = supabase.table("itens_producao").select("*").in_("lancamento_id", lanc_ids).execute()
        
        itens_dict = {}
        for item in itens_response.data:
            lid = item['lancamento_id']
            if lid not in itens_dict: itens_dict[lid] = []
            itens_dict[lid].append(item)
        
        producao_total = 0
        perdas_total = 0
        dias_unicos = set()
        stats_turno = {
            "A": {"prod": 0, "perd": 0, "dias": set()},
            "B": {"prod": 0, "perd": 0, "dias": set()},
            "Administrativo": {"prod": 0, "perd": 0, "dias": set()}
        }
        
        for lanc in lancamentos:
            itens = itens_dict.get(lanc['id'], [])
            prod_lanc = sum(float(item['producao_kg'] or 0) for item in itens)
            perd_lanc = float(lanc['orelha_kg'] or 0) + float(lanc['aparas_kg'] or 0)
            
            producao_total += prod_lanc
            perdas_total += perd_lanc
            dias_unicos.add(lanc['data'])
            
            t = lanc['turno']
            if t in stats_turno:
                stats_turno[t]["prod"] += prod_lanc
                stats_turno[t]["perd"] += perd_lanc
                stats_turno[t]["dias"].add(lanc['data'])
        
        dias_total = len(dias_unicos)
        
        relatorio = {
            "producao_total": round(producao_total, 2),
            "perdas_total": round(perdas_total, 2),
            "percentual_perdas": round((perdas_total / producao_total * 100) if producao_total > 0 else 0, 2),
            "dias_produzidos": dias_total,
            "media_diaria": round(producao_total / dias_total if dias_total > 0 else 0, 2),
            "data_inicio": data_inicio,
            "data_fim": data_fim,
            "por_turno": {
                t: {
                    "producao": round(s["prod"], 2),
                    "perdas": round(s["perd"], 2),
                    "dias_produzidos": len(s["dias"]),
                    "media_diaria": round(s["prod"] / len(s["dias"]) if s["dias"] else 0, 2),
                    "percentual_perdas": round((s["perd"] / s["prod"] * 100) if s["prod"] > 0 else 0, 2)
                } for t, s in stats_turno.items()
            }
        }
        return jsonify(relatorio)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== AUTENTICAÇÃO E USUÁRIOS ====================

@app.route('/api/auth/register', methods=['POST'])
def registrar_usuario():
    try:
        data = request.get_json()
        existing = supabase.table("users").select("*").eq("email", data['email']).execute()
        if existing.data:
            return jsonify({"error": "Email já cadastrado"}), 400
        
        hashed = bcrypt.hashpw(data['senha'].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        user = {
            "id": str(uuid.uuid4()),
            "nome": data['nome'],
            "email": data['email'],
            "senha": hashed,
            "tipo": data.get('tipo', 'Operador'),
            "created_at": datetime.now().isoformat()
        }
        supabase.table("users").insert(user).execute()
        return jsonify({"success": True}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        response = supabase.table("users").select("*").eq("email", data['email']).execute()
        if not response.data:
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        user = response.data[0]
        if bcrypt.checkpw(data['senha'].encode('utf-8'), user['senha'].encode('utf-8')):
            token = jwt.encode({
                'user_id': user['id'],
                'exp': datetime.utcnow() + timedelta(days=7)
            }, app.config['SECRET_KEY'])
            
            user_data = {k: v for k, v in user.items() if k != 'senha'}
            return jsonify({"token": token, "user": user_data})
        
        return jsonify({"error": "Senha incorreta"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users', methods=['GET'])
def listar_usuarios():
    try:
        response = supabase.table("users").select("*").order("created_at", desc=True).execute()
        users = [{k: v for k, v in u.items() if k != 'senha'} for u in response.data]
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/users/<user_id>', methods=['DELETE'])
def deletar_usuario(user_id):
    try:
        supabase.table("users").delete().eq("id", user_id).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Configurar headers para cache no cliente
@app.after_request
def add_cache_headers(response):
    if request.path.startswith('/api/lancamentos') or request.path.startswith('/api/relatorios'):
        response.headers['Cache-Control'] = 'public, max-age=60'
    return response

if __name__ == '__main__':
    app.run(debug=False, threaded=True)
