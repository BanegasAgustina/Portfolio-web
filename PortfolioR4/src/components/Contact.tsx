/*
 * Archivo: src/components/Contact.tsx
 * Propósito:
 * Ventana pública de contacto. Recibe links para SocialLinks y cv como URL opcional del currículum.
 * Muestra email, redes y descarga del CV; usa el PDF público si no se configuró otra URL.
 * Esta versión no tiene formulario ni envía mensajes al endpoint /api/contact.
 */
import type { RecordData } from "../types";
import SocialLinks from "./SocialLinks";
import Icon from "./Icon";
// Recibe redes y CV; devuelve enlaces. Los clics los resuelve el navegador, no la API.
export default function Contact({
  links,
  cv,
}: {
  links: RecordData[];
  cv?: string;
}) {
  return (
    <>
      <div className="explorer-toolbar">
        Libreta de direcciones <b>›</b> Contacto
      </div>
      <div className="contact-details">
        <h2>Hablemos</h2>
        <p>Podés encontrarme por email o en mis redes profesionales.</p>
        <a className="email-link" href="mailto:agustinabanegas26@gmail.com">
          <Icon name="email" size={24} />
          <span>agustinabanegas26@gmail.com</span>
        </a>
        <SocialLinks links={links} />
        <a
          className="primary download-cv"
          href={cv || "/cv/Agustina-Banegas-CV.pdf"}
          download="Agustina-Banegas-CV.pdf"
        >
          <Icon name="document" size={23} />
          Descargar Curriculum
        </a>
      </div>
    </>
  );
}
