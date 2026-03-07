import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Settings, RefreshCw, GripVertical } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

function Variaveis() {
  const [variaveis, setVariaveis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [novaVariavel, setNovaVariavel] = useState({ tipo: 'turno', nome: '' });
  const [salvando, setSalvando] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  useEffect(() => {
    carregarVariaveis();
  }, []);

  const carregarVariaveis = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/variaveis`);
      setVariaveis(response.data);
    } catch (error) {
      console.error('Erro ao carregar variáveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const adicionarVariavel = async (e) => {
    e.preventDefault();
    if (!novaVariavel.nome.trim()) {
      alert('Digite um nome para a variável');
      return;
    }

    setSalvando(true);
    try {
      await axios.post(`${API_URL}/variaveis`, novaVariavel);
      setNovaVariavel({ ...novaVariavel, nome: '' });
      carregarVariaveis();
    } catch (error) {
      if (error.response?.data?.error === 'Variável já existe') {
        alert('Esta variável já existe!');
      } else {
        console.error('Erro ao adicionar variável:', error);
        alert('Erro ao adicionar variável');
      }
    } finally {
      setSalvando(false);
    }
  };

  const deletarVariavel = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;

    try {
      await axios.delete(`${API_URL}/variaveis/${id}`);
      carregarVariaveis();
    } catch (error) {
      console.error('Erro ao deletar variável:', error);
      alert('Erro ao deletar variável');
    }
  };

  // Funções de Drag and Drop
  const handleDragStart = (e, item, tipo) => {
    setDraggedItem({ ...item, tipo });
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragOver = (e, item, tipo) => {
    e.preventDefault();
    if (draggedItem && draggedItem.tipo === tipo && draggedItem.id !== item.id) {
      setDragOverItem(item.id);
    }
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = async (e, targetItem, tipo) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem.tipo !== tipo) return;
    
    const lista = ordenarPorOrdem(variaveis.filter(v => v.tipo === tipo));
    const dragIndex = lista.findIndex(item => item.id === draggedItem.id);
    const dropIndex = lista.findIndex(item => item.id === targetItem.id);
    
    if (dragIndex === dropIndex) return;
    
    // Reordenar lista
    const novaLista = [...lista];
    const [removed] = novaLista.splice(dragIndex, 1);
    novaLista.splice(dropIndex, 0, removed);
    
    // Atualizar ordem no backend
    try {
      const ordemAtualizada = novaLista.map((item, idx) => ({
        id: item.id,
        ordem: idx
      }));
      
      await axios.put(`${API_URL}/variaveis/ordem`, { variaveis: ordemAtualizada });
      carregarVariaveis();
    } catch (error) {
      console.error('Erro ao reordenar variáveis:', error);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Ordenar por campo 'ordem' se existir
  const ordenarPorOrdem = (lista) => {
    return [...lista].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999));
  };

  const turnos = ordenarPorOrdem(variaveis.filter(v => v.tipo === 'turno'));
  const formatos = ordenarPorOrdem(variaveis.filter(v => v.tipo === 'formato'));
  const cores = ordenarPorOrdem(variaveis.filter(v => v.tipo === 'cor'));

  // Componente para renderizar lista de variáveis com drag and drop
  const ListaVariaveis = ({ lista, tipo, icone, corFundo }) => (
    <div className="card">
      <h2 style={{marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px'}}>
        <span style={{background: corFundo, padding: '8px', borderRadius: '8px'}}>{icone}</span>
        {tipo === 'turno' ? 'Turnos' : tipo === 'formato' ? 'Formatos' : 'Cores'}
        <span style={{background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', marginLeft: 'auto'}}>
          {lista.length}
        </span>
      </h2>
      {lista.length === 0 ? (
        <p style={{color: '#64748b', fontSize: '14px'}}>Nenhum {tipo} cadastrado</p>
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
          {lista.map((v) => (
            <div 
              key={v.id} 
              draggable
              onDragStart={(e) => handleDragStart(e, v, tipo)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, v, tipo)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, v, tipo)}
              style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '10px 12px', 
                background: dragOverItem === v.id ? '#dcfce7' : '#f8fafc', 
                borderRadius: '8px', 
                border: dragOverItem === v.id ? '2px dashed #15803d' : '1px solid #e2e8f0',
                cursor: 'grab',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Ícone de arrastar */}
              <div style={{
                display: 'flex', 
                alignItems: 'center', 
                color: '#94a3b8',
                marginRight: '10px',
                cursor: 'grab'
              }}>
                <GripVertical size={18} />
              </div>
              
              {/* Nome da variável */}
              <span style={{fontWeight: '500', flex: 1}}>{v.nome}</span>
              
              {/* Botão de excluir */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletarVariavel(v.id, v.nome);
                }}
                className="btn btn-danger"
                style={{padding: '6px 10px', fontSize: '12px'}}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p style={{fontSize: '11px', color: '#94a3b8', marginTop: '10px', textAlign: 'center'}}>
        Arraste para reordenar
      </p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
          <Settings size={32} style={{color: '#15803d'}} />
          <div>
            <h1>Variáveis do Sistema</h1>
            <p>Gerencie as opções de Turno, Formato e Cor</p>
          </div>
        </div>
        <button onClick={carregarVariaveis} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Atualizar
        </button>
      </div>

      {/* Formulário para adicionar */}
      <div className="card" style={{marginBottom: '20px'}}>
        <h2 style={{marginBottom: '15px'}}>Adicionar Nova Variável</h2>
        <form onSubmit={adicionarVariavel} style={{display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'flex-end'}}>
          <div className="form-group" style={{marginBottom: 0, minWidth: '150px'}}>
            <label>Tipo</label>
            <select
              className="form-control"
              value={novaVariavel.tipo}
              onChange={(e) => setNovaVariavel({ ...novaVariavel, tipo: e.target.value })}
            >
              <option value="turno">Turno</option>
              <option value="formato">Formato</option>
              <option value="cor">Cor</option>
            </select>
          </div>
          
          <div className="form-group" style={{marginBottom: 0, flex: 1, minWidth: '200px'}}>
            <label>Nome</label>
            <input
              type="text"
              className="form-control"
              value={novaVariavel.nome}
              onChange={(e) => setNovaVariavel({ ...novaVariavel, nome: e.target.value })}
              placeholder={`Ex: ${novaVariavel.tipo === 'turno' ? 'Manhã' : novaVariavel.tipo === 'formato' ? '30x40' : 'Azul'}`}
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            <Plus size={16} /> {salvando ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </div>

      {loading ? (
        <div className="loading">Carregando variáveis...</div>
      ) : (
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px'}}>
          <ListaVariaveis lista={turnos} tipo="turno" icone="🕐" corFundo="#dcfce7" />
          <ListaVariaveis lista={formatos} tipo="formato" icone="📐" corFundo="#dbeafe" />
          <ListaVariaveis lista={cores} tipo="cor" icone="🎨" corFundo="#fef3c7" />
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default Variaveis;
