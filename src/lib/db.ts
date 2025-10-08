import { Pool } from 'pg';

// Configuración del pool de conexiones PostgreSQL para Neon
export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Neon requiere SSL
  },
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Helper para ejecutar queries con manejo de errores
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const res = await db.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Verificar conexión al iniciar
db.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL (Neon)');
});

db.on('error', (err: Error) => {
  console.error('❌ Error en pool de PostgreSQL:', err);
});

