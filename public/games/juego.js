document.addEventListener('DOMContentLoaded', () => {
    const btnInicio = document.getElementById('btnInicio');
    const titulo = document.querySelector('.titulo-juego');
    const bgBlur = document.getElementById('bgBlur');

    btnInicio.addEventListener('click', () => {
        // animaciones de salida
        titulo.classList.add('fade-up');
        btnInicio.classList.add('fade-down');

        // Quitamos el desenfoque del fondo
        bgBlur.style.filter = "blur(0px)";

        setTimeout(() => {
            titulo.style.display = 'none';
            btnInicio.style.display = 'none';
            console.log("El juego ha comenzado oficialmente.");
        }, 800);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const btnInicio = document.getElementById('btnInicio');
    const world = document.getElementById('world');
    const platformStack = document.getElementById('platformStack');
    const waterLayer = document.getElementById('waterLayer');
    
    let alturaActual = 0; // Puntos/bloques acumulados
    let nivelMar = 200;   // Altura inicial del mar

    btnInicio.addEventListener('click', () => {
        document.querySelector('.titulo-juego').classList.add('fade-up');
        btnInicio.classList.add('fade-down');
        document.getElementById('bgBlur').style.filter = "blur(0px)";

        setTimeout(() => {
            // Iniciamos con 3 bloques
            agregarBloques(3);
        }, 800);
    });

    function agregarBloques(cantidad) {
        const colores = ['#4c3a76', '#1d4ed8', '#db2777', '#eab308', '#f97316'];
        
        for (let i = 0; i < cantidad; i++) {
            const bloque = document.createElement('div');
            bloque.className = 'bloque';
            bloque.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            platformStack.appendChild(bloque);
            alturaActual++;
        }

        actualizarCamara();
    }

    function actualizarCamara() {
        // Cada bloque mide aprox 40px. 
        const desplazamiento = alturaActual * 42; 
        
        if (desplazamiento > window.innerHeight / 2) {
            // Calculamos cuánto bajar el mundo para centrar al jugador
            const offset = desplazamiento - (window.innerHeight / 2);
            world.style.transform = `translateY(${offset}px)`;
        }
    }

    // sistema de ahogamiento (subir el mar)
    function subirMar() {
        nivelMar += 20; // Sube 20px cada vez que se llame
        waterLayer.parentElement.style.height = `${nivelMar}px`;
    }
});