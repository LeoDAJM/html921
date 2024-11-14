import type { APIRoute } from 'astro';
import mysql from 'mysql2';
import mariadb from 'mariadb';

// Configuración de la conexión con MariaDB
const pool = mariadb.createPool({
  host: '127.0.0.1',  // Cambia a tu host de la base de datos
  user: 'root',       // Usuario de tu base de datos
  password: '', // Contraseña de tu base de datos
  database: 'ping_db',   // Nombre de tu base de datos
  port: 3306, // Puerto, usa el puerto adecuado
  connectionLimit: 5, // Número máximo de conexiones simultáneas
});

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;
  console.log("params")
  console.log(params)
  const serverUrl2 = params.toString();
  const serverUrl = serverUrl2.slice(10);
  console.log(serverUrl); // Debería mostrar 'www.entel.bo'
  const query = 'SELECT * FROM ping_data WHERE domain = ?';
  if (!serverUrl) {
    return new Response(
      JSON.stringify({
        message: "Missing required query parameter 'serverUrl'",
      }),
      { status: 400 }
    );
  }

  try {
    // Conectamos a la base de datos
    const connection = await pool.getConnection();

    // Realizamos la consulta para obtener todos los datos de ping
    const rows = await connection.query(
      'SELECT timestamp, ping_max, ping_min, ping_avg FROM ping_data WHERE domain = ? ORDER BY timestamp',
      [serverUrl]
    );
        // Si no se encuentran resultados
    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          message: `No data found for serverUrl: ${serverUrl}`,
        }),
        { status: 404 }
      );
    }
    console.log(rows)    // Formateo de los datos para el gráfico
    const formattedData = rows.map((row: any) => ({
      timestamp: row.timestamp,
      max: row.ping_max,
      min: row.ping_min,
      avg: row.ping_avg,
    }));
    connection.end();
    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        message: "Error retrieving ping data from database",
      }),
      { status: 500 }
    );
  }
};