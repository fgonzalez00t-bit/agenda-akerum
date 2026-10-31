// Toda la configuración sale de variables de entorno (ver .env.example).
export const config = {
  businessName: process.env.BUSINESS_NAME || 'Akerum',
  tagline: process.env.BUSINESS_TAGLINE || 'Tarot · Numerología · Astrología · Biodecodificación',
  address: process.env.BUSINESS_ADDRESS || '',
  instagramUrl: process.env.INSTAGRAM_URL || '',
  whatsappNumber: (process.env.WHATSAPP_NUMBER || '').replace(/\D/g, ''),
  timezone: process.env.TIMEZONE || 'America/Montevideo',
  countryCode: (process.env.COUNTRY_CODE || '598').replace(/\D/g, ''),
  slotStepMin: Number(process.env.SLOT_STEP_MIN || 60),
  daysAhead: Number(process.env.DAYS_AHEAD || 60),
  minNoticeHours: Number(process.env.MIN_NOTICE_HOURS || 12),
  publicUrl: (process.env.PUBLIC_URL || 'http://localhost:3000').replace(/\/$/, ''),
};

export function publicConfig() {
  const { businessName, tagline, address, instagramUrl, whatsappNumber } = config;
  return { businessName, tagline, address, instagramUrl, whatsappNumber };
}
