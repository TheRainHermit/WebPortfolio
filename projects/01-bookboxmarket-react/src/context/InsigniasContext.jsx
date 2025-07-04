import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const InsigniasContext = createContext();

export function useInsignias() {
  return useContext(InsigniasContext);
}

export function InsigniasProvider({ idUsuario, children }) {
  const [todas, setTodas] = useState([]);
  const [obtenidas, setObtenidas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInsignias = useCallback(async () => {
    if (!idUsuario) return;
    setLoading(true);
    try {
      const [allRes, userRes] = await Promise.all([
        fetch("http://localhost:3000/api/insignias"),
        fetch(`http://localhost:3000/api/insignias/${idUsuario}`)
      ]);
      const allData = await allRes.json();
      const userData = await userRes.json();
      setTodas(allData.insignias || []);
      setObtenidas(userData.insignias || []);
    } catch (err) {
      setTodas([]);
      setObtenidas([]);
    } finally {
      setLoading(false);
    }
  }, [idUsuario]);

  // Refrescar insignias al montar o cuando cambia el usuario
  useEffect(() => {
    fetchInsignias();
  }, [fetchInsignias]);

  return (
    <InsigniasContext.Provider value={{
      todas,
      obtenidas,
      loading,
      refreshInsignias: fetchInsignias
    }}>
      {children}
    </InsigniasContext.Provider>
  );
}