import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import CambiarContraseña from "./CambiarContraseña";
import InsigniasUsuario from "./InsigniasUsuario";
import RankingUsuarios from "./RankingUsuarios";

export default function PerfilUsuario() {
  const { user, setUser } = useAuth();
  const [editando, setEditando] = useState(false);
  const [tab, setTab] = useState("perfil");
  const [perfil, setPerfil] = useState({
    nombre: user?.nombre || "",
    direccion: user?.direccion || "",
    preferencias_literarias: user?.preferencias_literarias || "",
  });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");

  // Para el indicador animado de la pestaña activa
  const perfilBtnRef = useRef(null);
  const passBtnRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    setPerfil({
      nombre: user?.nombre || "",
      direccion: user?.direccion || "",
      preferencias_literarias: user?.preferencias_literarias || "",
    });
  }, [user]);

  // Mueve el indicador visual bajo la pestaña activa
  useEffect(() => {
    const activeRef = tab === "perfil" ? perfilBtnRef : passBtnRef;
    if (activeRef.current && indicatorRef.current) {
      const { offsetLeft, offsetWidth } = activeRef.current;
      indicatorRef.current.style.left = `${offsetLeft}px`;
      indicatorRef.current.style.width = `${offsetWidth}px`;
    }
  }, [tab]);

  const validarFormulario = () => {
    const errores = {};
    if (!perfil.nombre || perfil.nombre.length < 3) {
      errores.nombre = "El nombre debe tener al menos 3 caracteres";
    }
    if (perfil.preferencias_literarias && perfil.preferencias_literarias.length < 10) {
      errores.preferencias_literarias = "Las preferencias literarias deben tener al menos 10 caracteres";
    }
    setErrores(errores);
    return Object.keys(errores).length === 0;
  };

  const handlePerfilSubmit = async e => {
    e.preventDefault();
    if (!validarFormulario()) return;
    setMensaje("");
    try {
      const res = await fetch("http://localhost:3000/api/usuario/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(perfil),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(prev => ({ ...prev, ...perfil }));
        setEditando(false);
        setMensaje("Perfil actualizado correctamente.");
      } else {
        setMensaje(data.error || "Error al actualizar el perfil");
      }
    } catch (err) {
      setMensaje("Error de red al actualizar el perfil");
    }
  };

  return (
    <div className="perfil-usuario-main">
      {/* Bloque de tabs con indicador visual */}
      <div className="perfil-tabs" style={{ position: "relative" }}>
        <button
          className={`perfil-tab-btn${tab === "perfil" ? " active" : ""}`}
          onClick={() => setTab("perfil")}
          ref={perfilBtnRef}
        >
          Perfil
        </button>
        <button
          className={`perfil-tab-btn${tab === "contraseña" ? " active" : ""}`}
          onClick={() => setTab("contraseña")}
          ref={passBtnRef}
        >
          Cambiar contraseña
        </button>
        {/* Indicador visual */}
        <span
          ref={indicatorRef}
          className="perfil-tab-indicator"
          aria-hidden="true"
        />
      </div>

      {tab === "perfil" && (
        <>
          <section className="perfil-card">
            <h2>Mi Perfil</h2>
            {editando ? (
              <form onSubmit={handlePerfilSubmit} className="form-editar-perfil">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={perfil.nombre}
                    onChange={e => setPerfil({ ...perfil, nombre: e.target.value })}
                    className={errores.nombre ? "input-error" : ""}
                  />
                  {errores.nombre && <div className="error-message">{errores.nombre}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="direccion">Dirección:</label>
                  <input
                    type="text"
                    id="direccion"
                    name="direccion"
                    value={perfil.direccion}
                    onChange={e => setPerfil({ ...perfil, direccion: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="preferencias_literarias">Preferencias literarias:</label>
                  <textarea
                    id="preferencias_literarias"
                    name="preferencias_literarias"
                    value={perfil.preferencias_literarias}
                    onChange={e => setPerfil({ ...perfil, preferencias_literarias: e.target.value })}
                    className={errores.preferencias_literarias ? "input-error" : ""}
                  />
                  {errores.preferencias_literarias && (
                    <div className="error-message">{errores.preferencias_literarias}</div>
                  )}
                </div>

                <div className="form-buttons">
                  <button type="submit" className="btn_mod btn-primary">Guardar</button>
                  <button type="button" onClick={() => setEditando(false)} className="btn_mod btn-secondary">Cancelar</button>
                </div>
                {mensaje && <div className="feedback">{mensaje}</div>}
              </form>
            ) : (
              <div className="datos-visual">
                <p><b>Nombre:</b> {user?.nombre}</p>
                <p><b>Dirección:</b> {user?.direccion || "No especificada"}</p>
                <p><b>Preferencias literarias:</b> {user?.preferencias_literarias || "No especificadas"}</p>
                <button onClick={() => setEditando(true)} className="btn_mod btn-edit">Editar perfil</button>
              </div>
            )}
          </section>

          <section>
            <div className="section-title">Insignias obtenidas</div>
            <InsigniasUsuario />
          </section>

          <section>
            <div className="section-title">Ranking de usuarios más activos</div>
            <RankingUsuarios />
          </section>
        </>
      )}

      {tab === "contraseña" && <CambiarContraseña />}
    </div>
  );
}