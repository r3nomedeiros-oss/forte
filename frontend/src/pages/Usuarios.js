import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserCheck, Shield } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      // Garantir que temos um array
      setUsuarios(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const deletarUsuario = async (id) => {
    if (currentUser.tipo !== 'Administrador') {
      alert('Apenas administradores podem excluir usuários');
      return;
    }

    if (id === currentUser.id) {
      alert('Você não pode excluir seu próprio usuário');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/users/${id}`);
      alert('Usuário excluído com sucesso!');
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      alert('Erro ao excluir usuário');
    }
  };

  const formatarData = (data) => {
    if (!data) return '-';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Usuários</h1>
        <p>Gerenciar usuários do sistema</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Cadastrado em</th>
                {currentUser.tipo === 'Administrador' && <th>Ações</th>}
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={currentUser.tipo === 'Administrador' ? 5 : 4} style={{textAlign: 'center', padding: '30px'}}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                usuarios.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        {user.tipo === 'Administrador' ? <Shield size={16} color="#15803d" /> : <UserCheck size={16} color="#48bb78" />}
                        <span style={{fontWeight: '600'}}>{user.nome}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge ${user.tipo === 'Administrador' ? 'badge-danger' : 'badge-success'}`}>
                        {user.tipo}
                      </span>
                    </td>
                    <td>{formatarData(user.created_at)}</td>
                    {currentUser.tipo === 'Administrador' && (
                      <td>
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => deletarUsuario(user.id)}
                            className="btn btn-danger"
                            style={{padding: '8px 12px'}}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Usuarios;
