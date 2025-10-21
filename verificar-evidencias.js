const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  const client = await pool.connect();
  try {
    console.log('📋 Últimas evidencias subidas:\n');
    
    const result = await client.query(`
      SELECT 
        e.id,
        e.evidencia_texto,
        e.archivo_nombre,
        e.archivo_tipo,
        e.estado,
        e.calificacion,
        e.trimestre,
        u.nombre as usuario,
        u.email,
        pa.meta,
        TO_CHAR(e.fecha_subida, 'DD/MM/YYYY HH24:MI') as fecha
      FROM evidencias e
      JOIN usuarios u ON e.usuario_id = u.id
      JOIN plan_accion pa ON e.meta_id = pa.id
      ORDER BY e.fecha_subida DESC
      LIMIT 5
    `);
    
    if (result.rows.length === 0) {
      console.log('No hay evidencias en la base de datos.');
    } else {
      result.rows.forEach((row, index) => {
        console.log(`\n${index + 1}. ID: ${row.id}`);
        console.log(`   Usuario: ${row.usuario} (${row.email})`);
        console.log(`   Meta: ${row.meta}`);
        console.log(`   Archivo: ${row.archivo_nombre || 'Sin archivo'}`);
        console.log(`   Tipo: ${row.archivo_tipo || 'N/A'}`);
        console.log(`   Estado: ${row.estado}`);
        console.log(`   Calificación: ${row.calificacion || 'Sin calificar'}`);
        console.log(`   Trimestre: ${row.trimestre}`);
        console.log(`   Fecha: ${row.fecha}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
})();
