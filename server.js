// server.js

// --- IMPORTACIONES Y CONFIGURACIÓN INICIAL ---
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Las otras importaciones (nodemailer, fs) no se usan, pero pueden quedar ahí.

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- RUTAS ---
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Ruta principal para crear la sesión de pago de Stripe
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        // 1. Extraemos los datos del body de la petición
        const { name, email, whatsapp, priceId } = req.body;

        if (!name || !email || !whatsapp || !priceId) {
            return res.status(400).json({ error: { message: 'Faltan datos del cliente o el ID del precio.' }});
        }

        console.log('Intentando crear sesión de Stripe con Price ID:', priceId);

        // 2. Creamos la sesión de pago con Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `https://entrenadormental.netlify.app/success.html`,
            cancel_url: `https://entrenadormental.netlify.app/la-calma-de-mama.html?payment=cancelled`,
        });

        console.log('✅ Sesión de Stripe creada con éxito.');

        // 3. Devolvemos el ID de la sesión al frontend
        res.json({ id: session.id });

    } catch (error) {
        // 4. Capturamos CUALQUIER error que ocurra en el bloque try
        console.error("❌ Error al procesar la solicitud:", error);
        res.status(500).json({ error: { message: error.message }});
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});