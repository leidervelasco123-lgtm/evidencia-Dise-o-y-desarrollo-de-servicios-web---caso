# GA7-220501096-AA5-EV01
## Servicio web de registro e inicio de sesión

### Diseño

La API recibe solicitudes HTTP con datos JSON. El usuario puede registrarse y luego iniciar sesión. La contraseña se almacena como hash con una sal aleatoria, no como texto plano.

| Método | Ruta | Función |
|---|---|---|
| POST | `/api/registro` | Registra un usuario nuevo |
| POST | `/api/login` | Valida usuario y contraseña |

Si el inicio de sesión es correcto, el servicio responde `200` con “Autenticación satisfactoria”. Si las credenciales no coinciden, responde `401` con “Error en la autenticación”.

### Archivos

- `src/server.js`: código comentado del servicio.
- `usuarios.json`: se crea al registrar el primer usuario y almacena sus datos protegidos.
- `package.json`: información y comando de inicio del proyecto.

### Ejecución

Con Node.js instalado, abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm start
```

El servicio queda disponible en `http://localhost:3000`.

### Pruebas con Postman

Para registrar un usuario, crea una solicitud `POST` a:

`http://localhost:3000/api/registro`

En **Body → raw → JSON**, envía:

```json
{
  "usuario": "aprendiz01",
  "contrasena": "ClaveSegura123"
}
```

Para iniciar sesión, usa el mismo cuerpo en una solicitud `POST` a:

`http://localhost:3000/api/login`

Prueba también una contraseña incorrecta para observar la respuesta de error de autenticación.

### Versionamiento

El proyecto se versiona con Git y se publica en un repositorio de GitHub. El enlace se entrega en `enlace_repositorio.txt`.