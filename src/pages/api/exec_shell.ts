import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { APIRoute } from 'astro';

const execPromise = promisify(exec);

export const POST: APIRoute = async ({ request }) => {
if (request.method === 'POST') {
    try {
      //Obtener el argumento desde el cuerpo de la solicitud
    const { argument } = await request.json();

    if (!argument) {
        return new Response('Falta el argumento', { status: 400 });
    }    

      // Definir la ruta al script .sh
      const scriptPath = path.resolve('./src/scripts/ping.sh');  // Ajusta la ruta si es necesario

      // Ejecutar el script con el argumento pasado
    const { stdout, stderr } = await execPromise(`${scriptPath} ${argument}`);
      // Si hay error en el script, devuelve el error
    if (stderr) {
        return new Response(`Error: ${stderr}`, { status: 500 });
    }

    return new Response(`Resultado: ${stdout}`, { status: 200 });
    } catch (error) {
    return new Response(`Error al ejecutar el script: ${error.message}`, { status: 500 });
    }
} else {
    return new Response('Método no permitido', { status: 405 });
}
};
