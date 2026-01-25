-- database.sql

-- 1. Crear la tabla de cupones (si no existe)
CREATE TABLE IF NOT EXISTS cupones (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    fecha_uso TIMESTAMP WITH TIME ZONE
);

-- 2. Limpiar datos viejos (opcional, cuidado!)
-- DELETE FROM cupones;

-- 3. Insertar tus cupones iniciales
INSERT INTO cupones (id, nombre, usado) VALUES
    ('cupon_masajes', 'Vale por Masajes', false),
    ('cupon_cena', 'Vale por Cena Casera', false),
    ('cupon_peli', 'Vale por Elegir Peli', false),
    ('cupon_helado', 'Vale por Helado', false)
ON CONFLICT (id) DO NOTHING; -- Esto evita errores si ya existen

-- 4. Ver qué cargaste
SELECT * FROM cupones;  