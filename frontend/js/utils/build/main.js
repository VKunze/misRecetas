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

    Http.send(params);

    if (returnValue) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImZyb250ZW5kL2pzL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL0NvbWVudGFyaW9zLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL1JlY2V0YS5qcyIsImZyb250ZW5kL2pzL1NlcnZpY2lvcy9tYW5lam9FdmVudG9zLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUGFnUHJpbmNpcGFsLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUmVjZXRhRXNwZWNpZmljYS5qcyIsImZyb250ZW5kL2pzL1Zpc3RhL1RyYW5zaWNpb25lcy5qcyIsImZyb250ZW5kL2pzL21haW4uanMiLCJmcm9udGVuZC9qcy91dGlscy91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiY29uc3QgSHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuY29uc3QgdXJsID0gJ2h0dHBzOi8vYm9pbGluZy1kdXNrLTk0MTk4Lmhlcm9rdWFwcC5jb20nO1xuXG5leHBvcnRzLm9idGVuZXJSZWNldGFzID0gYXN5bmMgKCkgPT4ge1xuICAgIHJldHVybiBtYW5kYXJBQmFja2VuZChcIkdFVFwiLCBcIi9vYnRlbmVyUmVjZXRhc1wiLCBudWxsLCB0cnVlKTtcbn1cblxuZXhwb3J0cy5vYnRlbmVyUmVjZXRhRXNwZWNpZmljYSA9IGFzeW5jIChpZCkgPT4ge1xuICAgIHJldHVybiBtYW5kYXJBQmFja2VuZChcIlBPU1RcIiwgXCIvb2J0ZW5lclJlY2V0YUVzcGVjaWZpY2FcIiwgJ3tcImlkUmVjZXRhXCI6XCInICsgaWQgKyAnXCJ9JywgdHJ1ZSkuZGF0b3M7XG59XG5cbmV4cG9ydHMuZ3VhcmRhclJlY2V0YSA9IGFzeW5jIChkYXRvcykgPT4ge1xuICAgIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9ndWFyZGFyUmVjZXRhXCIsIEpTT04uc3RyaW5naWZ5KGRhdG9zKSk7XG59XG5cbmV4cG9ydHMuZ3VhcmRhckNvbWVudGFyaW8gPSBhc3luYyAoZGF0b3MpID0+IHtcbiAgICBtYW5kYXJBQmFja2VuZChcIlBPU1RcIiwgXCIvZ3VhcmRhckNvbWVudGFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoZGF0b3MpKTtcbn1cblxuZXhwb3J0cy5vYnRlbmVyQ29tZW50YXJpb3MgPSBhc3luYyAoaWQpID0+IHtcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL29idGVuZXJDb21lbnRhcmlvc1wiLCAne1wiaWRSZWNldGFcIjpcIicgKyBpZCArICdcIn0nLCB0cnVlKS5jb21lbnRhcmlvcztcbn1cblxuLy9SZXF1ZXN0c1xuXG5mdW5jdGlvbiBtYW5kYXJBQmFja2VuZCh0aXBvUmVxdWVzdCwgdXJpLCBwYXJhbXMsIHJldHVyblZhbHVlID0gZmFsc2UpIHtcbiAgICBIdHRwLm9wZW4odGlwb1JlcXVlc3QsIHVybCArIHVyaSwgZmFsc2UpO1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgSHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICAgICAgSHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiY2FjaGVcIiwgXCJmYWxzZVwiKTtcbiAgICAgICAgSHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwicHJvY2Vzc0RhdGFcIiwgXCJmYWxzZVwiKTtcbiAgICB9XG5cbiAgICBIdHRwLnNlbmQocGFyYW1zKTtcblxuICAgIGlmIChyZXR1cm5WYWx1ZSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShIdHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiT0tcIjtcbiAgICB9XG5cbn1cbiIsImNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcbmNvbnN0IHZpc3RhUmVjZXRhRXNwZWNpZmljYSA9IHJlcXVpcmUoJy4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2EnKTtcbmNvbnN0IGJhY2tlbmQgPSByZXF1aXJlKCcuLi9QZXJzaXN0ZW5jaWEvQmFja2VuZCcpO1xuXG5leHBvcnRzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbyA9IGFzeW5jICh0aXBvRXZlbnRvKSA9PiB7XG4gICAgaWYgKHRpcG9FdmVudG8gPT0gJ2FncmVnYXInKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbygpO1xuICAgIH0gZWxzZSBpZiAodGlwb0V2ZW50byA9PSAnZ3VhcmRhcicpIHtcbiAgICAgICAgZGF0b3MgPSB7fVxuICAgICAgICBkYXRvcy5pZFJlY2V0YSA9IHZpc3RhUmVjZXRhRXNwZWNpZmljYS5vYnRlbmVySWRSZWNldGFBY3R1YWwoKTtcbiAgICAgICAgdmFyIGNvbWVudGFyaW8gPSB7fVxuICAgICAgICBjb21lbnRhcmlvLmNvbnRlbmlkbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW5pZG9Db21lbnRhcmlvJykudmFsdWU7XG4gICAgICAgIGNvbWVudGFyaW8uYXV0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0b3JDb21lbnRhcmlvJykudmFsdWU7XG4gICAgICAgIGRhdG9zLmNvbWVudGFyaW8gPSBjb21lbnRhcmlvXG4gICAgICAgIGF3YWl0IGJhY2tlbmQuZ3VhcmRhckNvbWVudGFyaW8oZGF0b3MpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInBvc3Qgc2F2aW5nIGNvbW1lbnQsIGlkIHJlY2V0YTogXCIsIGRhdG9zLmlkUmVjZXRhKVxuICAgICAgICB2YXIgY29tZW50YXJpb3MgPSBhd2FpdCBiYWNrZW5kLm9idGVuZXJDb21lbnRhcmlvcyhkYXRvcy5pZFJlY2V0YSk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9zdCBnZXR0aW5nIHRoZW06IFwiLCBjb21lbnRhcmlvcylcbiAgICAgICAgdmlzdGFSZWNldGFFc3BlY2lmaWNhLmFjdHVhbGl6YXJDb21lbnRhcmlvcyhjb21lbnRhcmlvcyk7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLm9jdWx0YXJBZ3JlZ2FyQ29tZW50YXJpbygpO1xuICAgIH1cbn1cbiIsImNvbnN0IGJhY2tlbmQgPSByZXF1aXJlKFwiLi4vUGVyc2lzdGVuY2lhL0JhY2tlbmQuanNcIik7XG5jb25zdCB2aXN0YVBhZ1ByaW5jaXBhbCA9IHJlcXVpcmUoXCIuLi9WaXN0YS9QYWdQcmluY2lwYWwuanNcIik7XG5jb25zdCB2aXN0YVRyYW5zaWNpb25lcyA9IHJlcXVpcmUoXCIuLi9WaXN0YS9UcmFuc2ljaW9uZXNcIik7XG5jb25zdCB2aXN0YVJlY2V0YUVzcGVjaWZpY2EgPSByZXF1aXJlKFwiLi4vVmlzdGEvUmVjZXRhRXNwZWNpZmljYVwiKTtcbmNvbnN0IHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxzL3V0aWxzXCIpO1xuXG5leHBvcnRzLmxpc3RhclJlY2V0YXMgPSBhc3luYyAoKSA9PiB7XG4gICAgdmFyIHJlc3B1ZXN0YSA9IGF3YWl0IGJhY2tlbmQub2J0ZW5lclJlY2V0YXMoKTtcbiAgICB2aXN0YVBhZ1ByaW5jaXBhbC5saXN0YXJSZWNldGFzKHJlc3B1ZXN0YVtcInJlY2V0YXNcIl0pO1xufVxuXG5leHBvcnRzLm1vc3RyYXJSZWNldGEgPSBhc3luYyAoaWQpID0+IHtcbiAgICB2YXIgZGF0b3MgPSBhd2FpdCBiYWNrZW5kLm9idGVuZXJSZWNldGFFc3BlY2lmaWNhKGlkLnNwbGl0KFwiLVwiKS5qb2luKFwiIFwiKSk7XG4gICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EoKTtcbiAgICB2aXN0YVJlY2V0YUVzcGVjaWZpY2EubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EoZGF0b3MpO1xufVxuXG5leHBvcnRzLmd1YXJkYXJOdWV2YVJlY2V0YSA9ICgpID0+IHtcbiAgICAvL29idGVuY2lvbiBkZSBkYXRvc1xuICAgIHZhciBkYXRvcyA9IHt9O1xuICAgIGRhdG9zLm5vbWJyZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0dWxvTnVldmFSZWNldGFcIikudmFsdWU7XG4gICAgZGF0b3MuYXV0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dG9yTnVldmFSZWNldGFcIikudmFsdWU7XG4gICAgZGF0b3MudGlwb0NvbWlkYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGlwb0NvbWlkYVwiKS52YWx1ZTtcbiAgICBkYXRvcy5kZXNjcmlwY2lvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcGNpw7NuTnVldmFSZWNldGFcIikudmFsdWU7XG4gICAgZGF0b3MuaW1hZ2VuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmV2aWV3SW1hZ2VuXCIpLnNyYztcblxuICAgIHZhciBpbmdyZWRpZW50ZXNJbmdyZXNhZG9zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5pbmdyZWRpZW50ZUluZ3Jlc2Fkb1wiKTtcbiAgICBkYXRvcy5pbmdyZWRpZW50ZXMgPSBbXVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5ncmVkaWVudGVzSW5ncmVzYWRvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaW5ncmVkaWVudGUgPSB7fVxuICAgICAgICBpbmdyZWRpZW50ZS5jYW50aWRhZCA9IGluZ3JlZGllbnRlc0luZ3Jlc2Fkb3NbaV0ucXVlcnlTZWxlY3RvcihcIi5pbmdyZWRpZW50ZUNhbnRpZGFkXCIpLnZhbHVlO1xuICAgICAgICBpbmdyZWRpZW50ZS51bmlkYWREZU1lZGlkYSA9IGluZ3JlZGllbnRlc0luZ3Jlc2Fkb3NbaV0ucXVlcnlTZWxlY3RvcihcIi5pbmdyZWRpZW50ZVVuaWRhZFwiKS52YWx1ZTtcbiAgICAgICAgaW5ncmVkaWVudGUubm9tYnJlID0gaW5ncmVkaWVudGVzSW5ncmVzYWRvc1tpXS5xdWVyeVNlbGVjdG9yKFwiLmluZ3JlZGllbnRlTm9tYnJlXCIpLnZhbHVlO1xuICAgICAgICBkYXRvcy5pbmdyZWRpZW50ZXMucHVzaChpbmdyZWRpZW50ZSk7XG4gICAgfVxuICAgIGJhY2tlbmQuZ3VhcmRhclJlY2V0YShkYXRvcyk7XG4gICAgdmlzdGFUcmFuc2ljaW9uZXMuaXJBUGFnUHJpbmNpcGFsKCk7XG4gICAgdGhpcy5saXN0YXJSZWNldGFzKCk7XG59XG5cbmV4cG9ydHMubW9zdHJhckFncmVnYXJJbmdyZWRpZW50ZSA9IChpZFByZXZpbykgPT4ge1xuICAgIHZhciBpZCA9IE51bWJlcihpZFByZXZpbykgKyAxO1xuICAgIHZhciBvdXRlckRpdiA9IHV0aWxzLmNyZWFyRGl2KFwiaW5ncmVkaWVudGVOdWV2YVJlY2V0YVwiICsgaWQsIFtcImluZ3JlZGllbnRlSW5ncmVzYWRvXCJdLCBcIlwiKVxuICAgIHZhciBpbnB1dENhbnRpZGFkID0gdXRpbHMuY3JlYXJJbnB1dChcImluZ3JlZGllbnRlc051ZXZhUmVjZXRhXCIgKyBpZCArIFwiY2FudGlkYWRcIiwgW1wiaW5wdXRMaW5kb1wiLCBcImluZ3JlZGllbnRlQ2FudGlkYWRcIiwgXCJpbmdyZWRpZW50ZUNhbnRpZGFkRmlsYU5vMFwiXSwgdHJ1ZSwgeyBcInBsYWNlaG9sZGVyXCI6IFwiY2FudGlkYWRcIiB9KVxuICAgIHZhciBpbnB1dFVuaWRhZCA9IHV0aWxzLmNyZWFySW5wdXQoXCJpbmdyZWRpZW50ZXNOdWV2YVJlY2V0YVwiICsgaWQgKyBcInVuaWRhZFwiLCBbXCJpbnB1dExpbmRvXCIsIFwiaW5ncmVkaWVudGVVbmlkYWRcIiwgXCJpbmdyZWRpZW50ZVVuaWRhZEZpbGFObzBcIl0sIHRydWUsIHsgXCJwbGFjZWhvbGRlclwiOiBcInVuaWRhZFwiIH0pXG4gICAgdmFyIGlucHV0Tm9tYnJlID0gdXRpbHMuY3JlYXJJbnB1dChcImluZ3JlZGllbnRlc051ZXZhUmVjZXRhXCIgKyBpZCArIFwiaW5ncmVkaWVudGVcIiwgW1wiaW5wdXRMaW5kb1wiLCBcImluZ3JlZGllbnRlTm9tYnJlXCIsIFwiaW5ncmVkaWVudGVOb21icmVGaWxhTm8wXCJdLCB0cnVlLCB7IFwicGxhY2Vob2xkZXJcIjogXCJpbmdyZWRpZW50ZVwiIH0pXG4gICAgdmFyIHNwYW5BZ3JlZ2FyTWFzID0gdXRpbHMuY3JlYXJTcGFuKFwibWFzSW5ncmVkaWVudGVzXCIgKyBpZClcbiAgICB2YXIgYnRuQWdyZWdhck1hcyA9IHV0aWxzLmNyZWFyQm90b25BZ3JlZ2FySW5ncmVkaWVudGUoXCJib3RvbkFncmVnYXJJbmdyZWRpZW50ZVwiICsgaWQsIGlkLCBbXCJmYVwiLCBcImZhLXBsdXNcIl0sIFwibWFyZ2luLWxlZnQ6IDEwcHg7XCIpXG4gICAgc3BhbkFncmVnYXJNYXMuYXBwZW5kQ2hpbGQoYnRuQWdyZWdhck1hcyk7XG4gICAgdXRpbHMuYXBwZW5kQ2hpbGRyZW4ob3V0ZXJEaXYsIFtpbnB1dENhbnRpZGFkLCBpbnB1dFVuaWRhZCwgaW5wdXROb21icmUsIHNwYW5BZ3JlZ2FyTWFzXSlcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbXBvc0luZ3JlZGllbnRlc1wiKS5hcHBlbmRDaGlsZChvdXRlckRpdik7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib3RvbkFncmVnYXJJbmdyZWRpZW50ZVwiICsgaWRQcmV2aW8pLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbn1cblxudmFyIHVwbG9hZGVyID0gJCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIC8+JylcblxuZXhwb3J0cy5hZ3JlZ2FySW1hZ2VuID0gKCkgPT4ge1xuICAgIHVwbG9hZGVyLmNsaWNrKClcblxuICAgIHVwbG9hZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlYWRVcmwodGhpcylcbiAgICB9KVxufVxuXG52YXIgcmVhZFVybCA9IChpbnB1dCkgPT4ge1xuICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgdmFyIGFscmVhZHlSZXNpemVkID0gdHJ1ZTtcblxuICAgICAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByZXZpZXdJbWFnZW5cIik7XG4gICAgICAgICAgICBpbWcuc3JjID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgICAgYWxyZWFkeVJlc2l6ZWQgPSBmYWxzZTtcbiAgICAgICAgfSlcblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByZXZpZXdJbWFnZW5cIikuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGlmICghYWxyZWFkeVJlc2l6ZWQpIHtcbiAgICAgICAgICAgICAgICBhbHJlYWR5UmVzaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJldmlld0ltYWdlblwiKTtcblxuICAgICAgICAgICAgICAgIC8vIFJlc2l6ZSBpbWcgaWYgdG9vIGJpZ1xuICAgICAgICAgICAgICAgIHZhciBNQVhfV0lEVEggPSA0MDA7XG4gICAgICAgICAgICAgICAgdmFyIE1BWF9IRUlHSFQgPSA0MDA7XG4gICAgICAgICAgICAgICAgdmFyIHdpZHRoID0gaW1nLndpZHRoO1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBpbWcuaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGlmICh3aWR0aCA+IGhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2lkdGggPiBNQVhfV0lEVEgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCAqPSBNQVhfV0lEVEggLyB3aWR0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoID0gTUFYX1dJRFRIO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGhlaWdodCA+IE1BWF9IRUlHSFQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZHRoICo9IE1BWF9IRUlHSFQgLyBoZWlnaHQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNQVhfSEVJR0hUO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZShpbWcsIDAsIDAsIHdpZHRoLCBoZWlnaHQpXG4gICAgICAgICAgICAgICAgdmFyIGRhdGFVcmwgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvanBlZ1wiKVxuICAgICAgICAgICAgICAgIGltZy5zcmMgPSBkYXRhVXJsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKVxuICAgIH1cbn0iLCJjb25zdCByZWNldGEgPSByZXF1aXJlKFwiLi9SZWNldGEuanNcIik7XG5jb25zdCBjb21lbnRhcmlvcyA9IHJlcXVpcmUoXCIuL0NvbWVudGFyaW9zLmpzXCIpO1xuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xuXG5leHBvcnRzLmVzY3VjaGFyUG9yRXZlbnRvcyA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcmVjZXRhLmxpc3RhclJlY2V0YXMoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FyUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhckFncmVnYXJSZWNldGEoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhdHJhc1wiLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLmF0cmFzKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJndWFyZGFyTnVldmFSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICByZWNldGEuZ3VhcmRhck51ZXZhUmVjZXRhKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FySW1hZ2VuXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmVjZXRhLmFncmVnYXJJbWFnZW4oKTtcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vc3RyYXJSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJlY2V0YS5tb3N0cmFyUmVjZXRhKGlkLmRldGFpbCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYWdyZWdhckNvbWVudGFyaW9cIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGNvbWVudGFyaW9zLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbyhpZC5kZXRhaWwpO1xuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImFncmVnYXJJbmdyZWRpZW50ZVwiLCBhc3luYyBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmVjZXRhLm1vc3RyYXJBZ3JlZ2FySW5ncmVkaWVudGUoaWQuZGV0YWlsKTtcbiAgICB9KTtcbn0iLCJjb25zdCB7IGFncmVnYXJJbWFnZW4gfSA9IHJlcXVpcmUoXCIuLi9TZXJ2aWNpb3MvUmVjZXRhXCIpO1xuXG5cbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IChyZWNldGFzKSA9PiB7XG4gICAgdmFyIGh0bWwgPSBcIlwiO1xuICAgIGNvbnNvbGUubG9cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY2V0YXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG5vbWJyZXNJbmdyZWRpZW50ZXMgPSBbXTtcbiAgICAgICAgcmVjZXRhc1tpXS5pbmdyZWRpZW50ZXMuZm9yRWFjaChpbmdyZWRpZW50ZSA9PiBub21icmVzSW5ncmVkaWVudGVzLnB1c2goaW5ncmVkaWVudGUubm9tYnJlKSlcbiAgICAgICAgaHRtbCArPSBcIjxkaXYgaWQ9XFxcIlwiICsgcmVjZXRhc1tpXS5pZCArIFwiXFxcIiBjbGFzcz1cXFwiY29sLWxnLTQgY29sLW1kLTYgZWxlbWVudG8tZ3JpZC1yZWNldGFzIFwiICsgcmVjZXRhc1tpXS50aXBvQ29taWRhICsgXCJcXFwiIHN0eWxlPVxcXCJ3aWR0aD0yNDdweFxcXCI+XCIgK1xuICAgICAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJnYWxsZXJ5LXNpbmdsZSBmaXhcXFwiPlwiICtcbiAgICAgICAgICAgIGFncmVnYXJJbWFnZW5jaXRhKHJlY2V0YXNbaV0pICtcbiAgICAgICAgICAgIFwiPGRpdiBjbGFzcz1cXFwid2h5LXRleHRcXFwiPlwiICtcbiAgICAgICAgICAgIFwiPGg0IGNsYXNzPW5vbWJyZVJlY2V0YT5cIiArIHJlY2V0YXNbaV0ubm9tYnJlICsgXCI8L2g0PlwiICtcbiAgICAgICAgICAgIFwiPHAgc3R5bGU9XFxcImRpc3BsYXk6bm9uZTtcXFwiIGNsYXNzPW5vbWJyZUF1dG9yPlwiICsgcmVjZXRhc1tpXS5hdXRvciArIFwiPC9wPlwiICtcbiAgICAgICAgICAgIFwiPHAgc3R5bGU9XFxcImRpc3BsYXk6bm9uZTtcXFwiIGNsYXNzPW5vbWJyZXNJbmdyZWRpZW50ZXM+XCIgKyBub21icmVzSW5ncmVkaWVudGVzLmpvaW4oXCIsXCIpICsgXCI8L3A+XCIgK1xuICAgICAgICAgICAgXCI8YSBjbGFzcz1cXFwiYnRuLWxnIGJ0bi1jaXJjbGUgYnRuLW91dGxpbmUtbmV3LXdoaXRlXFxcIiBpZD1cXFwiXCIgKyByZWNldGFzW2ldLmlkICsgXCJcXFwiIG9uY2xpY2s9XFxcIm1vc3RyYXJSZWNldGEodGhpcy5pZClcXFwiIHN0eWxlPVxcXCJjb2xvcjp3aGl0ZTtcXFwiPlZlciByZWNldGE8L2E+XCIgK1xuICAgICAgICAgICAgXCI8L2Rpdj5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiICtcbiAgICAgICAgICAgIFwiPC9kaXY+XCI7XG4gICAgfVxuICAgIGh0bWwgKz0gYWdyZWdhckhUTUxBZ3JlZ2FyUmVjZXRhKCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0YVJlY2V0YXNcIikuaW5uZXJIVE1MID0gaHRtbDtcbn1cblxuZnVuY3Rpb24gYWdyZWdhckltYWdlbmNpdGEocmVjZXRhKSB7XG4gICAgaWYgKHJlY2V0YS5pbWFnZW4pIHtcbiAgICAgICAgdmFyIGltZ0RhdGEgPSByZWNldGEuaW1hZ2VuLmRhdGE7XG4gICAgICAgIHJldHVybiBcIjxpbWcgc3JjPVxcXCJcIiArIFVpbnQ4VG9TdHJpbmcoaW1nRGF0YSkgKyBcIlxcXCIgY2xhc3M9XFxcImltZy1mbHVpZCBhZGp1c3QtaW1nXFxcIiBhbHQ9XFxcIkltYWdlXFxcIj5cIlxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBcIlwiXG4gICAgfVxufVxuXG5mdW5jdGlvbiBhZ3JlZ2FySFRNTEFncmVnYXJSZWNldGEoKSB7XG4gICAgdmFyIGh0bWwgPSBcIjxkaXYgY2xhc3M9XFxcImNvbC1sZy00IGNvbC1tZC02IGVsZW1lbnRvLWdyaWQtcmVjZXRhcyBzaWVtcHJlVmlzaWJsZVxcXCIgaWQ9ZWxlbWVudG9BZ3JlZ2FyUmVjZXRhPlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJnYWxsZXJ5LXNpbmdsZSBmaXggYWdyZWdhclJlY2V0YVxcXCI+XCIgK1xuICAgICAgICBcIjxhIGNsYXNzPVxcXCJidG4tbGcgYnRuLWNpcmNsZSBidG4tb3V0bGluZS1uZXctd2hpdGVcXFwiIGlkPVxcXCJhZ3JlZ2FyUmVjZXRhQnRuXFxcIiBvbmNsaWNrPVxcXCJhZ3JlZ2FyUmVjZXRhKClcXFwiIHN0eWxlPVxcXCJkaXNwbGF5OmJsb2NrOyBjb2xvcjp3aGl0ZTtcXFwiPkFncmVnYXIgcmVjZXRhPC9hPlwiICtcbiAgICAgICAgXCI8L2Rpdj5cIiArXG4gICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiO1xuICAgIHJldHVybiBodG1sO1xufVxuXG5mdW5jdGlvbiBVaW50OFRvU3RyaW5nKHU4YSkge1xuICAgIHZhciBDSFVOS19TWiA9IDB4ODAwMDtcbiAgICB2YXIgYyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdThhLmxlbmd0aDsgaSArPSBDSFVOS19TWikge1xuICAgICAgICBjLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB1OGEuc2xpY2UoaSwgaSArIENIVU5LX1NaKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYy5qb2luKFwiXCIpO1xufVxuIiwidmFyIGlkUmVjZXRhQWN0dWFsID0gJyc7XG5cbmV4cG9ydHMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EgPSAoZGF0b3MpID0+IHtcbiAgICBpZFJlY2V0YUFjdHVhbCA9IGRhdG9zLmlkO1xuICAgIC8vUmVzZXRlYXIgdG9kb3MgbG9zIGh0bWxcbiAgICB2YXIgZWxlbWVudG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImVsZW1SZWNldGFFc3BlY2lmaWNhXCIpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRvc1tpXS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vc2V0IHRpdHVsb1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0dWxvXCIpLmlubmVySFRNTCA9IGRhdG9zLm5vbWJyZTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2VuUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBcIjxpbWcgY2xhc3M9XFxcImltZy1mbHVpZFxcXCIgc3JjPVxcXCJcIiArIFVpbnQ4VG9TdHJpbmcoZGF0b3MuaW1hZ2VuLmRhdGEpICsgXCJcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiBhbHQ9XFxcIlxcXCI+XCI7XG4gICAgZm9yIChrZXkgaW4gZGF0b3MpIHtcbiAgICAgICAgaWYgKGtleSAhPSBcInRpcG9Db21pZGFcIiAmJiBrZXkgIT0gXCJjcmVhdGVkQXRcIiAmJiBrZXkgIT0gXCJ1cGRhdGVkQXRcIiAmJiBrZXkgIT0gXCJpZFwiICYmIGtleSAhPSBcIm5vbWJyZVwiKSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09IFwiaW5ncmVkaWVudGVzXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgdmFyIGluZ3JlZGllbnRlcyA9IGRhdG9zW2tleV07XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmdyZWRpZW50ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW5ncmVkaWVudGVzW2ldKVxuICAgICAgICAgICAgICAgICAgICBodG1sICs9IFwiPHRyPjx0ZCBzdHlsZT1cXFwicGFkZGluZy1yaWdodDoxNXB4O1xcXCI+XCIgKyBpbmdyZWRpZW50ZXNbaV0uY2FudGlkYWQgKyBcIiBcIiArIGluZ3JlZGllbnRlc1tpXS51bmlkYWREZU1lZGlkYSArIFwiPC90ZD48dGQ+XCIgKyBpbmdyZWRpZW50ZXNbaV0ubm9tYnJlICsgXCI8L3RkPjwvdHI+XCJcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbmdyUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBodG1sO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT0gXCJjb21lbnRhcmlvc1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3R1YWxpemFyQ29tZW50YXJpb3MoZGF0b3Nba2V5XSlcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09ICdpbWFnZW4nKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5ICsgXCJSZWNldGFFc3BlY2lmaWNhXCIpLnNyYyA9IGRhdG9zW2tleV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBkYXRvc1trZXldLnJlcGxhY2VBbGwoXCJcXG5cIiwgXCI8YnI+XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnRzLm9idGVuZXJJZFJlY2V0YUFjdHVhbCA9ICgpID0+IHtcbiAgICByZXR1cm4gaWRSZWNldGFBY3R1YWw7XG59XG5cbmV4cG9ydHMuYWN0dWFsaXphckNvbWVudGFyaW9zID0gKGFyckNvbWVudGFyaW9zKSA9PiB7XG4gICAgaWYgKGFyckNvbWVudGFyaW9zLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tZW50YXJpb3NSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCA9IFwiPHA+UG9yIGFob3JhIG5vIGhheSBjb21lbnRhcmlvcyBwYXJhIGVzdGEgcmVjZXRhLjwvcD5cIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbWVudGFyaW9zUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJDb21lbnRhcmlvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21lbnRhcmlvc1JlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MICs9IGFkZENvbW1lbnQoYXJyQ29tZW50YXJpb3NbaV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGFkZENvbW1lbnQoY29tbWVudCkge1xuICAgIGNvbnN0IGZlY2hhID0gY29tbWVudFsnY3JlYXRlZEF0J10gPyBjb21tZW50WydjcmVhdGVkQXQnXS5zbGljZSgwLCAxMCkgOiAnJztcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJjb21tZW50LWl0ZW1cXFwiPlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJwdWxsLWxlZnRcXFwiPlwiICtcbiAgICAgICAgXCI8YT5cIiArIGNvbW1lbnRbJ2F1dG9yJ10gKyBcIjwvYT48L2Rpdj5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwicHVsbC1yaWdodFxcXCIgc3R5bGU9XFxcInBhZGRpbmc6IDVweCAxMHB4O1xcXCI+XCIgK1xuICAgICAgICBcIjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIiBhcmlhLWhpZGRlbj10cnVlPjwvaT4gPHNwYW4+XCIgKyBmZWNoYSArIFwiPC9zcGFuPjwvZGl2PlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJkZXMtbFxcXCI+XCIgK1xuICAgICAgICBcIjxwPlwiICsgY29tbWVudFsnY29udGVuaWRvJ10gKyBcIjwvcD48L2Rpdj5cIiArXG4gICAgICAgIFwiPC9kaXY+XCI7XG59XG5cblxuZnVuY3Rpb24gVWludDhUb1N0cmluZyh1OGEpIHtcbiAgICB2YXIgQ0hVTktfU1ogPSAweDgwMDA7XG4gICAgdmFyIGMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHU4YS5sZW5ndGg7IGkgKz0gQ0hVTktfU1opIHtcbiAgICAgICAgYy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdThhLnNsaWNlKGksIGkgKyBDSFVOS19TWikpKTtcbiAgICB9XG4gICAgcmV0dXJuIGMuam9pbihcIlwiKTtcbn1cblxuXG4iLCJcblxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYSA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcFwiKS5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgICB9KTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjZXRhRXNwZWNpZmljYVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdBZ3JlZ2FyIGNvbWVudGFyaW8nO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLnNldEF0dHJpYnV0ZShcIm5hbWVcIixcImFncmVnYXJcIik7XG59XG5cbmV4cG9ydHMubW9zdHJhckFncmVnYXJSZWNldGEgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbn1cbiAgICBcbmV4cG9ydHMuYXRyYXMgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNldGFFc3BlY2lmaWNhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufVxuXG5leHBvcnRzLmlyQVBhZ1ByaW5jaXBhbCA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xufVxuXG5leHBvcnRzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbyA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWdyZWdhckNvbWVudGFyaW9SZWNldGFFc3BlY2lmaWNhJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbmlkb0NvbWVudGFyaW8nKS52YWx1ZSA9ICcnO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdHdWFyZGFyJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsXCJndWFyZGFyXCIpO1xufVxuXG5leHBvcnRzLm9jdWx0YXJBZ3JlZ2FyQ29tZW50YXJpbyA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWdyZWdhckNvbWVudGFyaW9SZWNldGFFc3BlY2lmaWNhJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5pbm5lckhUTUwgPSAnQWdyZWdhciBjb21lbnRhcmlvJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsXCJhZ3JlZ2FyXCIpO1xufVxuXG4iLCJjb25zdCBzZXJ2aWNpb3MgPSByZXF1aXJlKFwiLi9TZXJ2aWNpb3MvbWFuZWpvRXZlbnRvcy5qc1wiKTtcblxudmFyIGJyb3dzZXJpZnkgPSBcImJyb3dzZXJpZnkgLi9qcy9tYWluLmpzIC1vIC4vanMvYnVpbGQvbWFpbi5qcyAtZHZcIjtcblxuXG5zZXJ2aWNpb3MuZXNjdWNoYXJQb3JFdmVudG9zKCk7IiwiXG5leHBvcnRzLmZvcm1hdE51bWJlciA9IChudW1iZXIsIHBsYWNlc0FmdGVyQ29tbWEgPSAwKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBudW1iZXIgIT0gTnVtYmVyKSB7XG4gICAgICAgIG51bWJlciA9IHBhcnNlRmxvYXQobnVtYmVyKVxuICAgIH1cbiAgICByZXR1cm4gbnVtYmVyLnRvRml4ZWQocGxhY2VzQWZ0ZXJDb21tYSlcbiAgICAvLyAucmVwbGFjZSgnLicsICcsJykucmVwbGFjZSgvKFxcZCkoPz0oXFxkezN9KSsoPyFcXGQpKS9nLCAnJDEuJylcbn1cblxuZXhwb3J0cy5hcHBlbmRDaGlsZHJlbiA9IChwYWRyZSwgb2JqZXRvcykgPT4ge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZXRvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBwYWRyZS5hcHBlbmRDaGlsZChvYmpldG9zW2ldKTtcbiAgICB9XG59XG5cbmV4cG9ydHMuY3JlYXJMYWJlbCA9IChmb3JWYWx1ZSwgY29udGVuaWRvKSA9PiB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xhYmVsJyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJmb3JcIiwgZm9yVmFsdWUpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29udGVuaWRvXG4gICAgcmV0dXJuIGVsZW1lbnRcbn1cblxuZXhwb3J0cy5jcmVhckRpdiA9IChpZCwgY2xhc3NMaXN0LCBjb250ZW5pZG8pID0+IHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBjbGFzc0xpc3Quam9pbignICcpKTtcbiAgICBlbGVtZW50LmlubmVySFRNTCA9IGNvbnRlbmlkb1xuICAgIHJldHVybiBlbGVtZW50XG59XG5cbmV4cG9ydHMuY3JlYXJTcGFuID0gKGlkKSA9PiB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICByZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnRzLmNyZWFyQm90b25BZ3JlZ2FySW5ncmVkaWVudGUgPSAoaWQsIG5hbWUsIGljb25DbGFzc0xpc3QsIGljb25TdHlsZSkgPT4ge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwiYnV0dG9uXCIpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwibmFtZVwiLCBuYW1lKTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICBhZ3JlZ2FySW5ncmVkaWVudGUodGhpcy5uYW1lKTtcbiAgICB9KTtcbiAgICBpY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaScpO1xuICAgIGljb24uc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgaWNvbkNsYXNzTGlzdC5qb2luKCcgJykpO1xuICAgIGljb24uc2V0QXR0cmlidXRlKFwic3R5bGVcIiwgaWNvblN0eWxlKTtcbiAgICBlbGVtZW50LmFwcGVuZENoaWxkKGljb24pO1xuICAgIHJldHVybiBlbGVtZW50XG59ICAgXG5cbmV4cG9ydHMuY3JlYXJJbnB1dE51bWVybyA9IChpZCwgY2xhc3NMaXN0LCByZXF1aXJlZCwgb3RoZXJQYXJhbXMsIG9uQ2xpY2tGdW5jdGlvbk5hbWUpID0+IHtcbiAgICBpbnB1dCA9IHRoaXMuY3JlYXJJbnB1dChpZCwgY2xhc3NMaXN0LCByZXF1aXJlZCwgb3RoZXJQYXJhbXMsIG9uQ2xpY2tGdW5jdGlvbk5hbWUpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJudW1iZXJcIik7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwic3RlcFwiLCBcIjAuMDFcIik7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwibWluXCIsIFwiMFwiKTtcbiAgICByZXR1cm4gaW5wdXRcbn1cblxuZXhwb3J0cy5jcmVhcklucHV0RmVjaGEgPSAoaWQsIGNsYXNzTGlzdCwgcmVxdWlyZWQsIG90aGVyUGFyYW1zLCBvbkNsaWNrRnVuY3Rpb25OYW1lKSA9PiB7XG4gICAgaW5wdXQgPSB0aGlzLmNyZWFySW5wdXQoaWQsIGNsYXNzTGlzdCwgcmVxdWlyZWQsIG90aGVyUGFyYW1zLCBvbkNsaWNrRnVuY3Rpb25OYW1lKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwibW9udGhcIik7XG4gICAgcmV0dXJuIGlucHV0O1xufVxuXG5leHBvcnRzLmNyZWFySW5wdXQgPSAoaWQsIGNsYXNzTGlzdCwgcmVxdWlyZWQsIG90aGVyUGFyYW1zLCBvbkNsaWNrRnVuY3Rpb25OYW1lKSA9PiB7XG4gICAgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBjbGFzc0xpc3Quam9pbignICcpKTtcbiAgICBPYmplY3Qua2V5cyhvdGhlclBhcmFtcykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgIGlucHV0LnNldEF0dHJpYnV0ZShrZXksIG90aGVyUGFyYW1zW2tleV0pO1xuICAgIH0pO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZnVuY3Rpb25Ub0V4ZWN1dGUgPSBuZXcgRnVuY3Rpb24ob25DbGlja0Z1bmN0aW9uTmFtZSArICcoKScpO1xuICAgICAgICBmdW5jdGlvblRvRXhlY3V0ZSgpO1xuICAgIH0pO1xuICAgIGlucHV0LnJlcXVpcmVkID0gcmVxdWlyZWQ7XG4gICAgcmV0dXJuIGlucHV0XG59XG4iXX0=
