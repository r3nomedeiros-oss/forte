import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useVariaveis } from '../contexts/VariaveisContext';
import { Plus, Trash2, Save, Eye } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

// Função para formatar data
const formatarData = (data) => {
  if (!data) return '-';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

// Função para formatar número
const formatarKg = (valor) => {
  if (!valor && valor !== 0) return '0';
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(valor) || 0);
};

function NovoLancamento() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { variaveis } = useVariaveis();
  
  const [lancamento, setLancamento] = useState({
    data: new Date().toISOString().split('T')[0],
    turno: '',
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    orelha_kg: '',
    aparas_kg: '',
    referencia_producao: '',
    itens: [
      { formato: '', cor: '', pacote_kg: '', producao_kg: '' }
    ]
  });

  // Atualizar hora automaticamente a cada minuto (sem segundos)
  useEffect(() => {
    const interval = setInterval(() => {
      setLancamento(prev => ({
        ...prev,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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
      await axios.post(`${API_URL}/lancamentos`, lancamento);
      alert('Lançamento criado com sucesso!');
      navigate('/lancamentos');
    } catch (error) {
      console.error('Erro ao criar lançamento:', error);
      alert('Erro ao criar lançamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Novo Lançamento</h1>
        <p>Registrar nova produção de sacolas</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2 style={{marginBottom: '20px'}}>Informações Gerais</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px'}}>
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
                <option value="">Selecione o turno</option>
                {variaveis.turnos.map((t) => (
                  <option key={t.id} value={t.nome}>{t.nome}</option>
                ))}
              </select>
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
                placeholder="0,00"
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
                placeholder="0,00"
              />
            </div>
          </div>

          <div style={{marginTop: '20px', padding: '15px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bcf0da'}}>
            <div className="form-group" style={{marginBottom: '0'}}>
              <label style={{fontWeight: '700', color: '#15803d', fontSize: '16px'}}>Referência de Produção</label>
              <input
                type="text"
                className="form-control"
                value={lancamento.referencia_producao}
                onChange={(e) => setLancamento({...lancamento, referencia_producao: e.target.value})}
                placeholder="Ex: Produção para Cliente X"
                style={{border: '2px solid #15803d', fontSize: '16px', fontWeight: '600'}}
                required
              />
              <p style={{fontSize: '12px', color: '#15803d', marginTop: '5px'}}>Destaque para que vai a produção</p>
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
            <div key={index} className="item-producao-row" style={{background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '10px', border: '1px solid #e2e8f0'}}>
              <div className="item-producao-grid">
                <div className="form-group" style={{marginBottom: '0'}}>
                  <label className="item-label">Formato</label>
                  <select
                    className="form-control item-input"
                    value={item.formato}
                    onChange={(e) => atualizarItem(index, 'formato', e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {variaveis.formatos.map((f) => (
                      <option key={f.id} value={f.nome}>{f.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{marginBottom: '0'}}>
                  <label className="item-label">Cor</label>
                  <select
                    className="form-control item-input"
                    value={item.cor}
                    onChange={(e) => atualizarItem(index, 'cor', e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    {variaveis.cores.map((c) => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{marginBottom: '0'}}>
                  <label className="item-label">Pacote (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control item-input"
                    value={item.pacote_kg}
                    onChange={(e) => atualizarItem(index, 'pacote_kg', e.target.value)}
                    required
                    placeholder="0,00"
                  />
                </div>

                <div className="form-group" style={{marginBottom: '0'}}>
                  <label className="item-label">Produção (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control item-input"
                    value={item.producao_kg}
                    onChange={(e) => atualizarItem(index, 'producao_kg', e.target.value)}
                    required
                    placeholder="0,00"
                  />
                </div>

                {lancamento.itens.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-danger item-delete-btn"
                    onClick={() => removerItem(index)}
                    title="Remover item"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pré-visualização do Lançamento - Sempre Aberta */}
        <div className="card" style={{background: '#f0fdf4', border: '2px solid #15803d'}}>
          <h2 style={{color: '#15803d', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <Eye size={20} />
            Pré-visualização do Lançamento
          </h2>
          
          <div>
              {/* Informações Gerais */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px', padding: '15px', background: 'white', borderRadius: '8px'}}>
                <div>
                  <span style={{fontSize: '12px', color: '#64748b', display: 'block'}}>Data</span>
                  <strong style={{fontSize: '16px'}}>{formatarData(lancamento.data)}</strong>
                </div>
                <div>
                  <span style={{fontSize: '12px', color: '#64748b', display: 'block'}}>Hora</span>
                  <strong style={{fontSize: '16px'}}>{lancamento.hora || '-'}</strong>
                </div>
                <div>
                  <span style={{fontSize: '12px', color: '#64748b', display: 'block'}}>Turno</span>
                  <strong style={{fontSize: '16px'}}>{lancamento.turno || '-'}</strong>
                </div>
                <div>
                  <span style={{fontSize: '12px', color: '#64748b', display: 'block'}}>Referência</span>
                  <strong style={{fontSize: '16px', color: '#15803d'}}>{lancamento.referencia_producao || '-'}</strong>
                </div>
              </div>

              {/* Itens de Produção */}
              <div style={{background: 'white', borderRadius: '8px', padding: '15px', marginBottom: '15px'}}>
                <h3 style={{fontSize: '14px', marginBottom: '10px', color: '#4a5568'}}>Itens de Produção</h3>
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', fontSize: '13px'}}>
                    <thead>
                      <tr style={{background: '#f8fafc'}}>
                        <th style={{padding: '8px', textAlign: 'left'}}>Formato</th>
                        <th style={{padding: '8px', textAlign: 'left'}}>Cor</th>
                        <th style={{padding: '8px', textAlign: 'right'}}>Pacote (kg)</th>
                        <th style={{padding: '8px', textAlign: 'right'}}>Produção (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lancamento.itens.map((item, index) => (
                        <tr key={index} style={{borderBottom: '1px solid #e2e8f0'}}>
                          <td style={{padding: '8px'}}>{item.formato || '-'}</td>
                          <td style={{padding: '8px'}}>{item.cor || '-'}</td>
                          <td style={{padding: '8px', textAlign: 'right'}}>{formatarKg(item.pacote_kg)}</td>
                          <td style={{padding: '8px', textAlign: 'right', fontWeight: '600', color: '#15803d'}}>{formatarKg(item.producao_kg)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totais */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px'}}>
                <div style={{background: '#dcfce7', padding: '12px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{fontSize: '11px', color: '#15803d', display: 'block'}}>Produção Total</span>
                  <strong style={{fontSize: '18px', color: '#166534'}}>
                    {formatarKg(lancamento.itens.reduce((acc, item) => acc + (parseFloat(item.producao_kg) || 0), 0))} kg
                  </strong>
                </div>
                <div style={{background: '#fee2e2', padding: '12px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{fontSize: '11px', color: '#dc2626', display: 'block'}}>Orelha</span>
                  <strong style={{fontSize: '18px', color: '#b91c1c'}}>
                    {formatarKg(lancamento.orelha_kg)} kg
                  </strong>
                </div>
                <div style={{background: '#fee2e2', padding: '12px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{fontSize: '11px', color: '#dc2626', display: 'block'}}>Aparas</span>
                  <strong style={{fontSize: '18px', color: '#b91c1c'}}>
                    {formatarKg(lancamento.aparas_kg)} kg
                  </strong>
                </div>
                <div style={{background: '#fef3c7', padding: '12px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{fontSize: '11px', color: '#d97706', display: 'block'}}>Perdas Total</span>
                  <strong style={{fontSize: '18px', color: '#b45309'}}>
                    {formatarKg((parseFloat(lancamento.orelha_kg) || 0) + (parseFloat(lancamento.aparas_kg) || 0))} kg
                  </strong>
                </div>
                <div style={{background: '#e0e7ff', padding: '12px', borderRadius: '8px', textAlign: 'center'}}>
                  <span style={{fontSize: '11px', color: '#4338ca', display: 'block'}}>% Perdas</span>
                  <strong style={{fontSize: '18px', color: '#3730a3'}}>
                    {(() => {
                      const producaoTotal = lancamento.itens.reduce((acc, item) => acc + (parseFloat(item.producao_kg) || 0), 0);
                      const perdasTotal = (parseFloat(lancamento.orelha_kg) || 0) + (parseFloat(lancamento.aparas_kg) || 0);
                      return producaoTotal > 0 ? ((perdasTotal / producaoTotal) * 100).toFixed(2) : '0.00';
                    })()}%
                  </strong>
                </div>
              </div>
            </div>
        </div>

        <div style={{display: 'flex', gap: '10px'}}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <Save size={16} /> {loading ? 'Salvando...' : 'Salvar Lançamento'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/lancamentos')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default NovoLancamento;
