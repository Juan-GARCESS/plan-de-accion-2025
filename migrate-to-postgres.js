/**
 * Script de migración masiva de MySQL a PostgreSQL
 * Este script actualiza automáticamente todas las rutas API
 */

const fs = require('fs');
const path = require('path');

// Patrones de reemplazo
const replacements = [
  // 1. Remover imports de mysql2
  {
    pattern: /import type \{ RowDataPacket, ResultSetHeader \} from ['"]mysql2['"];?\n/g,
    replacement: ''
  },
  {
    pattern: /import type \{ RowDataPacket \} from ['"]mysql2['"];?\n/g,
    replacement: ''
  },
  {
    pattern: /import type \{ ResultSetHeader \} from ['"]mysql2['"];?\n/g,
    replacement: ''
  },
  
  // 2. Cambiar destructuring de results
  {
    pattern: /const \[([a-zA-Z0-9_]+)\] = await db\.query</g,
    replacement: 'const $1Result = await db.query'
  },
  
  // 3. Acceder a .rows después del cambio
  {
    pattern: /([a-zA-Z0-9_]+)Result = await db\.query([^;]+);/g,
    replacement: (match, varName) => {
      return match.replace('Result = ', 'Result = ') + `\n    const ${varName} = $1Result.rows;`;
    }
  },
  
  // 4. Cambiar placeholders ? a $1, $2, etc
  // Este es más complejo y requiere lógica especial
];

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Aplicar reemplazos básicos
  replacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
    }
  });
  
  // Migrar placeholders ? a $1, $2, ...
  if (content.includes('db.query')) {
    const queryRegex = /db\.query\([^)]+\)/g;
    const queries = content.match(queryRegex) || [];
    
    queries.forEach(query => {
      let newQuery = query;
      let paramIndex = 1;
      
      // Contar y reemplazar ?
      while (newQuery.includes('?')) {
        newQuery = newQuery.replace('?', `$${paramIndex}`);
        paramIndex++;
      }
      
      // Reemplazar activo = 1 por activo = true
      newQuery = newQuery.replace(/activo = 1/g, 'activo = true');
      newQuery = newQuery.replace(/activo = 0/g, 'activo = false');
      
      // Reemplazar NOW() por CURRENT_TIMESTAMP
      newQuery = newQuery.replace(/NOW\(\)/g, 'CURRENT_TIMESTAMP');
      
      // Reemplazar ON DUPLICATE KEY UPDATE
      if (newQuery.includes('ON DUPLICATE KEY UPDATE')) {
        newQuery = newQuery.replace(/ON DUPLICATE KEY UPDATE (.+)/g, (match, updatePart) => {
          const newUpdatePart = updatePart.replace(/VALUES\(([^)]+)\)/g, 'EXCLUDED.$1');
          return `ON CONFLICT DO UPDATE SET ${newUpdatePart}`;
        });
      }
      
      if (query !== newQuery) {
        content = content.replace(query, newQuery);
        modified = true;
      }
    });
  }
  
  // Guardar si hubo cambios
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Migrado: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let count = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      count += scanDirectory(fullPath);
    } else if (file.name.endsWith('.ts') && !file.name.endsWith('.d.ts')) {
      if (migrateFile(fullPath)) {
        count++;
      }
    }
  });
  
  return count;
}

// Ejecutar migración
const apiDir = path.join(__dirname, 'src', 'app', 'api');
console.log('🔄 Iniciando migración de MySQL a PostgreSQL...\n');

const migratedCount = scanDirectory(apiDir);

console.log(`\n✅ Migración completada: ${migratedCount} archivos modificados`);
