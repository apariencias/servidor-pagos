// 1. Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// 2. Importar las dependencias necesarias
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

// 3. Crear la aplicación de Express
const app = express();

// --- CONFIGURACIÓN DE CORS (EL GUARDIA DE SEGURIDAD) ---
// Permite que tu frontend (Netlify) se comunique con este backend (Render)
const corsOptions = {
    origin: [
        'https://entrenadormental.netlify.app', // Tu sitio en producción
        'http://127.0.0.1:5500',                 // Servidor local (si usas Live Server)
        'http://localhost:8080'                  // Servidor local (alternativo)
    ],
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// --- FIN DE LA CONFIGURACIÓN DE CORS ---

// 4. Middleware para que Express entienda JSON
// Esto es CLAVE para poder leer el body de las peticiones POST
app.use(express.json());

// 5. Rutas de la API
app.get('/', (req, res) => {
    res.send('Servidor de pagos funcionando correctamente.');
});

// --- RUTA DE SALUD PARA RENDER (Health Check) ---
app.get('/api/test', (req, res) => {
    res.status(200).send('OK');
});
// --- FIN DE LA RUTA DE SALUD ---


// --- INICIO: LA RUTA CORREGIDA ---
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        // 1. EXTRAEMOS EL PRICEID DEL BODY DE LA PETICIÓN
        // El frontend nos envía { name, email, whatsapp, priceId }
        const { name, email, whatsapp, priceId } = req.body;

        // 2. VALIDAMOS QUE NOS HAYAN ENVIADO UN PRICEID
        if (!priceId) {
            console.error('Error: Falta el priceId en la petición.');
            return res.status(400).json({ error: { message: 'No se especificó ningún precio (priceId).' }});
        }

        // (Opcional) Log para depuración en los logs de Render
        console.log('🔍 Datos recibidos del frontend:', { name, email, whatsapp, priceId });

        // 3. CREAMOS LA SESIÓN DE PAGO CON STRIPE
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email, // Pre-llenamos el email del cliente en Stripe
            line_items: [
                {
                    // 4. ¡USAMOS DIRECTAMENTE EL PRICEID QUE RECIBIMOS!
                    // Esto le dice a Stripe que use el producto y precio que ya configuraste en tu Dashboard.
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            // URLs de redirección después del pago
            success_url: `https://entrenadormental.netlify.app/success.html`,
            cancel_url: `https://entrenadormental.netlify.app/la-calma-de-mama.html?payment=cancelled`,
        });

        // 5. DEVOLVEMOS LA SESIÓN CREADA AL FRONTEND
        res.json(session);

    } catch (error) {
        console.error("❌ Error al crear la sesión de Stripe:", error);
        res.status(500).json({ error: { message: 'Error interno del servidor al crear la sesión de pago.' }});
    }
});
// --- FIN: LA RUTA CORREGIDA ---


// 6. Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});