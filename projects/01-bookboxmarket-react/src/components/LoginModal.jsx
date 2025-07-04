import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import "./LoginModal.css";
import avatar from "../assets/images/user.png";

export default function LoginModal({ show, onClose }) {
  const { setUser, setToken } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!show) return null;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await axios.post("http://localhost:3000/api/login", form, { withCredentials: true });
      // El backend responde con { user, token }
      setUser(res.data.user);
      setToken(res.data.token);
      setForm({ email: "", password: "" });
      setSuccess("¡Inicio de sesión exitoso!");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch (err) {
      setError("Credenciales inválidas o error de servidor.");
    }
  };

  return (
    <div className="modal">
      <form className="modal-content animate" onSubmit={handleSubmit}>
        <span onClick={onClose} className="close" title="Cerrar Modal">
          &times;
        </span>
        <div className="imgcontainer">
          <img src={avatar} alt="Avatar" className="avatar" />
        </div>
        <div className="container">
          <h2 className="login-title">Iniciar Sesión</h2>
          <label htmlFor="email"><b>Correo electrónico</b></label>
          <input
            type="email"
            name="email"
            className="input_usu"
            placeholder="Ingresa tu correo"
            required
            value={form.email}
            onChange={handleChange}
            autoComplete="username"
          />
          <label htmlFor="password"><b>Contraseña</b></label>
          <input
            type="password"
            name="password"
            className="pass_login"
            placeholder="Contraseña"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={handleChange}
          />
          <div style={{ display: "flex", alignItems: "center", margin: "10px 0" }}>
            <input type="checkbox" defaultChecked style={{ marginRight: 8 }} /> Recuérdame
          </div>
          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">{success}</p>}
          <button type="submit" className="btn_mod">Iniciar sesión</button>
          <button type="button" onClick={onClose} className="cancelbtn">
            Cancelar
          </button>
          <div className="login-secondary-actions">
            <span className="psw">
              ¿Nuevo por aquí?{" "}
              <a href="/registro" className="login-link">
                Regístrate
              </a>
            </span>
            <br />
            <span className="psw">
              <a href="#" className="login-link">
                ¿Olvidaste tu contraseña?
              </a>
            </span>
            <br />
            <br />
            <br />
          </div>
        </div>
      </form>
    </div>
  );
}