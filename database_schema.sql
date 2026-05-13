-- =========================================================================
-- SISTEMA CORPORATIVO CSMONTERREY - SCRIPT DE BASE DE DATOS Y POBLACIÓN
-- Base de Datos: bdmonterrey
-- =========================================================================

-- Eliminar tablas si ya existen para un reinicio limpio (opcional)
DROP TABLE IF EXISTS tblusuarios CASCADE;
DROP TABLE IF EXISTS tblempleados CASCADE;
DROP TABLE IF EXISTS tblsucursales CASCADE;
DROP TABLE IF EXISTS tbldepartamentos CASCADE;
DROP TABLE IF EXISTS tblpuestos CASCADE;
DROP TABLE IF EXISTS tblciudades CASCADE;
DROP TABLE IF EXISTS tblestados CASCADE;

-- =========================================
-- TABLA: ESTADOS
-- =========================================
CREATE TABLE tblestados (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(60) NOT NULL
);

-- =========================================
-- TABLA: CIUDADES
-- =========================================
CREATE TABLE tblciudades (
    id_ciudad SERIAL PRIMARY KEY,
    nombre_ciudad VARCHAR(40) NOT NULL,
    id_estado INT NOT NULL,

    CONSTRAINT fk_ciudad_estado
        FOREIGN KEY (id_estado)
        REFERENCES tblestados(id_estado)
);

-- =========================================
-- TABLA: PUESTOS
-- =========================================
CREATE TABLE tblpuestos (
    id_puesto VARCHAR(10) PRIMARY KEY,
    nombre_puesto VARCHAR(35) NOT NULL,
    salario_min INT,
    salario_max INT
);

-- =========================================
-- TABLA: DEPARTAMENTOS
-- =========================================
CREATE TABLE tbldepartamentos (
    id_departamento NUMERIC(6,0) PRIMARY KEY,
    nombre_departamento VARCHAR(30) NOT NULL
);

-- =========================================
-- TABLA: SUCURSALES
-- =========================================
CREATE TABLE tblsucursales (
    id_sucursal INT PRIMARY KEY,
    nombre_sucursal VARCHAR(40) NOT NULL,
    direccion VARCHAR(100) NOT NULL,
    codigo_postal INT NOT NULL,
    id_ciudad INT NOT NULL,
    id_departamento NUMERIC(6,0) NOT NULL,

    CONSTRAINT fk_sucursal_ciudad
        FOREIGN KEY (id_ciudad)
        REFERENCES tblciudades(id_ciudad),

    CONSTRAINT fk_sucursal_departamento
        FOREIGN KEY (id_departamento)
        REFERENCES tbldepartamentos(id_departamento)
);

-- =========================================
-- TABLA: EMPLEADOS
-- =========================================
CREATE TABLE tblempleados (
    id_empleado INT PRIMARY KEY,
    nombre VARCHAR(35) NOT NULL,
    apaterno VARCHAR(35) NOT NULL,
    amaterno VARCHAR(35),
    telefono BIGINT,
    fecha_contratacion DATE NOT NULL,
    id_puesto VARCHAR(10) NOT NULL,
    id_gerente INT,
    id_departamento NUMERIC(6,0) NOT NULL,
    id_sucursal INT NOT NULL,
    salario INT NOT NULL,

    CONSTRAINT fk_empleado_puesto
        FOREIGN KEY (id_puesto)
        REFERENCES tblpuestos(id_puesto),

    CONSTRAINT fk_empleado_departamento
        FOREIGN KEY (id_departamento)
        REFERENCES tbldepartamentos(id_departamento),

    CONSTRAINT fk_empleado_sucursal
        FOREIGN KEY (id_sucursal)
        REFERENCES tblsucursales(id_sucursal),

    CONSTRAINT fk_empleado_gerente
        FOREIGN KEY (id_gerente)
        REFERENCES tblempleados(id_empleado)
);

-- =========================================
-- TABLA: USUARIOS
-- =========================================
CREATE TABLE tblusuarios (
    id_usuario VARCHAR(9) PRIMARY KEY,
    correo VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    estado BOOLEAN,
    nombre VARCHAR(35),
    apaterno VARCHAR(35),
    amaterno VARCHAR(35),
    remember_token VARCHAR(255)
);

-- =========================================================================
-- INSERCIÓN DE DATOS DE MUESTRA PREMIUM (SEED DATA)
-- =========================================================================

-- 1. Estados
INSERT INTO tblestados (nombre_estado) VALUES 
('Nuevo León'), 
('Jalisco'), 
('Ciudad de México'), 
('Querétaro'), 
('Chiapas');

-- 2. Ciudades
INSERT INTO tblciudades (nombre_ciudad, id_estado) VALUES 
('Monterrey', 1), 
('San Pedro Garza García', 1), 
('Guadalajara', 2), 
('CDMX', 3), 
('Tuxtla Gutiérrez', 5);

