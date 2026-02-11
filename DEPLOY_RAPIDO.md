# 🚀 Guia Rápido de Deploy

## ✅ O que já está pronto:
- ✅ Código adaptado para Supabase (PostgreSQL)
- ✅ Backend usando FastAPI + Supabase
- ✅ Frontend React configurado
- ✅ Arquivos de configuração criados

---

## 📝 CHECKLIST DE DEPLOY

### 1️⃣ SUPABASE (Banco de Dados)
- [ ] Acessar: https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor
- [ ] Ir em "SQL Editor"
- [ ] Executar SQL (disponível em `/app/backend/create_table.py`)
- [ ] Confirmar que tabela `status_checks` foi criada

### 2️⃣ RAILWAY (Backend)
- [ ] Criar conta: https://railway.app
- [ ] Criar novo projeto → Deploy from GitHub
- [ ] Selecionar repositório: `r3nomedeiros-oss/v2`
- [ ] Configurar:
  - Root Directory: `backend`
  - Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- [ ] Adicionar variáveis:
  ```
  SUPABASE_URL=https://qmhldxyagakxeywkszkq.supabase.co
  SUPABASE_KEY=sbp_39477759ac6132b9b6604a530e2862071b09ef43
  CORS_ORIGINS=*
  ```
- [ ] Aguardar deploy
- [ ] Copiar URL do backend (ex: `https://xxx.railway.app`)

### 3️⃣ VERCEL (Frontend)
- [ ] Criar conta: https://vercel.com
- [ ] Import Project → Selecionar `r3nomedeiros-oss/v2`
- [ ] Configurar:
  - Framework: Create React App
  - Root Directory: `frontend`
  - Build Command: `yarn build`
  - Output Directory: `build`
- [ ] Adicionar variável de ambiente:
  ```
  REACT_APP_BACKEND_URL=<URL_DO_RAILWAY_AQUI>
  ```
- [ ] Deploy!

### 4️⃣ TESTAR
- [ ] Acessar URL do Vercel
- [ ] Abrir console do navegador (F12)
- [ ] Verificar mensagem "Hello World"
- [ ] Testar criação de status check

---

## 🔗 Links Úteis

**Supabase Dashboard:**
https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq

**Railway:**
https://railway.app

**Vercel:**
https://vercel.com/dashboard

**Repositório:**
https://github.com/r3nomedeiros-oss/v2

---

## 📞 Comandos para Teste

### Testar Backend (Railway):
```bash
# Hello World
curl https://SEU_BACKEND.railway.app/api/

# Criar status
curl -X POST https://SEU_BACKEND.railway.app/api/status \
  -H "Content-Type: application/json" \
  -d '{"client_name": "Teste"}'

# Listar status
curl https://SEU_BACKEND.railway.app/api/status
```

---

## 💡 Dicas

1. **Railway**: Primeiro deploy pode levar 3-5 minutos
2. **Vercel**: Deploy é muito rápido (1-2 minutos)
3. **Supabase**: Tabela precisa ser criada ANTES de usar as APIs
4. **Variáveis de ambiente**: Sempre use a URL do Railway no Vercel

---

## ⚠️ IMPORTANTE

Antes de fazer deploy no Vercel, certifique-se de:
1. ✅ Backend está rodando no Railway
2. ✅ Tabela foi criada no Supabase
3. ✅ URL do backend está correta

---

**Tudo pronto para deploy!** 🎉
