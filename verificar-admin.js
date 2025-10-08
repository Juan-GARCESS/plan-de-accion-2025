const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_vc9djoEer1Rl@ep-frosty-moon-acux7z3k-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function verificarAdmin() {
  try {
    console.log('🔍 Verificando usuario admin...\n');
    
    const result = await pool.query(
      'SELECT id, email, nombre, rol, estado, password FROM usuarios WHERE email = $1',
      ['admin@sistema.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuario admin NO existe en la base de datos');
      console.log('📝 Voy a crear el usuario admin...\n');
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const insertResult = await pool.query(
        `INSERT INTO usuarios (email, password, nombre, rol, estado, area_id) 
         VALUES ($1, $2, $3, $4, $5, NULL) 
         RETURNING id, email, nombre, rol, estado`,
        ['admin@sistema.com', hashedPassword, 'Administrador', 'admin', 'activo']
      );
      
      console.log('✅ Usuario admin creado exitosamente:');
      console.log(insertResult.rows[0]);
    } else {
      console.log('✅ Usuario admin existe:');
      console.log('ID:', result.rows[0].id);
      console.log('Email:', result.rows[0].email);
      console.log('Nombre:', result.rows[0].nombre);
      console.log('Rol:', result.rows[0].rol);
      console.log('Estado:', result.rows[0].estado);
      console.log('Password hash:', result.rows[0].password.substring(0, 20) + '...');
      
      // Verificar que la contraseña coincida
      const bcrypt = require('bcrypt');
      const passwordMatch = await bcrypt.compare('admin123', result.rows[0].password);
      console.log('\n🔐 Verificación de contraseña:', passwordMatch ? '✅ CORRECTA' : '❌ INCORRECTA');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verificarAdmin();