-- 3. Puestos
INSERT INTO tblpuestos (id_puesto, nombre_puesto, salario_min, salario_max) VALUES 
('P-CEO', 'Director General', 100000, 250000),
('P-GER', 'Gerente de Sucursal', 50000, 95000),
('P-DEV', 'Desarrollador Senior', 40000, 80000),
('P-DBA', 'Administrador de Base de Datos', 45000, 85000),
('P-ANA', 'Analista Financiero', 30000, 60000),
('P-VEN', 'Asesor Comercial', 15000, 40000);

-- 4. Departamentos
INSERT INTO tbldepartamentos (id_departamento, nombre_departamento) VALUES 
(100100, 'Dirección Ejecutiva'),
(100200, 'Tecnologías de la Información'),
(100300, 'Finanzas y Contabilidad'),
(100400, 'Ventas y Marketing'),
(100500, 'Recursos Humanos');

-- 5. Sucursales
INSERT INTO tblsucursales (id_sucursal, nombre_sucursal, direccion, codigo_postal, id_ciudad, id_departamento) VALUES 
(10, 'Corporativo Valle Oriente', 'Av. Lázaro Cárdenas 1000', 66269, 2, 100100),
(20, 'Hub Tecnológico Fundidora', 'Av. Revolución 500', 64010, 1, 100200),
(30, 'Sucursal Puerta de Hierro', 'Blvd. Puerta de Hierro 200', 45116, 3, 100400),
(40, 'Torre Reforma Financiera', 'Paseo de la Reforma 250', 06600, 4, 100300),
(50, 'Oficinas Sureste', 'Blvd. Belisario Domínguez 1080', 29020, 5, 100400);

-- 6. Empleados
-- ID Gerente General (CEO)
INSERT INTO tblempleados (id_empleado, nombre, apaterno, amaterno, telefono, fecha_contratacion, id_puesto, id_gerente, id_departamento, id_sucursal, salario) VALUES 
(1001, 'Carlos', 'Garza', 'Sada', 8181234567, '2020-01-15', 'P-CEO', NULL, 100100, 10, 180000);

-- Gerentes y Jefes
INSERT INTO tblempleados (id_empleado, nombre, apaterno, amaterno, telefono, fecha_contratacion, id_puesto, id_gerente, id_departamento, id_sucursal, salario) VALUES 
(1002, 'Mariana', 'Treviño', 'Cantú', 8187654321, '2020-03-01', 'P-GER', 1001, 100200, 20, 85000),
(1003, 'Roberto', 'López', 'Gómez', 3312345678, '2021-06-10', 'P-GER', 1001, 100400, 30, 75000),
(1004, 'Sofía', 'Beltrán', 'Márquez', 5598765432, '2019-11-20', 'P-GER', 1001, 100300, 40, 82000);

-- Personal operativo / técnico
INSERT INTO tblempleados (id_empleado, nombre, apaterno, amaterno, telefono, fecha_contratacion, id_puesto, id_gerente, id_departamento, id_sucursal, salario) VALUES 
(1005, 'Erick', 'García', 'Pérez', 8123456789, '2022-02-15', 'P-DBA', 1002, 100200, 20, 65000),
(1006, 'Alejandro', 'Ruiz', 'Espinoza', 8134567890, '2022-08-01', 'P-DEV', 1002, 100200, 20, 60000),
(1007, 'Laura', 'Martínez', 'Sánchez', 5523456781, '2023-01-10', 'P-ANA', 1004, 100300, 40, 45000),
(1008, 'Fernando', 'Gutiérrez', 'Vega', 3345678901, '2021-09-05', 'P-VEN', 1003, 100400, 30, 32000),
(1009, 'Patricia', 'Morales', 'Cruz', 9611234567, '2023-05-12', 'P-VEN', 1003, 100400, 50, 28000),
(1010, 'Jorge', 'Herrera', 'Molina', 8156789012, '2024-02-01', 'P-DEV', 1002, 100200, 20, 55000);

-- 7. Usuarios del sistema
-- Contraseña para admin@csmonterrey.com es: admin123 (encriptada con bcrypt)
INSERT INTO tblusuarios (id_usuario, correo, password, estado, nombre, apaterno, amaterno) VALUES 
('USR-00001', 'admin@csmonterrey.com', '$2a$10$w85PZ.JmtL/T2h.Tck2D/eWJsqmOUn6T6tUf05tF7oWnS6xRk3kNW', true, 'Erick', 'Administrador', 'Sistema'),
('USR-00002', 'gerencia@csmonterrey.com', '$2a$10$w85PZ.JmtL/T2h.Tck2D/eWJsqmOUn6T6tUf05tF7oWnS6xRk3kNW', true, 'Carlos', 'Garza', 'Sada');
