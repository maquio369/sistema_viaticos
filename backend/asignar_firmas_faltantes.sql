-- ASIGNAR FIRMAS A LAS ÁREAS FALTANTES CON NOMBRES REALES

-- Insertar nuevas firmas para las áreas que faltan
INSERT INTO public.firmas (nombre_firma, cargo_firma, descripcion) VALUES
('Juan Carlos Gómez Aranda', 'Coordinador General de Asesores', 'Firma del Coordinador de Asesores y Proyectos Estratégicos'),
('Jorge Alberto Cruz Nájera', 'Coordinador Ejecutivo de Giras', 'Firma del Coordinador de Giras, Logística y Protocolo'),
('Anjuli Acosta Guillén', 'Coordinadora de Atención Ciudadana', 'Firma de la Coordinadora de Atención Ciudadana'),
('Kenia Arroyo Muñiz', 'Representante en CDMX', 'Firma de la Representante del Gobierno en Ciudad de México'),
('José Eduardo Alabath Paniagua', 'Coordinador Administrativo', 'Firma del Coordinador Administrativo'),
('Luis Enrique López Díaz', 'Responsable de Casa de Gobierno', 'Firma del Responsable de Casa de Gobierno'),
('Sergio Alejandro López Matías', 'Responsable Técnico de Comisionados', 'Firma del Responsable de Comisionados Externos');

-- Asignar las nuevas firmas a las áreas correspondientes
-- Área 5: Coordinación de Asesores y Proyectos Estratégicos → Juan Carlos Gómez Aranda
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (5, 5);

-- Área 6: Coordinación de Giras, Logística, Ayudantía, Protocolo y Cultura Cívica → Jorge Alberto Cruz Nájera
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (6, 6);

-- Área 12: Coordinación de Atención Ciudadana → Anjuli Acosta Guillén
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (12, 7);

-- Área 15: Representación en CDMX → Kenia Arroyo Muñiz
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (15, 8);

-- Área 21: Coordinación Administrativa → José Eduardo Alabath Paniagua
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (21, 9);

-- Área 28: Casa de Gobierno → Luis Enrique López Díaz
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (28, 10);

-- Área 34: Comisionados Externos → Sergio Alejandro López Matías
INSERT INTO public.firmas_por_area (id_area, id_firma) VALUES (34, 11);

-- Verificar las asignaciones
SELECT fa.id_area, a.descripcion as area_nombre, 
       f.nombre_firma, f.cargo_firma
FROM firmas_por_area fa
JOIN areas a ON fa.id_area = a.id_area
JOIN firmas f ON fa.id_firma = f.id_firma
WHERE fa.esta_borrado = false
ORDER BY fa.id_area;