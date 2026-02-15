// stripe-checkout.js
// Este archivo maneja la integración con Stripe Checkout

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const showFormBtn = document.getElementById('show-form-btn');
    const inscriptionForm = document.getElementById('inscription-form');
    
    // Mostrar formulario al hacer clic en el botón inicial
    if (showFormBtn && inscriptionForm) {
        showFormBtn.addEventListener('click', () => {
            showFormBtn.style.display = 'none';
            inscriptionForm.style.display = 'block';
            inscriptionForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }
    
    // Manejar envío del formulario
    if (inscriptionForm) {
        inscriptionForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            // Obtener datos del formulario
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const whatsapp = document.getElementById('whatsapp').value;
            
            // Validar formulario
            if (!name || !email || !whatsapp) {
                showError('Por favor, completa todos los campos.');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('Por favor, ingresa un correo electrónico válido.');
                return;
            }
            
            // Mostrar indicador de carga
            showLoading();
            
            try {
                // >>>> CORRECCIÓN #1: URL REAL DEL SERVIDOR <<<<<
                const response = await fetch('https://servidor-pagos.onrender.com/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        whatsapp: whatsapp,
                        product: 'la-calma-de-mama' // Identificador del producto
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Error al procesar el pago');
                }
                
                const session = await response.json();
                
                // >>>> CORRECCIÓN #2: REDIRECCIÓN SIMPLE QUE FUNCIONA CON TU BACKEND <<<<<
                // Tu servidor devuelve { url: '...' }, así que solo redirigimos.
                window.location.href = session.url;
                
            } catch (error) {
                console.error('Error:', error);
                showError('Ha ocurrido un error al procesar tu pago. Por favor, inténtalo de nuevo.');
            } finally {
                hideLoading();
            }
        });
    }
    
    // Funciones auxiliares
    function showError(message) {
        let errorElement = document.getElementById('payment-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = 'payment-error';
            errorElement.className = 'payment-error';
            inscriptionForm.parentNode.insertBefore(errorElement, inscriptionForm.nextSibling);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
    
    function showLoading() {
        const submitBtn = document.querySelector('#inscription-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Procesando...';
        }
    }
    
    function hideLoading() {
        const submitBtn = document.querySelector('#inscription-form button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Continuar al Pago Seguro';
        }
    }
});

/* Estilos para mensajes de error y carga */
const style = document.createElement('style');
style.textContent = `
    .payment-error {
        background: rgba(220, 53, 69, 0.1);
        border: 1px solid rgba(220, 53, 69, 0.3);
        color: #f8d7da;
        padding: 12px 16px;
        border-radius: 8px;
        margin-top: 1rem;
        font-size: 0.9rem;
        display: none;
    }
`;
document.head.appendChild(style);