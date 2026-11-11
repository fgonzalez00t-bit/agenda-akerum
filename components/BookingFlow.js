'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { WhatsAppIcon } from './Icons';
import { MODALITIES, formatDate, formatDuration, formatPrice, waLink } from '@/lib/format';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAY_HEADERS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

const pad = (n) => String(n).padStart(2, '0');
const isoDate = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;

function todayIso() {
  const d = new Date();
  return isoDate(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDaysIso(date, n) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Precio más bajo de una categoría, para mostrar "desde ..." en su tarjeta.
function fromPrice(list) {
  const priced = list.filter((t) => Number(t.price) > 0);
  if (priced.length === 0) return 'precio a consultar';
  const byCurrency = {};
  for (const t of priced) byCurrency[t.currency] = Math.min(byCurrency[t.currency] ?? Infinity, t.price);
  const [currency, price] = Object.entries(byCurrency)[0];
  return formatPrice(price, currency, true);
}

// En pantallas anchas el calendario va en la columna derecha; en el celular, debajo del servicio elegido.
function useIsWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return wide;
}

export default function BookingFlow({ treatments, business }) {
  // Con un solo servicio (la consulta de Akerum) no hay nada que elegir: se va directo al calendario.
  const single = treatments.length === 1 ? treatments[0] : null;
  const [category, setCategory] = useState(null);
  const [treatment, setTreatment] = useState(single);
  const [days, setDays] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [form, setForm] = useState({ modality: '', name: '', phone: '', notes: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null);
  const wide = useIsWide();
  const listRef = useRef(null);
  const scheduleRef = useRef(null);

  useEffect(() => {
    if (!treatment) return;
    let cancelled = false;
    setDays(null);
    setLoadError('');
    const from = todayIso();
    fetch(`/api/availability?treatmentId=${treatment.id}&from=${from}&to=${addDaysIso(from, 120)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        setDays(data.days);
        // Abre el calendario en el mes del primer turno libre.
        const first = Object.keys(data.days).sort()[0];
        if (first) setMonth({ y: Number(first.slice(0, 4)), m: Number(first.slice(5, 7)) - 1 });
      })
      .catch(() => !cancelled && setLoadError('No pudimos cargar los horarios. Probá de nuevo en un momento.'));
    return () => {
      cancelled = true;
    };
  }, [treatment]);

  // Con la reserva hecha, se oculta el encabezado (logo y redes) y queda solo la confirmación.
  useEffect(() => {
    document.body.classList.toggle('booking-done', Boolean(done));
  }, [done]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const t of treatments) {
      const key = t.category || 'Otros servicios';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    }
    return [...map];
  }, [treatments]);

  const currentList = groups.find(([c]) => c === category)?.[1] ?? [];

  function chooseCategory(c) {
    setCategory(c);
    setTreatment(null);
    setDate(null);
    setTime(null);
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }

  function chooseTreatment(t) {
    setTreatment(t);
    setDate(null);
    setTime(null);
    setError('');
    requestAnimationFrame(() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  }

  async function submit(e) {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ treatmentId: treatment.id, date, time, ...form }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se pudo reservar.');
        if (res.status === 409) {
          setTime(null);
          setDays((prev) => ({ ...prev, [date]: (prev?.[date] ?? []).filter((t) => t !== time) }));
        }
        return;
      }
      setDone(data.booking);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Hubo un problema de conexión. Probá de nuevo.');
    } finally {
      setSending(false);
    }
  }

  if (done) {
    const message = [
      `Hola! Soy ${form.name}. Acabo de reservar ${treatment.name} ${MODALITIES[form.modality].phrase} para el ${formatDate(date).toLowerCase()} a las ${time}.`,
      `Para confirmarla: ${window.location.origin}/admin/reserva/${done.id}`,
    ].join('\n\n');
    return (
      <section className="section">
        <div className="card center done-card">
          <div className="check">✓</div>
          <h2 className="title">¡Ya casi está!</h2>
          <p>
            <strong>{treatment.name} · {MODALITIES[form.modality].label}</strong>
            <br />
            {formatDate(date)} · {time} hs
          </p>
          {business.whatsappNumber ? (
            <>
              <p><strong>Último paso:</strong> enviale el aviso a {business.businessName} por WhatsApp para que confirme tu turno.</p>
              <a className="btn btn-wa btn-lg" href={waLink(business.whatsappNumber, message)} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon /> Enviar aviso por WhatsApp
              </a>
              <p className="muted small">El turno queda reservado a tu nombre y pendiente hasta que {business.businessName} lo confirme.</p>
            </>
          ) : (
            <p className="muted">Tu turno queda pendiente hasta que {business.businessName} lo confirme. Te va a escribir al {form.phone}.</p>
          )}
        </div>
      </section>
    );
  }

  const schedule = treatment && (
    <Schedule
      ref={scheduleRef}
      treatment={treatment}
      days={days}
      loadError={loadError}
      month={month}
      setMonth={setMonth}
      date={date}
      setDate={(d) => {
        setDate(d);
        setTime(null);
      }}
      time={time}
      setTime={setTime}
      form={form}
      setForm={setForm}
      sending={sending}
      error={error}
      onSubmit={submit}
    />
  );

  if (single) {
    return (
      <section className="section booking-area single">
        <div className="booking-grid">
          <div className="treat-col">
            <p className="eyebrow">Reservá tu turno online</p>
            <h2 className="title">Reservá tu {single.name.toLowerCase()}</h2>
            {single.description && <p className="muted">{single.description}</p>}
            <ul className="facts">
              <li><strong>Duración</strong> variable, reservamos {formatDuration(single.duration_min)}</li>
              <li><strong>Valor</strong> {formatPrice(single.price, single.currency, single.price_from)}</li>
              <li><strong>Modalidad</strong> presencial o por Zoom, la elegís al reservar</li>
              <li><strong>Cómo</strong> elegí un día y un horario; te confirmamos por WhatsApp</li>
            </ul>
            {!wide && schedule}
          </div>
          {wide && <aside className="side-col">{schedule}</aside>}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="band">
        <Scallops className="wave wave-top" />
        <div className="band-inner">
          <p className="eyebrow light">Reservá tu turno online</p>
          <h2 className="band-title">Elegí tu sesión</h2>
          <div className="cat-grid">
            {groups.map(([c, list], i) => (
              <button
                key={c}
                type="button"
                className={`cat-tile tone-${i % 5} ${category === c ? 'selected' : ''}`}
                onClick={() => chooseCategory(c)}
                aria-pressed={category === c}
              >
                <span className="cat-name">{c}</span>
                <span className="cat-meta">
                  {list.length === 1
                    ? `${formatDuration(list[0].duration_min)} · ${Number(list[0].price) ? formatPrice(list[0].price, list[0].currency, list[0].price_from) : 'a consultar'}`
                    : `${list.length} opciones · ${fromPrice(list)}`}
                </span>
                <span className="cat-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
          {treatments.length === 0 && <p className="light">Por el momento no hay servicios disponibles para reservar online.</p>}
        </div>
        <Scallops className="wave wave-bottom" />
      </section>

      {category && (
        <section className="section booking-area" ref={listRef}>
          <div className="booking-grid">
            <div className="treat-col">
              <h2 className="title">{category}</h2>
              <p className="muted">Elegí una opción para ver los días disponibles.</p>
              <div className="treatments">
                {currentList.map((t) => (
                  <div key={t.id} className="treatment-wrap">
                    <button
                      type="button"
                      className={`treatment ${treatment?.id === t.id ? 'selected' : ''}`}
                      onClick={() => chooseTreatment(t)}
                      aria-pressed={treatment?.id === t.id}
                    >
                      <span className="treatment-name">{t.name}</span>
                      {t.description && <span className="treatment-desc">{t.description}</span>}
                      <span className="treatment-meta">
                        <span>⏱ {formatDuration(t.duration_min)} aprox.</span>
                        <span className="price">{formatPrice(t.price, t.currency, t.price_from)}</span>
                      </span>
                    </button>
                    {!wide && treatment?.id === t.id && schedule}
                  </div>
                ))}
              </div>
            </div>
            {wide && (
              <aside className="side-col">
                {schedule || (
                  <div className="side-empty">
                    <FolderCalendar month={month} days={{}} lastDate={todayIso()} onSelect={() => {}} setMonth={setMonth} />
                    <p className="muted center">Elegí un servicio a la izquierda para ver los días libres.</p>
                  </div>
                )}
              </aside>
            )}
          </div>
        </section>
      )}
    </>
  );
}

// Borde festoneado, como las tarjetas de la identidad de Akerum.
const SCALLOPS = `M0,24 ${'a20,20 0 0 1 40,0 '.repeat(36)}L1440,40 L0,40 Z`;

export function Scallops({ className }) {
  return (
    <svg className={className} viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true">
      <path d={SCALLOPS} />
    </svg>
  );
}

function Schedule({ ref, treatment, days, loadError, month, setMonth, date, setDate, time, setTime, form, setForm, sending, error, onSubmit }) {
  const availableDates = Object.keys(days ?? {}).sort();
  return (
    <div className="schedule" ref={ref}>
      {loadError && <p className="error">{loadError}</p>}
      {!days && !loadError && <p className="muted">Cargando horarios…</p>}
      {days && availableDates.length === 0 && (
        <p className="muted">No hay turnos libres para este servicio en las próximas semanas. Escribinos por WhatsApp.</p>
      )}
      {days && availableDates.length > 0 && (
        <>
          <FolderCalendar
            month={month}
            setMonth={setMonth}
            days={days}
            selected={date}
            time={time}
            treatment={treatment}
            lastDate={availableDates[availableDates.length - 1]}
            onSelect={setDate}
          />
          {date && (
            <div className="slots-panel">
              <p className="slots-title">Horarios del {formatDate(date).toLowerCase()}</p>
              {(days[date] ?? []).length === 0 && <p className="muted">Ya no quedan horarios este día.</p>}
              <div className="slots">
                {(days[date] ?? []).map((t) => (
                  <button key={t} type="button" className={`slot ${time === t ? 'selected' : ''}`} onClick={() => setTime(t)}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {date && time && (
            <form onSubmit={onSubmit} className="form booking-form">
              <p className="form-title">Tus datos</p>
              <fieldset className="modality">
                <legend>¿Cómo querés tu consulta?</legend>
                <div className="modality-options">
                  {Object.entries(MODALITIES).map(([key, m]) => (
                    <label key={key} className={`modality-option ${form.modality === key ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="modality"
                        value={key}
                        required
                        checked={form.modality === key}
                        onChange={() => setForm({ ...form, modality: key })}
                      />
                      <span className="modality-name">{m.label}</span>
                      <span className="modality-hint">{m.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <label>
                Nombre y apellido
                <input required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
              </label>
              <label>
                WhatsApp
                <input required type="tel" inputMode="tel" placeholder="099 123 456" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
              </label>
              <label>
                Comentario (opcional)
                <textarea rows={2} maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </label>
              <input className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              {error && <p className="error">{error}</p>}
              <button className="btn" disabled={sending}>{sending ? 'Reservando…' : 'Confirmar reserva'}</button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

// Calendario con forma de carpeta: pestaña azul con el mes y círculo dibujado a mano en el día elegido.
function FolderCalendar({ month, setMonth, days, selected, time, treatment, lastDate, onSelect }) {
  const now = new Date();
  const first = new Date(month.y, month.m, 1);
  const daysInMonth = new Date(month.y, month.m + 1, 0).getDate();
  const offset = (first.getDay() + 6) % 7; // la semana empieza el lunes
  const canPrev = month.y > now.getFullYear() || (month.y === now.getFullYear() && month.m > now.getMonth());
  const canNext = isoDate(month.y, month.m, daysInMonth) < lastDate;
  const shift = (n) => {
    const d = new Date(month.y, month.m + n, 1);
    setMonth({ y: d.getFullYear(), m: d.getMonth() });
  };

  return (
    <div className="folder">
      <div className="folder-tab">
        <span>{MONTHS[month.m].toUpperCase()}</span>
        <span className="folder-nav">
          <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Mes anterior">‹</button>
          <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label="Mes siguiente">›</button>
        </span>
      </div>
      <div className="folder-body">
        <div className="cal-grid cal-dows">
          {DAY_HEADERS.map((d) => <span key={d} className="cal-dow">{d}</span>)}
        </div>
        <div className="cal-grid">
          {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const iso = isoDate(month.y, month.m, i + 1);
            const available = (days[iso] ?? []).length > 0;
            const isSelected = selected === iso;
            return (
              <button
                key={iso}
                type="button"
                className={`cal-day ${available ? 'available' : ''} ${isSelected ? 'selected' : ''}`}
                disabled={!available}
                onClick={() => onSelect(iso)}
                aria-pressed={isSelected}
              >
                {i + 1}
                {isSelected && (
                  <svg className="cal-circle" viewBox="0 0 60 36" aria-hidden="true">
                    <path d="M8,20 C6,9 26,3 41,5 C55,7 58,18 50,26 C42,33 18,34 9,27 C4,23 5,16 12,11" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
        {treatment && (
          <div className="folder-foot">
            <p className="folder-when">
              {selected ? formatDate(selected).toUpperCase() : 'ELEGÍ UN DÍA'}
              <br />
              {time ? `${time} HS · HORA URUGUAY` : selected ? 'ELEGÍ UN HORARIO' : 'LOS DÍAS RESALTADOS TIENEN LUGAR'}
            </p>
            <div className="ticket" aria-label={`Inversión ${formatPrice(treatment.price, treatment.currency, treatment.price_from)}`}>
              <span className="ticket-label">Inversión</span>
              <span className="ticket-price">{formatPrice(treatment.price, treatment.currency, treatment.price_from)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
