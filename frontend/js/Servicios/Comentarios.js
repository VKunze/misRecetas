const vistaTransiciones = require("../Vista/Transiciones");
const vistaRecetaEspecifica = require('../Vista/RecetaEspecifica');
const backend = require('../Persistencia/Backend');

exports.mostrarAgregarComentario = async (tipoEvento) => {
    if (tipoEvento == 'agregar') {
        vistaTransiciones.mostrarAgregarComentario();
    } else if (tipoEvento == 'guardar') {
        datos = {}
        datos.idReceta = vistaRecetaEspecifica.obtenerIdRecetaActual();
        var comentario = {}
        comentario.contenido = document.getElementById('contenidoComentario').value;
        comentario.autor = document.getElementById('autorComentario').value;
        datos.comentario = comentario
        await backend.guardarComentario(datos);
        console.log("post saving comment, id receta: ", datos.idReceta)
        var comentarios = await backend.obtenerComentarios(datos.idReceta);
        console.log("post getting them: ", comentarios)
        vistaRecetaEspecifica.actualizarComentarios(comentarios);
        vistaTransiciones.ocultarAgregarComentario();
    }
}
