const backend = require("../Persistencia/Backend.js");
const vistaPagPrincipal = require("../Vista/PagPrincipal.js");
const vistaTransiciones = require("../Vista/Transiciones");
const vistaRecetaEspecifica = require("../Vista/RecetaEspecifica");

exports.listarRecetas = async () => {
    var respuesta = await backend.obtenerRecetas();
    console.log(respuesta);
    vistaPagPrincipal.listarRecetas(respuesta["recetas"]);
}

exports.mostrarReceta = async (id) => {
    var datos = await backend.obtenerRecetaEspecifica(id.split("-").join(" "));
    console.log(datos);
    vistaTransiciones.mostrarRecetaEspecifica();
    vistaRecetaEspecifica.mostrarRecetaEspecifica(datos);
}

exports.guardarNuevaReceta = () => {
    //obtencion de datos
    var datos = {};
    datos.nombre = document.getElementById("tituloNuevaReceta").value;
    datos.autor = document.getElementById("autorNuevaReceta").value;
    datos.tipoComida = document.getElementById("tipoComida").value;
    datos.ingredientes = document.getElementById("ingredientesNuevaReceta").value;
    datos.descripcion = document.getElementById("descripciónNuevaReceta").value;
    datos.imagen = document.getElementById("previewImagen").src;
    console.log('image', datos.imagen)
    // "/" + datos.nombre.split(" ").join("-") + ".jpg";

    backend.guardarReceta(datos);
    vistaTransiciones.irAPagPrincipal();
    this.listarRecetas();
}

var uploader = $('<input type="file" accept="image/*" />')

exports.agregarImagen = () => {
    uploader.click()

    uploader.on('change', function () {
        readUrl(this)
    })
}

var readUrl = (input) => {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.addEventListener("load", function (e) {
            $('#previewImagen').attr('src', e.target.result);
        }, false);

        reader.readAsDataURL(input.files[0])
    }
}