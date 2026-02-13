document.addEventListener('DOMContentLoaded', () => {
    const btnInicio = document.getElementById('btnInicio');
    const titulo = document.querySelector('.titulo-juego');
    const bgBlur = document.getElementById('bgBlur');

    btnInicio.addEventListener('click', () => {
        // 1. Aplicamos animaciones de salida
        titulo.classList.add('fade-up');
        btnInicio.classList.add('fade-down');

        // 2. Quitamos el desenfoque del fondo
        bgBlur.style.filter = "blur(0px)";

        // 3. Opcional: Eliminar los elementos del DOM después de la animación
        setTimeout(() => {
            titulo.style.display = 'none';
            btnInicio.style.display = 'none';
            console.log("El juego ha comenzado oficialmente.");
        }, 800);
    });
});