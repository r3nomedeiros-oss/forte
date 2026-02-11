import os
from supabase import create_client

# Conectar ao Supabase
supabase = create_client(
    "https://qmhldxyagakxeywkszkq.supabase.co",
    "sbp_39477759ac6132b9b6604a530e2862071b09ef43"
)

# SQL para criar a tabela
sql = """
CREATE TABLE IF NOT EXISTS status_checks (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_status_checks_timestamp ON status_checks(timestamp DESC);

ALTER TABLE status_checks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all access for status_checks" ON status_checks;
CREATE POLICY "Enable all access for status_checks" ON status_checks
    FOR ALL
    USING (true)
    WITH CHECK (true);
"""

try:
    # Executar SQL via RPC ou usando o SQL editor
    result = supabase.rpc('exec_sql', {'query': sql}).execute()
    print("✅ Tabela criada com sucesso!")
except Exception as e:
    print(f"⚠️ Erro: {e}")
    print("\n📝 Execute este SQL manualmente no Supabase SQL Editor:")
    print("https://supabase.com/dashboard/project/qmhldxyagakxeywkszkq/editor")
    print("\n" + sql)
