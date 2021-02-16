const backend = require("../Persistencia/Backend.js");
const vistaPagPrincipal = require("../Vista/PagPrincipal.js");
const vistaTransiciones = require("../Vista/Transiciones");
const vistaRecetaEspecifica = require("../Vista/RecetaEspecifica");
const utils = require("../utils/utils");

exports.listarRecetas = async () => {
    var respuesta = await backend.obtenerRecetas();
    vistaPagPrincipal.listarRecetas(respuesta["recetas"]);
}

exports.mostrarReceta = async (id) => {
    var datos = await backend.obtenerRecetaEspecifica(id.split("-").join(" "));
    vistaTransiciones.mostrarRecetaEspecifica();
    vistaRecetaEspecifica.mostrarRecetaEspecifica(datos);
}

exports.guardarNuevaReceta = () => {
    //obtencion de datos
    var datos = {};
    datos.nombre = document.getElementById("tituloNuevaReceta").value;
    datos.autor = document.getElementById("autorNuevaReceta").value;
    datos.tipoComida = document.getElementById("tipoComida").value;
    datos.descripcion = document.getElementById("descripciónNuevaReceta").value;
    datos.imagen = document.getElementById("previewImagen").src;

    var ingredientesIngresados = document.querySelectorAll(".ingredienteIngresado");
    datos.ingredientes = []
    for (var i = 0; i < ingredientesIngresados.length; i++) {
        var ingrediente = {}
        ingrediente.cantidad = ingredientesIngresados[i].querySelector(".ingredienteCantidad").value;
        ingrediente.unidadDeMedida = ingredientesIngresados[i].querySelector(".ingredienteUnidad").value;
        ingrediente.nombre = ingredientesIngresados[i].querySelector(".ingredienteNombre").value;
        datos.ingredientes.push(ingrediente);
    }
    backend.guardarReceta(datos);
    vistaTransiciones.irAPagPrincipal();
    this.listarRecetas();
}

exports.mostrarAgregarIngrediente = (idPrevio) => {
    var id = Number(idPrevio) + 1;
    var outerDiv = utils.crearDiv("ingredienteNuevaReceta" + id, ["ingredienteIngresado"], "")
    var inputCantidad = utils.crearInput("ingredientesNuevaReceta" + id + "cantidad", ["inputLindo", "ingredienteCantidad", "ingredienteCantidadFilaNo0"], true, { "placeholder": "cantidad" })
    var inputUnidad = utils.crearInput("ingredientesNuevaReceta" + id + "unidad", ["inputLindo", "ingredienteUnidad", "ingredienteUnidadFilaNo0"], true, { "placeholder": "unidad" })
    var inputNombre = utils.crearInput("ingredientesNuevaReceta" + id + "ingrediente", ["inputLindo", "ingredienteNombre", "ingredienteNombreFilaNo0"], true, { "placeholder": "ingrediente" })
    var spanAgregarMas = utils.crearSpan("masIngredientes" + id)
    var btnAgregarMas = utils.crearBotonAgregarIngrediente("botonAgregarIngrediente" + id, id, ["fa", "fa-plus"], "margin-left: 10px;")
    spanAgregarMas.appendChild(btnAgregarMas);
    utils.appendChildren(outerDiv, [inputCantidad, inputUnidad, inputNombre, spanAgregarMas])
    document.getElementById("camposIngredientes").appendChild(outerDiv);
    document.getElementById("botonAgregarIngrediente" + idPrevio).style.display = "none";
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
        var alreadyResized = true;

        reader.addEventListener("load", function (e) {
            var img = document.getElementById("previewImagen");
            img.src = e.target.result;
            alreadyResized = false;
        })

        document.getElementById("previewImagen").addEventListener("load", function (e) {
            if (!alreadyResized) {
                alreadyResized = true;
                var img = document.getElementById("previewImagen");

                // Resize img if too big
                var MAX_WIDTH = 400;
                var MAX_HEIGHT = 400;
                var width = img.width;
                var height = img.height;
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                var canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height)
                var dataUrl = canvas.toDataURL("image/jpeg")
                img.src = dataUrl;
            }
        }, false);
        reader.readAsDataURL(input.files[0])
    }
}