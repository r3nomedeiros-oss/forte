# 🔐 ENVIRONMENT VARIABLES PARA VERCEL

## Adicione estas variáveis no painel da Vercel:
## https://vercel.com/reno-medeiros-projects/v2/settings/environment-variables

---

### 1️⃣ SUPABASE_URL
**Valor:**
```
https://qmhldxyagakxeywkszkq.supabase.co
```
**Environment:** Production, Preview, Development

---

### 2️⃣ SUPABASE_KEY
**Valor:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtaGxkeHlhZ2FreGV5d2tzemtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNzY4NzYsImV4cCI6MjA4NTY1Mjg3Nn0.BZCpzK6eAR-AnorwIWvHbU_OHVBtwLnENYglwRJkJio
```
**Environment:** Production, Preview, Development

---

### 3️⃣ REACT_APP_BACKEND_URL
**Valor:**
```
(deixe VAZIO ou não adicione)
```
**Environment:** Production, Preview, Development

**Motivo:** Frontend e backend estarão no mesmo domínio, então usa URLs relativas.

---

## ✅ RESUMO:

Apenas 2 variáveis obrigatórias:
1. **SUPABASE_URL** = `https://qmhldxyagakxeywkszkq.supabase.co`
2. **SUPABASE_KEY** = `eyJhbGci...` (o token JWT completo)

---

## 📝 Como Adicionar:

1. Acesse: https://vercel.com/reno-medeiros-projects/v2/settings/environment-variables
2. Clique em "Add New"
3. Cole Nome e Valor
4. Selecione todos os ambientes (Production, Preview, Development)
5. Clique "Save"
6. Repita para cada variável

---

## 🚀 Após Adicionar:

Faça um **Redeploy** em: https://vercel.com/reno-medeiros-projects/v2

---

**Tudo pronto para funcionar!** ✅
