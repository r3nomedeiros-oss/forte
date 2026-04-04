import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos de cache

const DadosContext = createContext();

export const useDados = () => {
  const context = useContext(DadosContext);
  if (!context) {
    throw new Error('useDados must be used within a DadosProvider');
  }
  return context;
};

export const DadosProvider = ({ children }) => {
  // Cache de lançamentos
  const [lancamentos, setLancamentos] = useState([]);
  const [loadingLancamentos, setLoadingLancamentos] = useState(false);
  const lastFetchLancamentosRef = useRef(null);
  
  // Cache de estatísticas do dashboard
  const [statsMensal, setStatsMensal] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const lastFetchStatsRef = useRef(null);

  // Carregar lançamentos com cache
  const carregarLancamentos = useCallback(async (forceRefresh = false, filtros = {}) => {
    const temFiltros = filtros.dataInicio || filtros.dataFim || filtros.referencia;
    
    // Se tem filtros, sempre busca do servidor
    if (temFiltros) {
      setLoadingLancamentos(true);
      try {
        let url = `${API_URL}/lancamentos?t=${Date.now()}`;
        if (filtros.dataInicio) url += `&data_inicio=${filtros.dataInicio}`;
        if (filtros.dataFim) url += `&data_fim=${filtros.dataFim}`;
        if (filtros.referencia?.trim()) {
          url += `&referencia_producao=${encodeURIComponent(filtros.referencia.trim())}`;
        }
        const response = await axios.get(url);
        return response.data;
      } catch (error) {
        console.error('Erro ao carregar lançamentos:', error);
        return [];
      } finally {
        setLoadingLancamentos(false);
      }
    }
    
    // Sem filtros - usa cache
    if (!forceRefresh && lastFetchLancamentosRef.current && 
        (Date.now() - lastFetchLancamentosRef.current) < CACHE_DURATION && 
        lancamentos.length > 0) {
      return lancamentos;
    }

    setLoadingLancamentos(true);
    try {
      const response = await axios.get(`${API_URL}/lancamentos?t=${Date.now()}`);
      setLancamentos(response.data);
      lastFetchLancamentosRef.current = Date.now();
      return response.data;
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
      return lancamentos;
    } finally {
      setLoadingLancamentos(false);
    }
  }, [lancamentos]);

  // Função para encontrar o último mês com lançamentos
  const encontrarUltimoPeriodoComDados = useCallback(async () => {
    try {
      // Buscar todos os lançamentos (sem filtro)
      const response = await axios.get(`${API_URL}/lancamentos?t=${Date.now()}`);
      const todosLancamentos = response.data;
      
      if (!todosLancamentos || todosLancamentos.length === 0) {
        // Se não há lançamentos, retorna mês atual mesmo
        const hoje = new Date();
        return {
          ano: hoje.getFullYear(),
          mes: hoje.getMonth() + 1,
          data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0],
          data_fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
        };
      }
      
      // Ordenar lançamentos por data (mais recente primeiro)
      const lancamentosOrdenados = todosLancamentos.sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
      });
      
      // Pegar a data do lançamento mais recente
      const dataUltimoLancamento = new Date(lancamentosOrdenados[0].data + 'T00:00:00');
      const ano = dataUltimoLancamento.getFullYear();
      const mes = dataUltimoLancamento.getMonth() + 1;
      
      // Calcular primeiro e último dia do mês
      const primeiroDia = new Date(ano, mes - 1, 1);
      const ultimoDia = new Date(ano, mes, 0);
      
      return {
        ano,
        mes,
        data_inicio: primeiroDia.toISOString().split('T')[0],
        data_fim: ultimoDia.toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Erro ao encontrar último período:', error);
      // Em caso de erro, retorna mês atual
      const hoje = new Date();
      return {
        ano: hoje.getFullYear(),
        mes: hoje.getMonth() + 1,
        data_inicio: new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0],
        data_fim: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split('T')[0]
      };
    }
  }, []);

  // Carregar stats mensais com cache (para Dashboard)
  const carregarStatsMensal = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && lastFetchStatsRef.current && 
        (Date.now() - lastFetchStatsRef.current) < CACHE_DURATION && 
        statsMensal) {
      return statsMensal;
    }

    setLoadingStats(true);
    try {
      // Encontrar o último período com dados
      const periodo = await encontrarUltimoPeriodoComDados();
      
      // Buscar relatório para esse período específico
      const response = await axios.get(
        `${API_URL}/relatorios?periodo=customizado&data_inicio=${periodo.data_inicio}&data_fim=${periodo.data_fim}&t=${Date.now()}`
      );
      
      // Adicionar informação do período aos dados
      const statsComPeriodo = {
        ...response.data,
        periodo_referencia: {
          ano: periodo.ano,
          mes: periodo.mes,
          mesNome: new Date(periodo.ano, periodo.mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
        }
      };
      
      setStatsMensal(statsComPeriodo);
      lastFetchStatsRef.current = Date.now();
      return statsComPeriodo;
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
      return statsMensal;
    } finally {
      setLoadingStats(false);
    }
  }, [statsMensal, encontrarUltimoPeriodoComDados]);

  // Invalidar cache após criar/editar/deletar lançamento
  const invalidarCache = useCallback(() => {
    lastFetchLancamentosRef.current = null;
    lastFetchStatsRef.current = null;
  }, []);

  // Pré-carregar dados ao iniciar a aplicação
  useEffect(() => {
    const preCarregar = async () => {
      await Promise.all([
        carregarLancamentos(),
        carregarStatsMensal()
      ]);
    };
    preCarregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DadosContext.Provider value={{ 
      lancamentos,
      loadingLancamentos,
      carregarLancamentos,
      statsMensal,
      loadingStats,
      carregarStatsMensal,
      invalidarCache
    }}>
      {children}
    </DadosContext.Provider>
  );
};

export default DadosContext;
