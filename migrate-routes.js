const fs = require('fs');
const path = require('path');

// Rutas a migrar
const routesToMigrate = [
  'src/app/api/usuario/trimestres/route.ts',
  'src/app/api/usuario/metas/route.ts',
  'src/app/api/admin/estadisticas-trimestres/route.ts',
  'src/app/api/admin/areas/[id]/trimestres/route.ts',
  'src/app/api/admin/usuarios/corregir-areas/route.ts',
];

function migrateFile(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ No existe: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  // Eliminar imports de MySQL
  if (content.includes('import type { RowDataPacket') || content.includes('import type { ResultSetHeader')) {
    content = content.replace(/import type \{ RowDataPacket.*?\} from ["']mysql2["'];?\n?/g, '');
    content = content.replace(/import type \{ ResultSetHeader.*?\} from ["']mysql2["'];?\n?/g, '');
    content = content.replace(/import.*?from ["']mysql2\/promise["'];?\n?/g, '');
    changed = true;
  }

  // Reemplazar destructuración de arrays
  const arrayDestructuringPattern = /const \[(\w+)\] = await db\.(query|execute)<.*?>\(/g;
  if (arrayDestructuringPattern.test(content)) {
    content = content.replace(/const \[(\w+)\] = await db\.(query|execute)<.*?>\(/g, 'const $1Result = await db.query(');
    changed = true;
  }

  // Reemplazar uso de variables destructuradas
  content = content.replace(/(\w+)Result as \{.*?\}\[\]/g, '$1Result.rows');
  content = content.replace(/(\w+)Result as \{.*?\}/g, '$1Result.rows');
  
  // Reemplazar accesos a datos después de destructuring
  const varPattern = /(\w+)Data\[0\]/g;
  content = content.replace(varPattern, '$1Data');

  // Cambiar placeholders ? a $1, $2, etc
  content = content.replace(/await db\.(query|execute)\(([\s\S]*?)\[([^\]]+)\]\s*\)/g, (match, method, query, params) => {
    const paramsArray = params.split(',').map(p => p.trim());
    let paramIndex = 1;
    let newQuery = query.replace(/\?/g, () => `$${paramIndex++}`);
    return `await db.query(${newQuery}[${params}])`;
  });

  // Reemplazar db.execute por db.query
  content = content.replace(/db\.execute\(/g, 'db.query(');

  // Reemplazar funciones SQL específicas de MySQL
  content = content.replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP');
  content = content.replace(/result\.insertId/g, 'result.rows[0].id');
  content = content.replace(/result\.affectedRows/g, 'result.rowCount');

  // Reemplazar RETURNING en INSERT
  content = content.replace(/(INSERT INTO .*?VALUES.*?\))\s*"/g, '$1 RETURNING id"');

  // Guardar si hubo cambios
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Migrado: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  Sin cambios: ${filePath}`);
    return false;
  }
}

console.log('🚀 Iniciando migración automática de rutas...\n');

let migratedCount = 0;
routesToMigrate.forEach(route => {
  if (migrateFile(route)) {
    migratedCount++;
  }
});

console.log(`\n✨ Migración completada: ${migratedCount}/${routesToMigrate.length} archivos modificados`);
