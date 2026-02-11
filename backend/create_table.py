"""
Script para criar a tabela status_checks no Supabase.
Execute este SQL no Supabase SQL Editor:
"""

sql_query = """
-- Criar tabela status_checks
CREATE TABLE IF NOT EXISTS status_checks (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para buscar por timestamp
CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);

-- Habilitar Row Level Security (RLS) - opcional
ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir todas as operações (para desenvolvimento)
-- ATENÇÃO: Em produção, ajuste as políticas de segurança!
CREATE POLICY "Enable all access for status_checks" ON status_checks
    FOR ALL
    USING (true)
    WITH CHECK (true);
"""

print("=" * 80)
print("SQL PARA CRIAR TABELA NO SUPABASE")
print("=" * 80)
print("\n1. Acesse: https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor")
print("2. Clique em 'SQL Editor' no menu lateral")
print("3. Cole o SQL abaixo e execute:\n")
print(sql_query)
print("=" * 80)
