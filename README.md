Servidor de Pagos para Entrenador Mental
Un backend simple y seguro construido con Node.js y Express para procesar pagos a través de Stripe. Este servidor se comunica con el frontend de Entrenador Mental para gestionar la compra de productos digitales.

🚀 Funcionalidad
Crea sesiones de pago de Stripe de forma segura.
Valida los productos en el backend para evitar manipulaciones.
Devuelve el sessionId al frontend para redirigir al cliente al checkout de Stripe.
Configurado con CORS para permitir solicitudes solo desde el dominio autorizado.
Desplegado en Render.

📋 Requisitos Previos
Node.js (versión 18 o superior)
Una cuenta de Stripe con tus claves (Public Key y Secret Key).

⚙️ Configuración Local
Clona este repositorio:
git clone https://github.com/apariencias/servidor-pagos.gitcd servidor-pagos
Instala las dependencias:
npm install
Configura las variables de entorno:
Crea un archivo llamado .env en la raíz del proyecto.
Añade tus claves de Stripe al archivo .env:
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
Importante: Usa tu clave de prueba (sk_test_...). Nunca subas tu clave real (sk_live_...) a un repositorio público.
Inicia el servidor:
npm start
El servidor estará corriendo en http://localhost:3000.

📁 Estructura del Proyecto
servidor-pagos/
├── .env # Archivo de variables de entorno (¡no subas este archivo a Git!)
├── .gitignore # Archivos que Git debe ignorar
├── package.json # Información del proyecto y dependencias
├── server.js # El código principal del servidor
└── README.md # Este archivo


## 🔗 Endpoints de la API

### `POST /create-checkout-session`

Crea una nueva sesión de pago en Stripe.

**Cuerpo de la solicitud (Body):**
```json
{
  "name": "Nombre del Cliente",
  "email": "cliente@email.com",
  "whatsapp": "+1234567890",
  "product": "la-calma-de-mama"
}

{
  "id": "cs_xxxxxxxxxxxxxxxxxxxxxxxx"
}

🛠️ Tecnologías Utilizadas
Node.js
Express.js
Stripe
dotenv
cors
