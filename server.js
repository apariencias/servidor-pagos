// 1. Cargar las variables de entorno desde el archivo .env
require('dotenv').config();

// --- LÍNEA DE DEPURACIÓN ---
// Esta línea confirma que la clave de Stripe se está cargando.
// Puedes eliminarla después de que todo funcione.
console.log('>>> DIAGNÓSTICO: La variable STRIPE_SECRET_KEY está cargada.');
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

// --- INICIO: RUTA DE SALUD PARA RENDER ---
// Render necesita una ruta que responda con "200 OK" para verificar que el servicio está vivo.
// Esta ruta satisface ese requisito.
app.get('/api/test', (req, res) => {
    res.status(200).send('OK');
});
// --- FIN: RUTA DE SALUD ---

app.post('/create-checkout-session', async (req, res) => {
    try {
        const { product } = req.body;

        // Validación básica para asegurar que se envió un producto
        if (!product || !product.name || !product.price) {
            return res.status(400).json({ error: { message: 'Faltan datos del producto (nombre y precio).' } });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'eur', // Asegúrate de que esta es la moneda correcta
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: product.price * 100, // Stripe trabaja en céntimos (ej: 10.00€ = 1000)
                },
                quantity: 1,
            }],
            mode: 'payment',
            // URLs a las que Stripe redirigirá después del pago.
            // Deben ser URLs públicas y accesibles.
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