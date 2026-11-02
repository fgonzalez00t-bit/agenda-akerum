import BookingFlow, { Scallops } from '@/components/BookingFlow';
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons';
import Services from '@/components/Services';
import { config, publicConfig } from '@/lib/config';
import { sql } from '@/lib/db';
import { waLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Si la base falla, la página igual se muestra (sin calendario) y el motivo queda en los logs y en /api/salud.
  let treatments = [];
  let dbError = false;
  try {
    treatments = await sql`
      select id, category, name, description, duration_min, price, currency, price_from
      from treatments where active order by sort, name`;
  } catch (err) {
    console.error('No se pudo leer la base de datos:', err);
    dbError = true;
  }

  return (
    <main>
      <header className="hero">
        <h1 className="logo">
          <img src="/akerum-logo-navy.svg" alt={config.businessName} />
        </h1>
        <p className="eyebrow">{config.tagline}</p>
        {config.address && <p className="muted">{config.address}</p>}
        {(config.instagramUrl || config.whatsappNumber) && (
          <nav className="social">
            {config.instagramUrl && (
              <a href={config.instagramUrl} target="_blank" rel="noopener noreferrer" className="pill">
                <InstagramIcon /> Instagram
              </a>
            )}
            {config.whatsappNumber && (
              <a href={waLink(config.whatsappNumber, 'Hola! Te escribo por una consulta.')} target="_blank" rel="noopener noreferrer" className="pill">
                <WhatsAppIcon /> WhatsApp
              </a>
            )}
          </nav>
        )}
      </header>

      {dbError ? (
        <section className="section center">
          <p className="muted">La reserva online no está disponible en este momento. Escribinos por WhatsApp y te damos un turno.</p>
        </section>
      ) : (
        <BookingFlow treatments={treatments} business={publicConfig()} />
      )}
      {(dbError || treatments.length === 1) && <Services Edge={Scallops} />}

      <footer className="footer muted">
        Los turnos quedan pendientes hasta que {config.businessName} los confirme por WhatsApp.
      </footer>
    </main>
  );
}
