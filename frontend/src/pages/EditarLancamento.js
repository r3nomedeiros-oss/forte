import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

function EditarLancamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  
  const [lancamento, setLancamento] = useState({
    data: '',
    turno: 'A',
    hora: '',
    orelha_kg: '',
    aparas_kg: '',
    itens: []
  });

  useEffect(() => {
    carregarLancamento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const carregarLancamento = async () => {
    try {
      const response = await axios.get(`${API_URL}/lancamentos/${id}`);
      setLancamento(response.data);
    } catch (error) {
      console.error('Erro ao carregar lançamento:', error);
      alert('Erro ao carregar lançamento');
      navigate('/lancamentos');
    } finally {
      setCarregando(false);
    }
  };

  const adicionarItem = () => {
    setLancamento({
      ...lancamento,
      itens: [...lancamento.itens, { formato: '', cor: '', pacote_kg: '', producao_kg: '' }]
    });
  };

  const removerItem = (index) => {
    const novosItens = lancamento.itens.filter((_, i) => i !== index);
    setLancamento({ ...lancamento, itens: novosItens });
  };

  const atualizarItem = (index, field, value) => {
    const novosItens = [...lancamento.itens];
    novosItens[index][field] = value;
    setLancamento({ ...lancamento, itens: novosItens });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.put(`${API_URL}/lancamentos/${id}`, lancamento);
      alert('Lançamento atualizado com sucesso!');
      navigate('/lancamentos');
    } catch (error) {
      console.error('Erro ao atualizar lançamento:', error);
      alert('Erro ao atualizar lançamento');
    } finally {
      setLoading(false);
    }
  };

  if (carregando) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div>
      <button onClick={() => navigate('/lancamentos')} className="btn btn-secondary" style={{marginBottom: '20px'}}>
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="page-header">
        <h1>Editar Lançamento</h1>
        <p>Atualizar informações da produção</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 style={{marginBottom: '20px'}}>Informações Gerais</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px'}}>
            <div className="form-group">
              <label>Data</label>
              <input
                type="date"
                className="form-control"
                value={lancamento.data}
                onChange={(e) => setLancamento({...lancamento, data: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Turno</label>
              <select
                className="form-control"
                value={lancamento.turno}
                onChange={(e) => setLancamento({...lancamento, turno: e.target.value})}
                required
              >
                <option value="A">Turno A</option>
                <option value="B">Turno B</option>
                <option value="Administrativo">Administrativo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Hora</label>
              <input
                type="time"
                className="form-control"
                value={lancamento.hora}
                onChange={(e) => setLancamento({...lancamento, hora: e.target.value})}
                required
              />
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div className="form-group">
              <label>Orelha (kg)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={lancamento.orelha_kg}
                onChange={(e) => setLancamento({...lancamento, orelha_kg: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Aparas (kg)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={lancamento.aparas_kg}
                onChange={(e) => setLancamento({...lancamento, aparas_kg: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Itens de Produção</h2>
            <button type="button" className="btn btn-secondary" onClick={adicionarItem}>
              <Plus size={16} /> Adicionar Item
            </button>
          </div>

          {lancamento.itens.map((item, index) => (
            <div key={index} className="item-row" style={{position: 'relative'}}>
              {lancamento.itens.length > 1 && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => removerItem(index)}
                  style={{position: 'absolute', top: '10px', right: '10px'}}
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              <div className="form-group">
                <label>Formato</label>
                <input
                  type="text"
                  className="form-control"
                  value={item.formato}
                  onChange={(e) => atualizarItem(index, 'formato', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Cor</label>
                <input
                  type="text"
                  className="form-control"
                  value={item.cor}
                  onChange={(e) => atualizarItem(index, 'cor', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pacote (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={item.pacote_kg}
                  onChange={(e) => atualizarItem(index, 'pacote_kg', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Produção (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={item.producao_kg}
                  onChange={(e) => atualizarItem(index, 'producao_kg', e.target.value)}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{display: 'flex', gap: '10px'}}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/lancamentos')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarLancamento;
