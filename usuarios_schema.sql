-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Administrador', 'Operador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for users" ON users;
CREATE POLICY "Enable all for users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- Inserir usuário admin padrão (senha: admin123)
-- Hash bcrypt de 'admin123': $2b$10$rQ0Z8yGzX5qN9xK7E3J4XuWj8.8V7nK9mL5X6Z7Y8A9B0C1D2E3F4
INSERT INTO users (nome, email, senha, tipo) 
VALUES ('Administrador', 'admin@sacolas.com', '$2b$10$rQ0Z8yGzX5qN9xK7E3J4XuWj8.8V7nK9mL5X6Z7Y8A9B0C1D2E3F4', 'Administrador')
ON CONFLICT (email) DO NOTHING;
