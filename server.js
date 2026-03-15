// server.js

// --- IMPORTACIONES Y CONFIGURACIÓN INICIAL ---
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer'); // Se mantiene importado pero no se usa
const fs = require('fs'); // Se mantiene importado pero no se usa
const path = require('path'); // Se mantiene importado pero no se usa

// --- INICIALIZACIÓN DE LA APLICACIÓN ---
const app = express();

// --- MIDDLEWARE ---
app.use(cors()); // Permite peticiones desde otros dominios (tu frontend)
app.use(express.json()); // Permite al servidor entender JSON en el body de las peticiones

// --- RUTAS ---
// Ruta de salud para verificar que el servidor está vivo
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

        // --- SECCIÓN DE DEPURACIÓN (COMENTADA) ---
        // El problema está aquí. Comentamos para aislar el error.
        /*
        // --- PASO A: GUARDAR LOS DATOS EN UN ARCHIVO JSON ---
        const nuevoRegistro = { /* ... */ };
        // ... (código de archivo)
        console.log('✅ Cliente guardado en clientes.json.');

        // --- PASO B: ENVIAR UN EMAIL DE NOTIFICACIÓN ---
        const transporter = nodemailer.createTransport({ /* ... */ });
        // ... (código de email)
        console.log('✅ Email de notificación enviado.');
        */
        // --- FIN DE LA SECCIÓN COMENTADA ---


        // --- PASO C: CREAR LA SESIÓN DE PAGO CON STRIPE (ESTE ES EL ÚNICO PASO ACTIVO AHORA) ---
        console.log('Intentando crear sesión de Stripe con Price ID:', priceId);
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email: email,
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            success_url: `https://entrenadormental.netlify.app/success.html`,
            cancel_url: `https://entrenadormental.netlify.app/la-calma-de-mama.html?payment=cancelled`,
        });
        console.log('✅ Sesión de Stripe creada con éxito.');

        // Devolvemos el ID de la sesión al frontend
        res.json({ id: session.id });

    } catch (error) {
        console.error("❌ Error al procesar la solicitud:", error);
        res.status(500).json({ error: { message: error.message }});
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});