// src/pages/api/get-domains.js
import mysql from 'mysql2/promise';

export async function GET() {
  // Configuración de la conexión a la base de datos
  const connection = await mysql.createConnection({
    host: 'localhost', // Cambia esto si es necesario
    user: 'ale',
    password: 'AleGatoGalleta',
    database: 'ping_db',
  });

  try {
    // Consulta SQL para obtener los valores únicos de la columna 'domain'
    const [rows] = await connection.execute('SELECT DISTINCT domain FROM ping_data');

    // Genera el HTML de las opciones de selección
    const opcionesHTML = rows.map(row => `<option value="${row.domain}">${row.domain}</option>`).join('\n');

    // Cerrar la conexión
    await connection.end();

    // Retorna la respuesta en HTML
    return new Response(opcionesHTML, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Error al obtener los dominios:', error);
    return new Response('Error al obtener los dominios', { status: 500 });
  }
}
