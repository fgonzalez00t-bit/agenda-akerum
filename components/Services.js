// Qué hace Akerum, con el texto que mandó Federico. Es informativo: lo que se reserva es la consulta.
const TOOLS = [
  'Tarot', 'Astrología', 'Psicología', 'Numerología', 'Medicina tradicional china',
  'Biodecodificación', 'PNL', 'Constelaciones', 'Registros akáshicos',
];

const MODES = [
  { name: 'A corto plazo', text: 'Consultas breves y focalizadas, orientadas a abordar una situación o conflicto puntual.' },
  { name: 'A largo plazo', text: 'Sobre todo ofrecemos sostén terapéutico y acompañamiento continuo en tus procesos.' },
];

const WORKSHOPS = [
  { name: 'Acción de Gracias', when: 'Jueves 26/11' },
  { name: 'Círculo de Mujeres', when: 'Próximamente anunciaremos la fecha' },
  { name: 'Encuentros y propuestas', when: 'Diversos encuentros y propuestas que van surgiendo según la energía disponible del momento' },
];

export default function Services({ Edge }) {
  return (
    <section className="band services">
      <Edge className="wave wave-top" />
      <div className="band-inner">
        <p className="eyebrow light">Qué hacemos</p>
        <h2 className="band-title">Te guiamos y acompañamos</h2>
        <div className="about">
          <p className="about-lead">En Akerum nos dedicamos a guiarte y acompañarte en tus procesos terapéuticos.</p>
          <p>Trabajamos con distintas herramientas y técnicas, como:</p>
          <ul className="tools">
            {TOOLS.map((t, i) => <li key={t} className={`tone-${i % 4}`}>{t}</li>)}
          </ul>
          <p>Seleccionamos y aplicamos cada una según lo que resuene con cada persona y las necesidades particulares de su proceso.</p>
        </div>

        <h3 className="band-sub">Modalidades de trabajo</h3>
        <div className="cat-grid two">
          {MODES.map((m, i) => (
            <div key={m.name} className={`cat-tile info tone-${i ? 1 : 2}`}>
              <span className="cat-name">{m.name}</span>
              <span className="cat-desc">{m.text}</span>
            </div>
          ))}
        </div>

        <h3 className="band-sub">Espacios complementarios a la terapia</h3>
        <div className="cat-grid one">
          <div className="cat-tile info tone-0">
            <span className="cat-name">Lecturas individuales de Registros Akáshicos</span>
            <span className="cat-desc">Los miércoles de noviembre y diciembre, de 10:00 a 18:00 hrs.</span>
            <span className="cat-price">Valor: $2.200</span>
          </div>
        </div>

        <h3 className="band-sub">Talleres</h3>
        <div className="cat-grid">
          {WORKSHOPS.map((w, i) => (
            <div key={w.name} className={`cat-tile info tone-${[3, 4, 3][i]}`}>
              <span className="cat-name">{w.name}</span>
              <span className="cat-desc">{w.when}</span>
            </div>
          ))}
        </div>
      </div>
      <Edge className="wave wave-bottom" />
    </section>
  );
}
