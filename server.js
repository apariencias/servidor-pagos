// 1. Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// 2. Importar las dependencias necesarias
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 3. Crear la aplicación de Express
const app = express();

// --- CONFIGURACIÓN DE CORS (EL GUARDIA DE SEGURIDAD) ---
const cors = require('cors');
const corsOptions = {
    origin: [
        'https://entrenadormental.netlify.app', // <-- Tu sitio en producción
        'http://127.0.0.1:5500',                  // <-- Tu servidor local de Live Server (antiguo)
        'http://127.0.0.1:8080',                  // <-- ¡AÑADE ESTA LÍNEA!
        'http://localhost:8080'                   // <-- ¡Y ESTA OTRA!
    ],
    methods: 'GET,POST,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
// --- FIN DE LA CONFIGURACIÓN DE CORS ---

// 4. Middleware para que Express entienda JSON
app.use(express.json());

// 5. Rutas de la API
app.get('/', (req, res) => {
    res.send('Servidor de pagos funcionando correctamente.');
});

// --- INICIO: RUTA DE SALUD PARA RENDER ---
app.get('/api/test', (req, res) => {
    res.status(200).send('OK');
});
// --- FIN: RUTA DE SALUD ---

app.post('/api/create-checkout-session', async (req, res) => {
    try {
        // --- CAMBIO 1: RECIBIMOS LOS DATOS CORRECTAMENTE Y LOS MOSTRAMOS ---
        // Recibimos los datos que envía el frontend
        const { name, email, whatsapp, items } = req.body; // Cambiamos 'product' por 'items'
        
        // ESTA LÍNEA ES CLAVE PARA QUE VEAS LOS DATOS
        console.log('🔍 Datos recibidos del frontend:', { name, email, whatsapp, items });

        // Validamos que se hayan enviado los items
        if (!items || items.length === 0) {
            return res.status(400).json({ error: { message: 'No se especificó ningún producto.' } });
        }
        
        // Obtenemos el ID del primer item del carrito
        const productId = items[0].id;

        // --- VALIDACIÓN Y DEFINICIÓN DEL PRODUCTO EN EL SERVIDOR ---
        let productDetails;
        if (productId === 'la-calma-de-mama') { // Usamos el productId que recibimos
            productDetails = {
                name: 'Inscripción a "La Calma de Mamá"',
                price: 27.00, // Precio en euros
            };
        } else {
            return res.status(400).json({ error: { message: 'Producto no válido.' } });
        }
        // --- FIN DE LA DEFINICIÓN ---

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email, // Pre-llenamos el email en Stripe
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: productDetails.name,
                    },
                    unit_amount: productDetails.price * 100, // Convertimos a céntimos
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `https://entrenadormental.netlify.app/success.html`,
             cancel_url: `${process.env.FRONTEND_URL}/la-calma-de-mama.html?payment=cancelled`,
        });

        // --- CAMBIO 2: DEVOLVEMOS EL OBJETO SESIÓN COMPLETO ---
        // El frontend necesita `session.url` para redirigir al usuario
        res.json(session);

    } catch (error) {
        console.error("❌ Error al crear la sesión de Stripe:", error);
        res.status(500).json({ error: { message: 'Error interno del servidor.' } });
    }
});

// 6. Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
}); 
 
