-- =====================================================
--  Base de datos: Ferretería
--  Tablas: categorias, productos (relación 1:N)
-- =====================================================
SET NAMES utf8mb4;
DROP DATABASE IF EXISTS ferreteria;
CREATE DATABASE ferreteria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ferreteria;

-- -----------------------------------------------------
-- Tabla: categorias
-- -----------------------------------------------------
CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(100) NOT NULL UNIQUE,
  descripcion  VARCHAR(255) NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- Tabla: productos
-- Cada producto pertenece a una categoría (FK obligatoria).
-- ON DELETE RESTRICT: no se puede borrar una categoría con productos.
-- -----------------------------------------------------
CREATE TABLE productos (
  id_producto  INT AUTO_INCREMENT PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  descripcion  VARCHAR(255) NULL,
  precio       DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  stock        INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  id_categoria INT NOT NULL,
  CONSTRAINT fk_productos_categorias
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_productos_categoria ON productos(id_categoria);

-- -----------------------------------------------------
-- Datos de ejemplo
-- -----------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
('Herramientas manuales', 'Martillos, destornilladores, llaves y alicates'),
('Herramientas eléctricas', 'Taladros, amoladoras y sierras eléctricas'),
('Pinturas', 'Pinturas, barnices, brochas y rodillos'),
('Plomería', 'Tubos, llaves de paso, conexiones y accesorios'),
('Electricidad', 'Cables, enchufes, interruptores y focos');

INSERT INTO productos (nombre, descripcion, precio, stock, id_categoria) VALUES
('Martillo de carpintero 16 oz', 'Mango de fibra de vidrio', 65.00, 40, 1),
('Juego de destornilladores 6 pzas', 'Punta plana y estrella', 85.50, 25, 1),
('Llave inglesa 10"', 'Acero cromo vanadio', 72.00, 18, 1),
('Taladro percutor 650W', 'Incluye maletín y brocas', 480.00, 8, 2),
('Amoladora angular 4 1/2"', '850W, disco incluido', 395.00, 6, 2),
('Pintura látex blanca 4 L', 'Interior/exterior, lavable', 150.00, 30, 3),
('Brocha 3"', 'Cerdas sintéticas', 18.00, 60, 3),
('Tubo PVC 1/2" x 6 m', 'Presión clase 10', 35.00, 100, 4),
('Llave de paso 1/2"', 'Bronce', 42.00, 35, 4),
('Cable THW 12 AWG (rollo 100 m)', 'Cobre, aislado', 520.00, 10, 5),
('Foco LED 12W', 'Luz blanca, rosca E27', 22.00, 120, 5);
