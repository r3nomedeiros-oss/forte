# 🚀 DEPLOY - COMANDOS DIRETOS

## 1️⃣ CRIAR TABELA NO SUPABASE

Acesse: https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor

Clique em "SQL Editor" e execute:

```sql
CREATE TABLE IF NOT EXISTS status_checks (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for status_checks" ON status_checks;
CREATE POLICY "Enable all access for status_checks" ON status_checks FOR ALL USING (true) WITH CHECK (true);
```

---

## 2️⃣ DEPLOY BACKEND (RAILWAY)

**URL:** https://railway.app

**Passos:**
1. Login com GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Selecione: `r3nomedeiros-oss/v2`

**Settings:**
- Root Directory: `backend`
- Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`

**Variables (aba Variables):**
```
SUPABASE_URL=https://qmhldxyagakxeywkszkq.supabase.co
SUPABASE_KEY=sbp_39477759ac6132b9b6604a530e2862071b09ef43
CORS_ORIGINS=*
```

**Aguarde deploy (~3 min)**

**Copie a URL gerada** (ex: `v2-production-xxxx.up.railway.app`)

---

## 3️⃣ DEPLOY FRONTEND (VERCEL)

**URL:** https://vercel.com

**Passos:**
1. Login com GitHub
2. "Add New..." → "Project"
3. Import: `r3nomedeiros-oss/v2`

**Configure:**
- Framework Preset: `Create React App`
- Root Directory: `frontend`
- Build Command: `yarn build`
- Output Directory: `build`
- Install Command: `yarn install`

**Environment Variables:**
```
REACT_APP_BACKEND_URL=https://SUA-URL-DO-RAILWAY.up.railway.app
```

⚠️ **IMPORTANTE:** Substitua pela URL real do Railway

**Deploy!**

---

## ✅ TESTAR

Frontend Vercel → Abra e veja console (F12) → deve mostrar "Hello World"

Backend Railway → `https://sua-url.railway.app/api/` → deve retornar `{"message":"Hello World"}`

---

## 🎯 RESUMO

1. ☐ SQL no Supabase
2. ☐ Backend no Railway (copiar URL)
3. ☐ Frontend no Vercel (usar URL do Railway)
4. ☐ Testar

**PRONTO!** 🚀
