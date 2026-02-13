// INICIO: Esperamos a que toda la página se cargue
document.addEventListener('DOMContentLoaded', () => {

    // --- Lógica del Cuestionario ---
    // (No necesita cambios, los checkboxes funcionan por defecto)

    // --- Lógica del Formulario y Stripe ---
    const showFormBtn = document.getElementById('show-form-btn');
    const inscriptionForm = document.getElementById('inscription-form');

    // Verificamos que los elementos existan antes de usarlos
    if (showFormBtn && inscriptionForm) {

        // Evento para mostrar el formulario
        showFormBtn.addEventListener('click', () => {
            showFormBtn.style.display = 'none';
            inscriptionForm.style.display = 'block';
            inscriptionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });

        // INICIO: Evento principal al enviar el formulario
        inscriptionForm.addEventListener('submit', async (event) => {
            // 1. Prevenimos que la página se recargue
            event.preventDefault();

            // 2. Obtenemos los valores de los campos
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;

            // 3. Validamos que los campos no estén vacíos
            if (!name || !email || !whatsapp) {
                alert('Por favor, completa todos los campos.');
                return; // Detenemos la ejecución si faltan datos
            }

            console.log('Datos del cliente:', { name, email, whatsapp });

            // INICIO: Bloque para conectar con el servidor de pagos
            // INICIO: Bloque para conectar con el servidor de pagos
try {
    // Mostramos un estado de "cargando"
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.innerText = 'Procesando pago...';
    submitButton.disabled = true;

    console.log("🔍 Enviando petición al servidor...");
    
    // >>>>> ¡EL CAMBIO MÁGICO ESTÁ AQUÍ! <<<<<
    const response = await fetch('https://servidor-pagos.onrender.com/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    });

    console.log("🔍 Respuesta recibida. Status:", response.status, response.statusText);

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("🔍 El servidor devolvió un error:", errorBody);
        throw new Error(errorBody.error?.message || 'Error del servidor.');
    }

    const session = await response.json();
    console.log("🔍 Redirigiendo a:", session.url);
    window.location.href = session.url;

} catch (error) {
    console.error('❌ ERROR COMPLETO en el navegador:', error);
    alert(`Hubo un error: ${error.message}`);
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    submitButton.innerText = 'Inscribirse y Pagar';
    submitButton.disabled = false;
}

        }); // FIN del evento 'submit'
    } // FIN del bloque "if"

}); // FIN del evento 'DOMContentLoaded'