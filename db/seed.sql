-- Servicios iniciales de Akerum (textos de su identidad visual). Precio 0 = "A consultar" hasta que
-- se cargue el real; duraciones provisorias. Solo se cargan si las tablas están vacías; después se
-- editan desde el panel (/admin).
insert into treatments (category, name, description, duration_min, price, currency, price_from, sort)
select * from (values
  ('Tarot', 'Lectura de tarot', 'El tarot es un conjunto de cartas que sirve para reflexionar sobre la vida, decisiones y posibilidades, usando símbolos y arquetipos.', 60, 0, 'UYU', false, 10),
  ('Numerología', 'Sesión de numerología', 'La numerología estudia los números vinculados a la vida de una persona para comprender patrones, talentos y posibles caminos.', 60, 0, 'UYU', false, 20),
  ('Astrología', 'Sesión de astrología', 'La astrología estudia la influencia de los astros en la personalidad y la vida de las personas, ayudando a reflexionar sobre patrones y posibilidades.', 60, 0, 'UYU', false, 30),
  ('Biodecodificación', 'Sesión de biodecodificación', 'La biodecodificación busca entender el origen emocional de las enfermedades, viendo los síntomas como señales de conflictos internos no resueltos.', 60, 0, 'UYU', false, 40),
  ('Alquimia', 'Sesión de alquimia', 'Definimos alquimia como la suma de técnicas que se complementan.', 90, 0, 'UYU', false, 50)
) as t(category, name, description, duration_min, price, currency, price_from, sort)
where not exists (select 1 from treatments);

-- Lunes a viernes de 9 a 18
insert into weekly_hours (weekday, start_time, end_time)
select d, '09:00', '18:00' from generate_series(1, 5) as d
where not exists (select 1 from weekly_hours);
