import { useState, type FormEvent } from "react";
import type { RecordData } from "../types";
import SocialLinks from "./SocialLinks";
import { api, send } from "../services/api";
export default function Contact({ links }: { links: RecordData[] }) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [success, setSuccess] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setMessage("");
    try {
      await api(
        "/contact",
        send("POST", Object.fromEntries(new FormData(form))),
      );
      setSuccess(true);
      setMessage("Tu mensaje se guardó correctamente. ¡Gracias por escribir!");
      form.reset();
    } catch (error) {
      setSuccess(false);
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="explorer-toolbar">
        Libreta de direcciones <b>›</b> Nuevo mensaje
      </div>
      <div className="content-pad">
        <span className="eyebrow">CONECTEMOS</span>
        <h2>Una conversación puede ser el comienzo.</h2>
        <p>Podés encontrarme en mis redes o dejarme un mensaje.</p>
        <SocialLinks links={links} />
        <form className="contact-form" onSubmit={submit}>
          <div className="form-row">
            <label>
              Tu nombre
              <input
                name="name"
                required
                minLength={2}
                maxLength={120}
                autoComplete="name"
              />
            </label>
            <label>
              Tu email
              <input
                name="email"
                type="email"
                required
                maxLength={254}
                autoComplete="email"
              />
            </label>
          </div>
          <label>
            Asunto
            <input name="subject" required minLength={3} maxLength={160} />
          </label>
          <label>
            Mensaje
            <textarea
              name="message"
              required
              minLength={10}
              maxLength={6000}
              rows={5}
            />
          </label>
          {message && (
            <p role="status" className={success ? "success" : "error"}>
              {message}
            </p>
          )}
          <button className="primary" disabled={busy}>
            {busy ? "Enviando..." : "✉ Enviar mensaje"}
          </button>
        </form>
      </div>
    </>
  );
}
