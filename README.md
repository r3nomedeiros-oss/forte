# 🚀 Projeto Full-Stack - React + FastAPI + Supabase

Aplicação Full-Stack moderna com React no frontend, FastAPI no backend e Supabase (PostgreSQL) como banco de dados.

## 📊 Arquitetura

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │─────▶│    Backend      │─────▶│   Supabase      │
│   (React)       │      │   (FastAPI)     │      │  (PostgreSQL)   │
│   Vercel        │      │   Railway       │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- ⚛️ React 19
- 🎨 Tailwind CSS
- 🎭 shadcn/ui components
- 🔄 React Router
- 📡 Axios

### Backend
- ⚡ FastAPI
- 🐍 Python 3.11
- 🗄️ Supabase (PostgreSQL)
- 🔐 Pydantic v2

### Database
- 🗄️ Supabase (PostgreSQL)
- 🔒 Row Level Security (RLS)

## 🚀 Deploy Rápido

### Opção 1: Frontend + Backend Separados (Recomendado)

**1. Criar tabela no Supabase:**
```sql
-- Acesse: https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor
-- SQL Editor → Cole e execute:

CREATE TABLE IF NOT EXISTS status_checks (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for status_checks" ON status_checks
    FOR ALL USING (true) WITH CHECK (true);
```

**2. Deploy Backend no Railway:**
- Acesse: https://railway.app
- New Project → Deploy from GitHub
- Selecione: `r3nomedeiros-oss/v2`
- Configure:
  - Root Directory: `backend`
  - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
  - Variáveis:
    ```
    SUPABASE_URL=https://qmhldxyagakxeywkszkq.supabase.co
    SUPABASE_KEY=sbp_39477759ac6132b9b6604a530e2862071b09ef43
    CORS_ORIGINS=*
    ```

**3. Deploy Frontend no Vercel:**
- Acesse: https://vercel.com
- Import Project → `r3nomedeiros-oss/v2`
- Configure:
  - Framework: Create React App
  - Root Directory: `frontend`
  - Build: `yarn build`
  - Output: `build`
  - Variável: `REACT_APP_BACKEND_URL=<URL_DO_RAILWAY>`

**✅ Pronto!**

## 📖 Documentação Completa

- 📘 [Guia Completo de Deploy](./DEPLOY_GUIDE.md)
- ⚡ [Guia Rápido de Deploy](./DEPLOY_RAPIDO.md)

## 🧪 Desenvolvimento Local

### Pré-requisitos
- Node.js 18+
- Python 3.11+
- Yarn

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
```

### Frontend
```bash
cd frontend
yarn install
yarn start
```

## 📡 API Endpoints

### Base URL
- Local: `http://localhost:8001/api`
- Produção: `https://seu-app.railway.app/api`

### Rotas

**GET `/api/`**
```json
{
  "message": "Hello World"
}
```

**POST `/api/status`**
```json
// Request
{
  "client_name": "Nome do Cliente"
}

// Response
{
  "id": "uuid",
  "client_name": "Nome do Cliente",
  "timestamp": "2025-02-03T21:00:00Z"
}
```

**GET `/api/status`**
```json
[
  {
    "id": "uuid",
    "client_name": "Nome do Cliente",
    "timestamp": "2025-02-03T21:00:00Z"
  }
]
```

## 🧪 Testar API

```bash
# Hello World
curl http://localhost:8001/api/

# Criar status check
curl -X POST http://localhost:8001/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Teste Local"}'

# Listar todos
curl http://localhost:8001/api/status
```

## 🌐 URLs do Projeto

- **Supabase Dashboard:** https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq
- **Repositório:** https://github.com/r3nomedeiros-oss/v2

## 📦 Estrutura do Projeto

```
.
├── backend/
│   ├── server.py          # FastAPI app
│   ├── requirements.txt   # Python dependencies
│   ├── .env              # Environment variables
│   └── create_table.py   # SQL para criar tabela
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main component
│   │   ├── index.js      # Entry point
│   │   └── components/   # React components
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend env vars
├── vercel.json          # Vercel configuration
├── .vercelignore        # Files to ignore in Vercel
├── DEPLOY_GUIDE.md      # Guia completo
└── DEPLOY_RAPIDO.md     # Guia rápido
```

## 💰 Custos

- ✅ **Vercel:** Gratuito (100 GB/mês)
- ✅ **Railway:** $5 crédito/mês gratuito
- ✅ **Supabase:** Gratuito (500 MB database)

## 🆘 Suporte

Problemas com deploy? Consulte:
1. [Guia Completo](./DEPLOY_GUIDE.md) - Solução de problemas detalhada
2. [Guia Rápido](./DEPLOY_RAPIDO.md) - Checklist passo a passo

## 📄 Licença

MIT

---

**Desenvolvido com ❤️ usando React, FastAPI e Supabase**
# Force clean build 1770160786
