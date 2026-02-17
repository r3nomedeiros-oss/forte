import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Package, Download, Edit } from 'lucide-react';
import html2canvas from 'html2canvas';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';

const formatarKg = (valor) => {
  return new Intl.NumberFormat('pt-BR').format(Math.round(valor));
};

function DetalhesLancamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lancamento, setLancamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const detalhesRef = useRef(null);

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
      setLoading(false);
    }
  };

  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const calcularTotais = () => {
    if (!lancamento || !lancamento.itens) return { producao: 0, perdas: 0, percentual: 0 };
    
    const producao = lancamento.itens.reduce((sum, item) => sum + parseFloat(item.producao_kg), 0);
    const perdas = parseFloat(lancamento.orelha_kg) + parseFloat(lancamento.aparas_kg);
    const percentual = producao > 0 ? (perdas / producao * 100) : 0;
    
    return { producao, perdas, percentual: percentual.toFixed(2) };
  };

  const baixarImagem = async () => {
    if (!detalhesRef.current) return;

    try {
      // Capturar a imagem do elemento com dimensões otimizadas para mobile
      const canvas = await html2canvas(detalhesRef.current, {
        backgroundColor: '#ffffff',
        scale: 1.5,
        logging: false,
        width: 400,
        windowHeight: 600
      });

      // Converter para blob
      canvas.toBlob((blob) => {
        // Criar URL temporária
        const url = URL.createObjectURL(blob);
        
        // Criar link para download
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_${lancamento.data}.png`;
        
        // Fazer download da imagem
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      alert('Erro ao gerar imagem para download');
    }
  };

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  if (!lancamento) {
    return <div className="loading">Lançamento não encontrado</div>;
  }

  const totais = calcularTotais();

  return (
    <div>
      <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
        <button onClick={() => navigate('/lancamentos')} className="btn btn-secondary">
          <ArrowLeft size={16} /> Voltar
        </button>
        <button onClick={() => navigate(`/lancamentos/${id}/editar`)} className="btn btn-primary">
          <Edit size={16} /> Editar
        </button>
        <button onClick={baixarImagem} className="btn" style={{background: '#15803d', color: 'white'}}>
          <Download size={16} /> Baixar Imagem
        </button>
      </div>

      <div ref={detalhesRef} style={{background: 'white', padding: '16px', borderRadius: '12px', marginBottom: '20px', maxWidth: '500px'}}>
        <div style={{textAlign: 'center', marginBottom: '16px', borderBottom: '2px solid #15803d', paddingBottom: '12px'}}>
          <h2 style={{fontSize: '16px', fontWeight: '800', color: '#1a202c', margin: '0 0 4px 0'}}>RELATÓRIO DE PRODUÇÃO</h2>
	          <p style={{fontSize: '12px', color: '#4a5568', margin: '0', fontWeight: '600'}}>{formatarData(lancamento.data)} • Turno {lancamento.turno}</p>
	          <p style={{fontSize: '11px', color: '#718096', margin: '4px 0 0 0'}}>{lancamento.hora}</p>
            {lancamento.referencia_producao && (
              <p style={{fontSize: '13px', color: '#1a202c', margin: '8px 0 0 0', fontWeight: '700'}}>
                REF: {lancamento.referencia_producao}
              </p>
            )}
            {lancamento.referencia_lote && (
              <p style={{fontSize: '11px', color: '#4a5568', margin: '2px 0 0 0'}}>
                LOTE: {lancamento.referencia_lote}
              </p>
            )}
	        </div>

        <div style={{marginBottom: '14px'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
            <div style={{background: '#f0f4ff', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #15803d'}}>
              <p style={{fontSize: '11px', color: '#4a5568', margin: '0 0 4px 0', fontWeight: '700', textTransform: 'uppercase'}}>Produção Total</p>
              <p style={{fontSize: '18px', fontWeight: '800', color: '#1a202c', margin: '0'}}>{formatarKg(totais.producao)} kg</p>
            </div>
            <div style={{background: '#fff5f5', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f56565'}}>
              <p style={{fontSize: '11px', color: '#4a5568', margin: '0 0 4px 0', fontWeight: '700', textTransform: 'uppercase'}}>Perdas Totais</p>
              <p style={{fontSize: '18px', fontWeight: '800', color: '#1a202c', margin: '0'}}>{formatarKg(totais.perdas)} kg ({totais.percentual}%)</p>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
            <div style={{background: '#f0fdf4', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #48bb78'}}>
              <p style={{fontSize: '11px', color: '#4a5568', margin: '0 0 4px 0', fontWeight: '700', textTransform: 'uppercase'}}>Orelha</p>
              <p style={{fontSize: '16px', fontWeight: '800', color: '#1a202c', margin: '0'}}>{formatarKg(parseFloat(lancamento.orelha_kg))} kg</p>
            </div>
            <div style={{background: '#fef3c7', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b'}}>
              <p style={{fontSize: '11px', color: '#4a5568', margin: '0 0 4px 0', fontWeight: '700', textTransform: 'uppercase'}}>Aparas</p>
              <p style={{fontSize: '16px', fontWeight: '800', color: '#1a202c', margin: '0'}}>{formatarKg(parseFloat(lancamento.aparas_kg))} kg</p>
            </div>
          </div>
        </div>

        <div style={{borderTop: '2px solid #e2e8f0', paddingTop: '12px'}}>
          <h3 style={{fontSize: '14px', fontWeight: '800', color: '#1a202c', margin: '0 0 12px 0', textTransform: 'uppercase'}}>Itens Produzidos</h3>
          
          {lancamento.itens && lancamento.itens.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {lancamento.itens.map((item, index) => (
                <div key={index} style={{background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '15px'}}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                    <div><span style={{fontWeight: '700', color: '#1a202c', fontSize: '14px'}}>Formato:</span> <span style={{color: '#4a5568', fontSize: '16px', fontWeight: '600'}}>{item.formato}</span></div>
                    <div><span style={{fontWeight: '700', color: '#1a202c', fontSize: '14px'}}>Cor:</span> <span style={{color: '#4a5568', fontSize: '16px', fontWeight: '600'}}>{item.cor}</span></div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                    <div><span style={{fontWeight: '700', color: '#1a202c', fontSize: '14px'}}>Pacote:</span> <span style={{color: '#4a5568', fontSize: '16px', fontWeight: '600'}}>{parseFloat(item.pacote_kg).toFixed(2)} kg</span></div>
                    <div><span style={{fontWeight: '700', color: '#48bb78', fontSize: '14px'}}>Produção:</span> <span style={{color: '#48bb78', fontWeight: '700', fontSize: '16px'}}>{parseFloat(item.producao_kg).toFixed(2)} kg</span></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{fontSize: '12px', color: '#4a5568', margin: '0'}}>Nenhum item registrado</p>
          )}
        </div>

        <div style={{textAlign: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '10px', color: '#718096'}}>
          <p style={{margin: '0'}}>Sistema de Controle de Produção</p>
        </div>
      </div>
    </div>
  );
}

export default DetalhesLancamento;
