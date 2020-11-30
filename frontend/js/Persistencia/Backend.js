const Http = new XMLHttpRequest();
const url = 'https://boiling-dusk-94198.herokuapp.com';

exports.obtenerRecetas = async () => {
    return mandarABackend("GET", "/obtenerRecetas", null, true);
}

exports.obtenerRecetaEspecifica = async (id) => {
    return mandarABackend("POST", "/obtenerRecetaEspecifica", '{"nombreReceta":"' + id + '"}', true).datos;
}

exports.guardarReceta = async (datos) => {
    mandarABackend("POST", "/guardarReceta", JSON.stringify(datos));
}

exports.guardarComentario = async (datos) => {
    mandarABackend("POST", "/guardarComentario", JSON.stringify(datos));
}

exports.obtenerComentarios = async (id) => {
    return mandarABackend("POST", "/obtenerComentarios", '{"idReceta":"' + id + '"}', true).comentarios;
}

//Requests

function mandarABackend(tipoRequest, uri, params, returnValue = false) {
    Http.open(tipoRequest, url + uri, false);
    if (params) {
        Http.setRequestHeader("Content-type", "application/json");
    }

    Http.send(params);

    if (returnValue) {
        return JSON.parse(Http.responseText);
    } else {
        return "OK";
    }

}