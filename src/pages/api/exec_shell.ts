import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { APIRoute } from 'astro';

const execPromise = promisify(exec);

// src/pages/api/ejecutar.sh.js

import { spawn } from 'child_process';

export async function post({ request }) {
  // Aquí recibimos la petición POST
  try {
    const { args } = await request.json(); // Si necesitas recibir datos

    // Ejecutamos el script .sh
    const result = await new Promise((resolve, reject) => {
      const script = spawn("sh ./src/scripts/ping.sh $args"); // Asumiendo que el script está en ./scripts/

      let output = "";
      script.stdout.on("data", (data) => {
        output += data.toString(); // Guardamos la salida
      });

      script.stderr.on("data", (data) => {
        console.error(data.toString()); // Capturamos errores
      });

      script.on("close", (code) => {
        if (code === 0) {
          resolve(output); // Respondemos con la salida si no hay errores
        } else {
          reject(new Error("Error al ejecutar el script, código de salida: ${code}"));
        }
      });
    });

    // Respondemos con el resultado
    return new Response(JSON.stringify({ success: true, message: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // En caso de error, respondemos con un error
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}