import BookingFlow, { Scallops } from '@/components/BookingFlow';
import { InstagramIcon, WhatsAppIcon } from '@/components/Icons';
import Services from '@/components/Services';
import { config, publicConfig } from '@/lib/config';
import { sql } from '@/lib/db';
import { waLink } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const treatments = await sql`
    select id, category, name, description, duration_min, price, currency, price_from
    from treatments where active order by sort, name`;

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

      <BookingFlow treatments={treatments} business={publicConfig()} />
      {treatments.length === 1 && <Services Edge={Scallops} />}

      <footer className="footer muted">
        Los turnos quedan pendientes hasta que {config.businessName} los confirme por WhatsApp.
      </footer>
    </main>
  );
}
