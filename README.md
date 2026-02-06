# Sistema de Viáticos

## Configuración de la Base de Datos

1. Instalar PostgreSQL en tu sistema
2. Crear la base de datos ejecutando el archivo `backend/database.sql`:
   ```bash
   psql -U postgres -f backend/database.sql
   ```
3. Configurar las credenciales en `backend/.env`

## Instalación Backend

```bash
cd backend
npm install
npm run dev
```

## Instalación Frontend

```bash
cd frontend
npm install
npm start
```

## Usuario de Prueba

- Email: admin@test.com
- Contraseña: 123456

## Puertos

- Backend: http://localhost:5000
- Frontend: http://localhost:3000