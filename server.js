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
    origin: 'https://entrenadormental.netlify.app', // <-- ¡LA URL DE TU FRONTEND!
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

app.post('/create-checkout-session', async (req, res) => {
    try {
        // Recibimos los datos que envía el frontend
        const { name, email, whatsapp, product } = req.body;

        // --- VALIDACIÓN Y DEFINICIÓN DEL PRODUCTO EN EL SERVIDOR ---
        // Es más seguro definir el precio aquí en el backend.
        let productDetails;
        if (product === 'la-calma-de-mama') {
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
            success_url: `https://servidor-pagos.onrender.com/success.html`,
            cancel_url: `https://servidor-pagos.onrender.com/cancel.html`,
        });

        // --- CAMBIO CLAVE: DEVOLVEMOS LA URL DE LA SESIÓN ---
        res.json({ url: session.url });

    } catch (error) {
        console.error("Error al crear la sesión de Stripe:", error);
        res.status(500).json({ error: { message: 'Error interno del servidor.' } });
    }
});

// 6. Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});