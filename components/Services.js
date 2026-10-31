// Técnicas de Akerum, con los textos de su identidad visual. Son informativas: se reserva una consulta.
const SERVICES = [
  { name: 'Tarot', text: 'Un conjunto de cartas que sirve para reflexionar sobre la vida, decisiones y posibilidades, usando símbolos y arquetipos.' },
  { name: 'Numerología', text: 'Estudia los números vinculados a la vida de una persona para comprender patrones, talentos y posibles caminos.' },
  { name: 'Astrología', text: 'Estudia la influencia de los astros en la personalidad y la vida de las personas, ayudando a reflexionar sobre patrones y posibilidades.' },
  { name: 'Biodecodificación', text: 'Busca entender el origen emocional de las enfermedades, viendo los síntomas como señales de conflictos internos no resueltos.' },
  { name: 'Alquimia', text: 'Definimos alquimia como la suma de técnicas que se complementan.' },
];

export default function Services({ Edge }) {
  return (
    <section className="band services">
      <Edge className="wave wave-top" />
      <div className="band-inner">
        <p className="eyebrow light">En la consulta</p>
        <h2 className="band-title">Lo que trabajamos</h2>
        <div className="cat-grid">
          {SERVICES.map((s, i) => (
            <div key={s.name} className={`cat-tile info tone-${i % 5}`}>
              <span className="cat-name">{s.name}</span>
              <span className="cat-desc">{s.text}</span>
            </div>
          ))}
        </div>
      </div>
      <Edge className="wave wave-bottom" />
    </section>
  );
}
