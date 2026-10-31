-- Akerum reserva una sola "Consulta": en la sesión se ve qué técnica usar. La duración es el bloque que
-- ocupa en la agenda y el cupo, cuántas personas se atienden en el mismo horario. Precio 0 = "A consultar".
-- Solo se carga si la tabla está vacía; después se edita desde el panel (/admin).
insert into treatments (category, name, description, duration_min, price, currency, price_from, capacity, sort)
select * from (values
  ('Consulta', 'Consulta', 'En la consulta vemos juntos qué técnica te sirve más: tarot, numerología, astrología o biodecodificación.', 60, 0, 'UYU', false, 2, 10)
) as t(category, name, description, duration_min, price, currency, price_from, capacity, sort)
where not exists (select 1 from treatments);

-- Lunes a viernes de 9 a 18
insert into weekly_hours (weekday, start_time, end_time)
select d, '09:00', '18:00' from generate_series(1, 5) as d
where not exists (select 1 from weekly_hours);
