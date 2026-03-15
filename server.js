// server.js

// --- IMPORTACIONES Y CONFIGURACIÓN INICIAL ---
require('dotenv').config(); // Carga las variables de entorno desde el archivo .env
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer'); // Lo mantenemos importado
const fs = require('fs'); // Lo mantenemos importado
const path = require('path'); // Lo mantenemos importado

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

        // --- PASO DEPURACIÓN: COMENTADO PARA AISLAR EL ERROR ---
        // Vamos a desactivar temporalmente el guardado de archivo y el email
        // para ver si el problema está en la comunicación con Stripe.

        /*
        // --- PASO A: GUARDAR LOS DATOS EN UN ARCHIVO JSON ---
        const nuevoRegistro = {
            timestamp: new Date().toISOString(),
            name,
            email,
            whatsapp,
            priceId,
            status: 'payment_initiated'
        };

        const rutaArchivo = path.join(__dirname, 'clientes.json');
        
        let clientes = [];
        if (fs.existsSync(rutaArchivo)) {
            const contenido = fs.readFileSync(rutaArchivo, 'utf-8');
            clientes = contenido ? JSON.parse(contenido) : [];
        }
        
        clientes.push(nuevoRegistro);
        fs.writeFileSync(rutaArchivo, JSON.stringify(clientes, null, 2));
        console.log('✅ Cliente guardado en clientes.json.');

        // --- PASO B: ENVIAR UN EMAIL DE NOTIFICACIÓN ---
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Notificación de Pago" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: '¡Nuevo cliente interesado en "La Calma de Mamá"!',
            text: `Tienes un nuevo cliente potencial:\n\nNombre: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}\n\nHa iniciado el proceso de pago.`,
            html: `<h1>¡Nuevo cliente potencial!</h1><p>Tienes un nuevo cliente interesado en "La Calma de Mamá":</p><ul><li><strong>Nombre:</strong> ${name}</li><li><strong>Email:</strong> ${email}</li><li><strong>WhatsApp:</strong> ${whatsapp}</li></ul><p>Ha iniciado el proceso de pago.</p>`,
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email de notificación enviado a ' + process.env.EMAIL_USER);
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
        res.status(500).json({ error: { message: 'Error interno del servidor.' }});
    }
});

// --- INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});