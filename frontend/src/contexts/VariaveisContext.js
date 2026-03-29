import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const API_URL = (process.env.REACT_APP_BACKEND_URL || '') + '/api';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos de cache

const VariaveisContext = createContext();

export const useVariaveis = () => {
  const context = useContext(VariaveisContext);
  if (!context) {
    throw new Error('useVariaveis must be used within a VariaveisProvider');
  }
  return context;
};

export const VariaveisProvider = ({ children }) => {
  const [variaveis, setVariaveis] = useState({ turnos: [], formatos: [], cores: [] });
  const [loading, setLoading] = useState(true);
  const lastFetchRef = useRef(null);
  const variaveisRef = useRef(variaveis);

  // Atualiza ref quando variaveis muda
  useEffect(() => {
    variaveisRef.current = variaveis;
  }, [variaveis]);

  const carregarVariaveis = useCallback(async (forceRefresh = false) => {
    // Se já tem dados em cache e não passou do tempo, não recarrega
    if (!forceRefresh && lastFetchRef.current && (Date.now() - lastFetchRef.current) < CACHE_DURATION) {
      setLoading(false);
      return variaveisRef.current;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/variaveis`);
      const data = response.data;
      
      const novasVariaveis = {
        turnos: data.filter(v => v.tipo === 'turno'),
        formatos: data.filter(v => v.tipo === 'formato'),
        cores: data.filter(v => v.tipo === 'cor')
      };
      
      setVariaveis(novasVariaveis);
      lastFetchRef.current = Date.now();
      return novasVariaveis;
    } catch (error) {
      console.error('Erro ao carregar variáveis:', error);
      return variaveisRef.current;
    } finally {
      setLoading(false);
    }
  }, []);

  // Carrega na inicialização
  useEffect(() => {
    carregarVariaveis();
  }, [carregarVariaveis]);

  const refreshVariaveis = useCallback(() => carregarVariaveis(true), [carregarVariaveis]);

  return (
    <VariaveisContext.Provider value={{ 
      variaveis, 
      loading, 
      refreshVariaveis,
      carregarVariaveis 
    }}>
      {children}
    </VariaveisContext.Provider>
  );
};

export default VariaveisContext;
