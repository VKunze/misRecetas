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
    console.log("datos que se van a guardar: ", datos, JSON.stringify(datos))
    backend.guardarReceta(datos);
    vistaTransiciones.irAPagPrincipal();
    this.listarRecetas();
}

exports.mostrarAgregarIngrediente = (idPrevio) => {
    var id = Number(idPrevio) + 1;
    var outerDiv = utils.crearDiv("ingredienteNuevaReceta" + id, ["ingredienteIngresado"], "")
    var inputCantidad = utils.crearInputNumero("ingredientesNuevaReceta" + id + "cantidad", ["inputLindo", "ingredienteCantidad", "ingredienteCantidadFilaNo0"], true, { "placeholder": "cantidad" })
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

        reader.addEventListener("load", function (e) {
            console.log(e.target, e.target.result)
            var img = document.getElementById("previewImagen");
            img.src = e.target.result;
        })

        document.getElementById("previewImagen").addEventListener("load", function(e){
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
        }, false);

        console.log("input.files[0]", input.files[0])
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJmcm9udGVuZC9qcy9QZXJzaXN0ZW5jaWEvQmFja2VuZC5qcyIsImZyb250ZW5kL2pzL1NlcnZpY2lvcy9Db21lbnRhcmlvcy5qcyIsImZyb250ZW5kL2pzL1NlcnZpY2lvcy9SZWNldGEuanMiLCJmcm9udGVuZC9qcy9TZXJ2aWNpb3MvbWFuZWpvRXZlbnRvcy5qcyIsImZyb250ZW5kL2pzL1Zpc3RhL1BhZ1ByaW5jaXBhbC5qcyIsImZyb250ZW5kL2pzL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2EuanMiLCJmcm9udGVuZC9qcy9WaXN0YS9UcmFuc2ljaW9uZXMuanMiLCJmcm9udGVuZC9qcy9tYWluLmpzIiwiZnJvbnRlbmQvanMvdXRpbHMvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBIdHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbmNvbnN0IHVybCA9ICdodHRwczovL2JvaWxpbmctZHVzay05NDE5OC5oZXJva3VhcHAuY29tJztcclxuXHJcbmV4cG9ydHMub2J0ZW5lclJlY2V0YXMgPSBhc3luYyAoKSA9PiB7XHJcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJHRVRcIiwgXCIvb2J0ZW5lclJlY2V0YXNcIiwgbnVsbCwgdHJ1ZSk7XHJcbn1cclxuXHJcbmV4cG9ydHMub2J0ZW5lclJlY2V0YUVzcGVjaWZpY2EgPSBhc3luYyAoaWQpID0+IHtcclxuICAgIHJldHVybiBtYW5kYXJBQmFja2VuZChcIlBPU1RcIiwgXCIvb2J0ZW5lclJlY2V0YUVzcGVjaWZpY2FcIiwgJ3tcImlkUmVjZXRhXCI6XCInICsgaWQgKyAnXCJ9JywgdHJ1ZSkuZGF0b3M7XHJcbn1cclxuXHJcbmV4cG9ydHMuZ3VhcmRhclJlY2V0YSA9IGFzeW5jIChkYXRvcykgPT4ge1xyXG4gICAgbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL2d1YXJkYXJSZWNldGFcIiwgSlNPTi5zdHJpbmdpZnkoZGF0b3MpKTtcclxufVxyXG5cclxuZXhwb3J0cy5ndWFyZGFyQ29tZW50YXJpbyA9IGFzeW5jIChkYXRvcykgPT4ge1xyXG4gICAgbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL2d1YXJkYXJDb21lbnRhcmlvXCIsIEpTT04uc3RyaW5naWZ5KGRhdG9zKSk7XHJcbn1cclxuXHJcbmV4cG9ydHMub2J0ZW5lckNvbWVudGFyaW9zID0gYXN5bmMgKGlkKSA9PiB7XHJcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL29idGVuZXJDb21lbnRhcmlvc1wiLCAne1wiaWRSZWNldGFcIjpcIicgKyBpZCArICdcIn0nLCB0cnVlKS5jb21lbnRhcmlvcztcclxufVxyXG5cclxuLy9SZXF1ZXN0c1xyXG5cclxuZnVuY3Rpb24gbWFuZGFyQUJhY2tlbmQodGlwb1JlcXVlc3QsIHVyaSwgcGFyYW1zLCByZXR1cm5WYWx1ZSA9IGZhbHNlKSB7XHJcbiAgICBIdHRwLm9wZW4odGlwb1JlcXVlc3QsIHVybCArIHVyaSwgZmFsc2UpO1xyXG4gICAgaWYgKHBhcmFtcykge1xyXG4gICAgICAgIEh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICAgICAgSHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiY2FjaGVcIiwgXCJmYWxzZVwiKTtcclxuICAgICAgICBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJwcm9jZXNzRGF0YVwiLCBcImZhbHNlXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIEh0dHAuc2VuZChwYXJhbXMpO1xyXG5cclxuICAgIGlmIChyZXR1cm5WYWx1ZSkge1xyXG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEh0dHAucmVzcG9uc2VUZXh0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIFwiT0tcIjtcclxuICAgIH1cclxuXHJcbn1cclxuIiwiY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xyXG5jb25zdCB2aXN0YVJlY2V0YUVzcGVjaWZpY2EgPSByZXF1aXJlKCcuLi9WaXN0YS9SZWNldGFFc3BlY2lmaWNhJyk7XHJcbmNvbnN0IGJhY2tlbmQgPSByZXF1aXJlKCcuLi9QZXJzaXN0ZW5jaWEvQmFja2VuZCcpO1xyXG5cclxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhckNvbWVudGFyaW8gPSBhc3luYyAodGlwb0V2ZW50bykgPT4ge1xyXG4gICAgaWYgKHRpcG9FdmVudG8gPT0gJ2FncmVnYXInKSB7XHJcbiAgICAgICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhckFncmVnYXJDb21lbnRhcmlvKCk7XHJcbiAgICB9IGVsc2UgaWYgKHRpcG9FdmVudG8gPT0gJ2d1YXJkYXInKSB7XHJcbiAgICAgICAgZGF0b3MgPSB7fVxyXG4gICAgICAgIGRhdG9zLmlkUmVjZXRhID0gdmlzdGFSZWNldGFFc3BlY2lmaWNhLm9idGVuZXJJZFJlY2V0YUFjdHVhbCgpO1xyXG4gICAgICAgIHZhciBjb21lbnRhcmlvID0ge31cclxuICAgICAgICBjb21lbnRhcmlvLmNvbnRlbmlkbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW5pZG9Db21lbnRhcmlvJykudmFsdWU7XHJcbiAgICAgICAgY29tZW50YXJpby5hdXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhdXRvckNvbWVudGFyaW8nKS52YWx1ZTtcclxuICAgICAgICBkYXRvcy5jb21lbnRhcmlvID0gY29tZW50YXJpb1xyXG4gICAgICAgIGF3YWl0IGJhY2tlbmQuZ3VhcmRhckNvbWVudGFyaW8oZGF0b3MpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9zdCBzYXZpbmcgY29tbWVudCwgaWQgcmVjZXRhOiBcIiwgZGF0b3MuaWRSZWNldGEpXHJcbiAgICAgICAgdmFyIGNvbWVudGFyaW9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyQ29tZW50YXJpb3MoZGF0b3MuaWRSZWNldGEpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicG9zdCBnZXR0aW5nIHRoZW06IFwiLCBjb21lbnRhcmlvcylcclxuICAgICAgICB2aXN0YVJlY2V0YUVzcGVjaWZpY2EuYWN0dWFsaXphckNvbWVudGFyaW9zKGNvbWVudGFyaW9zKTtcclxuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8oKTtcclxuICAgIH1cclxufVxyXG4iLCJjb25zdCBiYWNrZW5kID0gcmVxdWlyZShcIi4uL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzXCIpO1xyXG5jb25zdCB2aXN0YVBhZ1ByaW5jaXBhbCA9IHJlcXVpcmUoXCIuLi9WaXN0YS9QYWdQcmluY2lwYWwuanNcIik7XHJcbmNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcclxuY29uc3QgdmlzdGFSZWNldGFFc3BlY2lmaWNhID0gcmVxdWlyZShcIi4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2FcIik7XHJcbmNvbnN0IHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxzL3V0aWxzXCIpO1xyXG5cclxuZXhwb3J0cy5saXN0YXJSZWNldGFzID0gYXN5bmMgKCkgPT4ge1xyXG4gICAgdmFyIHJlc3B1ZXN0YSA9IGF3YWl0IGJhY2tlbmQub2J0ZW5lclJlY2V0YXMoKTtcclxuICAgIHZpc3RhUGFnUHJpbmNpcGFsLmxpc3RhclJlY2V0YXMocmVzcHVlc3RhW1wicmVjZXRhc1wiXSk7XHJcbn1cclxuXHJcbmV4cG9ydHMubW9zdHJhclJlY2V0YSA9IGFzeW5jIChpZCkgPT4ge1xyXG4gICAgdmFyIGRhdG9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyUmVjZXRhRXNwZWNpZmljYShpZC5zcGxpdChcIi1cIikuam9pbihcIiBcIikpO1xyXG4gICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EoKTtcclxuICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYShkYXRvcyk7XHJcbn1cclxuXHJcbmV4cG9ydHMuZ3VhcmRhck51ZXZhUmVjZXRhID0gKCkgPT4ge1xyXG4gICAgLy9vYnRlbmNpb24gZGUgZGF0b3NcclxuICAgIHZhciBkYXRvcyA9IHt9O1xyXG4gICAgZGF0b3Mubm9tYnJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXR1bG9OdWV2YVJlY2V0YVwiKS52YWx1ZTtcclxuICAgIGRhdG9zLmF1dG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRvck51ZXZhUmVjZXRhXCIpLnZhbHVlO1xyXG4gICAgZGF0b3MudGlwb0NvbWlkYSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGlwb0NvbWlkYVwiKS52YWx1ZTtcclxuICAgIGRhdG9zLmRlc2NyaXBjaW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwY2nDs25OdWV2YVJlY2V0YVwiKS52YWx1ZTtcclxuICAgIGRhdG9zLmltYWdlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJldmlld0ltYWdlblwiKS5zcmM7XHJcblxyXG4gICAgdmFyIGluZ3JlZGllbnRlc0luZ3Jlc2Fkb3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmluZ3JlZGllbnRlSW5ncmVzYWRvXCIpO1xyXG4gICAgZGF0b3MuaW5ncmVkaWVudGVzID0gW11cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5ncmVkaWVudGVzSW5ncmVzYWRvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHZhciBpbmdyZWRpZW50ZSA9IHt9XHJcbiAgICAgICAgaW5ncmVkaWVudGUuY2FudGlkYWQgPSBpbmdyZWRpZW50ZXNJbmdyZXNhZG9zW2ldLnF1ZXJ5U2VsZWN0b3IoXCIuaW5ncmVkaWVudGVDYW50aWRhZFwiKS52YWx1ZTtcclxuICAgICAgICBpbmdyZWRpZW50ZS51bmlkYWREZU1lZGlkYSA9IGluZ3JlZGllbnRlc0luZ3Jlc2Fkb3NbaV0ucXVlcnlTZWxlY3RvcihcIi5pbmdyZWRpZW50ZVVuaWRhZFwiKS52YWx1ZTtcclxuICAgICAgICBpbmdyZWRpZW50ZS5ub21icmUgPSBpbmdyZWRpZW50ZXNJbmdyZXNhZG9zW2ldLnF1ZXJ5U2VsZWN0b3IoXCIuaW5ncmVkaWVudGVOb21icmVcIikudmFsdWU7XHJcbiAgICAgICAgZGF0b3MuaW5ncmVkaWVudGVzLnB1c2goaW5ncmVkaWVudGUpO1xyXG4gICAgfVxyXG4gICAgY29uc29sZS5sb2coXCJkYXRvcyBxdWUgc2UgdmFuIGEgZ3VhcmRhcjogXCIsIGRhdG9zLCBKU09OLnN0cmluZ2lmeShkYXRvcykpXHJcbiAgICBiYWNrZW5kLmd1YXJkYXJSZWNldGEoZGF0b3MpO1xyXG4gICAgdmlzdGFUcmFuc2ljaW9uZXMuaXJBUGFnUHJpbmNpcGFsKCk7XHJcbiAgICB0aGlzLmxpc3RhclJlY2V0YXMoKTtcclxufVxyXG5cclxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhckluZ3JlZGllbnRlID0gKGlkUHJldmlvKSA9PiB7XHJcbiAgICB2YXIgaWQgPSBOdW1iZXIoaWRQcmV2aW8pICsgMTtcclxuICAgIHZhciBvdXRlckRpdiA9IHV0aWxzLmNyZWFyRGl2KFwiaW5ncmVkaWVudGVOdWV2YVJlY2V0YVwiICsgaWQsIFtcImluZ3JlZGllbnRlSW5ncmVzYWRvXCJdLCBcIlwiKVxyXG4gICAgdmFyIGlucHV0Q2FudGlkYWQgPSB1dGlscy5jcmVhcklucHV0TnVtZXJvKFwiaW5ncmVkaWVudGVzTnVldmFSZWNldGFcIiArIGlkICsgXCJjYW50aWRhZFwiLCBbXCJpbnB1dExpbmRvXCIsIFwiaW5ncmVkaWVudGVDYW50aWRhZFwiLCBcImluZ3JlZGllbnRlQ2FudGlkYWRGaWxhTm8wXCJdLCB0cnVlLCB7IFwicGxhY2Vob2xkZXJcIjogXCJjYW50aWRhZFwiIH0pXHJcbiAgICB2YXIgaW5wdXRVbmlkYWQgPSB1dGlscy5jcmVhcklucHV0KFwiaW5ncmVkaWVudGVzTnVldmFSZWNldGFcIiArIGlkICsgXCJ1bmlkYWRcIiwgW1wiaW5wdXRMaW5kb1wiLCBcImluZ3JlZGllbnRlVW5pZGFkXCIsIFwiaW5ncmVkaWVudGVVbmlkYWRGaWxhTm8wXCJdLCB0cnVlLCB7IFwicGxhY2Vob2xkZXJcIjogXCJ1bmlkYWRcIiB9KVxyXG4gICAgdmFyIGlucHV0Tm9tYnJlID0gdXRpbHMuY3JlYXJJbnB1dChcImluZ3JlZGllbnRlc051ZXZhUmVjZXRhXCIgKyBpZCArIFwiaW5ncmVkaWVudGVcIiwgW1wiaW5wdXRMaW5kb1wiLCBcImluZ3JlZGllbnRlTm9tYnJlXCIsIFwiaW5ncmVkaWVudGVOb21icmVGaWxhTm8wXCJdLCB0cnVlLCB7IFwicGxhY2Vob2xkZXJcIjogXCJpbmdyZWRpZW50ZVwiIH0pXHJcbiAgICB2YXIgc3BhbkFncmVnYXJNYXMgPSB1dGlscy5jcmVhclNwYW4oXCJtYXNJbmdyZWRpZW50ZXNcIiArIGlkKVxyXG4gICAgdmFyIGJ0bkFncmVnYXJNYXMgPSB1dGlscy5jcmVhckJvdG9uQWdyZWdhckluZ3JlZGllbnRlKFwiYm90b25BZ3JlZ2FySW5ncmVkaWVudGVcIiArIGlkLCBpZCwgW1wiZmFcIiwgXCJmYS1wbHVzXCJdLCBcIm1hcmdpbi1sZWZ0OiAxMHB4O1wiKVxyXG4gICAgc3BhbkFncmVnYXJNYXMuYXBwZW5kQ2hpbGQoYnRuQWdyZWdhck1hcyk7XHJcbiAgICB1dGlscy5hcHBlbmRDaGlsZHJlbihvdXRlckRpdiwgW2lucHV0Q2FudGlkYWQsIGlucHV0VW5pZGFkLCBpbnB1dE5vbWJyZSwgc3BhbkFncmVnYXJNYXNdKVxyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW1wb3NJbmdyZWRpZW50ZXNcIikuYXBwZW5kQ2hpbGQob3V0ZXJEaXYpO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJib3RvbkFncmVnYXJJbmdyZWRpZW50ZVwiICsgaWRQcmV2aW8pLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxufVxyXG5cclxudmFyIHVwbG9hZGVyID0gJCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIC8+JylcclxuXHJcbmV4cG9ydHMuYWdyZWdhckltYWdlbiA9ICgpID0+IHtcclxuICAgIHVwbG9hZGVyLmNsaWNrKClcclxuXHJcbiAgICB1cGxvYWRlci5vbignY2hhbmdlJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJlYWRVcmwodGhpcylcclxuICAgIH0pXHJcbn1cclxuXHJcbnZhciByZWFkVXJsID0gKGlucHV0KSA9PiB7XHJcbiAgICBpZiAoaW5wdXQuZmlsZXMgJiYgaW5wdXQuZmlsZXNbMF0pIHtcclxuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcclxuXHJcbiAgICAgICAgcmVhZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudGFyZ2V0LCBlLnRhcmdldC5yZXN1bHQpXHJcbiAgICAgICAgICAgIHZhciBpbWcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByZXZpZXdJbWFnZW5cIik7XHJcbiAgICAgICAgICAgIGltZy5zcmMgPSBlLnRhcmdldC5yZXN1bHQ7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmV2aWV3SW1hZ2VuXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKGUpe1xyXG4gICAgICAgICAgICB2YXIgaW1nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmV2aWV3SW1hZ2VuXCIpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzaXplIGltZyBpZiB0b28gYmlnXHJcbiAgICAgICAgICAgIHZhciBNQVhfV0lEVEggPSA0MDA7XHJcbiAgICAgICAgICAgIHZhciBNQVhfSEVJR0hUID0gNDAwO1xyXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBpbWcud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBpbWcuaGVpZ2h0O1xyXG4gICAgICAgICAgICAgaWYgKHdpZHRoID4gaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICAgaWYgKHdpZHRoID4gTUFYX1dJRFRIKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgIGhlaWdodCAqPSBNQVhfV0lEVEggLyB3aWR0aDtcclxuICAgICAgICAgICAgICAgICAgICAgd2lkdGggPSBNQVhfV0lEVEg7XHJcbiAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICBpZiAoaGVpZ2h0ID4gTUFYX0hFSUdIVCkge1xyXG4gICAgICAgICAgICAgICAgICAgICB3aWR0aCAqPSBNQVhfSEVJR0hUIC8gaGVpZ2h0O1xyXG4gICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSBNQVhfSEVJR0hUO1xyXG4gICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICAgICAgY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKGltZywgMCwgMCwgd2lkdGgsIGhlaWdodClcclxuICAgICAgICAgICAgdmFyIGRhdGFVcmwgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvanBlZ1wiKVxyXG4gICAgICAgICAgICBpbWcuc3JjID0gZGF0YVVybDtcclxuICAgICAgICB9LCBmYWxzZSk7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW5wdXQuZmlsZXNbMF1cIiwgaW5wdXQuZmlsZXNbMF0pXHJcbiAgICAgICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoaW5wdXQuZmlsZXNbMF0pXHJcbiAgICB9XHJcbn0iLCJjb25zdCByZWNldGEgPSByZXF1aXJlKFwiLi9SZWNldGEuanNcIik7XHJcbmNvbnN0IGNvbWVudGFyaW9zID0gcmVxdWlyZShcIi4vQ29tZW50YXJpb3MuanNcIik7XHJcbmNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcclxuXHJcbmV4cG9ydHMuZXNjdWNoYXJQb3JFdmVudG9zID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgcmVjZXRhLmxpc3RhclJlY2V0YXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FyUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5tb3N0cmFyQWdyZWdhclJlY2V0YSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImF0cmFzXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5hdHJhcygpO1xyXG4gICAgfSlcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZ3VhcmRhck51ZXZhUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZWNldGEuZ3VhcmRhck51ZXZhUmVjZXRhKCk7XHJcbiAgICB9KVxyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FySW1hZ2VuXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZWNldGEuYWdyZWdhckltYWdlbigpO1xyXG4gICAgfSlcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW9zdHJhclJlY2V0YVwiLCBhc3luYyBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICByZWNldGEubW9zdHJhclJlY2V0YShpZC5kZXRhaWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImFncmVnYXJDb21lbnRhcmlvXCIsIGFzeW5jIGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgIGNvbWVudGFyaW9zLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbyhpZC5kZXRhaWwpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImFncmVnYXJJbmdyZWRpZW50ZVwiLCBhc3luYyBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICByZWNldGEubW9zdHJhckFncmVnYXJJbmdyZWRpZW50ZShpZC5kZXRhaWwpO1xyXG4gICAgfSk7XHJcbn0iLCJjb25zdCB7IGFncmVnYXJJbWFnZW4gfSA9IHJlcXVpcmUoXCIuLi9TZXJ2aWNpb3MvUmVjZXRhXCIpO1xyXG5cclxuXHJcbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IChyZWNldGFzKSA9PiB7XHJcbiAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICBjb25zb2xlLmxvXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY2V0YXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICB2YXIgbm9tYnJlc0luZ3JlZGllbnRlcyA9IFtdO1xyXG4gICAgICAgIHJlY2V0YXNbaV0uaW5ncmVkaWVudGVzLmZvckVhY2goaW5ncmVkaWVudGUgPT4gbm9tYnJlc0luZ3JlZGllbnRlcy5wdXNoKGluZ3JlZGllbnRlLm5vbWJyZSkpXHJcbiAgICAgICAgaHRtbCArPSBcIjxkaXYgaWQ9XFxcIlwiICsgcmVjZXRhc1tpXS5pZCArIFwiXFxcIiBjbGFzcz1cXFwiY29sLWxnLTQgY29sLW1kLTYgZWxlbWVudG8tZ3JpZC1yZWNldGFzIFwiICsgcmVjZXRhc1tpXS50aXBvQ29taWRhICsgXCJcXFwiIHN0eWxlPVxcXCJ3aWR0aD0yNDdweFxcXCI+XCIgK1xyXG4gICAgICAgICAgICBcIjxkaXYgY2xhc3M9XFxcImdhbGxlcnktc2luZ2xlIGZpeFxcXCI+XCIgK1xyXG4gICAgICAgICAgICBhZ3JlZ2FySW1hZ2VuY2l0YShyZWNldGFzW2ldKSArXHJcbiAgICAgICAgICAgIFwiPGRpdiBjbGFzcz1cXFwid2h5LXRleHRcXFwiPlwiICtcclxuICAgICAgICAgICAgXCI8aDQgY2xhc3M9bm9tYnJlUmVjZXRhPlwiICsgcmVjZXRhc1tpXS5ub21icmUgKyBcIjwvaDQ+XCIgK1xyXG4gICAgICAgICAgICBcIjxwIHN0eWxlPVxcXCJkaXNwbGF5Om5vbmU7XFxcIiBjbGFzcz1ub21icmVBdXRvcj5cIiArIHJlY2V0YXNbaV0uYXV0b3IgKyBcIjwvcD5cIiArXHJcbiAgICAgICAgICAgIFwiPHAgc3R5bGU9XFxcImRpc3BsYXk6bm9uZTtcXFwiIGNsYXNzPW5vbWJyZXNJbmdyZWRpZW50ZXM+XCIgKyBub21icmVzSW5ncmVkaWVudGVzLmpvaW4oXCIsXCIpICsgXCI8L3A+XCIgK1xyXG4gICAgICAgICAgICBcIjxhIGNsYXNzPVxcXCJidG4tbGcgYnRuLWNpcmNsZSBidG4tb3V0bGluZS1uZXctd2hpdGVcXFwiIGlkPVxcXCJcIiArIHJlY2V0YXNbaV0uaWQgKyBcIlxcXCIgb25jbGljaz1cXFwibW9zdHJhclJlY2V0YSh0aGlzLmlkKVxcXCIgc3R5bGU9XFxcImNvbG9yOndoaXRlO1xcXCI+VmVyIHJlY2V0YTwvYT5cIiArXHJcbiAgICAgICAgICAgIFwiPC9kaXY+XCIgK1xyXG4gICAgICAgICAgICBcIjwvZGl2PlwiICtcclxuICAgICAgICAgICAgXCI8L2Rpdj5cIjtcclxuICAgIH1cclxuICAgIGh0bWwgKz0gYWdyZWdhckhUTUxBZ3JlZ2FyUmVjZXRhKCk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RhUmVjZXRhc1wiKS5pbm5lckhUTUwgPSBodG1sO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhZ3JlZ2FySW1hZ2VuY2l0YShyZWNldGEpIHtcclxuICAgIGlmIChyZWNldGEuaW1hZ2VuKSB7XHJcbiAgICAgICAgdmFyIGltZ0RhdGEgPSByZWNldGEuaW1hZ2VuLmRhdGE7XHJcbiAgICAgICAgcmV0dXJuIFwiPGltZyBzcmM9XFxcIlwiICsgVWludDhUb1N0cmluZyhpbWdEYXRhKSArIFwiXFxcIiBjbGFzcz1cXFwiaW1nLWZsdWlkIGFkanVzdC1pbWdcXFwiIGFsdD1cXFwiSW1hZ2VcXFwiPlwiXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBcIlwiXHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFncmVnYXJIVE1MQWdyZWdhclJlY2V0YSgpIHtcclxuICAgIHZhciBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBlbGVtZW50by1ncmlkLXJlY2V0YXMgc2llbXByZVZpc2libGVcXFwiIGlkPWVsZW1lbnRvQWdyZWdhclJlY2V0YT5cIiArXHJcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJnYWxsZXJ5LXNpbmdsZSBmaXggYWdyZWdhclJlY2V0YVxcXCI+XCIgK1xyXG4gICAgICAgIFwiPGEgY2xhc3M9XFxcImJ0bi1sZyBidG4tY2lyY2xlIGJ0bi1vdXRsaW5lLW5ldy13aGl0ZVxcXCIgaWQ9XFxcImFncmVnYXJSZWNldGFCdG5cXFwiIG9uY2xpY2s9XFxcImFncmVnYXJSZWNldGEoKVxcXCIgc3R5bGU9XFxcImRpc3BsYXk6YmxvY2s7IGNvbG9yOndoaXRlO1xcXCI+QWdyZWdhciByZWNldGE8L2E+XCIgK1xyXG4gICAgICAgIFwiPC9kaXY+XCIgK1xyXG4gICAgICAgIFwiPC9kaXY+XCIgK1xyXG4gICAgICAgIFwiPC9kaXY+XCI7XHJcbiAgICByZXR1cm4gaHRtbDtcclxufVxyXG5cclxuZnVuY3Rpb24gVWludDhUb1N0cmluZyh1OGEpIHtcclxuICAgIHZhciBDSFVOS19TWiA9IDB4ODAwMDtcclxuICAgIHZhciBjID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHU4YS5sZW5ndGg7IGkgKz0gQ0hVTktfU1opIHtcclxuICAgICAgICBjLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB1OGEuc2xpY2UoaSwgaSArIENIVU5LX1NaKSkpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGMuam9pbihcIlwiKTtcclxufVxyXG4iLCJ2YXIgaWRSZWNldGFBY3R1YWwgPSAnJztcclxuXHJcbmV4cG9ydHMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EgPSAoZGF0b3MpID0+IHtcclxuICAgIGlkUmVjZXRhQWN0dWFsID0gZGF0b3MuaWQ7XHJcbiAgICAvL1Jlc2V0ZWFyIHRvZG9zIGxvcyBodG1sXHJcbiAgICB2YXIgZWxlbWVudG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImVsZW1SZWNldGFFc3BlY2lmaWNhXCIpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50b3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBlbGVtZW50b3NbaV0uaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIH1cclxuXHJcbiAgICAvL3NldCB0aXR1bG9cclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0dWxvXCIpLmlubmVySFRNTCA9IGRhdG9zLm5vbWJyZTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlblJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gXCI8aW1nIGNsYXNzPVxcXCJpbWctZmx1aWRcXFwiIHNyYz1cXFwiXCIgKyBVaW50OFRvU3RyaW5nKGRhdG9zLmltYWdlbi5kYXRhKSArIFwiXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgYWx0PVxcXCJcXFwiPlwiO1xyXG4gICAgZm9yIChrZXkgaW4gZGF0b3MpIHtcclxuICAgICAgICBpZiAoa2V5ICE9IFwidGlwb0NvbWlkYVwiICYmIGtleSAhPSBcImNyZWF0ZWRBdFwiICYmIGtleSAhPSBcInVwZGF0ZWRBdFwiICYmIGtleSAhPSBcImlkXCIgJiYga2V5ICE9IFwibm9tYnJlXCIpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PSBcImluZ3JlZGllbnRlc1wiKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5ncmVkaWVudGVzID0gZGF0b3Nba2V5XTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5ncmVkaWVudGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coaW5ncmVkaWVudGVzW2ldKVxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8dHI+PHRkIHN0eWxlPVxcXCJwYWRkaW5nLXJpZ2h0OjE1cHg7XFxcIj5cIiArIGluZ3JlZGllbnRlc1tpXS5jYW50aWRhZCArIFwiIFwiICsgaW5ncmVkaWVudGVzW2ldLnVuaWRhZERlTWVkaWRhICsgXCI8L3RkPjx0ZD5cIiArIGluZ3JlZGllbnRlc1tpXS5ub21icmUgKyBcIjwvdGQ+PC90cj5cIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbmdyUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PSBcImNvbWVudGFyaW9zXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0dWFsaXphckNvbWVudGFyaW9zKGRhdG9zW2tleV0pXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09ICdpbWFnZW4nKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuc3JjID0gZGF0b3Nba2V5XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBkYXRvc1trZXldLnJlcGxhY2VBbGwoXCJcXG5cIiwgXCI8YnI+XCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnRzLm9idGVuZXJJZFJlY2V0YUFjdHVhbCA9ICgpID0+IHtcclxuICAgIHJldHVybiBpZFJlY2V0YUFjdHVhbDtcclxufVxyXG5cclxuZXhwb3J0cy5hY3R1YWxpemFyQ29tZW50YXJpb3MgPSAoYXJyQ29tZW50YXJpb3MpID0+IHtcclxuICAgIGlmIChhcnJDb21lbnRhcmlvcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tZW50YXJpb3NSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCA9IFwiPHA+UG9yIGFob3JhIG5vIGhheSBjb21lbnRhcmlvcyBwYXJhIGVzdGEgcmVjZXRhLjwvcD5cIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21lbnRhcmlvc1JlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gJyc7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJDb21lbnRhcmlvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbWVudGFyaW9zUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgKz0gYWRkQ29tbWVudChhcnJDb21lbnRhcmlvc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gYWRkQ29tbWVudChjb21tZW50KSB7XHJcbiAgICBjb25zdCBmZWNoYSA9IGNvbW1lbnRbJ2NyZWF0ZWRBdCddID8gY29tbWVudFsnY3JlYXRlZEF0J10uc2xpY2UoMCwgMTApIDogJyc7XHJcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJjb21tZW50LWl0ZW1cXFwiPlwiICtcclxuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcInB1bGwtbGVmdFxcXCI+XCIgK1xyXG4gICAgICAgIFwiPGE+XCIgKyBjb21tZW50WydhdXRvciddICsgXCI8L2E+PC9kaXY+XCIgK1xyXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwicHVsbC1yaWdodFxcXCIgc3R5bGU9XFxcInBhZGRpbmc6IDVweCAxMHB4O1xcXCI+XCIgK1xyXG4gICAgICAgIFwiPGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiIGFyaWEtaGlkZGVuPXRydWU+PC9pPiA8c3Bhbj5cIiArIGZlY2hhICsgXCI8L3NwYW4+PC9kaXY+XCIgK1xyXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZGVzLWxcXFwiPlwiICtcclxuICAgICAgICBcIjxwPlwiICsgY29tbWVudFsnY29udGVuaWRvJ10gKyBcIjwvcD48L2Rpdj5cIiArXHJcbiAgICAgICAgXCI8L2Rpdj5cIjtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIFVpbnQ4VG9TdHJpbmcodThhKSB7XHJcbiAgICB2YXIgQ0hVTktfU1ogPSAweDgwMDA7XHJcbiAgICB2YXIgYyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1OGEubGVuZ3RoOyBpICs9IENIVU5LX1NaKSB7XHJcbiAgICAgICAgYy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdThhLnNsaWNlKGksIGkgKyBDSFVOS19TWikpKTtcclxuICAgIH1cclxuICAgIHJldHVybiBjLmpvaW4oXCJcIik7XHJcbn1cclxuXHJcblxyXG4iLCJcclxuXHJcbmV4cG9ydHMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EgPSAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcFwiKS5zY3JvbGxJbnRvVmlldyh7XHJcbiAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxyXG4gICAgfSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNldGFFc3BlY2lmaWNhXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5pbm5lckhUTUwgPSAnQWdyZWdhciBjb21lbnRhcmlvJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLnNldEF0dHJpYnV0ZShcIm5hbWVcIixcImFncmVnYXJcIik7XHJcbn1cclxuXHJcbmV4cG9ydHMubW9zdHJhckFncmVnYXJSZWNldGEgPSAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn1cclxuICAgIFxyXG5leHBvcnRzLmF0cmFzID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxufVxyXG5cclxuZXhwb3J0cy5pckFQYWdQcmluY2lwYWwgPSAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn1cclxuXHJcbmV4cG9ydHMubW9zdHJhckFncmVnYXJDb21lbnRhcmlvID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FncmVnYXJDb21lbnRhcmlvUmVjZXRhRXNwZWNpZmljYScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbmlkb0NvbWVudGFyaW8nKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuaW5uZXJIVE1MID0gJ0d1YXJkYXInO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiZ3VhcmRhclwiKTtcclxufVxyXG5cclxuZXhwb3J0cy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8gPSAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWdyZWdhckNvbWVudGFyaW9SZWNldGFFc3BlY2lmaWNhJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdBZ3JlZ2FyIGNvbWVudGFyaW8nO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiYWdyZWdhclwiKTtcclxufVxyXG5cclxuIiwiY29uc3Qgc2VydmljaW9zID0gcmVxdWlyZShcIi4vU2VydmljaW9zL21hbmVqb0V2ZW50b3MuanNcIik7XHJcblxyXG52YXIgYnJvd3NlcmlmeSA9IFwiYnJvd3NlcmlmeSAuL2pzL21haW4uanMgLW8gLi9qcy9idWlsZC9tYWluLmpzIC1kdlwiO1xyXG5cclxuXHJcbnNlcnZpY2lvcy5lc2N1Y2hhclBvckV2ZW50b3MoKTsiLCJcbmV4cG9ydHMuZm9ybWF0TnVtYmVyID0gKG51bWJlciwgcGxhY2VzQWZ0ZXJDb21tYSA9IDApID0+IHtcbiAgICBpZiAodHlwZW9mIG51bWJlciAhPSBOdW1iZXIpIHtcbiAgICAgICAgbnVtYmVyID0gcGFyc2VGbG9hdChudW1iZXIpXG4gICAgfVxuICAgIHJldHVybiBudW1iZXIudG9GaXhlZChwbGFjZXNBZnRlckNvbW1hKVxuICAgIC8vIC5yZXBsYWNlKCcuJywgJywnKS5yZXBsYWNlKC8oXFxkKSg/PShcXGR7M30pKyg/IVxcZCkpL2csICckMS4nKVxufVxuXG5leHBvcnRzLmFwcGVuZENoaWxkcmVuID0gKHBhZHJlLCBvYmpldG9zKSA9PiB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmpldG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHBhZHJlLmFwcGVuZENoaWxkKG9iamV0b3NbaV0pO1xuICAgIH1cbn1cblxuZXhwb3J0cy5jcmVhckxhYmVsID0gKGZvclZhbHVlLCBjb250ZW5pZG8pID0+IHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGFiZWwnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImZvclwiLCBmb3JWYWx1ZSk7XG4gICAgZWxlbWVudC5pbm5lckhUTUwgPSBjb250ZW5pZG9cbiAgICByZXR1cm4gZWxlbWVudFxufVxuXG5leHBvcnRzLmNyZWFyRGl2ID0gKGlkLCBjbGFzc0xpc3QsIGNvbnRlbmlkbykgPT4ge1xuICAgIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImlkXCIsIGlkKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzTGlzdC5qb2luKCcgJykpO1xuICAgIGVsZW1lbnQuaW5uZXJIVE1MID0gY29udGVuaWRvXG4gICAgcmV0dXJuIGVsZW1lbnRcbn1cblxuZXhwb3J0cy5jcmVhclNwYW4gPSAoaWQpID0+IHtcbiAgICBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgIHJldHVybiBlbGVtZW50XG59XG5cbmV4cG9ydHMuY3JlYXJCb3RvbkFncmVnYXJJbmdyZWRpZW50ZSA9IChpZCwgbmFtZSwgaWNvbkNsYXNzTGlzdCwgaWNvblN0eWxlKSA9PiB7XG4gICAgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJidXR0b25cIik7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJpZFwiLCBpZCk7XG4gICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIG5hbWUpO1xuICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGFncmVnYXJJbmdyZWRpZW50ZSh0aGlzLm5hbWUpO1xuICAgIH0pO1xuICAgIGljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpJyk7XG4gICAgaWNvbi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBpY29uQ2xhc3NMaXN0LmpvaW4oJyAnKSk7XG4gICAgaWNvbi5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLCBpY29uU3R5bGUpO1xuICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaWNvbik7XG4gICAgcmV0dXJuIGVsZW1lbnRcbn0gICBcblxuZXhwb3J0cy5jcmVhcklucHV0TnVtZXJvID0gKGlkLCBjbGFzc0xpc3QsIHJlcXVpcmVkLCBvdGhlclBhcmFtcywgb25DbGlja0Z1bmN0aW9uTmFtZSkgPT4ge1xuICAgIGlucHV0ID0gdGhpcy5jcmVhcklucHV0KGlkLCBjbGFzc0xpc3QsIHJlcXVpcmVkLCBvdGhlclBhcmFtcywgb25DbGlja0Z1bmN0aW9uTmFtZSk7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwidHlwZVwiLCBcIm51bWJlclwiKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJzdGVwXCIsIFwiMC4wMVwiKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoXCJtaW5cIiwgXCIwXCIpO1xuICAgIHJldHVybiBpbnB1dFxufVxuXG5leHBvcnRzLmNyZWFySW5wdXRGZWNoYSA9IChpZCwgY2xhc3NMaXN0LCByZXF1aXJlZCwgb3RoZXJQYXJhbXMsIG9uQ2xpY2tGdW5jdGlvbk5hbWUpID0+IHtcbiAgICBpbnB1dCA9IHRoaXMuY3JlYXJJbnB1dChpZCwgY2xhc3NMaXN0LCByZXF1aXJlZCwgb3RoZXJQYXJhbXMsIG9uQ2xpY2tGdW5jdGlvbk5hbWUpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJtb250aFwiKTtcbiAgICByZXR1cm4gaW5wdXQ7XG59XG5cbmV4cG9ydHMuY3JlYXJJbnB1dCA9IChpZCwgY2xhc3NMaXN0LCByZXF1aXJlZCwgb3RoZXJQYXJhbXMsIG9uQ2xpY2tGdW5jdGlvbk5hbWUpID0+IHtcbiAgICBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jyk7XG4gICAgaW5wdXQuc2V0QXR0cmlidXRlKFwiaWRcIiwgaWQpO1xuICAgIGlucHV0LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGNsYXNzTGlzdC5qb2luKCcgJykpO1xuICAgIE9iamVjdC5rZXlzKG90aGVyUGFyYW1zKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgaW5wdXQuc2V0QXR0cmlidXRlKGtleSwgb3RoZXJQYXJhbXNba2V5XSk7XG4gICAgfSk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBmdW5jdGlvblRvRXhlY3V0ZSA9IG5ldyBGdW5jdGlvbihvbkNsaWNrRnVuY3Rpb25OYW1lICsgJygpJyk7XG4gICAgICAgIGZ1bmN0aW9uVG9FeGVjdXRlKCk7XG4gICAgfSk7XG4gICAgaW5wdXQucmVxdWlyZWQgPSByZXF1aXJlZDtcbiAgICByZXR1cm4gaW5wdXRcbn1cbiJdfQ==
