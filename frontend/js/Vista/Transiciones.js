

exports.mostrarRecetaEspecifica = () => {
    document.getElementById("top").scrollIntoView({
        behavior: 'smooth',
    });
    document.getElementById("contenedorListaRecetas").style.display = "none";
    document.getElementById("recetaEspecifica").style.display = "block";
    document.getElementById('btnComentarios').innerHTML = 'Agregar comentario';
    document.getElementById('btnComentarios').setAttribute("name","agregar");
}

exports.mostrarAgregarReceta = () => {
    console.log(document.getElementById("agregarReceta"));
    document.getElementById("agregarReceta").style.display = "block";
    document.getElementById("contenedorListaRecetas").style.display = "none";
}
    
exports.atras = () => {
    document.getElementById("contenedorListaRecetas").style.display = "block";
    document.getElementById("recetaEspecifica").style.display = "none";
    document.getElementById("agregarReceta").style.display = "none";
}

exports.irAPagPrincipal = () => {
    document.getElementById("agregarReceta").style.display = "none";
    document.getElementById("contenedorListaRecetas").style.display = "block";
}

exports.mostrarAgregarComentario = () => {
    document.getElementById('agregarComentarioRecetaEspecifica').style.display = 'block';
    document.getElementById('contenidoComentario').value = '';
    document.getElementById('btnComentarios').innerHTML = 'Guardar';
    document.getElementById('btnComentarios').setAttribute("name","guardar");
}

exports.ocultarAgregarComentario = () => {
    document.getElementById('agregarComentarioRecetaEspecifica').style.display = 'none';
    document.getElementById('btnComentarios').innerHTML = 'Agregar comentario';
    document.getElementById('btnComentarios').setAttribute("name","agregar");
}

