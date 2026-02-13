document.addEventListener('DOMContentLoaded', () => {

    const inscriptionForm = document.getElementById('inscription-form');

    if (inscriptionForm) {

        inscriptionForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = event.target.querySelector('button[type="submit"]');
            const originalText = submitButton.innerText;

            try {
                // 1. Preparamos el botón para el pago
                submitButton.innerText = 'Procesando...';
                submitButton.disabled = true;

                // 2. Hacemos la petición al servidor
                // BIEN
const response = await fetch('https://servidor-pagos.onrender.com/api/create-checkout-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                // 3. Verificamos la respuesta
                if (!response.ok) {
                    throw new Error('El servidor respondió con un error.');
                }

                // 4. Redirigimos a Stripe
                const session = await response.json();
                window.location.href = session.url;

            } catch (error) {
                // 5. Si algo falla, mostramos el error y restauramos el botón
                console.error('Error en el pago:', error);
                alert('Hubo un error al procesar tu pago. Por favor, recarga la página e inténtalo de nuevo.');
                submitButton.innerText = originalText;
                submitButton.disabled = false;
            }
        });
    }
});