const { agregarImagen } = require("../Servicios/Receta");
const { principal } = require("../utils/propio/principal");


exports.listarRecetas = (recetas) => {
    var html = "";
    for (var i = 0; i < recetas.length; i++) {
        var nombreImg = recetas[i].nombre.split(" ").join("-");
        console.log(recetas[i], recetas[i].imagen)
        html += "<div class=\"col-lg-4 col-md-6 special-grid " + recetas[i].tipoComida + "\" style=\"width=247px\">" +
            "<div class=\"gallery-single fix\">" +
            agregarImagencita(recetas[i]) +
            "<div class=\"why-text\">" +
            "<h4>" + recetas[i].nombre + "</h4>" +
            "<a class=\"btn-lg btn-circle btn-outline-new-white\" id=\"" + nombreImg + "\" onclick=\"mostrarReceta(this.id)\" style=\"color:white;\">Ver receta</a>" +
            "</div>" +
            "</div>" +
            "</div>";
    }
    html += agregarHTMLAgregarReceta();
    document.getElementById("listaRecetas").innerHTML = html;
}

function agregarImagencita(receta) {
    if (receta.imagen) {
        var imgData = receta.imagen.data;
        return "<img src=\"" + Uint8ToString(imgData) + "\" class=\"img-fluid\" alt=\"Image\">"
    } else {
        return ""
    }
}

function agregarHTMLAgregarReceta() {
    var html = "<div class=\"col-lg-4 col-md-6 special-grid\">" +
        "<div class=\"gallery-single fix agregarReceta\">" +
        "<a class=\"btn-lg btn-circle btn-outline-new-white\" id=\"agregarRecetaBtn\" onclick=\"agregarReceta()\" style=\"display:block; color:white;\">Agregar receta</a>" +
        "</div>" +
        "</div>" +
        "</div>";
    return html;
}

function Uint8ToString(u8a) {
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
    }
    return c.join("");
}
