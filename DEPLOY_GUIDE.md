# 🚀 Guia Completo de Deploy - Opção 1

## Arquitetura do Deploy
- **Frontend (React)**: Vercel
- **Backend (FastAPI)**: Railway
- **Banco de Dados**: Supabase (PostgreSQL)

---

## 📋 PRÉ-REQUISITOS

### ✅ Já Configurado:
- ✅ Código adaptado para Supabase
- ✅ Variáveis de ambiente configuradas localmente
- ✅ Repositório: https://github.com/r3nomedeiros-oss/v2

### 🔧 Você Precisa:
1. Conta no Vercel (https://vercel.com)
2. Conta no Railway (https://railway.app)
3. Conta no Supabase (https://supabase.com) - **Já tem!**

---

## 🗄️ PASSO 1: Configurar Banco de Dados (Supabase)

### 1.1 Criar Tabela
1. Acesse: https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor
2. Clique em **"SQL Editor"** no menu lateral
3. Cole e execute este SQL:

```sql
-- Criar tabela status_checks
CREATE TABLE IF NOT EXISTS status_checks (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para buscar por timestamp
CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações
CREATE POLICY "Enable all access for status_checks" ON status_checks
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

4. Clique em **"RUN"** (F5)
5. ✅ Tabela criada!

---

## 🚂 PASSO 2: Deploy do Backend (Railway)

### 2.1 Criar Conta no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**

### 2.2 Conectar Repositório
1. Selecione **"Deploy from GitHub repo"**
2. Escolha: **r3nomedeiros-oss/v2**
3. Railway detectará automaticamente o projeto

### 2.3 Configurar o Backend
1. Após conectar, clique no serviço criado
2. Vá em **"Settings"**
3. Em **"Root Directory"**, configure: `backend`
4. Em **"Start Command"**, configure: `uvicorn server:app --host 0.0.0.0 --port $PORT`

### 2.4 Adicionar Variáveis de Ambiente
1. Vá em **"Variables"**
2. Adicione:
   ```
   SUPABASE_URL=https://qmhldxyagakxeywkszkq.supabase.co
   SUPABASE_KEY=sbp_39477759ac6132b9b6604a530e2862071b09ef43
   CORS_ORIGINS=*
   ```
3. Clique em **"Add"** para cada variável

### 2.5 Deploy
1. Railway fará deploy automaticamente
2. Aguarde 2-3 minutos
3. Após deploy, copie a **URL do backend** (ex: `https://seu-app.railway.app`)
4. ✅ Backend no ar!

### 2.6 Testar Backend
Abra no navegador: `https://seu-app.railway.app/api/`

Você deve ver: `{"message": "Hello World"}`

---

## 🌐 PASSO 3: Deploy do Frontend (Vercel)

### 3.1 Criar Conta no Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New..."** → **"Project"**

### 3.2 Importar Repositório
1. Selecione: **r3nomedeiros-oss/v2**
2. Clique em **"Import"**

### 3.3 Configurar Build
Na página de configuração:

**Framework Preset:** `Create React App`

**Root Directory:** `frontend`

**Build Command:** `yarn build`

**Output Directory:** `build`

**Install Command:** `yarn install`

### 3.4 Adicionar Variáveis de Ambiente
Em **"Environment Variables"**, adicione:

```
REACT_APP_BACKEND_URL=https://seu-app.railway.app
```

⚠️ **IMPORTANTE:** Substitua `https://seu-app.railway.app` pela URL real do Railway (Passo 2.5)

### 3.5 Deploy
1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. ✅ Frontend no ar!

---

## 🧪 PASSO 4: Testar a Aplicação

### 4.1 Testar API Backend
```bash
# Teste Hello World
curl https://seu-app.railway.app/api/

# Criar status check
curl -X POST https://seu-app.railway.app/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Teste"}'

# Listar status checks
curl https://seu-app.railway.app/api/status
```

### 4.2 Testar Frontend
1. Acesse a URL do Vercel (ex: `https://v2.vercel.app`)
2. Abra o Console do navegador (F12)
3. Verifique se aparece: `Hello World`
4. ✅ Tudo funcionando!

---

## 🔄 ATUALIZAÇÕES FUTURAS

### Para atualizar o Backend (Railway):
1. Faça commit e push no GitHub
2. Railway fará deploy automático

### Para atualizar o Frontend (Vercel):
1. Faça commit e push no GitHub
2. Vercel fará deploy automático

---

## 🆘 SOLUÇÃO DE PROBLEMAS

### Backend não inicia no Railway:
- Verifique se as variáveis de ambiente estão corretas
- Verifique logs no Railway Dashboard
- Certifique-se que a tabela foi criada no Supabase

### Frontend não conecta ao Backend:
- Verifique se `REACT_APP_BACKEND_URL` está correto no Vercel
- Certifique-se que a URL do Railway termina sem `/`
- Verifique CORS no backend

### Erro 404 nas rotas do Frontend:
- Certifique-se que `vercel.json` está na raiz do projeto
- Verifique configuração de rewrites

---

## 📊 RESUMO DAS URLS

Após deploy, você terá:

```
Frontend (Vercel):  https://v2-xxx.vercel.app
Backend (Railway):  https://seu-app.railway.app
Database (Supabase): https://qmhldxyagakxeywkszkq.supabase.co
```

---

## 💰 CUSTOS

- **Vercel**: Gratuito (até 100 GB bandwidth/mês)
- **Railway**: $5 de crédito grátis/mês (suficiente para hobby projects)
- **Supabase**: Gratuito (até 500 MB database, 2 GB bandwidth)

---

## 🎉 PRÓXIMOS PASSOS

1. ✅ Configure domínio customizado no Vercel (opcional)
2. ✅ Configure CI/CD com GitHub Actions (opcional)
3. ✅ Adicione testes automatizados
4. ✅ Configure monitoring (Sentry, LogRocket, etc)

---

**Dúvidas?** Entre em contato ou abra uma issue no repositório!
