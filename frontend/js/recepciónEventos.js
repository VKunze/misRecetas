function mostrarReceta(id) {
    var event = new CustomEvent('mostrarReceta', { detail: id });
    document.dispatchEvent(event);
}

function agregarReceta() {
    var event = new CustomEvent('agregarReceta');
    document.dispatchEvent(event);
}

function atras() {
    var event = new CustomEvent('atras');
    document.dispatchEvent(event);
}

function guardarNuevaReceta() {
    var event = new CustomEvent('guardarNuevaReceta');
    document.dispatchEvent(event);
}

function agregarImagen() {
    console.log('llega a agregar 1');
    var event = new CustomEvent('agregarImagen1');
    document.dispatchEvent(event);
}

function agregarComentario(id) {
    var event = new CustomEvent('agregarComentario', { detail: id });
    document.dispatchEvent(event);
}