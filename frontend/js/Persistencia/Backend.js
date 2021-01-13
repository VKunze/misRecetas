const Http = new XMLHttpRequest();
const url = 'https://boiling-dusk-94198.herokuapp.com';

exports.obtenerRecetas = async () => {
    return mandarABackend("GET", "/obtenerRecetas", null, true);
}

exports.obtenerRecetaEspecifica = async (id) => {
    return mandarABackend("POST", "/obtenerRecetaEspecifica", '{"nombreReceta":"' + id + '"}', true).datos;
}

exports.guardarReceta = async (datos) => {
    console.log("datos en guardar la receta", datos);
    // datos.image = makeblob(datos.image)
    // console.log(datos.image)
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
    // if (uri == '/guardarReceta') {
    //     Http.setRequestHeader("processData", "false");
    //     // Http.setRequestHeader("contentType", "false");
    //     // Http.setRequestHeader("cache", "false");       
    // }

    Http.send(params);

    if (returnValue) {
        return JSON.parse(Http.responseText);
    } else {
        return "OK";
    }

}

// function makeblob(dataURL) {
//     var BASE64_MARKER = ';base64,';
//     if (dataURL.indexOf(BASE64_MARKER) == -1) {
//         var parts = dataURL.split(',');
//         var contentType = parts[0].split(':')[1];
//         var raw = decodeURIComponent(parts[1]);
//         return new Blob([raw], { type: contentType });
//     }
//     var parts = dataURL.split(BASE64_MARKER);
//     var contentType = parts[0].split(':')[1];
//     var raw = window.atob(parts[1]);
//     var rawLength = raw.length;

//     var uInt8Array = new Uint8Array(rawLength);

//     for (var i = 0; i < rawLength; ++i) {
//         uInt8Array[i] = raw.charCodeAt(i);
//     }

//     return new Blob([uInt8Array], { type: contentType });
// }