import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import type { APIRoute } from 'astro';

const execPromise = promisify(exec);
  
  export const POST: APIRoute = async ({ request }) => {
    try {
      // Obtener el argumento desde el cuerpo de la solicitud (texto plano)
      const argument = await request.text();  // Esto nos da el texto plano enviado en el cuerpo
      console.log('Argumento recibido:', argument);  // Verifica que el argumento está siendo recibido correctamente
  
      // Definir la ruta al script .sh
      const scriptPath = path.resolve('./src/scripts/ping.sh');  // Ajusta la ruta si es necesario
      console.log('Ruta al script:', scriptPath);
      // Configurar un tiempo máximo de espera (por ejemplo 5 segundos)
    const timeout = 50000; // 5000 ms = 5 segundos

    // Crear una promesa que se resuelve después del timeout
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), timeout)
    );

    // Ejecutar el script con el argumento pasado y esperar a que termine
    const { stdout, stderr } = await Promise.race([
      execPromise(`${scriptPath} ${argument}`),  // Promesa que ejecuta el script
      timeoutPromise,  // Promesa que rechaza si se excede el timeout
    ]);
    console.log(stdout)
      // Si hay salida de error (stderr), la devolvemos
      if (stderr) {
        console.error('Error en el script:', stderr);  // Loguear el error si lo hay
        return new Response(`Error: ${stderr}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
  
      // Si todo va bien, devolvemos la salida estándar (stdout) como texto plano
      return new Response(stdout, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
        
      });
      
    } catch (error) {
      // Si ocurre algún error en la ejecución, devolvemos un mensaje de error en texto plano
      console.error('Error en la ejecución del script:', error);  // Loguear el error si ocurre
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  };
  