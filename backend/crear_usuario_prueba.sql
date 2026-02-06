-- Insertar usuario de prueba
-- La contraseña "123456" ya está hasheada con bcrypt
INSERT INTO usuarios (nombres, apellidos, usuario, contraseña, correo, esta_borrado) 
VALUES ('Admin', 'Sistema', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@test.com', false);