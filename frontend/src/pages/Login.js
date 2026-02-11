import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogIn, UserPlus, Factory } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    tipo: 'Operador'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await axios.post(`${API_URL}${endpoint}`, form);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        onLogin(response.data.user);
        navigate('/');
      } else if (isRegister) {
        alert('Usuário cadastrado! Faça login.');
        setIsRegister(false);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Erro ao processar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Factory size={40} color="white" />
          </div>
          <h1>{isRegister ? 'Criar Conta' : 'Bem-vindo'}</h1>
          <p>Sistema de Controle de Produção - PolyTrack</p>
        </div>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          {isRegister && (
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                className="form-control"
                value={form.nome}
                onChange={(e) => setForm({...form, nome: e.target.value})}
                required
              />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              className="form-control"
              value={form.senha}
              onChange={(e) => setForm({...form, senha: e.target.value})}
              required
            />
          </div>
          {isRegister && (
            <div className="form-group">
              <label>Tipo de Usuário</label>
              <select
                className="form-control"
                value={form.tipo}
                onChange={(e) => setForm({...form, tipo: e.target.value})}
              >
                <option value="Operador">Operador</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn btn-primary" style={{width: '100%', marginBottom: '10px', justifyContent: 'center'}} disabled={loading}>
            {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
            {loading ? 'Processando...' : (isRegister ? 'Cadastrar' : 'Entrar')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary" 
            style={{width: '100%', justifyContent: 'center'}}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
