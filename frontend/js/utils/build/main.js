(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Http = new XMLHttpRequest();
const url = 'https://boiling-dusk-94198.herokuapp.com';

exports.obtenerRecetas = async () => {
    return mandarABackend("GET", "/obtenerRecetas", null, true);
}

exports.obtenerRecetaEspecifica = async (id) => {
    return mandarABackend("POST", "/obtenerRecetaEspecifica", '{"idReceta":"' + id + '"}', true).datos;
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
        Http.setRequestHeader("cache", "false");
        Http.setRequestHeader("processData", "false");
    }
    console.log("params", params);
    Http.send(params);

    if (returnValue) {
        console.log(Http.responseText);
        return JSON.parse(Http.responseText);
    } else {
        return "OK";
    }

}

},{}],2:[function(require,module,exports){
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

},{"../Persistencia/Backend":1,"../Vista/RecetaEspecifica":6,"../Vista/Transiciones":7}],3:[function(require,module,exports){
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
},{"../Persistencia/Backend.js":1,"../Vista/PagPrincipal.js":5,"../Vista/RecetaEspecifica":6,"../Vista/Transiciones":7,"../utils/utils":9}],4:[function(require,module,exports){
const receta = require("./Receta.js");
const comentarios = require("./Comentarios.js");
const vistaTransiciones = require("../Vista/Transiciones");

exports.escucharPorEventos = () => {
    document.addEventListener("DOMContentLoaded", function (event) {
        receta.listarRecetas();
    });

    document.addEventListener("agregarReceta", async function () {
        vistaTransiciones.mostrarAgregarReceta();
    });

    document.addEventListener("atras", async function () {
        vistaTransiciones.atras();
    })

    document.addEventListener("guardarNuevaReceta", async function () {
        receta.guardarNuevaReceta();
    })

    document.addEventListener("agregarImagen", async function () {
        receta.agregarImagen();
    })

    document.addEventListener("mostrarReceta", async function (id) {
        receta.mostrarReceta(id.detail);
    });

    document.addEventListener("agregarComentario", async function (id) {
        comentarios.mostrarAgregarComentario(id.detail);
    });

    document.addEventListener("agregarIngrediente", async function (id) {
        receta.mostrarAgregarIngrediente(id.detail);
    });
}
},{"../Vista/Transiciones":7,"./Comentarios.js":2,"./Receta.js":3}],5:[function(require,module,exports){
const { agregarImagen } = require("../Servicios/Receta");


exports.listarRecetas = (recetas) => {
    var html = "";
    console.lo
    for (var i = 0; i < recetas.length; i++) {
        var nombresIngredientes = [];
        recetas[i].ingredientes.forEach(ingrediente => nombresIngredientes.push(ingrediente.nombre))
        html += "<div id=\"" + recetas[i].id + "\" class=\"col-lg-4 col-md-6 elemento-grid-recetas " + recetas[i].tipoComida + "\" style=\"width=247px\">" +
            "<div class=\"gallery-single fix\">" +
            agregarImagencita(recetas[i]) +
            "<div class=\"why-text\">" +
            "<h4 class=nombreReceta>" + recetas[i].nombre + "</h4>" +
            "<p style=\"display:none;\" class=nombreAutor>" + recetas[i].autor + "</p>" +
            "<p style=\"display:none;\" class=nombresIngredientes>" + nombresIngredientes.join(",") + "</p>" +
            "<a class=\"btn-lg btn-circle btn-outline-new-white\" id=\"" + recetas[i].id + "\" onclick=\"mostrarReceta(this.id)\" style=\"color:white;\">Ver receta</a>" +
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
        return "<img src=\"" + Uint8ToString(imgData) + "\" class=\"img-fluid adjust-img\" alt=\"Image\">"
    } else {
        return ""
    }
}

function agregarHTMLAgregarReceta() {
    var html = "<div class=\"col-lg-4 col-md-6 elemento-grid-recetas siempreVisible\" id=elementoAgregarReceta>" +
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

},{"../Servicios/Receta":3}],6:[function(require,module,exports){
var idRecetaActual = '';

exports.mostrarRecetaEspecifica = (datos) => {
    idRecetaActual = datos.id;
    //Resetear todos los html
    var elementos = document.getElementsByClassName("elemRecetaEspecifica");
    for (var i = 0; i < elementos.length; i++) {
        elementos[i].innerHTML = "";
    }

    //set titulo
    document.getElementById("titulo").innerHTML = datos.nombre;

    document.getElementById("imagenRecetaEspecifica").innerHTML = "<img class=\"img-fluid\" src=\"" + Uint8ToString(datos.imagen.data) + "\" width=\"100%\" alt=\"\">";
    for (key in datos) {
        if (key != "tipoComida" && key != "createdAt" && key != "updatedAt" && key != "id" && key != "nombre") {
            if (key == "ingredientes") {
                var html = "";
                var ingredientes = datos[key];
                for (var i = 0; i < ingredientes.length; i++) {
                    console.log(ingredientes[i])
                    html += "<tr><td style=\"padding-right:15px;\">" + ingredientes[i].cantidad + " " + ingredientes[i].unidadDeMedida + "</td><td>" + ingredientes[i].nombre + "</td></tr>"
                }
                document.getElementById("ingrRecetaEspecifica").innerHTML = html;
            } else if (key == "comentarios") {
                this.actualizarComentarios(datos[key])
            } else if (key == 'imagen') {
                document.getElementById(key + "RecetaEspecifica").src = datos[key];
            } else {
                document.getElementById(key + "RecetaEspecifica").innerHTML = datos[key].replaceAll("\n", "<br>");
            }
        }
    }
}

exports.obtenerIdRecetaActual = () => {
    return idRecetaActual;
}

exports.actualizarComentarios = (arrComentarios) => {
    if (arrComentarios.length == 0) {
        document.getElementById("comentariosRecetaEspecifica").innerHTML = "<p>Por ahora no hay comentarios para esta receta.</p>";
    } else {
        document.getElementById("comentariosRecetaEspecifica").innerHTML = '';
        for (var i = 0; i < arrComentarios.length; i++) {
            document.getElementById("comentariosRecetaEspecifica").innerHTML += addComment(arrComentarios[i]);
        }
    }
}


function addComment(comment) {
    const fecha = comment['createdAt'] ? comment['createdAt'].slice(0, 10) : '';
    return "<div class=\"comment-item\">" +
        "<div class=\"pull-left\">" +
        "<a>" + comment['autor'] + "</a></div>" +
        "<div class=\"pull-right\" style=\"padding: 5px 10px;\">" +
        "<i class=\"fa fa-clock-o\" aria-hidden=true></i> <span>" + fecha + "</span></div>" +
        "<div class=\"des-l\">" +
        "<p>" + comment['contenido'] + "</p></div>" +
        "</div>";
}


function Uint8ToString(u8a) {
    var CHUNK_SZ = 0x8000;
    var c = [];
    for (var i = 0; i < u8a.length; i += CHUNK_SZ) {
        c.push(String.fromCharCode.apply(null, u8a.slice(i, i + CHUNK_SZ)));
    }
    return c.join("");
}



},{}],7:[function(require,module,exports){


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


},{}],8:[function(require,module,exports){
const servicios = require("./Servicios/manejoEventos.js");

var browserify = "browserify ./js/main.js -o ./js/build/main.js -dv";


servicios.escucharPorEventos();
},{"./Servicios/manejoEventos.js":4}],9:[function(require,module,exports){

exports.formatNumber = (number, placesAfterComma = 0) => {
    if (typeof number != Number) {
        number = parseFloat(number)
    }
    return number.toFixed(placesAfterComma)
    // .replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
}

exports.appendChildren = (padre, objetos) => {
    for (var i = 0; i < objetos.length; i++) {
        padre.appendChild(objetos[i]);
    }
}

exports.crearLabel = (forValue, contenido) => {
    element = document.createElement('label');
    element.setAttribute("for", forValue);
    element.innerHTML = contenido
    return element
}

exports.crearDiv = (id, classList, contenido) => {
    element = document.createElement('div');
    element.setAttribute("id", id);
    element.setAttribute("class", classList.join(' '));
    element.innerHTML = contenido
    return element
}

exports.crearSpan = (id) => {
    element = document.createElement('span');
    element.setAttribute("id", id);
    return element
}

exports.crearBotonAgregarIngrediente = (id, name, iconClassList, iconStyle) => {
    element = document.createElement('a');
    element.setAttribute("type", "button");
    element.setAttribute("id", id);
    element.setAttribute("name", name);
    element.addEventListener('click', function () {
        agregarIngrediente(this.name);
    });
    icon = document.createElement('i');
    icon.setAttribute("class", iconClassList.join(' '));
    icon.setAttribute("style", iconStyle);
    element.appendChild(icon);
    return element
}   

exports.crearInputNumero = (id, classList, required, otherParams, onClickFunctionName) => {
    input = this.crearInput(id, classList, required, otherParams, onClickFunctionName);
    input.setAttribute("type", "number");
    input.setAttribute("step", "0.01");
    input.setAttribute("min", "0");
    return input
}

exports.crearInputFecha = (id, classList, required, otherParams, onClickFunctionName) => {
    input = this.crearInput(id, classList, required, otherParams, onClickFunctionName);
    input.setAttribute("type", "month");
    return input;
}

exports.crearInput = (id, classList, required, otherParams, onClickFunctionName) => {
    input = document.createElement('input');
    input.setAttribute("id", id);
    input.setAttribute("class", classList.join(' '));
    Object.keys(otherParams).forEach(function (key) {
        input.setAttribute(key, otherParams[key]);
    });
    input.addEventListener('click', function () {
        var functionToExecute = new Function(onClickFunctionName + '()');
        functionToExecute();
    });
    input.required = required;
    return input
}

},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImZyb250ZW5kL2pzL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL0NvbWVudGFyaW9zLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL1JlY2V0YS5qcyIsImZyb250ZW5kL2pzL1NlcnZpY2lvcy9tYW5lam9FdmVudG9zLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUGFnUHJpbmNpcGFsLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUmVjZXRhRXNwZWNpZmljYS5qcyIsImZyb250ZW5kL2pzL1Zpc3RhL1RyYW5zaWNpb25lcy5qcyIsImZyb250ZW5kL2pzL21haW4uanMiLCJmcm9udGVuZC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBIdHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5jb25zdCB1cmwgPSAnaHR0cHM6Ly9ib2lsaW5nLWR1c2stOTQxOTguaGVyb2t1YXBwLmNvbSc7XG5cbmV4cG9ydHMub2J0ZW5lclJlY2V0YXMgPSBhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIG1hbmRhckFCYWNrZW5kKFwiR0VUXCIsIFwiL29idGVuZXJSZWNldGFzXCIsIG51bGwsIHRydWUpO1xufVxuXG5leHBvcnRzLm9idGVuZXJSZWNldGFFc3BlY2lmaWNhID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgcmV0dXJuIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9vYnRlbmVyUmVjZXRhRXNwZWNpZmljYVwiLCAne1wiaWRSZWNldGFcIjpcIicgKyBpZCArICdcIn0nLCB0cnVlKS5kYXRvcztcbn1cblxuZXhwb3J0cy5ndWFyZGFyUmVjZXRhID0gYXN5bmMgKGRhdG9zKSA9PiB7XG4gICAgbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL2d1YXJkYXJSZWNldGFcIiwgSlNPTi5zdHJpbmdpZnkoZGF0b3MpKTtcbn1cblxuZXhwb3J0cy5ndWFyZGFyQ29tZW50YXJpbyA9IGFzeW5jIChkYXRvcykgPT4ge1xuICAgIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9ndWFyZGFyQ29tZW50YXJpb1wiLCBKU09OLnN0cmluZ2lmeShkYXRvcykpO1xufVxuXG5leHBvcnRzLm9idGVuZXJDb21lbnRhcmlvcyA9IGFzeW5jIChpZCkgPT4ge1xuICAgIHJldHVybiBtYW5kYXJBQmFja2VuZChcIlBPU1RcIiwgXCIvb2J0ZW5lckNvbWVudGFyaW9zXCIsICd7XCJpZFJlY2V0YVwiOlwiJyArIGlkICsgJ1wifScsIHRydWUpLmNvbWVudGFyaW9zO1xufVxuXG4vL1JlcXVlc3RzXG5cbmZ1bmN0aW9uIG1hbmRhckFCYWNrZW5kKHRpcG9SZXF1ZXN0LCB1cmksIHBhcmFtcywgcmV0dXJuVmFsdWUgPSBmYWxzZSkge1xuICAgIEh0dHAub3Blbih0aXBvUmVxdWVzdCwgdXJsICsgdXJpLCBmYWxzZSk7XG4gICAgaWYgKHBhcmFtcykge1xuICAgICAgICBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJjYWNoZVwiLCBcImZhbHNlXCIpO1xuICAgICAgICBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJwcm9jZXNzRGF0YVwiLCBcImZhbHNlXCIpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcInBhcmFtc1wiLCBwYXJhbXMpO1xuICAgIEh0dHAuc2VuZChwYXJhbXMpO1xuXG4gICAgaWYgKHJldHVyblZhbHVlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKEh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSHR0cC5yZXNwb25zZVRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIk9LXCI7XG4gICAgfVxuXG59XG4iLCJjb25zdCB2aXN0YVRyYW5zaWNpb25lcyA9IHJlcXVpcmUoXCIuLi9WaXN0YS9UcmFuc2ljaW9uZXNcIik7XG5jb25zdCB2aXN0YVJlY2V0YUVzcGVjaWZpY2EgPSByZXF1aXJlKCcuLi9WaXN0YS9SZWNldGFFc3BlY2lmaWNhJyk7XG5jb25zdCBiYWNrZW5kID0gcmVxdWlyZSgnLi4vUGVyc2lzdGVuY2lhL0JhY2tlbmQnKTtcblxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhckNvbWVudGFyaW8gPSBhc3luYyAodGlwb0V2ZW50bykgPT4ge1xuICAgIGlmICh0aXBvRXZlbnRvID09ICdhZ3JlZ2FyJykge1xuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5tb3N0cmFyQWdyZWdhckNvbWVudGFyaW8oKTtcbiAgICB9IGVsc2UgaWYgKHRpcG9FdmVudG8gPT0gJ2d1YXJkYXInKSB7XG4gICAgICAgIGRhdG9zID0ge31cbiAgICAgICAgZGF0b3MuaWRSZWNldGEgPSB2aXN0YVJlY2V0YUVzcGVjaWZpY2Eub2J0ZW5lcklkUmVjZXRhQWN0dWFsKCk7XG4gICAgICAgIHZhciBjb21lbnRhcmlvID0ge31cbiAgICAgICAgY29tZW50YXJpby5jb250ZW5pZG8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVuaWRvQ29tZW50YXJpbycpLnZhbHVlO1xuICAgICAgICBjb21lbnRhcmlvLmF1dG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2F1dG9yQ29tZW50YXJpbycpLnZhbHVlO1xuICAgICAgICBkYXRvcy5jb21lbnRhcmlvID0gY29tZW50YXJpb1xuICAgICAgICBhd2FpdCBiYWNrZW5kLmd1YXJkYXJDb21lbnRhcmlvKGRhdG9zKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJwb3N0IHNhdmluZyBjb21tZW50LCBpZCByZWNldGE6IFwiLCBkYXRvcy5pZFJlY2V0YSlcbiAgICAgICAgdmFyIGNvbWVudGFyaW9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyQ29tZW50YXJpb3MoZGF0b3MuaWRSZWNldGEpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBvc3QgZ2V0dGluZyB0aGVtOiBcIiwgY29tZW50YXJpb3MpXG4gICAgICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5hY3R1YWxpemFyQ29tZW50YXJpb3MoY29tZW50YXJpb3MpO1xuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8oKTtcbiAgICB9XG59XG4iLCJjb25zdCBiYWNrZW5kID0gcmVxdWlyZShcIi4uL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzXCIpO1xuY29uc3QgdmlzdGFQYWdQcmluY2lwYWwgPSByZXF1aXJlKFwiLi4vVmlzdGEvUGFnUHJpbmNpcGFsLmpzXCIpO1xuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xuY29uc3QgdmlzdGFSZWNldGFFc3BlY2lmaWNhID0gcmVxdWlyZShcIi4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2FcIik7XG5jb25zdCB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlscy91dGlsc1wiKTtcblxuZXhwb3J0cy5saXN0YXJSZWNldGFzID0gYXN5bmMgKCkgPT4ge1xuICAgIHZhciByZXNwdWVzdGEgPSBhd2FpdCBiYWNrZW5kLm9idGVuZXJSZWNldGFzKCk7XG4gICAgdmlzdGFQYWdQcmluY2lwYWwubGlzdGFyUmVjZXRhcyhyZXNwdWVzdGFbXCJyZWNldGFzXCJdKTtcbn1cblxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgdmFyIGRhdG9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyUmVjZXRhRXNwZWNpZmljYShpZC5zcGxpdChcIi1cIikuam9pbihcIiBcIikpO1xuICAgIHZpc3RhVHJhbnNpY2lvbmVzLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhKCk7XG4gICAgdmlzdGFSZWNldGFFc3BlY2lmaWNhLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhKGRhdG9zKTtcbn1cblxuZXhwb3J0cy5ndWFyZGFyTnVldmFSZWNldGEgPSAoKSA9PiB7XG4gICAgLy9vYnRlbmNpb24gZGUgZGF0b3NcbiAgICB2YXIgZGF0b3MgPSB7fTtcbiAgICBkYXRvcy5ub21icmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdHVsb051ZXZhUmVjZXRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmF1dG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRvck51ZXZhUmVjZXRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLnRpcG9Db21pZGEgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpcG9Db21pZGFcIikudmFsdWU7XG4gICAgZGF0b3MuZGVzY3JpcGNpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXBjacOzbk51ZXZhUmVjZXRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmltYWdlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJldmlld0ltYWdlblwiKS5zcmM7XG5cbiAgICB2YXIgaW5ncmVkaWVudGVzSW5ncmVzYWRvcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuaW5ncmVkaWVudGVJbmdyZXNhZG9cIik7XG4gICAgZGF0b3MuaW5ncmVkaWVudGVzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZ3JlZGllbnRlc0luZ3Jlc2Fkb3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGluZ3JlZGllbnRlID0ge31cbiAgICAgICAgaW5ncmVkaWVudGUuY2FudGlkYWQgPSBpbmdyZWRpZW50ZXNJbmdyZXNhZG9zW2ldLnF1ZXJ5U2VsZWN0b3IoXCIuaW5ncmVkaWVudGVDYW50aWRhZFwiKS52YWx1ZTtcbiAgICAgICAgaW5ncmVkaWVudGUudW5pZGFkRGVNZWRpZGEgPSBpbmdyZWRpZW50ZXNJbmdyZXNhZG9zW2ldLnF1ZXJ5U2VsZWN0b3IoXCIuaW5ncmVkaWVudGVVbmlkYWRcIikudmFsdWU7XG4gICAgICAgIGluZ3JlZGllbnRlLm5vbWJyZSA9IGluZ3JlZGllbnRlc0luZ3Jlc2Fkb3NbaV0ucXVlcnlTZWxlY3RvcihcIi5pbmdyZWRpZW50ZU5vbWJyZVwiKS52YWx1ZTtcbiAgICAgICAgZGF0b3MuaW5ncmVkaWVudGVzLnB1c2goaW5ncmVkaWVudGUpO1xuICAgIH1cbiAgICBiYWNrZW5kLmd1YXJkYXJSZWNldGEoZGF0b3MpO1xuICAgIHZpc3RhVHJhbnNpY2lvbmVzLmlyQVBhZ1ByaW5jaXBhbCgpO1xuICAgIHRoaXMubGlzdGFyUmVjZXRhcygpO1xufVxuXG5leHBvcnRzLm1vc3RyYXJBZ3JlZ2FySW5ncmVkaWVudGUgPSAoaWRQcmV2aW8pID0+IHtcbiAgICB2YXIgaWQgPSBOdW1iZXIoaWRQcmV2aW8pICsgMTtcbiAgICB2YXIgb3V0ZXJEaXYgPSB1dGlscy5jcmVhckRpdihcImluZ3JlZGllbnRlTnVldmFSZWNldGFcIiArIGlkLCBbXCJpbmdyZWRpZW50ZUluZ3Jlc2Fkb1wiXSwgXCJcIilcbiAgICB2YXIgaW5wdXRDYW50aWRhZCA9IHV0aWxzLmNyZWFySW5wdXQoXCJpbmdyZWRpZW50ZXNOdWV2YVJlY2V0YVwiICsgaWQgKyBcImNhbnRpZGFkXCIsIFtcImlucHV0TGluZG9cIiwgXCJpbmdyZWRpZW50ZUNhbnRpZGFkXCIsIFwiaW5ncmVkaWVudGVDYW50aWRhZEZpbGFObzBcIl0sIHRydWUsIHsgXCJwbGFjZWhvbGRlclwiOiBcImNhbnRpZGFkXCIgfSlcbiAgICB2YXIgaW5wdXRVbmlkYWQgPSB1dGlscy5jcmVhcklucHV0KFwiaW5ncmVkaWVudGVzTnVldmFSZWNldGFcIiArIGlkICsgXCJ1bmlkYWRcIiwgW1wiaW5wdXRMaW5kb1wiLCBcImluZ3JlZGllbnRlVW5pZGFkXCIsIFwiaW5ncmVkaWVudGVVbmlkYWRGaWxhTm8wXCJdLCB0cnVlLCB7IFwicGxhY2Vob2xkZXJcIjogXCJ1bmlkYWRcIiB9KVxuICAgIHZhciBpbnB1dE5vbWJyZSA9IHV0aWxzLmNyZWFySW5wdXQoXCJpbmdyZWRpZW50ZXNOdWV2YVJlY2V0YVwiICsgaWQgKyBcImluZ3JlZGllbnRlXCIsIFtcImlucHV0TGluZG9cIiwgXCJpbmdyZWRpZW50ZU5vbWJyZVwiLCBcImluZ3JlZGllbnRlTm9tYnJlRmlsYU5vMFwiXSwgdHJ1ZSwgeyBcInBsYWNlaG9sZGVyXCI6IFwiaW5ncmVkaWVudGVcIiB9KVxuICAgIHZhciBzcGFuQWdyZWdhck1hcyA9IHV0aWxzLmNyZWFyU3BhbihcIm1hc0luZ3JlZGllbnRlc1wiICsgaWQpXG4gICAgdmFyIGJ0bkFncmVnYXJNYXMgPSB1dGlscy5jcmVhckJvdG9uQWdyZWdhckluZ3JlZGllbnRlKFwiYm90b25BZ3JlZ2FySW5ncmVkaWVudGVcIiArIGlkLCBpZCwgW1wiZmFcIiwgXCJmYS1wbHVzXCJdLCBcIm1hcmdpbi1sZWZ0OiAxMHB4O1wiKVxuICAgIHNwYW5BZ3JlZ2FyTWFzLmFwcGVuZENoaWxkKGJ0bkFncmVnYXJNYXMpO1xuICAgIHV0aWxzLmFwcGVuZENoaWxkcmVuKG91dGVyRGl2LCBbaW5wdXRDYW50aWRhZCwgaW5wdXRVbmlkYWQsIGlucHV0Tm9tYnJlLCBzcGFuQWdyZWdhck1hc10pXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW1wb3NJbmdyZWRpZW50ZXNcIikuYXBwZW5kQ2hpbGQob3V0ZXJEaXYpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYm90b25BZ3JlZ2FySW5ncmVkaWVudGVcIiArIGlkUHJldmlvKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG5cbnZhciB1cGxvYWRlciA9ICQoJzxpbnB1dCB0eXBlPVwiZmlsZVwiIGFjY2VwdD1cImltYWdlLypcIiAvPicpXG5cbmV4cG9ydHMuYWdyZWdhckltYWdlbiA9ICgpID0+IHtcbiAgICB1cGxvYWRlci5jbGljaygpXG5cbiAgICB1cGxvYWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZWFkVXJsKHRoaXMpXG4gICAgfSlcbn1cblxudmFyIHJlYWRVcmwgPSAoaW5wdXQpID0+IHtcbiAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcbiAgICAgICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgIHZhciBhbHJlYWR5UmVzaXplZCA9IHRydWU7XG5cbiAgICAgICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmV2aWV3SW1hZ2VuXCIpO1xuICAgICAgICAgICAgaW1nLnNyYyA9IGUudGFyZ2V0LnJlc3VsdDtcbiAgICAgICAgICAgIGFscmVhZHlSZXNpemVkID0gZmFsc2U7XG4gICAgICAgIH0pXG5cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmV2aWV3SW1hZ2VuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBpZiAoIWFscmVhZHlSZXNpemVkKSB7XG4gICAgICAgICAgICAgICAgYWxyZWFkeVJlc2l6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByZXZpZXdJbWFnZW5cIik7XG5cbiAgICAgICAgICAgICAgICAvLyBSZXNpemUgaW1nIGlmIHRvbyBiaWdcbiAgICAgICAgICAgICAgICB2YXIgTUFYX1dJRFRIID0gNDAwO1xuICAgICAgICAgICAgICAgIHZhciBNQVhfSEVJR0hUID0gNDAwO1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IGltZy53aWR0aDtcbiAgICAgICAgICAgICAgICB2YXIgaGVpZ2h0ID0gaW1nLmhlaWdodDtcbiAgICAgICAgICAgICAgICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpZHRoID4gTUFYX1dJRFRIKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgKj0gTUFYX1dJRFRIIC8gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IE1BWF9XSURUSDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChoZWlnaHQgPiBNQVhfSEVJR0hUKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWR0aCAqPSBNQVhfSEVJR0hUIC8gaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gTUFYX0hFSUdIVDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgICAgICAgICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UoaW1nLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KVxuICAgICAgICAgICAgICAgIHZhciBkYXRhVXJsID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL2pwZWdcIilcbiAgICAgICAgICAgICAgICBpbWcuc3JjID0gZGF0YVVybDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChpbnB1dC5maWxlc1swXSlcbiAgICB9XG59IiwiY29uc3QgcmVjZXRhID0gcmVxdWlyZShcIi4vUmVjZXRhLmpzXCIpO1xuY29uc3QgY29tZW50YXJpb3MgPSByZXF1aXJlKFwiLi9Db21lbnRhcmlvcy5qc1wiKTtcbmNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcblxuZXhwb3J0cy5lc2N1Y2hhclBvckV2ZW50b3MgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHJlY2V0YS5saXN0YXJSZWNldGFzKCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYWdyZWdhclJlY2V0YVwiLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLm1vc3RyYXJBZ3JlZ2FyUmVjZXRhKCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYXRyYXNcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5hdHJhcygpO1xuICAgIH0pXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZ3VhcmRhck51ZXZhUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVjZXRhLmd1YXJkYXJOdWV2YVJlY2V0YSgpO1xuICAgIH0pXG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYWdyZWdhckltYWdlblwiLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlY2V0YS5hZ3JlZ2FySW1hZ2VuKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3N0cmFyUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZWNldGEubW9zdHJhclJlY2V0YShpZC5kZXRhaWwpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImFncmVnYXJDb21lbnRhcmlvXCIsIGFzeW5jIGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBjb21lbnRhcmlvcy5tb3N0cmFyQWdyZWdhckNvbWVudGFyaW8oaWQuZGV0YWlsKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FySW5ncmVkaWVudGVcIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJlY2V0YS5tb3N0cmFyQWdyZWdhckluZ3JlZGllbnRlKGlkLmRldGFpbCk7XG4gICAgfSk7XG59IiwiY29uc3QgeyBhZ3JlZ2FySW1hZ2VuIH0gPSByZXF1aXJlKFwiLi4vU2VydmljaW9zL1JlY2V0YVwiKTtcblxuXG5leHBvcnRzLmxpc3RhclJlY2V0YXMgPSAocmVjZXRhcykgPT4ge1xuICAgIHZhciBodG1sID0gXCJcIjtcbiAgICBjb25zb2xlLmxvXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNldGFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBub21icmVzSW5ncmVkaWVudGVzID0gW107XG4gICAgICAgIHJlY2V0YXNbaV0uaW5ncmVkaWVudGVzLmZvckVhY2goaW5ncmVkaWVudGUgPT4gbm9tYnJlc0luZ3JlZGllbnRlcy5wdXNoKGluZ3JlZGllbnRlLm5vbWJyZSkpXG4gICAgICAgIGh0bWwgKz0gXCI8ZGl2IGlkPVxcXCJcIiArIHJlY2V0YXNbaV0uaWQgKyBcIlxcXCIgY2xhc3M9XFxcImNvbC1sZy00IGNvbC1tZC02IGVsZW1lbnRvLWdyaWQtcmVjZXRhcyBcIiArIHJlY2V0YXNbaV0udGlwb0NvbWlkYSArIFwiXFxcIiBzdHlsZT1cXFwid2lkdGg9MjQ3cHhcXFwiPlwiICtcbiAgICAgICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZ2FsbGVyeS1zaW5nbGUgZml4XFxcIj5cIiArXG4gICAgICAgICAgICBhZ3JlZ2FySW1hZ2VuY2l0YShyZWNldGFzW2ldKSArXG4gICAgICAgICAgICBcIjxkaXYgY2xhc3M9XFxcIndoeS10ZXh0XFxcIj5cIiArXG4gICAgICAgICAgICBcIjxoNCBjbGFzcz1ub21icmVSZWNldGE+XCIgKyByZWNldGFzW2ldLm5vbWJyZSArIFwiPC9oND5cIiArXG4gICAgICAgICAgICBcIjxwIHN0eWxlPVxcXCJkaXNwbGF5Om5vbmU7XFxcIiBjbGFzcz1ub21icmVBdXRvcj5cIiArIHJlY2V0YXNbaV0uYXV0b3IgKyBcIjwvcD5cIiArXG4gICAgICAgICAgICBcIjxwIHN0eWxlPVxcXCJkaXNwbGF5Om5vbmU7XFxcIiBjbGFzcz1ub21icmVzSW5ncmVkaWVudGVzPlwiICsgbm9tYnJlc0luZ3JlZGllbnRlcy5qb2luKFwiLFwiKSArIFwiPC9wPlwiICtcbiAgICAgICAgICAgIFwiPGEgY2xhc3M9XFxcImJ0bi1sZyBidG4tY2lyY2xlIGJ0bi1vdXRsaW5lLW5ldy13aGl0ZVxcXCIgaWQ9XFxcIlwiICsgcmVjZXRhc1tpXS5pZCArIFwiXFxcIiBvbmNsaWNrPVxcXCJtb3N0cmFyUmVjZXRhKHRoaXMuaWQpXFxcIiBzdHlsZT1cXFwiY29sb3I6d2hpdGU7XFxcIj5WZXIgcmVjZXRhPC9hPlwiICtcbiAgICAgICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICAgICAgXCI8L2Rpdj5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiO1xuICAgIH1cbiAgICBodG1sICs9IGFncmVnYXJIVE1MQWdyZWdhclJlY2V0YSgpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdGFSZWNldGFzXCIpLmlubmVySFRNTCA9IGh0bWw7XG59XG5cbmZ1bmN0aW9uIGFncmVnYXJJbWFnZW5jaXRhKHJlY2V0YSkge1xuICAgIGlmIChyZWNldGEuaW1hZ2VuKSB7XG4gICAgICAgIHZhciBpbWdEYXRhID0gcmVjZXRhLmltYWdlbi5kYXRhO1xuICAgICAgICByZXR1cm4gXCI8aW1nIHNyYz1cXFwiXCIgKyBVaW50OFRvU3RyaW5nKGltZ0RhdGEpICsgXCJcXFwiIGNsYXNzPVxcXCJpbWctZmx1aWQgYWRqdXN0LWltZ1xcXCIgYWx0PVxcXCJJbWFnZVxcXCI+XCJcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIlxuICAgIH1cbn1cblxuZnVuY3Rpb24gYWdyZWdhckhUTUxBZ3JlZ2FyUmVjZXRhKCkge1xuICAgIHZhciBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBlbGVtZW50by1ncmlkLXJlY2V0YXMgc2llbXByZVZpc2libGVcXFwiIGlkPWVsZW1lbnRvQWdyZWdhclJlY2V0YT5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZ2FsbGVyeS1zaW5nbGUgZml4IGFncmVnYXJSZWNldGFcXFwiPlwiICtcbiAgICAgICAgXCI8YSBjbGFzcz1cXFwiYnRuLWxnIGJ0bi1jaXJjbGUgYnRuLW91dGxpbmUtbmV3LXdoaXRlXFxcIiBpZD1cXFwiYWdyZWdhclJlY2V0YUJ0blxcXCIgb25jbGljaz1cXFwiYWdyZWdhclJlY2V0YSgpXFxcIiBzdHlsZT1cXFwiZGlzcGxheTpibG9jazsgY29sb3I6d2hpdGU7XFxcIj5BZ3JlZ2FyIHJlY2V0YTwvYT5cIiArXG4gICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiICtcbiAgICAgICAgXCI8L2Rpdj5cIjtcbiAgICByZXR1cm4gaHRtbDtcbn1cblxuZnVuY3Rpb24gVWludDhUb1N0cmluZyh1OGEpIHtcbiAgICB2YXIgQ0hVTktfU1ogPSAweDgwMDA7XG4gICAgdmFyIGMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHU4YS5sZW5ndGg7IGkgKz0gQ0hVTktfU1opIHtcbiAgICAgICAgYy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdThhLnNsaWNlKGksIGkgKyBDSFVOS19TWikpKTtcbiAgICB9XG4gICAgcmV0dXJuIGMuam9pbihcIlwiKTtcbn1cbiIsInZhciBpZFJlY2V0YUFjdHVhbCA9ICcnO1xuXG5leHBvcnRzLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhID0gKGRhdG9zKSA9PiB7XG4gICAgaWRSZWNldGFBY3R1YWwgPSBkYXRvcy5pZDtcbiAgICAvL1Jlc2V0ZWFyIHRvZG9zIGxvcyBodG1sXG4gICAgdmFyIGVsZW1lbnRvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJlbGVtUmVjZXRhRXNwZWNpZmljYVwiKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50b3NbaV0uaW5uZXJIVE1MID0gXCJcIjtcbiAgICB9XG5cbiAgICAvL3NldCB0aXR1bG9cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdHVsb1wiKS5pbm5lckhUTUwgPSBkYXRvcy5ub21icmU7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlblJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gXCI8aW1nIGNsYXNzPVxcXCJpbWctZmx1aWRcXFwiIHNyYz1cXFwiXCIgKyBVaW50OFRvU3RyaW5nKGRhdG9zLmltYWdlbi5kYXRhKSArIFwiXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgYWx0PVxcXCJcXFwiPlwiO1xuICAgIGZvciAoa2V5IGluIGRhdG9zKSB7XG4gICAgICAgIGlmIChrZXkgIT0gXCJ0aXBvQ29taWRhXCIgJiYga2V5ICE9IFwiY3JlYXRlZEF0XCIgJiYga2V5ICE9IFwidXBkYXRlZEF0XCIgJiYga2V5ICE9IFwiaWRcIiAmJiBrZXkgIT0gXCJub21icmVcIikge1xuICAgICAgICAgICAgaWYgKGtleSA9PSBcImluZ3JlZGllbnRlc1wiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xuICAgICAgICAgICAgICAgIHZhciBpbmdyZWRpZW50ZXMgPSBkYXRvc1trZXldO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5ncmVkaWVudGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGluZ3JlZGllbnRlc1tpXSlcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIjx0cj48dGQgc3R5bGU9XFxcInBhZGRpbmctcmlnaHQ6MTVweDtcXFwiPlwiICsgaW5ncmVkaWVudGVzW2ldLmNhbnRpZGFkICsgXCIgXCIgKyBpbmdyZWRpZW50ZXNbaV0udW5pZGFkRGVNZWRpZGEgKyBcIjwvdGQ+PHRkPlwiICsgaW5ncmVkaWVudGVzW2ldLm5vbWJyZSArIFwiPC90ZD48L3RyPlwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5nclJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09IFwiY29tZW50YXJpb3NcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0dWFsaXphckNvbWVudGFyaW9zKGRhdG9zW2tleV0pXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PSAnaW1hZ2VuJykge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5zcmMgPSBkYXRvc1trZXldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gZGF0b3Nba2V5XS5yZXBsYWNlQWxsKFwiXFxuXCIsIFwiPGJyPlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5vYnRlbmVySWRSZWNldGFBY3R1YWwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGlkUmVjZXRhQWN0dWFsO1xufVxuXG5leHBvcnRzLmFjdHVhbGl6YXJDb21lbnRhcmlvcyA9IChhcnJDb21lbnRhcmlvcykgPT4ge1xuICAgIGlmIChhcnJDb21lbnRhcmlvcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbWVudGFyaW9zUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBcIjxwPlBvciBhaG9yYSBubyBoYXkgY29tZW50YXJpb3MgcGFyYSBlc3RhIHJlY2V0YS48L3A+XCI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21lbnRhcmlvc1JlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyQ29tZW50YXJpb3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tZW50YXJpb3NSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCArPSBhZGRDb21tZW50KGFyckNvbWVudGFyaW9zW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRDb21tZW50KGNvbW1lbnQpIHtcbiAgICBjb25zdCBmZWNoYSA9IGNvbW1lbnRbJ2NyZWF0ZWRBdCddID8gY29tbWVudFsnY3JlYXRlZEF0J10uc2xpY2UoMCwgMTApIDogJyc7XG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiY29tbWVudC1pdGVtXFxcIj5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwicHVsbC1sZWZ0XFxcIj5cIiArXG4gICAgICAgIFwiPGE+XCIgKyBjb21tZW50WydhdXRvciddICsgXCI8L2E+PC9kaXY+XCIgK1xuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcInB1bGwtcmlnaHRcXFwiIHN0eWxlPVxcXCJwYWRkaW5nOiA1cHggMTBweDtcXFwiPlwiICtcbiAgICAgICAgXCI8aSBjbGFzcz1cXFwiZmEgZmEtY2xvY2stb1xcXCIgYXJpYS1oaWRkZW49dHJ1ZT48L2k+IDxzcGFuPlwiICsgZmVjaGEgKyBcIjwvc3Bhbj48L2Rpdj5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZGVzLWxcXFwiPlwiICtcbiAgICAgICAgXCI8cD5cIiArIGNvbW1lbnRbJ2NvbnRlbmlkbyddICsgXCI8L3A+PC9kaXY+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiO1xufVxuXG5cbmZ1bmN0aW9uIFVpbnQ4VG9TdHJpbmcodThhKSB7XG4gICAgdmFyIENIVU5LX1NaID0gMHg4MDAwO1xuICAgIHZhciBjID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1OGEubGVuZ3RoOyBpICs9IENIVU5LX1NaKSB7XG4gICAgICAgIGMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIHU4YS5zbGljZShpLCBpICsgQ0hVTktfU1opKSk7XG4gICAgfVxuICAgIHJldHVybiBjLmpvaW4oXCJcIik7XG59XG5cblxuIiwiXG5cbmV4cG9ydHMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BcIikuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgfSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5pbm5lckhUTUwgPSAnQWdyZWdhciBjb21lbnRhcmlvJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsXCJhZ3JlZ2FyXCIpO1xufVxuXG5leHBvcnRzLm1vc3RyYXJBZ3JlZ2FyUmVjZXRhID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWdhclJlY2V0YVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG4gICAgXG5leHBvcnRzLmF0cmFzID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjZXRhRXNwZWNpZmljYVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbn1cblxuZXhwb3J0cy5pckFQYWdQcmluY2lwYWwgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbn1cblxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhckNvbWVudGFyaW8gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FncmVnYXJDb21lbnRhcmlvUmVjZXRhRXNwZWNpZmljYScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW5pZG9Db21lbnRhcmlvJykudmFsdWUgPSAnJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5pbm5lckhUTUwgPSAnR3VhcmRhcic7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiZ3VhcmRhclwiKTtcbn1cblxuZXhwb3J0cy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FncmVnYXJDb21lbnRhcmlvUmVjZXRhRXNwZWNpZmljYScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuaW5uZXJIVE1MID0gJ0FncmVnYXIgY29tZW50YXJpbyc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiYWdyZWdhclwiKTtcbn1cblxuIiwiY29uc3Qgc2VydmljaW9zID0gcmVxdWlyZShcIi4vU2VydmljaW9zL21hbmVqb0V2ZW50b3MuanNcIik7XG5cbnZhciBicm93c2VyaWZ5ID0gXCJicm93c2VyaWZ5IC4vanMvbWFpbi5qcyAtbyAuL2pzL2J1aWxkL21haW4uanMgLWR2XCI7XG5cblxuc2VydmljaW9zLmVzY3VjaGFyUG9yRXZlbnRvcygpOyIsIlxuZXhwb3J0cy5mb3JtYXROdW1iZXIgPSAobnVtYmVyLCBwbGFjZXNBZnRlckNvbW1hID0gMCkgPT4ge1xuICAgIGlmICh0eXBlb2YgbnVtYmVyICE9IE51bWJlcikge1xuICAgICAgICBudW1iZXIgPSBwYXJzZUZsb2F0KG51bWJlcilcbiAgICB9XG4gICAgcmV0dXJuIG51bWJlci50b0ZpeGVkKHBsYWNlc0FmdGVyQ29tbWEpXG4gICAgLy8gLnJlcGxhY2UoJy4nLCAnLCcpLnJlcGxhY2UoLyhcXGQpKD89KFxcZHszfSkrKD8hXFxkKSkvZywgJyQxLicpXG59XG5cbmV4cG9ydHMuYXBwZW5kQ2hpbGRyZW4gPSAocGFkcmUsIG9iamV0b3MpID0+IHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamV0b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFkcmUuYXBwZW5kQ2hpbGQob2JqZXRvc1tpXSk7XG4gICAgfVxufVxuXG5leHBvcnRzLmNyZWFyTGFiZWwgPSAoZm9yVmFsdWUsIGNvbnRlbmlkbykgPT4ge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsYWJlbCcpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiZm9yXCIsIGZvclZhbHVlKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbnRlbmlkb1xuICAgIHJldHVybiBlbGVtZW50XG59XG5cbmV4cG9ydHMuY3JlYXJEaXYgPSAoaWQsIGNsYXNzTGlzdCwgY29udGVuaWRvKSA9PiB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY2xhc3NMaXN0LmpvaW4oJyAnKSk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb250ZW5pZG9cbiAgICByZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnRzLmNyZWFyU3BhbiA9IChpZCkgPT4ge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgcmV0dXJuIGVsZW1lbnRcbn1cblxuZXhwb3J0cy5jcmVhckJvdG9uQWdyZWdhckluZ3JlZGllbnRlID0gKGlkLCBuYW1lLCBpY29uQ2xhc3NMaXN0LCBpY29uU3R5bGUpID0+IHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcImJ1dHRvblwiKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcIm5hbWVcIiwgbmFtZSk7XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYWdyZWdhckluZ3JlZGllbnRlKHRoaXMubmFtZSk7XG4gICAgfSk7XG4gICAgaWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2knKTtcbiAgICBpY29uLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGljb25DbGFzc0xpc3Quam9pbignICcpKTtcbiAgICBpY29uLnNldEF0dHJpYnV0ZShcInN0eWxlXCIsIGljb25TdHlsZSk7XG4gICAgZWxlbWVudC5hcHBlbmRDaGlsZChpY29uKTtcbiAgICByZXR1cm4gZWxlbWVudFxufSAgIFxuXG5leHBvcnRzLmNyZWFySW5wdXROdW1lcm8gPSAoaWQsIGNsYXNzTGlzdCwgcmVxdWlyZWQsIG90aGVyUGFyYW1zLCBvbkNsaWNrRnVuY3Rpb25OYW1lKSA9PiB7XG4gICAgaW5wdXQgPSB0aGlzLmNyZWFySW5wdXQoaWQsIGNsYXNzTGlzdCwgcmVxdWlyZWQsIG90aGVyUGFyYW1zLCBvbkNsaWNrRnVuY3Rpb25OYW1lKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwibnVtYmVyXCIpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcInN0ZXBcIiwgXCIwLjAxXCIpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcIm1pblwiLCBcIjBcIik7XG4gICAgcmV0dXJuIGlucHV0XG59XG5cbmV4cG9ydHMuY3JlYXJJbnB1dEZlY2hhID0gKGlkLCBjbGFzc0xpc3QsIHJlcXVpcmVkLCBvdGhlclBhcmFtcywgb25DbGlja0Z1bmN0aW9uTmFtZSkgPT4ge1xuICAgIGlucHV0ID0gdGhpcy5jcmVhcklucHV0KGlkLCBjbGFzc0xpc3QsIHJlcXVpcmVkLCBvdGhlclBhcmFtcywgb25DbGlja0Z1bmN0aW9uTmFtZSk7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcIm1vbnRoXCIpO1xuICAgIHJldHVybiBpbnB1dDtcbn1cblxuZXhwb3J0cy5jcmVhcklucHV0ID0gKGlkLCBjbGFzc0xpc3QsIHJlcXVpcmVkLCBvdGhlclBhcmFtcywgb25DbGlja0Z1bmN0aW9uTmFtZSkgPT4ge1xuICAgIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW5wdXQnKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY2xhc3NMaXN0LmpvaW4oJyAnKSk7XG4gICAgT2JqZWN0LmtleXMob3RoZXJQYXJhbXMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoa2V5LCBvdGhlclBhcmFtc1trZXldKTtcbiAgICB9KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZ1bmN0aW9uVG9FeGVjdXRlID0gbmV3IEZ1bmN0aW9uKG9uQ2xpY2tGdW5jdGlvbk5hbWUgKyAnKCknKTtcbiAgICAgICAgZnVuY3Rpb25Ub0V4ZWN1dGUoKTtcbiAgICB9KTtcbiAgICBpbnB1dC5yZXF1aXJlZCA9IHJlcXVpcmVkO1xuICAgIHJldHVybiBpbnB1dFxufVxuIl19
