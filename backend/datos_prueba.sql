-- DATOS DE PRUEBA PARA EL SISTEMA DE VIÁTICOS

-- Insertar firmas de ejemplo
INSERT INTO public.firmas (nombre_firma, cargo_firma, descripcion) VALUES
('Lic. Juan Pérez García', 'Director General', 'Firma del Director General'),
('Ing. María López Hernández', 'Subdirectora de Administración', 'Firma de la Subdirectora'),
('C.P. Carlos Ramírez Torres', 'Jefe de Recursos Humanos', 'Firma del Jefe de RH'),
('Lic. Ana Martínez Silva', 'Coordinadora de Finanzas', 'Firma de la Coordinadora');

-- Insertar asignaciones de firmas por área (necesitas ajustar los id_area según tu base)
-- Ejemplo: Área 1 usa firma 1, Área 2 usa firma 2, etc.
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES
(1, 1),  -- Área 1 usa firma del Director
(2, 2),  -- Área 2 usa firma de la Subdirectora
(3, 3),  -- Área 3 usa firma del Jefe de RH
(4, 4);  -- Área 4 usa firma de la Coordinadora

-- Insertar una actividad de prueba
INSERT INTO public.actividades (id_usuario, fecha, hora, tipo_lugar, lugar, direccion, motivo, tipo) VALUES
(1, '2024-01-15', '09:00:00', 'municipio', '1', 'Av. Principal #123, Centro', 'Reunión de trabajo con proveedores', 'administrativo');