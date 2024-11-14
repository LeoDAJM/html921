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
    const arg = await request.text();
    //const { args } = await request.json(); // Si necesitas recibir datos
    const { stdout, stderr } = await exec.promise(`sh ./scripts/mi-script.sh ${arg}`);
    // Ejecutamos el script .sh
    return new Response(JSON.stringify({ success: true, message: stdout }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // En caso de error en la ejecución del script
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}