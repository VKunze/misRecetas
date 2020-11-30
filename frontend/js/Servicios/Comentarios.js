const vistaTransiciones = require("../Vista/Transiciones");
const vistaRecetaEspecifica = require('../Vista/RecetaEspecifica');
const backend = require('../Persistencia/Backend');

exports.mostrarAgregarComentario = async (tipoEvento) => {
    console.log(tipoEvento);
    if (tipoEvento == 'agregar') {
        vistaTransiciones.mostrarAgregarComentario();
    } else if (tipoEvento == 'guardar') {
        datos = {}
        datos.idRecetaActual = vistaRecetaEspecifica.obtenerIdRecetaActual();
        datos.contenido = document.getElementById('contenidoComentario').value;
        datos.autor = document.getElementById('autorComentario').value;

        await backend.guardarComentario(datos);

        var comentarios = await backend.obtenerComentarios(datos.idRecetaActual);
        console.log(comentarios);
        vistaRecetaEspecifica.actualizarComentarios(comentarios);
        vistaTransiciones.ocultarAgregarComentario();
    }
}
