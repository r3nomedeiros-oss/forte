import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Eye, Edit, Trash2, FileText, FileSpreadsheet } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

const formatarKg = (valor) => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(valor));
};

function Lancamentos() {
  const [lancamentos, setLancamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');

  useEffect(() => {
    carregarLancamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarLancamentos = async () => {
    try {
      // Adiciona timestamp para evitar cache do navegador
      let url = `${API_URL}/lancamentos?t=${new Date().getTime()}`;
      
      if (filtroDataInicio) url += `&data_inicio=${filtroDataInicio}`;
      if (filtroDataFim) url += `&data_fim=${filtroDataFim}`;

      const response = await axios.get(url);
      setLancamentos(response.data);
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletarLancamento = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/lancamentos/${id}`);
      alert('Lançamento excluído com sucesso!');
      carregarLancamentos();
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      alert('Erro ao excluir lançamento');
    }
  };

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const formatarHora = (hora) => {
    if (!hora) return '';
    return hora.substring(0, 5); // Garante que mostre apenas HH:mm
  };

  const exportarHistoricoPDF = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const periodoTexto = filtroDataInicio && filtroDataFim 
      ? `Período: ${formatarData(filtroDataInicio)} até ${formatarData(filtroDataFim)}`
      : 'Histórico Completo';
      
    const conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Histórico de Produção - ${periodoTexto}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; color: #2d3748; }
    h1 { color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
    th { background: #f7fafc; font-weight: 600; }
    .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #a0aec0; }
  </style>
</head>
<body>
  <h1>Histórico de Produção - PolyTrack</h1>
  <p><strong>${periodoTexto}</strong></p>
  <p>Gerado em: ${dataAtual}</p>
  <table>
    <thead>
      <tr>
	        <th>Data/Hora</th>
	        <th>Referência</th>
	        <th>Turno</th>
	        <th>Produção (kg)</th>
        <th>Perdas (kg)</th>
        <th>% Perdas</th>
      </tr>
    </thead>
    <tbody>
	      ${lancamentos.map(lanc => `
	        <tr>
	          <td>${formatarData(lanc.data)} ${formatarHora(lanc.hora)}</td>
	          <td>${lanc.referencia_producao || ''}</td>
	          <td>${lanc.turno}</td>
	          <td>${formatarKg(lanc.producao_total)}</td>
          <td>${formatarKg(lanc.perdas_total)}</td>
          <td>${lanc.percentual_perdas}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">PolyTrack - Sistema de Controle de Produção</div>
  <script>
    window.onload = () => {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  </script>
</body>
</html>`;
    const blob = new Blob([conteudo], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const exportarHistoricoExcel = () => {
    let csv = `Data;Hora;Referência de Produção;Turno;Produção (kg);Perdas (kg);% Perdas\n`;
    lancamentos.forEach(lanc => {
      csv += `${formatarData(lanc.data)};${formatarHora(lanc.hora)};${lanc.referencia_producao || ''};${lanc.turno};${formatarKg(lanc.producao_total)};${formatarKg(lanc.perdas_total)};${lanc.percentual_perdas}%\n`;
    });
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_producao_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div>
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1>Lançamentos</h1>
          <p>Histórico de produção</p>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={exportarHistoricoPDF} className="btn btn-danger" style={{padding: '8px 15px', fontSize: '13px'}}>
            <FileText size={14} /> PDF
          </button>
          <button onClick={exportarHistoricoExcel} className="btn btn-success" style={{padding: '8px 15px', fontSize: '13px'}}>
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      <div className="card" style={{marginBottom: '20px', padding: '15px'}}>
        <div style={{display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap'}}>
          <div className="form-group" style={{marginBottom: 0, flex: 1, minWidth: '200px'}}>
            <label style={{fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'block'}}>Data Início</label>
            <input 
              type="date" 
              className="form-control" 
              value={filtroDataInicio} 
              onChange={(e) => setFiltroDataInicio(e.target.value)} 
            />
          </div>
          <div className="form-group" style={{marginBottom: 0, flex: 1, minWidth: '200px'}}>
            <label style={{fontSize: '13px', fontWeight: '600', marginBottom: '5px', display: 'block'}}>Data Fim</label>
            <input 
              type="date" 
              className="form-control" 
              value={filtroDataFim} 
              onChange={(e) => setFiltroDataFim(e.target.value)} 
            />
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={carregarLancamentos} 
              className="btn btn-primary" 
              style={{padding: '10px 20px'}}
            >
              Filtrar
            </button>
            {(filtroDataInicio || filtroDataFim) && (
              <button 
                onClick={() => {
                  setFiltroDataInicio('');
                  setFiltroDataFim('');
                  // Usar setTimeout para garantir que os estados foram limpos antes de carregar
                  setTimeout(carregarLancamentos, 0);
                }} 
                className="btn btn-secondary" 
                style={{padding: '10px 20px'}}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {lancamentos.length === 0 ? (
        <div className="card empty-state">
          <h3>Nenhum lançamento encontrado</h3>
          <p>Comece criando um novo lançamento de produção</p>
          <Link to="/novo-lancamento" className="btn btn-primary" style={{marginTop: '20px'}}>
            Novo Lançamento
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Lançamento</th>
                  <th>Referência</th>
                  <th>Turno</th>
                  <th>Produção</th>
                  <th>Perdas</th>
                  <th>% Perdas</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {lancamentos.map((lanc) => (
                  <tr key={lanc.id}>
                    <td>
                      <div style={{fontWeight: '600'}}>
                        {formatarData(lanc.data)} - {formatarHora(lanc.hora)}
                      </div>
                    </td>
                    <td>
                      <div style={{
                        fontWeight: '800', 
                        color: '#15803d', 
                        background: '#f0fdf4', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        border: '1px solid #bcf0da',
                        display: 'inline-block',
                        fontSize: '14px'
                      }}>
                        {lanc.referencia_producao || <span style={{color: '#a0aec0', fontStyle: 'italic', fontSize: '12px'}}>Sem referência</span>}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-success">{lanc.turno}</span>
                    </td>
                    <td style={{fontWeight: '600', color: '#48bb78'}}>
                      {formatarKg(lanc.producao_total)} kg
                    </td>
                    <td style={{fontWeight: '600', color: '#f56565'}}>
                      {formatarKg(lanc.perdas_total)} kg
                    </td>
                    <td>
                      <span className={`badge ${lanc.percentual_perdas > 10 ? 'badge-danger' : 'badge-warning'}`}>
                        {lanc.percentual_perdas}%
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <Link to={`/lancamentos/${lanc.id}`} className="btn btn-secondary" style={{padding: '6px 12px'}}>
                          <Eye size={14} />
                        </Link>
                        <Link to={`/lancamentos/${lanc.id}/editar`} className="btn btn-primary" style={{padding: '6px 12px'}}>
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => deletarLancamento(lanc.id)}
                          className="btn btn-danger"
                          style={{padding: '6px 12px'}}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Lancamentos;
