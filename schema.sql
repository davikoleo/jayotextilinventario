-- Habilitar la extensión uuid-ossp (opcional, pero buena práctica si se usa en raw postgres)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Creación de la tabla de inventario
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name TEXT NOT NULL,
    format TEXT NOT NULL CHECK (format IN ('cajas', 'unidades')),
    size TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    total_units INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN format = 'cajas' THEN quantity * 3 
            ELSE quantity 
        END
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index para optimizar las búsquedas por modelo y talla
CREATE INDEX idx_inventory_model_name ON inventory_items(model_name);
CREATE INDEX idx_inventory_size ON inventory_items(size);

-- Función y trigger para actualizar updated_at (opcional pero útil)
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_modtime
BEFORE UPDATE ON inventory_items
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- SEED DATA (Carga Inicial)
-- ==========================================
-- A. Modelos por Cajas (1 Cj = 3 Und)
-- ==========================================

-- Sirenita (S-15)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Sirenita (S-15)', 'cajas', '12', 5),
('Sirenita (S-15)', 'cajas', '16', 8),
('Sirenita (S-15)', 'cajas', '10', 2),
('Sirenita (S-15)', 'cajas', '14', 7),
('Sirenita (S-15)', 'cajas', '4', 3),
('Sirenita (S-15)', 'cajas', '8', 3),
('Sirenita (S-15)', 'cajas', '6', 3);

-- Princesita (B-18)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Princesita (B-18)', 'cajas', '4', 12),
('Princesita (B-18)', 'cajas', '6', 4),
('Princesita (B-18)', 'cajas', '8', 8),
('Princesita (B-18)', 'cajas', '10', 7),
('Princesita (B-18)', 'cajas', '12', 8),
('Princesita (B-18)', 'cajas', '14', 11),
('Princesita (B-18)', 'cajas', '16', 7);

-- Pajarita (R-05)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Pajarita (R-05)', 'cajas', '6', 5),
('Pajarita (R-05)', 'cajas', '8', 4),
('Pajarita (R-05)', 'cajas', '10', 6),
('Pajarita (R-05)', 'cajas', '12', 6),
('Pajarita (R-05)', 'cajas', '14', 5),
('Pajarita (R-05)', 'cajas', '16', 5),
('Pajarita (R-05)', 'cajas', '4', 6);

-- Boxer Sara (CN-20)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Boxer Sara (CN-20)', 'cajas', '10', 6),
('Boxer Sara (CN-20)', 'cajas', '12', 2),
('Boxer Sara (CN-20)', 'cajas', '6', 6),
('Boxer Sara (CN-20)', 'cajas', '14', 2),
('Boxer Sara (CN-20)', 'cajas', '8', 5),
('Boxer Sara (CN-20)', 'cajas', '16', 1);

-- Cachetero Liz (CN-17)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Cachetero Liz (CN-17)', 'cajas', '10', 5),
('Cachetero Liz (CN-17)', 'cajas', '6', 5),
('Cachetero Liz (CN-17)', 'cajas', '12', 8),
('Cachetero Liz (CN-17)', 'cajas', '8', 2),
('Cachetero Liz (CN-17)', 'cajas', '14', 5),
('Cachetero Liz (CN-17)', 'cajas', '16', 8);

-- Flamingo (B-19)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Flamingo (B-19)', 'cajas', '12', 8),
('Flamingo (B-19)', 'cajas', '14', 4),
('Flamingo (B-19)', 'cajas', '16', 3),
('Flamingo (B-19)', 'cajas', '8', 2),
('Flamingo (B-19)', 'cajas', '10', 2),
('Flamingo (B-19)', 'cajas', '4', 2),
('Flamingo (B-19)', 'cajas', '6', 4);

-- Monita (S-07)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Monita (S-07)', 'cajas', '16', 10),
('Monita (S-07)', 'cajas', '8', 7),
('Monita (S-07)', 'cajas', '4', 7),
('Monita (S-07)', 'cajas', '7', 7),
('Monita (S-07)', 'cajas', '10', 4),
('Monita (S-07)', 'cajas', '12', 7),
('Monita (S-07)', 'cajas', '14', 1);

-- Boxer (CN-26)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Boxer (CN-26)', 'cajas', '4', 7),
('Boxer (CN-26)', 'cajas', '6', 15),
('Boxer (CN-26)', 'cajas', '8', 11),
('Boxer (CN-26)', 'cajas', '12', 6),
('Boxer (CN-26)', 'cajas', '16', 7),
('Boxer (CN-26)', 'cajas', '14', 6),
('Boxer (CN-26)', 'cajas', '10', 5);

-- Astronauta (HP-07)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Astronauta (HP-07)', 'cajas', '4', 11),
('Astronauta (HP-07)', 'cajas', '6', 3),
('Astronauta (HP-07)', 'cajas', '8', 10),
('Astronauta (HP-07)', 'cajas', '10', 2),
('Astronauta (HP-07)', 'cajas', '12', 10),
('Astronauta (HP-07)', 'cajas', '14', 5),
('Astronauta (HP-07)', 'cajas', '16', 5);

-- Gamer (HP-12)
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Gamer (HP-12)', 'cajas', '4', 2),
('Gamer (HP-12)', 'cajas', '6', 4),
('Gamer (HP-12)', 'cajas', '8', 4),
('Gamer (HP-12)', 'cajas', '10', 3),
('Gamer (HP-12)', 'cajas', '12', 2),
('Gamer (HP-12)', 'cajas', '14', 2),
('Gamer (HP-12)', 'cajas', '16', 5);


-- ==========================================
-- B. Modelos por Unidades Sueltas
-- ==========================================

-- Boxer Niño Color Entero
INSERT INTO inventory_items (model_name, format, size, quantity) VALUES 
('Boxer Niño Color Entero', 'unidades', '4', 9),
('Boxer Niño Color Entero', 'unidades', '6', 22),
('Boxer Niño Color Entero', 'unidades', '8', 38),
('Boxer Niño Color Entero', 'unidades', '10', 25),
('Boxer Niño Color Entero', 'unidades', '12', 15),
('Boxer Niño Color Entero', 'unidades', '14', 21),
('Boxer Niño Color Entero', 'unidades', '16', 15);
