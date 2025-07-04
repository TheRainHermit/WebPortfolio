import React, { useEffect, useState } from "react";

export default function RankingUsuarios() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRanking() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3000/api/ranking");
        if (!res.ok) {
          throw new Error("Error al cargar el ranking");
        }
        const data = await res.json();
        setRanking(data.ranking || []);
      } catch (err) {
        console.error("Error al obtener ranking:", err);
        setError("No se pudo cargar el ranking. Intenta recargar la página.");
      } finally {
        setLoading(false);
      }
    }
    fetchRanking();
  }, []);

  if (loading) return <div>Cargando ranking...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!ranking.length) return <div>No hay usuarios en el ranking.</div>;

  return (
    <div className="ranking-list">
      <h2>Ranking de usuarios más activos</h2>
      <ol>
        {ranking.map((user, idx) => (
          <li key={`user-${user.id_usuario || idx}`}>
            <strong>{idx + 1}. {user.nombre} {user.apellido}</strong> — {user.puntos} puntos
          </li>
        ))}
      </ol>
    </div>
  );
}