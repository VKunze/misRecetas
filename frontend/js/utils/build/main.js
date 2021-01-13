(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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

},{"../Persistencia/Backend":1,"../Vista/RecetaEspecifica":6,"../Vista/Transiciones":7}],3:[function(require,module,exports){
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
},{"../Persistencia/Backend.js":1,"../Vista/PagPrincipal.js":5,"../Vista/RecetaEspecifica":6,"../Vista/Transiciones":7}],4:[function(require,module,exports){
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
        console.log('en manejo eventos')
        receta.agregarImagen();
    })

    document.addEventListener("mostrarReceta", async function (id) {
        receta.mostrarReceta(id.detail);
    });

    document.addEventListener("agregarComentario", async function (id) {
        console.log(id);
        comentarios.mostrarAgregarComentario(id.detail);
    });

}
},{"../Vista/Transiciones":7,"./Comentarios.js":2,"./Receta.js":3}],5:[function(require,module,exports){
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

},{"../Servicios/Receta":3,"../utils/propio/principal":9}],6:[function(require,module,exports){
var idRecetaActual = '';

exports.mostrarRecetaEspecifica = (datos) => {
    idRecetaActual = datos['id'];
    //Resetear todos los html
    var elementos = document.getElementsByClassName("elemRecetaEspecifica");
    console.log(elementos);
    for (var i = 0; i < elementos.length; i++) {
        elementos[i].innerHTML = "";
    }

    //set titulo
    document.getElementById("titulo").innerHTML = datos.nombre;
    const nombreImg = datos.nombre.split(" ").join("-");

    document.getElementById("imagenRecetaEspecifica").innerHTML = "<img class=\"img-fluid\" src=\"" + Uint8ToString(datos.imagen.data) + "\" width=\"100%\" alt=\"\">";
    for (key in datos) {
        //console.log(key);
        if (key != "tipoComida" && key != "createdAt" && key != "updatedAt" && key != "id" && key != "nombre") {
            if (key == "ingredientes") {
                var html = "";
                var ingredientes = datos[key].split(",");
                for (var i = 0; i < ingredientes.length; i++) {
                    html += "<p class=\"elemRecetaEspecifica ingrediente\">- " + ingredientes[i] + "</p>";
                }
                document.getElementById(key + "RecetaEspecifica").innerHTML = html;
            } else if (key == "comentarios") {
                this.actualizarComentarios(datos[key])
            } else if(key == 'imagen'){
                //document.getElementById(key + "RecetaEspecifica").innerHTML = datos[key];
            
                document.getElementById(key + "RecetaEspecifica").src = datos[key];
            } else {
                //console.log(key, datos[key]);
                document.getElementById(key + "RecetaEspecifica").innerHTML = datos[key];
            }
        }
    }
}

exports.obtenerIdRecetaActual = () => {
    return idRecetaActual;
}

exports.actualizarComentarios = (arrComentarios) => {
    if (arrComentarios.length == 0) {
        document.getElementById(key + "RecetaEspecifica").innerHTML = "<p>Por ahora no hay comentarios para esta receta.</p>";
    } else {
        document.getElementById(key + "RecetaEspecifica").innerHTML = '';
        for (var i = 0; i < arrComentarios.length; i++) {
            document.getElementById(key + "RecetaEspecifica").innerHTML += addComment(arrComentarios[i]);
        }
    }
}


function addComment(comment) {
    const fecha = comment['createdAt'] ? comment['createdAt'].slice(0,10): '';
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
    console.log(document.getElementById("agregarReceta"));
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
/* var recetas = {
    "arrollados-de-primavera": {
        "tipoComida": "salado",
        "autor": "Internet",
        "contenido": ["1 huevo", "3 tazas harina", "5 pancitos"],
        "descripcion": "Poner todo junto en una mezcla asombrosa y vualá, tremendos arrolladitos de primavera exquisitos!!"
    },
    "otra": {}
} */

document.addEventListener("DOMContentLoaded", function (event) {
    listarRecetas();
});

async function listarRecetas() {
    var respuesta = await mandarABackend("GET", "/obtenerRecetas");
    var recetas = respuesta["recetas"];
    var html = "";
    for (var i = 0; i < recetas.length; i++) {
        var nombreImg = recetas[i].nombre.split(" ").join("-");
        html += "<div class=\"col-lg-4 col-md-6 special-grid " + recetas[i].tipoComida + "\" style=\"width=247px\">" +
            "<div class=\"gallery-single fix\">" +
            "<img src=\"utils/imagenes/" + nombreImg + ".jpg\" class=\"img-fluid\" alt=\"Image\">" +
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

async function mostrarReceta(id) {
    document.getElementById("top").scrollIntoView({
        behavior: 'smooth',
    });
    document.getElementById("contenedorListaRecetas").style.display = "none";
    document.getElementById("recetaEspecifica").style.display = "block";
    //Resetear todos los html
    var elementos = document.getElementsByClassName("elemRecetaEspecifica");
    console.log(elementos);
    for (var i = 0; i < elementos.length; i++) {
        elementos[i].innerHTML = "";
    }

    //conseguir datos
    var respuesta = await mandarABackend("POST", "/obtenerRecetaEspecifica", id.split("-").join(" "));
    var datos = respuesta.datos;
    console.log(datos);
    //set titulo
    document.getElementById("titulo").innerHTML = datos.nombre;
    const nombreImg = datos.nombre.split(" ").join("-");

    document.getElementById("imagenRecetaEspecifica").innerHTML = "<img class=\"img-fluid\" src=\"utils/imagenes/" + nombreImg + ".jpg\" width=\"100%\" alt=\"\">";
    for (key in datos) {
        //console.log(key);
        if (key != "tipoComida" && key != "createdAt" && key != "updatedAt" && key != "id" && key != "nombre") {
            if (key == "ingredientes") {
                var html = "";
                var ingredientes = datos[key].split(",");
                for (var i = 0; i < ingredientes.length; i++) {
                    html += "<p class=\"elemRecetaEspecifica ingrediente\">- " + ingredientes[i] + "</p>";
                }
                document.getElementById(key + "RecetaEspecifica").innerHTML = html;
            } else {
                console.log(key);
                document.getElementById(key + "RecetaEspecifica").innerHTML = datos[key];
            }
        }
    }
}

function agregarReceta() {
    document.getElementById("agregarReceta").style.display = "block";
    document.getElementById("contenedorListaRecetas").style.display = "none";
}

function atras() {
    document.getElementById("contenedorListaRecetas").style.display = "block";
    document.getElementById("recetaEspecifica").style.display = "none";
    document.getElementById("agregarReceta").style.display = "none";
}

function nombreLindo(nombre) {
    var nombreLindo = "";
    var palabrasId = nombre.split("-");
    nombreLindo += palabrasId[0][0].toUpperCase() + palabrasId[0].slice(1) + " ";
    for (var i = 1; i < palabrasId.length; i++) {
        nombreLindo += palabrasId[i] + " ";
    }
    return nombreLindo;
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

function guardarNuevaReceta() {
    var datos = {};
    datos.nombre = document.getElementById("tituloNuevaReceta").value;

    datos.autor = document.getElementById("autorNuevaReceta").value;
    datos.tipoComida = document.getElementById("tipoComida").value;
    datos.ingredientes = document.getElementById("ingredientesNuevaReceta").value;
    datos.descripcion = document.getElementById("descripciónNuevaReceta").value;
    
    mandarABackend("POST", "/guardarReceta", JSON.stringify(datos));
    irAPagPrincipal();
}

function irAPagPrincipal() {
    document.getElementById("agregarReceta").style.display = "none";
    document.getElementById("contenedorListaRecetas").style.display = "block";
    listarRecetas();
}

//Requests
const Http = new XMLHttpRequest();
const url = 'http://localhost:8080';

async function mandarABackend(tipoRequest, uri, params) {
    Http.open(tipoRequest, url + uri, false);
    console.log(params);
    console.log(url+uri);
    if (params) {
        Http.setRequestHeader("Content-type", "application/json");
        if (uri == "/obtenerRecetaEspecifica") {
            params = '{"nombreReceta":"' + params + '"}'
        }
    }

    Http.send(params);

    /* Http.onreadystatechange = (e) => {
        console.log(Http.responseText);
        recetas = Http.responseText;
        return Http.responseText;
    } */
    //console.log(JSON.parse(Http.responseText));
    if(uri != "/guardarReceta"){
        return JSON.parse(Http.responseText);
    } else {
        return "OK";
    }  
}

module.exports = {
    listarRecetas
}
},{}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImZyb250ZW5kL2pzL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL0NvbWVudGFyaW9zLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL1JlY2V0YS5qcyIsImZyb250ZW5kL2pzL1NlcnZpY2lvcy9tYW5lam9FdmVudG9zLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUGFnUHJpbmNpcGFsLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUmVjZXRhRXNwZWNpZmljYS5qcyIsImZyb250ZW5kL2pzL1Zpc3RhL1RyYW5zaWNpb25lcy5qcyIsImZyb250ZW5kL2pzL21haW4uanMiLCJmcm9udGVuZC9qcy91dGlscy9wcm9waW8vcHJpbmNpcGFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IEh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbmNvbnN0IHVybCA9ICdodHRwczovL2JvaWxpbmctZHVzay05NDE5OC5oZXJva3VhcHAuY29tJztcblxuZXhwb3J0cy5vYnRlbmVyUmVjZXRhcyA9IGFzeW5jICgpID0+IHtcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJHRVRcIiwgXCIvb2J0ZW5lclJlY2V0YXNcIiwgbnVsbCwgdHJ1ZSk7XG59XG5cbmV4cG9ydHMub2J0ZW5lclJlY2V0YUVzcGVjaWZpY2EgPSBhc3luYyAoaWQpID0+IHtcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL29idGVuZXJSZWNldGFFc3BlY2lmaWNhXCIsICd7XCJub21icmVSZWNldGFcIjpcIicgKyBpZCArICdcIn0nLCB0cnVlKS5kYXRvcztcbn1cblxuZXhwb3J0cy5ndWFyZGFyUmVjZXRhID0gYXN5bmMgKGRhdG9zKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJkYXRvcyBlbiBndWFyZGFyIGxhIHJlY2V0YVwiLCBkYXRvcyk7XG4gICAgLy8gZGF0b3MuaW1hZ2UgPSBtYWtlYmxvYihkYXRvcy5pbWFnZSlcbiAgICAvLyBjb25zb2xlLmxvZyhkYXRvcy5pbWFnZSlcbiAgICBtYW5kYXJBQmFja2VuZChcIlBPU1RcIiwgXCIvZ3VhcmRhclJlY2V0YVwiLCBKU09OLnN0cmluZ2lmeShkYXRvcykpO1xufVxuXG5leHBvcnRzLmd1YXJkYXJDb21lbnRhcmlvID0gYXN5bmMgKGRhdG9zKSA9PiB7XG4gICAgbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL2d1YXJkYXJDb21lbnRhcmlvXCIsIEpTT04uc3RyaW5naWZ5KGRhdG9zKSk7XG59XG5cbmV4cG9ydHMub2J0ZW5lckNvbWVudGFyaW9zID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgcmV0dXJuIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9vYnRlbmVyQ29tZW50YXJpb3NcIiwgJ3tcImlkUmVjZXRhXCI6XCInICsgaWQgKyAnXCJ9JywgdHJ1ZSkuY29tZW50YXJpb3M7XG59XG5cbi8vUmVxdWVzdHNcblxuZnVuY3Rpb24gbWFuZGFyQUJhY2tlbmQodGlwb1JlcXVlc3QsIHVyaSwgcGFyYW1zLCByZXR1cm5WYWx1ZSA9IGZhbHNlKSB7XG4gICAgSHR0cC5vcGVuKHRpcG9SZXF1ZXN0LCB1cmwgKyB1cmksIGZhbHNlKTtcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgIEh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgfVxuICAgIC8vIGlmICh1cmkgPT0gJy9ndWFyZGFyUmVjZXRhJykge1xuICAgIC8vICAgICBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJwcm9jZXNzRGF0YVwiLCBcImZhbHNlXCIpO1xuICAgIC8vICAgICAvLyBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJjb250ZW50VHlwZVwiLCBcImZhbHNlXCIpO1xuICAgIC8vICAgICAvLyBIdHRwLnNldFJlcXVlc3RIZWFkZXIoXCJjYWNoZVwiLCBcImZhbHNlXCIpOyAgICAgICBcbiAgICAvLyB9XG5cbiAgICBIdHRwLnNlbmQocGFyYW1zKTtcblxuICAgIGlmIChyZXR1cm5WYWx1ZSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShIdHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiT0tcIjtcbiAgICB9XG5cbn1cblxuLy8gZnVuY3Rpb24gbWFrZWJsb2IoZGF0YVVSTCkge1xuLy8gICAgIHZhciBCQVNFNjRfTUFSS0VSID0gJztiYXNlNjQsJztcbi8vICAgICBpZiAoZGF0YVVSTC5pbmRleE9mKEJBU0U2NF9NQVJLRVIpID09IC0xKSB7XG4vLyAgICAgICAgIHZhciBwYXJ0cyA9IGRhdGFVUkwuc3BsaXQoJywnKTtcbi8vICAgICAgICAgdmFyIGNvbnRlbnRUeXBlID0gcGFydHNbMF0uc3BsaXQoJzonKVsxXTtcbi8vICAgICAgICAgdmFyIHJhdyA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJ0c1sxXSk7XG4vLyAgICAgICAgIHJldHVybiBuZXcgQmxvYihbcmF3XSwgeyB0eXBlOiBjb250ZW50VHlwZSB9KTtcbi8vICAgICB9XG4vLyAgICAgdmFyIHBhcnRzID0gZGF0YVVSTC5zcGxpdChCQVNFNjRfTUFSS0VSKTtcbi8vICAgICB2YXIgY29udGVudFR5cGUgPSBwYXJ0c1swXS5zcGxpdCgnOicpWzFdO1xuLy8gICAgIHZhciByYXcgPSB3aW5kb3cuYXRvYihwYXJ0c1sxXSk7XG4vLyAgICAgdmFyIHJhd0xlbmd0aCA9IHJhdy5sZW5ndGg7XG5cbi8vICAgICB2YXIgdUludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KHJhd0xlbmd0aCk7XG5cbi8vICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJhd0xlbmd0aDsgKytpKSB7XG4vLyAgICAgICAgIHVJbnQ4QXJyYXlbaV0gPSByYXcuY2hhckNvZGVBdChpKTtcbi8vICAgICB9XG5cbi8vICAgICByZXR1cm4gbmV3IEJsb2IoW3VJbnQ4QXJyYXldLCB7IHR5cGU6IGNvbnRlbnRUeXBlIH0pO1xuLy8gfSIsImNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcbmNvbnN0IHZpc3RhUmVjZXRhRXNwZWNpZmljYSA9IHJlcXVpcmUoJy4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2EnKTtcbmNvbnN0IGJhY2tlbmQgPSByZXF1aXJlKCcuLi9QZXJzaXN0ZW5jaWEvQmFja2VuZCcpO1xuXG5leHBvcnRzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbyA9IGFzeW5jICh0aXBvRXZlbnRvKSA9PiB7XG4gICAgY29uc29sZS5sb2codGlwb0V2ZW50byk7XG4gICAgaWYgKHRpcG9FdmVudG8gPT0gJ2FncmVnYXInKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbygpO1xuICAgIH0gZWxzZSBpZiAodGlwb0V2ZW50byA9PSAnZ3VhcmRhcicpIHtcbiAgICAgICAgZGF0b3MgPSB7fVxuICAgICAgICBkYXRvcy5pZFJlY2V0YUFjdHVhbCA9IHZpc3RhUmVjZXRhRXNwZWNpZmljYS5vYnRlbmVySWRSZWNldGFBY3R1YWwoKTtcbiAgICAgICAgZGF0b3MuY29udGVuaWRvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbmlkb0NvbWVudGFyaW8nKS52YWx1ZTtcbiAgICAgICAgZGF0b3MuYXV0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0b3JDb21lbnRhcmlvJykudmFsdWU7XG5cbiAgICAgICAgYXdhaXQgYmFja2VuZC5ndWFyZGFyQ29tZW50YXJpbyhkYXRvcyk7XG5cbiAgICAgICAgdmFyIGNvbWVudGFyaW9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyQ29tZW50YXJpb3MoZGF0b3MuaWRSZWNldGFBY3R1YWwpO1xuICAgICAgICBjb25zb2xlLmxvZyhjb21lbnRhcmlvcyk7XG4gICAgICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5hY3R1YWxpemFyQ29tZW50YXJpb3MoY29tZW50YXJpb3MpO1xuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8oKTtcbiAgICB9XG59XG4iLCJjb25zdCBiYWNrZW5kID0gcmVxdWlyZShcIi4uL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzXCIpO1xuY29uc3QgdmlzdGFQYWdQcmluY2lwYWwgPSByZXF1aXJlKFwiLi4vVmlzdGEvUGFnUHJpbmNpcGFsLmpzXCIpO1xuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xuY29uc3QgdmlzdGFSZWNldGFFc3BlY2lmaWNhID0gcmVxdWlyZShcIi4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2FcIik7XG5cbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IGFzeW5jICgpID0+IHtcbiAgICB2YXIgcmVzcHVlc3RhID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyUmVjZXRhcygpO1xuICAgIGNvbnNvbGUubG9nKHJlc3B1ZXN0YSk7XG4gICAgdmlzdGFQYWdQcmluY2lwYWwubGlzdGFyUmVjZXRhcyhyZXNwdWVzdGFbXCJyZWNldGFzXCJdKTtcbn1cblxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgdmFyIGRhdG9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyUmVjZXRhRXNwZWNpZmljYShpZC5zcGxpdChcIi1cIikuam9pbihcIiBcIikpO1xuICAgIGNvbnNvbGUubG9nKGRhdG9zKTtcbiAgICB2aXN0YVRyYW5zaWNpb25lcy5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYSgpO1xuICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYShkYXRvcyk7XG59XG5cbmV4cG9ydHMuZ3VhcmRhck51ZXZhUmVjZXRhID0gKCkgPT4ge1xuICAgIC8vb2J0ZW5jaW9uIGRlIGRhdG9zXG4gICAgdmFyIGRhdG9zID0ge307XG4gICAgZGF0b3Mubm9tYnJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXR1bG9OdWV2YVJlY2V0YVwiKS52YWx1ZTtcbiAgICBkYXRvcy5hdXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0b3JOdWV2YVJlY2V0YVwiKS52YWx1ZTtcbiAgICBkYXRvcy50aXBvQ29taWRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXBvQ29taWRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmluZ3JlZGllbnRlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5ncmVkaWVudGVzTnVldmFSZWNldGFcIikudmFsdWU7XG4gICAgZGF0b3MuZGVzY3JpcGNpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXBjacOzbk51ZXZhUmVjZXRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmltYWdlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJldmlld0ltYWdlblwiKS5zcmM7XG4gICAgY29uc29sZS5sb2coJ2ltYWdlJywgZGF0b3MuaW1hZ2VuKVxuICAgIC8vIFwiL1wiICsgZGF0b3Mubm9tYnJlLnNwbGl0KFwiIFwiKS5qb2luKFwiLVwiKSArIFwiLmpwZ1wiO1xuXG4gICAgYmFja2VuZC5ndWFyZGFyUmVjZXRhKGRhdG9zKTtcbiAgICB2aXN0YVRyYW5zaWNpb25lcy5pckFQYWdQcmluY2lwYWwoKTtcbiAgICB0aGlzLmxpc3RhclJlY2V0YXMoKTtcbn1cblxudmFyIHVwbG9hZGVyID0gJCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIC8+JylcblxuZXhwb3J0cy5hZ3JlZ2FySW1hZ2VuID0gKCkgPT4ge1xuICAgIHVwbG9hZGVyLmNsaWNrKClcblxuICAgIHVwbG9hZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlYWRVcmwodGhpcylcbiAgICB9KVxufVxuXG52YXIgcmVhZFVybCA9IChpbnB1dCkgPT4ge1xuICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICQoJyNwcmV2aWV3SW1hZ2VuJykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKVxuICAgIH1cbn0iLCJjb25zdCByZWNldGEgPSByZXF1aXJlKFwiLi9SZWNldGEuanNcIik7XG5jb25zdCBjb21lbnRhcmlvcyA9IHJlcXVpcmUoXCIuL0NvbWVudGFyaW9zLmpzXCIpO1xuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xuXG5leHBvcnRzLmVzY3VjaGFyUG9yRXZlbnRvcyA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcmVjZXRhLmxpc3RhclJlY2V0YXMoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FyUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhckFncmVnYXJSZWNldGEoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhdHJhc1wiLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLmF0cmFzKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJndWFyZGFyTnVldmFSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICByZWNldGEuZ3VhcmRhck51ZXZhUmVjZXRhKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FySW1hZ2VuXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VuIG1hbmVqbyBldmVudG9zJylcbiAgICAgICAgcmVjZXRhLmFncmVnYXJJbWFnZW4oKTtcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vc3RyYXJSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJlY2V0YS5tb3N0cmFyUmVjZXRhKGlkLmRldGFpbCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYWdyZWdhckNvbWVudGFyaW9cIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGlkKTtcbiAgICAgICAgY29tZW50YXJpb3MubW9zdHJhckFncmVnYXJDb21lbnRhcmlvKGlkLmRldGFpbCk7XG4gICAgfSk7XG5cbn0iLCJjb25zdCB7IGFncmVnYXJJbWFnZW4gfSA9IHJlcXVpcmUoXCIuLi9TZXJ2aWNpb3MvUmVjZXRhXCIpO1xuY29uc3QgeyBwcmluY2lwYWwgfSA9IHJlcXVpcmUoXCIuLi91dGlscy9wcm9waW8vcHJpbmNpcGFsXCIpO1xuXG5cbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IChyZWNldGFzKSA9PiB7XG4gICAgdmFyIGh0bWwgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVjZXRhcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbm9tYnJlSW1nID0gcmVjZXRhc1tpXS5ub21icmUuc3BsaXQoXCIgXCIpLmpvaW4oXCItXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhyZWNldGFzW2ldLCByZWNldGFzW2ldLmltYWdlbilcbiAgICAgICAgaHRtbCArPSBcIjxkaXYgY2xhc3M9XFxcImNvbC1sZy00IGNvbC1tZC02IHNwZWNpYWwtZ3JpZCBcIiArIHJlY2V0YXNbaV0udGlwb0NvbWlkYSArIFwiXFxcIiBzdHlsZT1cXFwid2lkdGg9MjQ3cHhcXFwiPlwiICtcbiAgICAgICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZ2FsbGVyeS1zaW5nbGUgZml4XFxcIj5cIiArXG4gICAgICAgICAgICBhZ3JlZ2FySW1hZ2VuY2l0YShyZWNldGFzW2ldKSArXG4gICAgICAgICAgICBcIjxkaXYgY2xhc3M9XFxcIndoeS10ZXh0XFxcIj5cIiArXG4gICAgICAgICAgICBcIjxoND5cIiArIHJlY2V0YXNbaV0ubm9tYnJlICsgXCI8L2g0PlwiICtcbiAgICAgICAgICAgIFwiPGEgY2xhc3M9XFxcImJ0bi1sZyBidG4tY2lyY2xlIGJ0bi1vdXRsaW5lLW5ldy13aGl0ZVxcXCIgaWQ9XFxcIlwiICsgbm9tYnJlSW1nICsgXCJcXFwiIG9uY2xpY2s9XFxcIm1vc3RyYXJSZWNldGEodGhpcy5pZClcXFwiIHN0eWxlPVxcXCJjb2xvcjp3aGl0ZTtcXFwiPlZlciByZWNldGE8L2E+XCIgK1xuICAgICAgICAgICAgXCI8L2Rpdj5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiICtcbiAgICAgICAgICAgIFwiPC9kaXY+XCI7XG4gICAgfVxuICAgIGh0bWwgKz0gYWdyZWdhckhUTUxBZ3JlZ2FyUmVjZXRhKCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsaXN0YVJlY2V0YXNcIikuaW5uZXJIVE1MID0gaHRtbDtcbn1cblxuZnVuY3Rpb24gYWdyZWdhckltYWdlbmNpdGEocmVjZXRhKSB7XG4gICAgaWYgKHJlY2V0YS5pbWFnZW4pIHtcbiAgICAgICAgdmFyIGltZ0RhdGEgPSByZWNldGEuaW1hZ2VuLmRhdGE7XG4gICAgICAgIHJldHVybiBcIjxpbWcgc3JjPVxcXCJcIiArIFVpbnQ4VG9TdHJpbmcoaW1nRGF0YSkgKyBcIlxcXCIgY2xhc3M9XFxcImltZy1mbHVpZFxcXCIgYWx0PVxcXCJJbWFnZVxcXCI+XCJcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIlxuICAgIH1cbn1cblxuZnVuY3Rpb24gYWdyZWdhckhUTUxBZ3JlZ2FyUmVjZXRhKCkge1xuICAgIHZhciBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBzcGVjaWFsLWdyaWRcXFwiPlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJnYWxsZXJ5LXNpbmdsZSBmaXggYWdyZWdhclJlY2V0YVxcXCI+XCIgK1xuICAgICAgICBcIjxhIGNsYXNzPVxcXCJidG4tbGcgYnRuLWNpcmNsZSBidG4tb3V0bGluZS1uZXctd2hpdGVcXFwiIGlkPVxcXCJhZ3JlZ2FyUmVjZXRhQnRuXFxcIiBvbmNsaWNrPVxcXCJhZ3JlZ2FyUmVjZXRhKClcXFwiIHN0eWxlPVxcXCJkaXNwbGF5OmJsb2NrOyBjb2xvcjp3aGl0ZTtcXFwiPkFncmVnYXIgcmVjZXRhPC9hPlwiICtcbiAgICAgICAgXCI8L2Rpdj5cIiArXG4gICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiO1xuICAgIHJldHVybiBodG1sO1xufVxuXG5mdW5jdGlvbiBVaW50OFRvU3RyaW5nKHU4YSkge1xuICAgIHZhciBDSFVOS19TWiA9IDB4ODAwMDtcbiAgICB2YXIgYyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdThhLmxlbmd0aDsgaSArPSBDSFVOS19TWikge1xuICAgICAgICBjLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB1OGEuc2xpY2UoaSwgaSArIENIVU5LX1NaKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYy5qb2luKFwiXCIpO1xufVxuIiwidmFyIGlkUmVjZXRhQWN0dWFsID0gJyc7XG5cbmV4cG9ydHMubW9zdHJhclJlY2V0YUVzcGVjaWZpY2EgPSAoZGF0b3MpID0+IHtcbiAgICBpZFJlY2V0YUFjdHVhbCA9IGRhdG9zWydpZCddO1xuICAgIC8vUmVzZXRlYXIgdG9kb3MgbG9zIGh0bWxcbiAgICB2YXIgZWxlbWVudG9zID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShcImVsZW1SZWNldGFFc3BlY2lmaWNhXCIpO1xuICAgIGNvbnNvbGUubG9nKGVsZW1lbnRvcyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50b3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudG9zW2ldLmlubmVySFRNTCA9IFwiXCI7XG4gICAgfVxuXG4gICAgLy9zZXQgdGl0dWxvXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXR1bG9cIikuaW5uZXJIVE1MID0gZGF0b3Mubm9tYnJlO1xuICAgIGNvbnN0IG5vbWJyZUltZyA9IGRhdG9zLm5vbWJyZS5zcGxpdChcIiBcIikuam9pbihcIi1cIik7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlblJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gXCI8aW1nIGNsYXNzPVxcXCJpbWctZmx1aWRcXFwiIHNyYz1cXFwiXCIgKyBVaW50OFRvU3RyaW5nKGRhdG9zLmltYWdlbi5kYXRhKSArIFwiXFxcIiB3aWR0aD1cXFwiMTAwJVxcXCIgYWx0PVxcXCJcXFwiPlwiO1xuICAgIGZvciAoa2V5IGluIGRhdG9zKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coa2V5KTtcbiAgICAgICAgaWYgKGtleSAhPSBcInRpcG9Db21pZGFcIiAmJiBrZXkgIT0gXCJjcmVhdGVkQXRcIiAmJiBrZXkgIT0gXCJ1cGRhdGVkQXRcIiAmJiBrZXkgIT0gXCJpZFwiICYmIGtleSAhPSBcIm5vbWJyZVwiKSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09IFwiaW5ncmVkaWVudGVzXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgdmFyIGluZ3JlZGllbnRlcyA9IGRhdG9zW2tleV0uc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5ncmVkaWVudGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8cCBjbGFzcz1cXFwiZWxlbVJlY2V0YUVzcGVjaWZpY2EgaW5ncmVkaWVudGVcXFwiPi0gXCIgKyBpbmdyZWRpZW50ZXNbaV0gKyBcIjwvcD5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5ICsgXCJSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCA9IGh0bWw7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PSBcImNvbWVudGFyaW9zXCIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdHVhbGl6YXJDb21lbnRhcmlvcyhkYXRvc1trZXldKVxuICAgICAgICAgICAgfSBlbHNlIGlmKGtleSA9PSAnaW1hZ2VuJyl7XG4gICAgICAgICAgICAgICAgLy9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gZGF0b3Nba2V5XTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5zcmMgPSBkYXRvc1trZXldO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGtleSwgZGF0b3Nba2V5XSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5ICsgXCJSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCA9IGRhdG9zW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydHMub2J0ZW5lcklkUmVjZXRhQWN0dWFsID0gKCkgPT4ge1xuICAgIHJldHVybiBpZFJlY2V0YUFjdHVhbDtcbn1cblxuZXhwb3J0cy5hY3R1YWxpemFyQ29tZW50YXJpb3MgPSAoYXJyQ29tZW50YXJpb3MpID0+IHtcbiAgICBpZiAoYXJyQ29tZW50YXJpb3MubGVuZ3RoID09IDApIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5ICsgXCJSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCA9IFwiPHA+UG9yIGFob3JhIG5vIGhheSBjb21lbnRhcmlvcyBwYXJhIGVzdGEgcmVjZXRhLjwvcD5cIjtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyQ29tZW50YXJpb3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgKz0gYWRkQ29tbWVudChhcnJDb21lbnRhcmlvc1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cblxuZnVuY3Rpb24gYWRkQ29tbWVudChjb21tZW50KSB7XG4gICAgY29uc3QgZmVjaGEgPSBjb21tZW50WydjcmVhdGVkQXQnXSA/IGNvbW1lbnRbJ2NyZWF0ZWRBdCddLnNsaWNlKDAsMTApOiAnJztcbiAgICByZXR1cm4gXCI8ZGl2IGNsYXNzPVxcXCJjb21tZW50LWl0ZW1cXFwiPlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJwdWxsLWxlZnRcXFwiPlwiICtcbiAgICAgICAgXCI8YT5cIiArIGNvbW1lbnRbJ2F1dG9yJ10gKyBcIjwvYT48L2Rpdj5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwicHVsbC1yaWdodFxcXCIgc3R5bGU9XFxcInBhZGRpbmc6IDVweCAxMHB4O1xcXCI+XCIgK1xuICAgICAgICBcIjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIiBhcmlhLWhpZGRlbj10cnVlPjwvaT4gPHNwYW4+XCIgKyBmZWNoYSArIFwiPC9zcGFuPjwvZGl2PlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJkZXMtbFxcXCI+XCIgK1xuICAgICAgICBcIjxwPlwiICsgY29tbWVudFsnY29udGVuaWRvJ10gKyBcIjwvcD48L2Rpdj5cIiArXG4gICAgICAgIFwiPC9kaXY+XCI7XG59XG5cblxuZnVuY3Rpb24gVWludDhUb1N0cmluZyh1OGEpIHtcbiAgICB2YXIgQ0hVTktfU1ogPSAweDgwMDA7XG4gICAgdmFyIGMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHU4YS5sZW5ndGg7IGkgKz0gQ0hVTktfU1opIHtcbiAgICAgICAgYy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdThhLnNsaWNlKGksIGkgKyBDSFVOS19TWikpKTtcbiAgICB9XG4gICAgcmV0dXJuIGMuam9pbihcIlwiKTtcbn1cblxuXG4iLCJcblxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYSA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvcFwiKS5zY3JvbGxJbnRvVmlldyh7XG4gICAgICAgIGJlaGF2aW9yOiAnc21vb3RoJyxcbiAgICB9KTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjZXRhRXNwZWNpZmljYVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdBZ3JlZ2FyIGNvbWVudGFyaW8nO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLnNldEF0dHJpYnV0ZShcIm5hbWVcIixcImFncmVnYXJcIik7XG59XG5cbmV4cG9ydHMubW9zdHJhckFncmVnYXJSZWNldGEgPSAoKSA9PiB7XG4gICAgY29uc29sZS5sb2coZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufVxuICAgIFxuZXhwb3J0cy5hdHJhcyA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWdhclJlY2V0YVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG5cbmV4cG9ydHMuaXJBUGFnUHJpbmNpcGFsID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWdhclJlY2V0YVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG59XG5cbmV4cG9ydHMubW9zdHJhckFncmVnYXJDb21lbnRhcmlvID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZ3JlZ2FyQ29tZW50YXJpb1JlY2V0YUVzcGVjaWZpY2EnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVuaWRvQ29tZW50YXJpbycpLnZhbHVlID0gJyc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuaW5uZXJIVE1MID0gJ0d1YXJkYXInO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLnNldEF0dHJpYnV0ZShcIm5hbWVcIixcImd1YXJkYXJcIik7XG59XG5cbmV4cG9ydHMub2N1bHRhckFncmVnYXJDb21lbnRhcmlvID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhZ3JlZ2FyQ29tZW50YXJpb1JlY2V0YUVzcGVjaWZpY2EnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdBZ3JlZ2FyIGNvbWVudGFyaW8nO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLnNldEF0dHJpYnV0ZShcIm5hbWVcIixcImFncmVnYXJcIik7XG59XG5cbiIsImNvbnN0IHNlcnZpY2lvcyA9IHJlcXVpcmUoXCIuL1NlcnZpY2lvcy9tYW5lam9FdmVudG9zLmpzXCIpO1xuXG52YXIgYnJvd3NlcmlmeSA9IFwiYnJvd3NlcmlmeSAuL2pzL21haW4uanMgLW8gLi9qcy9idWlsZC9tYWluLmpzIC1kdlwiO1xuXG5cblxuXG5zZXJ2aWNpb3MuZXNjdWNoYXJQb3JFdmVudG9zKCk7IiwiLyogdmFyIHJlY2V0YXMgPSB7XG4gICAgXCJhcnJvbGxhZG9zLWRlLXByaW1hdmVyYVwiOiB7XG4gICAgICAgIFwidGlwb0NvbWlkYVwiOiBcInNhbGFkb1wiLFxuICAgICAgICBcImF1dG9yXCI6IFwiSW50ZXJuZXRcIixcbiAgICAgICAgXCJjb250ZW5pZG9cIjogW1wiMSBodWV2b1wiLCBcIjMgdGF6YXMgaGFyaW5hXCIsIFwiNSBwYW5jaXRvc1wiXSxcbiAgICAgICAgXCJkZXNjcmlwY2lvblwiOiBcIlBvbmVyIHRvZG8ganVudG8gZW4gdW5hIG1lemNsYSBhc29tYnJvc2EgeSB2dWFsw6EsIHRyZW1lbmRvcyBhcnJvbGxhZGl0b3MgZGUgcHJpbWF2ZXJhIGV4cXVpc2l0b3MhIVwiXG4gICAgfSxcbiAgICBcIm90cmFcIjoge31cbn0gKi9cblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgbGlzdGFyUmVjZXRhcygpO1xufSk7XG5cbmFzeW5jIGZ1bmN0aW9uIGxpc3RhclJlY2V0YXMoKSB7XG4gICAgdmFyIHJlc3B1ZXN0YSA9IGF3YWl0IG1hbmRhckFCYWNrZW5kKFwiR0VUXCIsIFwiL29idGVuZXJSZWNldGFzXCIpO1xuICAgIHZhciByZWNldGFzID0gcmVzcHVlc3RhW1wicmVjZXRhc1wiXTtcbiAgICB2YXIgaHRtbCA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNldGFzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBub21icmVJbWcgPSByZWNldGFzW2ldLm5vbWJyZS5zcGxpdChcIiBcIikuam9pbihcIi1cIik7XG4gICAgICAgIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBzcGVjaWFsLWdyaWQgXCIgKyByZWNldGFzW2ldLnRpcG9Db21pZGEgKyBcIlxcXCIgc3R5bGU9XFxcIndpZHRoPTI0N3B4XFxcIj5cIiArXG4gICAgICAgICAgICBcIjxkaXYgY2xhc3M9XFxcImdhbGxlcnktc2luZ2xlIGZpeFxcXCI+XCIgK1xuICAgICAgICAgICAgXCI8aW1nIHNyYz1cXFwidXRpbHMvaW1hZ2VuZXMvXCIgKyBub21icmVJbWcgKyBcIi5qcGdcXFwiIGNsYXNzPVxcXCJpbWctZmx1aWRcXFwiIGFsdD1cXFwiSW1hZ2VcXFwiPlwiICtcbiAgICAgICAgICAgIFwiPGRpdiBjbGFzcz1cXFwid2h5LXRleHRcXFwiPlwiICtcbiAgICAgICAgICAgIFwiPGg0PlwiICsgcmVjZXRhc1tpXS5ub21icmUgKyBcIjwvaDQ+XCIgK1xuICAgICAgICAgICAgXCI8YSBjbGFzcz1cXFwiYnRuLWxnIGJ0bi1jaXJjbGUgYnRuLW91dGxpbmUtbmV3LXdoaXRlXFxcIiBpZD1cXFwiXCIgKyBub21icmVJbWcgKyBcIlxcXCIgb25jbGljaz1cXFwibW9zdHJhclJlY2V0YSh0aGlzLmlkKVxcXCIgc3R5bGU9XFxcImNvbG9yOndoaXRlO1xcXCI+VmVyIHJlY2V0YTwvYT5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiICtcbiAgICAgICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICAgICAgXCI8L2Rpdj5cIjtcbiAgICB9XG4gICAgaHRtbCArPSBhZ3JlZ2FySFRNTEFncmVnYXJSZWNldGEoKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxpc3RhUmVjZXRhc1wiKS5pbm5lckhUTUwgPSBodG1sO1xufVxuXG5hc3luYyBmdW5jdGlvbiBtb3N0cmFyUmVjZXRhKGlkKSB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b3BcIikuc2Nyb2xsSW50b1ZpZXcoe1xuICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXG4gICAgfSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAvL1Jlc2V0ZWFyIHRvZG9zIGxvcyBodG1sXG4gICAgdmFyIGVsZW1lbnRvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJlbGVtUmVjZXRhRXNwZWNpZmljYVwiKTtcbiAgICBjb25zb2xlLmxvZyhlbGVtZW50b3MpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRvc1tpXS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vY29uc2VndWlyIGRhdG9zXG4gICAgdmFyIHJlc3B1ZXN0YSA9IGF3YWl0IG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9vYnRlbmVyUmVjZXRhRXNwZWNpZmljYVwiLCBpZC5zcGxpdChcIi1cIikuam9pbihcIiBcIikpO1xuICAgIHZhciBkYXRvcyA9IHJlc3B1ZXN0YS5kYXRvcztcbiAgICBjb25zb2xlLmxvZyhkYXRvcyk7XG4gICAgLy9zZXQgdGl0dWxvXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXR1bG9cIikuaW5uZXJIVE1MID0gZGF0b3Mubm9tYnJlO1xuICAgIGNvbnN0IG5vbWJyZUltZyA9IGRhdG9zLm5vbWJyZS5zcGxpdChcIiBcIikuam9pbihcIi1cIik7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlblJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gXCI8aW1nIGNsYXNzPVxcXCJpbWctZmx1aWRcXFwiIHNyYz1cXFwidXRpbHMvaW1hZ2VuZXMvXCIgKyBub21icmVJbWcgKyBcIi5qcGdcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiBhbHQ9XFxcIlxcXCI+XCI7XG4gICAgZm9yIChrZXkgaW4gZGF0b3MpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICBpZiAoa2V5ICE9IFwidGlwb0NvbWlkYVwiICYmIGtleSAhPSBcImNyZWF0ZWRBdFwiICYmIGtleSAhPSBcInVwZGF0ZWRBdFwiICYmIGtleSAhPSBcImlkXCIgJiYga2V5ICE9IFwibm9tYnJlXCIpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT0gXCJpbmdyZWRpZW50ZXNcIikge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gXCJcIjtcbiAgICAgICAgICAgICAgICB2YXIgaW5ncmVkaWVudGVzID0gZGF0b3Nba2V5XS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmdyZWRpZW50ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIjxwIGNsYXNzPVxcXCJlbGVtUmVjZXRhRXNwZWNpZmljYSBpbmdyZWRpZW50ZVxcXCI+LSBcIiArIGluZ3JlZGllbnRlc1tpXSArIFwiPC9wPlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coa2V5KTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gZGF0b3Nba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gYWdyZWdhclJlY2V0YSgpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xufVxuXG5mdW5jdGlvbiBhdHJhcygpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWdhclJlY2V0YVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG5cbmZ1bmN0aW9uIG5vbWJyZUxpbmRvKG5vbWJyZSkge1xuICAgIHZhciBub21icmVMaW5kbyA9IFwiXCI7XG4gICAgdmFyIHBhbGFicmFzSWQgPSBub21icmUuc3BsaXQoXCItXCIpO1xuICAgIG5vbWJyZUxpbmRvICs9IHBhbGFicmFzSWRbMF1bMF0udG9VcHBlckNhc2UoKSArIHBhbGFicmFzSWRbMF0uc2xpY2UoMSkgKyBcIiBcIjtcbiAgICBmb3IgKHZhciBpID0gMTsgaSA8IHBhbGFicmFzSWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbm9tYnJlTGluZG8gKz0gcGFsYWJyYXNJZFtpXSArIFwiIFwiO1xuICAgIH1cbiAgICByZXR1cm4gbm9tYnJlTGluZG87XG59XG5cbmZ1bmN0aW9uIGFncmVnYXJIVE1MQWdyZWdhclJlY2V0YSgpIHtcbiAgICB2YXIgaHRtbCA9IFwiPGRpdiBjbGFzcz1cXFwiY29sLWxnLTQgY29sLW1kLTYgc3BlY2lhbC1ncmlkXFxcIj5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZ2FsbGVyeS1zaW5nbGUgZml4IGFncmVnYXJSZWNldGFcXFwiPlwiICtcbiAgICAgICAgXCI8YSBjbGFzcz1cXFwiYnRuLWxnIGJ0bi1jaXJjbGUgYnRuLW91dGxpbmUtbmV3LXdoaXRlXFxcIiBpZD1cXFwiYWdyZWdhclJlY2V0YUJ0blxcXCIgb25jbGljaz1cXFwiYWdyZWdhclJlY2V0YSgpXFxcIiBzdHlsZT1cXFwiZGlzcGxheTpibG9jazsgY29sb3I6d2hpdGU7XFxcIj5BZ3JlZ2FyIHJlY2V0YTwvYT5cIiArXG4gICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiICtcbiAgICAgICAgXCI8L2Rpdj5cIjtcbiAgICByZXR1cm4gaHRtbDtcbn1cblxuZnVuY3Rpb24gZ3VhcmRhck51ZXZhUmVjZXRhKCkge1xuICAgIHZhciBkYXRvcyA9IHt9O1xuICAgIGRhdG9zLm5vbWJyZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0dWxvTnVldmFSZWNldGFcIikudmFsdWU7XG5cbiAgICBkYXRvcy5hdXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0b3JOdWV2YVJlY2V0YVwiKS52YWx1ZTtcbiAgICBkYXRvcy50aXBvQ29taWRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXBvQ29taWRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmluZ3JlZGllbnRlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5ncmVkaWVudGVzTnVldmFSZWNldGFcIikudmFsdWU7XG4gICAgZGF0b3MuZGVzY3JpcGNpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXBjacOzbk51ZXZhUmVjZXRhXCIpLnZhbHVlO1xuICAgIFxuICAgIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9ndWFyZGFyUmVjZXRhXCIsIEpTT04uc3RyaW5naWZ5KGRhdG9zKSk7XG4gICAgaXJBUGFnUHJpbmNpcGFsKCk7XG59XG5cbmZ1bmN0aW9uIGlyQVBhZ1ByaW5jaXBhbCgpIHtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGxpc3RhclJlY2V0YXMoKTtcbn1cblxuLy9SZXF1ZXN0c1xuY29uc3QgSHR0cCA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuY29uc3QgdXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4MCc7XG5cbmFzeW5jIGZ1bmN0aW9uIG1hbmRhckFCYWNrZW5kKHRpcG9SZXF1ZXN0LCB1cmksIHBhcmFtcykge1xuICAgIEh0dHAub3Blbih0aXBvUmVxdWVzdCwgdXJsICsgdXJpLCBmYWxzZSk7XG4gICAgY29uc29sZS5sb2cocGFyYW1zKTtcbiAgICBjb25zb2xlLmxvZyh1cmwrdXJpKTtcbiAgICBpZiAocGFyYW1zKSB7XG4gICAgICAgIEh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgICAgIGlmICh1cmkgPT0gXCIvb2J0ZW5lclJlY2V0YUVzcGVjaWZpY2FcIikge1xuICAgICAgICAgICAgcGFyYW1zID0gJ3tcIm5vbWJyZVJlY2V0YVwiOlwiJyArIHBhcmFtcyArICdcIn0nXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBIdHRwLnNlbmQocGFyYW1zKTtcblxuICAgIC8qIEh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gKGUpID0+IHtcbiAgICAgICAgY29uc29sZS5sb2coSHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICByZWNldGFzID0gSHR0cC5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJldHVybiBIdHRwLnJlc3BvbnNlVGV4dDtcbiAgICB9ICovXG4gICAgLy9jb25zb2xlLmxvZyhKU09OLnBhcnNlKEh0dHAucmVzcG9uc2VUZXh0KSk7XG4gICAgaWYodXJpICE9IFwiL2d1YXJkYXJSZWNldGFcIil7XG4gICAgICAgIHJldHVybiBKU09OLnBhcnNlKEh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJPS1wiO1xuICAgIH0gIFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsaXN0YXJSZWNldGFzXG59Il19
