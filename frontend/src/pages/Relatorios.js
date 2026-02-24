import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

const formatarKg = (valor) => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(valor));
};

function Relatorios() {
  const [periodo, setPeriodo] = useState('mensal');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [referenciaProducao, setReferenciaProducao] = useState('');
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (periodo !== 'customizado') {
      gerarRelatorio();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodo]);

  const gerarRelatorio = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/relatorios?periodo=${periodo}`;
      
      if (periodo === 'customizado') {
        if (!dataInicio || !dataFim) {
          alert('Por favor, selecione as datas de início e fim.');
          setLoading(false);
          return;
        }
        url += `&data_inicio=${dataInicio}&data_fim=${dataFim}`;
      }

      if (referenciaProducao) {
        url += `&referencia_producao=${referenciaProducao}`;
      }
      
      // Adiciona timestamp para evitar cache
      url += `&t=${new Date().getTime()}`;
      
      const response = await axios.get(url);
      setRelatorio(response.data);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('Erro ao carregar relatório. Verifique a conexão.');
    } finally {
      setLoading(false);
    }
  };

  const exportarPDF = () => {
    if (!relatorio) return;
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const periodoTexto = periodo === 'customizado' ? `${dataInicio} a ${dataFim}` : periodo.charAt(0).toUpperCase() + periodo.slice(1);
    const filtroRefTexto = referenciaProducao ? ` - Ref: ${referenciaProducao}` : '';
    
    const conteudo = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Produção</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #2d3748; line-height: 1.6; }
    h1 { color: #15803d; border-bottom: 2px solid #15803d; padding-bottom: 10px; margin-bottom: 20px; }
    h2 { color: #2d3748; margin-top: 30px; border-left: 4px solid #15803d; padding-left: 10px; }
    .header { text-align: right; color: #718096; margin-bottom: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    th { background: #f7fafc; font-weight: 600; color: #4a5568; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .stat-box { padding: 15px; background: #f7fafc; border-left: 4px solid #15803d; border-radius: 4px; }
    .stat-box strong { display: block; color: #718096; font-size: 12px; text-transform: uppercase; }
    .stat-box .value { font-size: 20px; font-weight: 700; color: #1a202c; }
    .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #a0aec0; border-top: 1px solid #edf2f7; padding-top: 10px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">Gerado em: ${dataAtual}</div>
  <h1>Relatório de Produção - ${periodoTexto}${filtroRefTexto}</h1>
  
  <h2>Informações Consolidadas</h2>
  <div class="stats">
    <div class="stat-box"><strong>Produção Total</strong><div class="value">${formatarKg(relatorio.producao_total)} kg</div></div>
    <div class="stat-box"><strong>Perdas Totais</strong><div class="value">${formatarKg(relatorio.perdas_total)} kg (${relatorio.percentual_perdas}%)</div></div>
    <div class="stat-box"><strong>Média Diária</strong><div class="value">${formatarKg(relatorio.media_diaria)} kg</div></div>
    <div class="stat-box"><strong>Dias Produzidos</strong><div class="value">${relatorio.dias_produzidos}</div></div>
  </div>

  <h2>Produção por Itens (Formato e Cor)</h2>
  <table>
    <thead>
      <tr>
        <th>Formato</th>
        <th>Cor</th>
        <th>Total Produzido (kg)</th>
        <th>% da Produção</th>
      </tr>
    </thead>
    <tbody>
      ${relatorio.por_item.map(item => `
        <tr>
          <td><strong>${item.formato}</strong></td>
          <td>${item.cor}</td>
          <td>${formatarKg(item.producao)} kg</td>
          <td>${(item.producao / relatorio.producao_total * 100).toFixed(1)}%</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <h2>Detalhamento por Referência de Produção</h2>
  <table>
    <thead>
      <tr>
        <th>Referência</th>
        <th>Produção (kg)</th>
        <th>Perdas (kg)</th>
        <th>% Perdas</th>
        <th>Média Diária</th>
        <th>Dias</th>
      </tr>
    </thead>
    <tbody>
      ${Object.entries(relatorio.por_referencia).map(([ref, dados]) => `
        <tr>
          <td><strong>${ref}</strong></td>
          <td>${formatarKg(dados.producao)}</td>
          <td>${formatarKg(dados.perdas)}</td>
          <td>${dados.percentual_perdas}%</td>
          <td>${formatarKg(dados.media_diaria)}</td>
          <td>${dados.dias_produzidos}</td>
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
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    // Em vez de forçar download do HTML, abrimos para impressão que é o comportamento esperado para PDF no navegador
    window.open(url, '_blank');
  };

  const exportarExcel = () => {
    if (!relatorio) return;
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    let csv = `RELATÓRIO DE PRODUÇÃO;${periodo.toUpperCase()}${referenciaProducao ? ' - REF: ' + referenciaProducao : ''}\n`;
    csv += `Gerado em:;${dataAtual}\n\n`;
    csv += `RESUMO GERAL\n`;
    csv += `Produção Total;${formatarKg(relatorio.producao_total)} kg\n`;
    csv += `Perdas Totais;${formatarKg(relatorio.perdas_total)} kg\n`;
    csv += `Percentual de Perdas;${relatorio.percentual_perdas}%\n`;
    csv += `Média Diária;${formatarKg(relatorio.media_diaria)} kg\n`;
    csv += `Dias Produzidos;${relatorio.dias_produzidos}\n\n`;
    csv += `PRODUÇÃO POR ITENS\n`;
    csv += `Formato;Cor;Total Produzido (kg);% da Produção\n`;
    relatorio.por_item.forEach(item => {
      csv += `${item.formato};${item.cor};${formatarKg(item.producao)};${(item.producao / relatorio.producao_total * 100).toFixed(1)}%\n`;
    });
    csv += `\nDETALHES POR REFERÊNCIA\n`;
    csv += `Referência;Produção (kg);Perdas (kg);% Perdas;Média Diária;Dias Produzidos\n`;
    Object.entries(relatorio.por_referencia).forEach(([ref, dados]) => {
      csv += `${ref};${formatarKg(dados.producao)};${formatarKg(dados.perdas)};${dados.percentual_perdas}%;${formatarKg(dados.media_diaria)};${dados.dias_produzidos}\n`;
    });
    
    const blob = new Blob(["\ufeff" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_producao_${periodo}_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Relatórios</h1>
        <p>Análise consolidada da produção</p>
      </div>

      <div className="card">
        <h2 style={{marginBottom: '20px'}}>Filtros</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px'}}>
          <div className="form-group">
            <label>Período</label>
            <select className="form-control" value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
              <option value="semanal">Semanal</option>
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
              <option value="customizado">Customizado</option>
            </select>
          </div>
          {periodo === 'customizado' && (
            <>
              <div className="form-group">
                <label>Data Início</label>
                <input type="date" className="form-control" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Data Fim</label>
                <input type="date" className="form-control" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
              </div>
            </>
          )}
          <div className="form-group">
            <label style={{fontWeight: '700', color: '#15803d'}}>Referência de Produção</label>
            <input 
              type="text" 
              className="form-control" 
              value={referenciaProducao} 
              onChange={(e) => setReferenciaProducao(e.target.value)} 
              placeholder="Filtrar por referência (ex: Cliente X)"
              style={{border: '1px solid #15803d'}}
            />
          </div>
        </div>
        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={gerarRelatorio} className="btn btn-primary" disabled={loading}>
            {loading ? 'Gerando...' : 'Gerar Relatório'}
          </button>
          {relatorio && (
            <>
              <button onClick={exportarPDF} className="btn btn-danger"><FileText size={16} /> PDF</button>
              <button onClick={exportarExcel} className="btn btn-success"><FileSpreadsheet size={16} /> Excel</button>
            </>
          )}
        </div>
      </div>

      {loading && <div className="loading">Gerando relatório...</div>}

      {relatorio && !loading && (
        <>
          <div className="card">
            <h2 style={{marginBottom: '20px'}}>Informações Consolidadas</h2>
            <div className="stats-grid">
              <div className="stat-card"><h3>Produção Total</h3><div className="value">{formatarKg(relatorio.producao_total)} kg</div></div>
              <div className="stat-card"><h3>Perdas Totais</h3><div className="value">{formatarKg(relatorio.perdas_total)} kg</div></div>
              <div className="stat-card"><h3>Percentual de Perdas</h3><div className="value">{relatorio.percentual_perdas}%</div></div>
              <div className="stat-card"><h3>Média Diária</h3><div className="value">{formatarKg(relatorio.media_diaria)} kg</div></div>
            </div>
          </div>

          <div className="card" style={{marginBottom: '30px', borderLeft: '5px solid #15803d'}}>
            <h2 style={{marginBottom: '20px', color: '#15803d'}}>Produção por Itens (Formato e Cor)</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Formato</th>
                    <th>Cor</th>
                    <th>Total Produzido (kg)</th>
                    <th>% da Produção Total</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorio.por_item && relatorio.por_item.length > 0 ? (
                    relatorio.por_item.map((item, index) => (
                      <tr key={index}>
                        <td style={{fontWeight: '700'}}>{item.formato}</td>
                        <td>
                          <span style={{
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            background: '#edf2f7', 
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            {item.cor}
                          </span>
                        </td>
                        <td style={{fontWeight: '800', color: '#2d3748'}}>{formatarKg(item.producao)} kg</td>
                        <td>
                          <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <div style={{flex: 1, height: '8px', background: '#edf2f7', borderRadius: '4px', overflow: 'hidden'}}>
                              <div style={{
                                width: `${(item.producao / relatorio.producao_total * 100).toFixed(1)}%`,
                                height: '100%',
                                background: '#15803d'
                              }}></div>
                            </div>
                            <span style={{fontSize: '12px', fontWeight: '600'}}>
                              {(item.producao / relatorio.producao_total * 100).toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', padding: '20px', color: '#718096'}}>
                        Nenhum item produzido no período selecionado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 style={{marginBottom: '20px'}}>Detalhamento por Referência de Produção</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Referência</th>
                    <th>Produção (kg)</th>
                    <th>Perdas (kg)</th>
                    <th>% Perdas</th>
                    <th>Média Diária</th>
                    <th>Dias</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(relatorio.por_referencia).map(([ref, dados]) => (
                    <tr key={ref}>
                      <td>
                        <div style={{
                          fontWeight: '800', 
                          color: '#15803d', 
                          background: '#f0fdf4', 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          border: '1px solid #bcf0da',
                          display: 'inline-block',
                          fontSize: '13px'
                        }}>
                          {ref}
                        </div>
                      </td>
                      <td>{formatarKg(dados.producao)} kg</td>
                      <td>{formatarKg(dados.perdas)} kg</td>
                      <td><span className={`badge ${dados.percentual_perdas > 10 ? 'badge-danger' : 'badge-warning'}`}>{dados.percentual_perdas}%</span></td>
                      <td>{formatarKg(dados.media_diaria)} kg</td>
                      <td>{dados.dias_produzidos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Relatorios;
