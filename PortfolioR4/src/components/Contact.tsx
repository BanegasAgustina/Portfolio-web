import type { RecordData } from "../types";
import SocialLinks from "./SocialLinks";
import Icon from "./Icon";
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
