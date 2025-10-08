const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function actualizarPasswordAdmin() {
  try {
    console.log('🔐 Generando nuevo hash para "admin123"...\n');
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Hash generado:', hashedPassword.substring(0, 30) + '...\n');
    
    console.log('📝 Actualizando contraseña del admin...\n');
    
    const result = await pool.query(
      `UPDATE usuarios 
       SET password = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE email = $2 
       RETURNING id, email, nombre, rol`,
      [hashedPassword, 'admin@sistema.com']
    );
    
    console.log('✅ Contraseña actualizada exitosamente:');
    console.log(result.rows[0]);
    
    // Verificar que funciona
    console.log('\n🧪 Verificando que la contraseña funciona...');
    const verification = await pool.query(
      'SELECT password FROM usuarios WHERE email = $1',
      ['admin@sistema.com']
    );
    
    const isValid = await bcrypt.compare('admin123', verification.rows[0].password);
    console.log('Resultado:', isValid ? '✅ CONTRASEÑA CORRECTA' : '❌ ERROR');
    
    console.log('\n✨ Ahora puedes iniciar sesión con:');
    console.log('📧 Email: admin@sistema.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

actualizarPasswordAdmin();
