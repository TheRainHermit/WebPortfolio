import React from "react";
import { useInsignias } from "../context/InsigniasContext";

export default function InsigniasUsuario() {
  const { todas, obtenidas, loading, refreshInsignias } = useInsignias();

  if (loading) return <div>Cargando insignias...</div>;
  if (!todas.length) return <div>No hay insignias disponibles.</div>;

  const idsObtenidas = new Set(obtenidas.map(i => i.id_insignia));

  return (
    <div className="insignias-list">
      {todas.map(ins => {
        const obtenida = idsObtenidas.has(ins.id_insignia);
        const info = obtenidas.find(i => i.id_insignia === ins.id_insignia);
        return (
          <div
            key={ins.id_insignia}
            className={`insignia-card${obtenida ? "" : " bloqueada"}`}
            title={obtenida ? ins.descripcion : "Insignia bloqueada"}
          >
            <span className="insignia-icon">{ins.icono}</span>
            <div>
              <strong>{ins.nombre}</strong>
              <div>
                {obtenida
                  ? ins.descripcion
                  : <span style={{ color: "#999" }}>Bloqueada</span>}
              </div>
              {obtenida && info?.fecha && (
                <small>Obtenida: {new Date(info.fecha).toLocaleDateString()}</small>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}