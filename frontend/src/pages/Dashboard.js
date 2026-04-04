import React, { useState, useEffect } from 'react';
import { useDados } from '../contexts/DadosContext';
import { TrendingUp, AlertCircle, Calendar, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Função para formatar números
const formatarKg = (valor) => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(valor));
};

function Dashboard() {
  const { statsMensal, carregarStatsMensal, carregarLancamentos, loadingStats, loadingLancamentos } = useDados();
  const [lancamentos7Dias, setLancamentos7Dias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const carregarDashboard = async () => {
    try {
      const [stats, lancamentosData] = await Promise.all([
        carregarStatsMensal(),
        carregarLancamentos()
      ]);
      
      // Últimos 7 dias (incluindo hoje)
      const hoje = new Date();
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(hoje.getDate() - 6);
      
      const ultimos7Dias = lancamentosData.filter(lanc => {
        const dataLanc = new Date(lanc.data + 'T00:00:00');
        return dataLanc >= seteDiasAtras && dataLanc <= hoje;
      });
      
      setLancamentos7Dias(ultimos7Dias);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepararDadosGrafico = () => {
    // Criar array com os últimos 7 dias
    const hoje = new Date();
    const dadosPorDia = {};
    
    // Inicializar todos os 7 dias com valores zerados
    for (let i = 6; i >= 0; i--) {
      const data = new Date();
      data.setDate(hoje.getDate() - i);
      const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      dadosPorDia[dataFormatada] = { data: dataFormatada, producao: 0, perdas: 0, percentualPerdas: 0 };
    }
    
    // Preencher com dados reais dos lançamentos
    lancamentos7Dias.forEach(lanc => {
      const data = new Date(lanc.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (dadosPorDia[data]) {
        dadosPorDia[data].producao += parseFloat(lanc.producao_total) || 0;
        dadosPorDia[data].perdas += parseFloat(lanc.perdas_total) || 0;
      }
    });
    
    // Calcular percentual de perdas para cada dia
    Object.values(dadosPorDia).forEach(dia => {
      if (dia.producao > 0) {
        dia.percentualPerdas = parseFloat(((dia.perdas / dia.producao) * 100).toFixed(1));
      }
    });
    
    // Ordenar por data
    return Object.values(dadosPorDia).sort((a, b) => {
      const [diaA, mesA] = a.data.split('/');
      const [diaB, mesB] = b.data.split('/');
      const dataA = new Date(`2026-${mesA}-${diaA}`);
      const dataB = new Date(`2026-${mesB}-${diaB}`);
      return dataA - dataB;
    });
  };

  // Tooltip customizado para mostrar Produção primeiro
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Encontrar os valores
      const producao = payload.find(p => p.dataKey === 'producao');
      const perdas = payload.find(p => p.dataKey === 'perdas');
      const percentual = payload.find(p => p.dataKey === 'percentualPerdas');
      
      return (
        <div style={{
          background: 'white',
          padding: '10px 14px',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#1a202c' }}>{label}</p>
          {producao && (
            <p style={{ margin: '4px 0', color: producao.color, fontWeight: '500' }}>
              Produção: {formatarKg(producao.value)} kg
            </p>
          )}
          {perdas && (
            <p style={{ margin: '4px 0', color: perdas.color, fontWeight: '500' }}>
              Perdas: {formatarKg(perdas.value)} kg
            </p>
          )}
          {percentual && (
            <p style={{ margin: '4px 0', color: percentual.color, fontWeight: '600' }}>
              % Perdas: {percentual.value}%
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Visão geral da produção mensal</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Produção Total</h3>
          <div className="value">{formatarKg(statsMensal?.producao_total || 0)} kg</div>
          <div className="subtitle" style={{fontSize: '15px', fontWeight: '600', color: '#4a5568'}}>
            <Package size={16} style={{display: 'inline', marginRight: '5px'}} />
            {statsMensal?.dias_produzidos || 0} dias produzidos
          </div>
        </div>

        <div className="stat-card">
          <h3>Média Diária</h3>
          <div className="value">{formatarKg(statsMensal?.media_diaria || 0)} kg</div>
          <div className="subtitle" style={{fontSize: '15px', fontWeight: '600', color: '#4a5568'}}>
            <TrendingUp size={16} style={{display: 'inline', marginRight: '5px'}} />
            Por dia produzido
          </div>
        </div>

        <div className="stat-card">
          <h3>Perdas Totais</h3>
          <div className="value">{formatarKg(statsMensal?.perdas_total || 0)} kg</div>
          <div className="subtitle" style={{fontSize: '15px', fontWeight: '600', color: '#4a5568'}}>
            <AlertCircle size={16} style={{display: 'inline', marginRight: '5px'}} />
            {statsMensal?.percentual_perdas || 0}% da produção
          </div>
        </div>

        <div className="stat-card">
          <h3>Período</h3>
          <div className="value" style={{fontSize: '24px'}}>Mensal</div>
          <div className="subtitle" style={{fontSize: '13px', fontWeight: '600', color: '#4a5568'}}>
            <Calendar size={14} style={{display: 'inline', marginRight: '5px'}} />
            {statsMensal?.periodo_referencia?.mesNome 
              ? statsMensal.periodo_referencia.mesNome.replace(/^./, c => c.toUpperCase())
              : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^./, c => c.toUpperCase())
            }
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{marginBottom: '20px', fontWeight: 'bold', fontStyle: 'italic'}}>Produção x Perdas (Últimos 7 Dias)</h2>
        
        {lancamentos7Dias.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={prepararDadosGrafico()} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
              <CartesianGrid 
                strokeDasharray="4 4" 
                stroke="#ccc"
                horizontal={false}
                vertical={true}
              />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12, fill: '#333' }}
                interval={0}
                tickLine={false}
                axisLine={{ stroke: '#ccc' }}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#333' }}
                tickLine={false}
                axisLine={{ stroke: '#ccc' }}
                domain={[0, 'auto']}
                label={{ 
                  value: 'kg', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fontSize: 14,
                  fill: '#333',
                  dx: -5
                }} 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#333' }}
                tickLine={false}
                axisLine={{ stroke: '#ccc' }}
                label={{ 
                  value: '%', 
                  angle: 90, 
                  position: 'insideRight', 
                  fontSize: 14,
                  fill: '#333',
                  dx: 5
                }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
                iconType="diamond"
                formatter={(value) => <span style={{ color: '#333', marginLeft: '4px' }}>{value}</span>}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="percentualPerdas" 
                stroke="#805ad5" 
                strokeWidth={2}
                strokeDasharray="6 4"
                name="% Perdas"
                dot={{ r: 5, fill: '#805ad5', stroke: '#805ad5', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#805ad5' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="perdas" 
                stroke="#f56565" 
                strokeWidth={3}
                name="Perdas (kg)"
                dot={{ r: 5, fill: '#f56565', stroke: '#f56565', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#f56565' }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="producao" 
                stroke="#15803d" 
                strokeWidth={3}
                name="Produção (kg)"
                dot={{ r: 5, fill: '#15803d', stroke: '#15803d', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#15803d' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">
            <p>Sem dados para exibir no gráfico</p>
          </div>
        )}
      </div>


    </div>
  );
}

export default Dashboard;
