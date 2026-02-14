// 1. Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// --- LÍNEA DE DEPURACIÓN FINAL ---
// Esta línea nos ayudará a confirmar si la clave de Stripe se está cargando correctamente.
console.log('>>> DIAGNÓSTICO: La variable STRIPE_SECRET_KEY es:', process.env.STRIPE_SECRET_KEY);
// --- FIN DE LA LÍNEA DE DEPURACIÓN ---

// 2. Importar las dependencias necesarias
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 3. Crear la aplicación de Express
const app = express();

// 4. Middleware (Configuración)
app.use(cors()); // Permite peticiones desde otros dominios (tu frontend)
app.use(express.json()); // Permite a Express entender JSON en el cuerpo de las peticiones

// 5. Rutas de la API
app.get('/', (req, res) => {
    res.send('Servidor de pagos funcionando correctamente.');
});

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { product } = req.body;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: product.price * 100, // El precio debe estar en céntimos
                },
                quantity: 1,
            }],
            mode: 'payment',
            // URLs a las que Stripe redirigirá después del pago
            // IMPORTANTE: Cambia estas URLs por las de tu sitio web en producción
            success_url: `https://servidor-pagos.onrender.com/success.html`,
            cancel_url: `https://servidor-pagos.onrender.com/cancel.html`,
        });

        res.json({ id: session.id });

    } catch (error) {
        console.error("Error al crear la sesión de Stripe:", error);
        res.status(500).json({ error: { message: error.message } });
    }
});

// 6. Iniciar el servidor
const PORT = process.env.PORT || 3000; // Render asignará el puerto a través de la variable de entorno PORT
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});