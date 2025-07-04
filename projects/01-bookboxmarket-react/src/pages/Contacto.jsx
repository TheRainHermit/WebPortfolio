import React, { useState, useEffect } from "react";
import face from "../assets/images/face.png";
import twitter from "../assets/images/twitter.png";
import insta from "../assets/images/insta.png";
import whats from "../assets/images/whats.png";

export default function Contacto() {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [suscribirse, setSuscribirse] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState(() => {
    const stored = localStorage.getItem("contactForm");
    return stored ? JSON.parse(stored) : { nombre: "", presupuesto: "", email: "", mensaje: "" };
  });

  useEffect(() => {
    localStorage.setItem("contactForm", JSON.stringify(form));
  }, [form]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setFeedback("");
    try {
      // Aquí iría tu lógica para enviar el mensaje de contacto (si tienes endpoint de contacto)
      // await fetch("http://localhost:3000/api/contacto", { ... });

      // Si el usuario quiere suscribirse, registra el email en la tabla de suscriptores
      if (suscribirse) {
        const res = await fetch("http://localhost:3000/api/suscriptores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, nombre: form.nombre }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al suscribirse");
      }

      setFeedback("¡Mensaje enviado! " + (suscribirse ? "Te suscribiste a novedades." : ""));
      setForm({ nombre: "", presupuesto: "", email: "", mensaje: "" });
      setSuscribirse(false);
    } catch (err) {
      setFeedback("Error al enviar: " + err.message);
    }
  };

  return (
    <div className="contacto-wrapper">
      <h1>Contacto</h1>
      <div className="contacto-content">
        <form className="contacto-form" onSubmit={handleSubmit}>
          <label>Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
          <label>Presupuesto</label>
          <input
            type="text"
            name="presupuesto"
            value={form.presupuesto}
            onChange={handleChange}
          />
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label>Mensaje</label>
          <textarea
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            required
          />
          <label style={{ marginTop: "1em", display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={suscribirse}
              onChange={e => setSuscribirse(e.target.checked)}
              style={{ marginRight: 8 }}
            />
            Quiero recibir novedades y promociones por email
          </label>
          <button type="submit" className="btn_mod">Enviar</button>
        </form>
        {feedback && (
          <div className={`feedback${feedback.toLowerCase().includes("error") ? " error" : ""}`}>
            {feedback}
          </div>
        )}
        <div className="social-media">
          <a href="#" aria-label="Facebook">
            <img src={face} alt="Facebook" />
          </a>
          <a href="#" aria-label="Twitter">
            <img src={twitter} alt="Twitter" />
          </a>
          <a href="#" aria-label="Instagram">
            <img src={insta} alt="Instagram" />
          </a>
          <a href="#" aria-label="WhatsApp">
            <img src={whats} alt="WhatsApp" />
          </a>
        </div>
      </div>
    </div>
  );
}