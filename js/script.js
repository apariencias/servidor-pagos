document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('three-container');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limitar el ratio de píxeles para mejor rendimiento
    container.appendChild(renderer.domElement);

    // Ajustar la cantidad de partículas según el dispositivo
    const isMobile = window.innerWidth <= 768;
    const particlesCnt = isMobile ? 800 : 2000; // Menos partículas en móviles
    
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particlesCnt * 3);
    const originalPositions = new Float32Array(particlesCnt * 3);

    for(let i = 0; i < particlesCnt * 3; i += 3) {
        const x = (Math.random() - 0.5) * 12;
        const y = (Math.random() - 0.5) * 12;
        const z = (Math.random() - 0.5) * 12;
        
        posArray[i] = x;
        posArray[i + 1] = y;
        posArray[i + 2] = z;

        originalPositions[i] = x;
        originalPositions[i + 1] = y;
        originalPositions[i + 2] = z;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    // Crear textura para las partículas
    const canvas = document.createElement('canvas');
    canvas.width = 128; 
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(212, 175, 55, 1)');
    gradient.addColorStop(0.2, 'rgba(212, 175, 55, 0.8)');
    gradient.addColorStop(1, 'rgba(212, 175, 55, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);

    // Ajustar el tamaño de las partículas según el dispositivo
    const particleSize = isMobile ? 0.1 : 0.15;
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: particleSize,
        map: texture,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthTest: false
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 5;

    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const clock = new THREE.Clock();
    
    // Optimizar la animación con requestAnimationFrame y limitar la complejidad
    let animationId;
    const animate = () => {
        animationId = requestAnimationFrame(animate);
        
        const elapsedTime = clock.getElapsedTime();
        const positions = particlesMesh.geometry.attributes.position.array;
        
        // Reducir la complejidad de los cálculos en móviles
        const updateFrequency = isMobile ? 2 : 1; // Actualizar cada 2 frames en móviles
        
        if (Math.floor(elapsedTime * 60) % updateFrequency === 0) {
            for (let i = 0; i < positions.length; i += 3) {
                const x = originalPositions[i];
                const wave = Math.sin(elapsedTime * 0.5 + x * 0.1) * 0.02;
                positions[i + 1] = originalPositions[i + 1] + wave;

                const particleX = positions[i];
                const particleY = positions[i + 1];
                const mouseInWorldSpaceX = mouse.x * 6;
                const mouseInWorldSpaceY = mouse.y * 6;
                
                const dx = particleX - mouseInWorldSpaceX;
                const dy = particleY - mouseInWorldSpaceY;
                
                const distanceSq = dx * dx + dy * dy;
                const radiusSq = 2 * 2;
                
                if (distanceSq < radiusSq) {
                    const force = (1 - Math.sqrt(distanceSq) / 2);
                    positions[i] += dx * force * 0.02;
                    positions[i + 1] += dy * force * 0.02;
                } else {
                    positions[i] += (originalPositions[i] - positions[i]) * 0.05;
                    positions[i + 1] += (originalPositions[i + 1] - positions[i + 1]) * 0.05;
                }
            }
            
            particlesMesh.geometry.attributes.position.needsUpdate = true;
        }
        
        particlesMesh.rotation.y = elapsedTime * 0.05;
        renderer.render(scene, camera);
    };
    
    animate();
    
    // Manejar el redimensionamiento de la ventana
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Limpiar recursos al cambiar de página
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationId);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        texture.dispose();
    });

    // --- MENÚ HAMBURGUESA ---
    const navToggle = document.getElementById('nav-toggle');
    const mainNav = document.getElementById('main-nav');
    if (navToggle && mainNav) {
        const navUl = mainNav.querySelector('ul');
        if(navUl) {
            navToggle.addEventListener('click', () => { 
                navUl.classList.toggle('active'); 
            });
        }
    }
});