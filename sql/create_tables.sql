-- Crear la base de datos (solo si aún no existe)
-- CREATE DATABASE product_system;

-- \c product_system;

-- ========================================
-- Tabla: currencies (monedas)
-- ========================================
CREATE TABLE IF NOT EXISTS currencies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
        CHECK (LENGTH(name) BETWEEN 1 AND 50),
    symbol VARCHAR(10) NOT NULL
        CHECK (LENGTH(symbol) BETWEEN 1 AND 10),
    UNIQUE (name),
    UNIQUE (symbol)
);

-- ========================================
-- Tabla: products
-- ========================================
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,

    -- Código del producto (ingresado por el usuario)
    code VARCHAR(15) NOT NULL UNIQUE
        CHECK (
            LENGTH(code) BETWEEN 5 AND 15
            AND code ~ '^[A-Za-z0-9]+$'   -- Solo letras y números
            AND code ~ '[A-Za-z]'         -- Al menos una letra
            AND code ~ '[0-9]'            -- Al menos un número
        ),

    -- Nombre del producto
    name VARCHAR(50) NOT NULL
        CHECK (LENGTH(name) BETWEEN 2 AND 50),

    -- Precio del producto
    price NUMERIC(10,2) NOT NULL
        CHECK (price > 0),

    -- Moneda del producto
    currency_id INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (currency_id)
        REFERENCES currencies (id)
        ON DELETE RESTRICT
);

-- ========================================
-- Tabla: materials
-- ========================================
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,

    -- Código del material
    code VARCHAR(15) NOT NULL UNIQUE
        CHECK (
            LENGTH(code) BETWEEN 5 AND 15
            AND code ~ '^[A-Za-z0-9]+$'   -- Solo letras y números
        ),

    -- Descripción del material
    description VARCHAR(20) NOT NULL
        CHECK (LENGTH(description) BETWEEN 1 AND 20)
);

-- ========================================
-- Tabla intermedia: product_materials
-- Relación muchos-a-muchos entre productos y materiales
-- ========================================
CREATE TABLE IF NOT EXISTS product_materials (
    product_id INT NOT NULL,
    material_id INT NOT NULL,

    PRIMARY KEY (product_id, material_id),

    FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE CASCADE,

    FOREIGN KEY (material_id)
        REFERENCES materials (id)
        ON DELETE CASCADE
);

-- ========================================
-- Tabla: warehouses (bodegas)
-- ========================================
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,

    -- Descripción de la bodega
    description VARCHAR(100) NOT NULL
        CHECK (LENGTH(description) BETWEEN 1 AND 100),

    -- Evitar descripciones duplicadas
    UNIQUE(description)
);

-- ========================================
-- Tabla: branches (sucursales)
-- Cada sucursal pertenece a una única bodega
-- ========================================
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,

    -- Descripción de la sucursal
    description VARCHAR(100) NOT NULL
        CHECK (LENGTH(description) BETWEEN 1 AND 100),

    -- Bodega asociada
    warehouse_id INT NOT NULL,

    FOREIGN KEY (warehouse_id)
        REFERENCES warehouses (id)
        ON DELETE RESTRICT,

    -- Evitar duplicados por bodega
    UNIQUE (warehouse_id, description)
);