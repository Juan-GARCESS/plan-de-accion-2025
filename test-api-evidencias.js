// Test directo de la API
const fetch = require('node-fetch');

async function testAPI() {
  try {
    const url = 'http://localhost:3001/api/admin/evidencias?areaId=3&trimestre=1';
    console.log('Llamando a:', url);
    
    const response = await fetch(url, {
      headers: {
        'Cookie': 'userId=1' // ID del admin
      }
    });
    
    const data = await response.json();
    console.log('\n=== RESPUESTA DE LA API ===\n');
    console.log(JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
