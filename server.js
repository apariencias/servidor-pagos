const express = require('express');
const stripe = require('stripe');
const cors = require('cors');
require('dotenv').config(); // Esto es para tu desarrollo local, Render usará sus propias variables.

const app = express();

app.use(express.static('.'));

// --- CONFIGURACIÓN CORS (ACTUALIZADA PARA DESPLIEGUE) ---
const corsOptions = {
    origin: '*', // Permite peticiones de cualquier origen para pruebas. ¡AJUSTAR EN PRODUCCIÓN!
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.use(express.json());

// --- RUTA DE PRUEBA ---
app.get('/api/test', (req, res) => {
    console.log("✅ Petición recibida en /api/test");
    res.send('¡Hola desde el servidor! Estoy vivo y funcionando.');
});

// --- RUTA DE PAGO ---
app.post('/api/create-checkout-session', async (req, res) => {
    // ... (el resto del código de arriba se queda igual) ...
    const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

    try {
        console.log("⏳ Intentando crear la sesión de Stripe...");
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [{ 
                price_data: { 
                    currency: 'usd', // Asegúrate que esta sea tu moneda
                    product_data: { 
                        name: 'Entrenamiento Mental', 
                        description: 'Sesión personalizada.' 
                    }, 
                    unit_amount: 2000, // 20.00 USD (en centavos)
                }, 
                quantity: 1, 
            }],
            // >>>> CORRECCIÓN AQUÍ <<<<<
            success_url: `https://servidor-pagos.onrender.com/success.html`,
            cancel_url: `https://servidor-pagos.onrender.com/cancel.html`,
        });
        console.log("✅ Sesión de Stripe creada con éxito:", session.id);
        res.json({ url: session.url });

    } catch (error) {
        console.error("❌ ERROR al crear la sesión de Stripe:", error.message);
        res.status(500).json({ error: { message: error.message } });
    }
});