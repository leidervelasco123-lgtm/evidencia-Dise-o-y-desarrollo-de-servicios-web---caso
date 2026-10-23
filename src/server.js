const http = require('node:http');
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const PORT = 3000;
const archivoUsuarios = path.join(__dirname, '..', 'usuarios.json');

// Lee los usuarios guardados. Si el archivo aún no existe, empieza con una lista vacía.
function leerUsuarios() {
    if (!fs.existsSync(archivoUsuarios)) {
        fs.writeFileSync(archivoUsuarios, '[]');
    }

    return JSON.parse(fs.readFileSync(archivoUsuarios, 'utf8'));
}

// Guarda los usuarios registrados en un archivo JSON.
function guardarUsuarios(usuarios) {
    fs.writeFileSync(archivoUsuarios, JSON.stringify(usuarios, null, 2));
}

// Crea un hash con sal aleatoria para no guardar la contraseña original.
function protegerContrasena(contrasena, sal = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(contrasena, sal, 64).toString('hex');
    return { sal, hash };
}

// Lee el JSON enviado en el cuerpo de la solicitud.
function leerCuerpo(request) {
    return new Promise((resolve, reject) => {
        let cuerpo = '';

        request.on('data', parte => cuerpo += parte);
        request.on('end', () => {
            try {
                resolve(JSON.parse(cuerpo));
            } catch {
                reject(new Error('El cuerpo debe ser JSON válido.'));
            }
        });
    });
}

// Crea y configura el servicio web.
const servidor = http.createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');

    // Ruta para registrar un usuario.
    if (request.method === 'POST' && request.url === '/api/registro') {
        try {
            const { usuario, contrasena } = await leerCuerpo(request);

            if (!usuario || !contrasena) {
                response.writeHead(400);
                return response.end(JSON.stringify({ mensaje: 'Usuario y contraseña son obligatorios.' }));
            }

            const usuarios = leerUsuarios();
            const nombre = usuario.trim().toLowerCase();

            if (usuarios.some(persona => persona.usuario === nombre)) {
                response.writeHead(409);
                return response.end(JSON.stringify({ mensaje: 'El usuario ya está registrado.' }));
            }

            const credenciales = protegerContrasena(contrasena);
            usuarios.push({
                usuario: nombre,
                sal: credenciales.sal,
                hash: credenciales.hash
            });

            guardarUsuarios(usuarios);
            response.writeHead(201);
            return response.end(JSON.stringify({ mensaje: 'Registro satisfactorio.' }));
        } catch (error) {
            response.writeHead(400);
            return response.end(JSON.stringify({ mensaje: error.message }));
        }
    }

    // Ruta para iniciar sesión y comparar la contraseña ingresada con el hash guardado.
    if (request.method === 'POST' && request.url === '/api/login') {
        try {
            const { usuario, contrasena } = await leerCuerpo(request);
            const nombre = usuario?.trim().toLowerCase();
            const persona = leerUsuarios().find(item => item.usuario === nombre);

            if (!persona || !contrasena) {
                response.writeHead(401);
                return response.end(JSON.stringify({ mensaje: 'Error en la autenticación.' }));
            }

            const credenciales = protegerContrasena(contrasena, persona.sal);
            const hashIngresado = Buffer.from(credenciales.hash, 'hex');
            const hashGuardado = Buffer.from(persona.hash, 'hex');

            // La comparación en tiempo constante evita diferencias fáciles de medir.
            const coincide =
                hashIngresado.length === hashGuardado.length &&
                crypto.timingSafeEqual(hashIngresado, hashGuardado);

            if (!coincide) {
                response.writeHead(401);
                return response.end(JSON.stringify({ mensaje: 'Error en la autenticación.' }));
            }

            response.writeHead(200);
            return response.end(JSON.stringify({ mensaje: 'Autenticación satisfactoria.' }));
        } catch (error) {
            response.writeHead(400);
            return response.end(JSON.stringify({ mensaje: error.message }));
        }
    }

    // Informa cuando se solicita una ruta que no existe.
    response.writeHead(404);
    response.end(JSON.stringify({ mensaje: 'Ruta no encontrada.' }));
});

// Inicia el servidor y escucha solicitudes en el puerto configurado.
servidor.listen(PORT, () => {
    console.log(`Servicio disponible en http://localhost:${PORT}`);
});