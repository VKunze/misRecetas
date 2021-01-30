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


exports.listarRecetas = (recetas) => {
    var html = "";
    for (var i = 0; i < recetas.length; i++) {
        var nombreImg = recetas[i].nombre.split(" ").join("-");
        console.log(recetas[i], recetas[i].imagen)
        html += "<div id=\"" + recetas[i].id + "\" class=\"col-lg-4 col-md-6 elemento-grid-recetas " + recetas[i].tipoComida + "\" style=\"width=247px\">" +
            "<div class=\"gallery-single fix\">" +
            agregarImagencita(recetas[i]) +
            "<div class=\"why-text\">" +
            "<h4 class=nombreReceta>" + recetas[i].nombre + "</h4>" +
            "<p style=\"display:none;\" class=nombreAutor>" + recetas[i].autor + "</p>"+
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
    idRecetaActual = datos['id'];
    //Resetear todos los html
    var elementos = document.getElementsByClassName("elemRecetaEspecifica");
    console.log(elementos);
    for (var i = 0; i < elementos.length; i++) {
        elementos[i].innerHTML = "";
    }

    //set titulo
    document.getElementById("titulo").innerHTML = datos.nombre;

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
},{"./Servicios/manejoEventos.js":4}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImZyb250ZW5kL2pzL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL0NvbWVudGFyaW9zLmpzIiwiZnJvbnRlbmQvanMvU2VydmljaW9zL1JlY2V0YS5qcyIsImZyb250ZW5kL2pzL1NlcnZpY2lvcy9tYW5lam9FdmVudG9zLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUGFnUHJpbmNpcGFsLmpzIiwiZnJvbnRlbmQvanMvVmlzdGEvUmVjZXRhRXNwZWNpZmljYS5qcyIsImZyb250ZW5kL2pzL1Zpc3RhL1RyYW5zaWNpb25lcy5qcyIsImZyb250ZW5kL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBIdHRwID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5jb25zdCB1cmwgPSAnaHR0cHM6Ly9ib2lsaW5nLWR1c2stOTQxOTguaGVyb2t1YXBwLmNvbSc7XG5cbmV4cG9ydHMub2J0ZW5lclJlY2V0YXMgPSBhc3luYyAoKSA9PiB7XG4gICAgcmV0dXJuIG1hbmRhckFCYWNrZW5kKFwiR0VUXCIsIFwiL29idGVuZXJSZWNldGFzXCIsIG51bGwsIHRydWUpO1xufVxuXG5leHBvcnRzLm9idGVuZXJSZWNldGFFc3BlY2lmaWNhID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgcmV0dXJuIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9vYnRlbmVyUmVjZXRhRXNwZWNpZmljYVwiLCAne1wibm9tYnJlUmVjZXRhXCI6XCInICsgaWQgKyAnXCJ9JywgdHJ1ZSkuZGF0b3M7XG59XG5cbmV4cG9ydHMuZ3VhcmRhclJlY2V0YSA9IGFzeW5jIChkYXRvcykgPT4ge1xuICAgIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9ndWFyZGFyUmVjZXRhXCIsIEpTT04uc3RyaW5naWZ5KGRhdG9zKSk7XG59XG5cbmV4cG9ydHMuZ3VhcmRhckNvbWVudGFyaW8gPSBhc3luYyAoZGF0b3MpID0+IHtcbiAgICBtYW5kYXJBQmFja2VuZChcIlBPU1RcIiwgXCIvZ3VhcmRhckNvbWVudGFyaW9cIiwgSlNPTi5zdHJpbmdpZnkoZGF0b3MpKTtcbn1cblxuZXhwb3J0cy5vYnRlbmVyQ29tZW50YXJpb3MgPSBhc3luYyAoaWQpID0+IHtcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL29idGVuZXJDb21lbnRhcmlvc1wiLCAne1wiaWRSZWNldGFcIjpcIicgKyBpZCArICdcIn0nLCB0cnVlKS5jb21lbnRhcmlvcztcbn1cblxuLy9SZXF1ZXN0c1xuXG5mdW5jdGlvbiBtYW5kYXJBQmFja2VuZCh0aXBvUmVxdWVzdCwgdXJpLCBwYXJhbXMsIHJldHVyblZhbHVlID0gZmFsc2UpIHtcbiAgICBIdHRwLm9wZW4odGlwb1JlcXVlc3QsIHVybCArIHVyaSwgZmFsc2UpO1xuICAgIGlmIChwYXJhbXMpIHtcbiAgICAgICAgSHR0cC5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICB9XG5cbiAgICBIdHRwLnNlbmQocGFyYW1zKTtcblxuICAgIGlmIChyZXR1cm5WYWx1ZSkge1xuICAgICAgICByZXR1cm4gSlNPTi5wYXJzZShIdHRwLnJlc3BvbnNlVGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFwiT0tcIjtcbiAgICB9XG5cbn1cbiIsImNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcbmNvbnN0IHZpc3RhUmVjZXRhRXNwZWNpZmljYSA9IHJlcXVpcmUoJy4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2EnKTtcbmNvbnN0IGJhY2tlbmQgPSByZXF1aXJlKCcuLi9QZXJzaXN0ZW5jaWEvQmFja2VuZCcpO1xuXG5leHBvcnRzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbyA9IGFzeW5jICh0aXBvRXZlbnRvKSA9PiB7XG4gICAgY29uc29sZS5sb2codGlwb0V2ZW50byk7XG4gICAgaWYgKHRpcG9FdmVudG8gPT0gJ2FncmVnYXInKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLm1vc3RyYXJBZ3JlZ2FyQ29tZW50YXJpbygpO1xuICAgIH0gZWxzZSBpZiAodGlwb0V2ZW50byA9PSAnZ3VhcmRhcicpIHtcbiAgICAgICAgZGF0b3MgPSB7fVxuICAgICAgICBkYXRvcy5pZFJlY2V0YUFjdHVhbCA9IHZpc3RhUmVjZXRhRXNwZWNpZmljYS5vYnRlbmVySWRSZWNldGFBY3R1YWwoKTtcbiAgICAgICAgZGF0b3MuY29udGVuaWRvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbmlkb0NvbWVudGFyaW8nKS52YWx1ZTtcbiAgICAgICAgZGF0b3MuYXV0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0b3JDb21lbnRhcmlvJykudmFsdWU7XG5cbiAgICAgICAgYXdhaXQgYmFja2VuZC5ndWFyZGFyQ29tZW50YXJpbyhkYXRvcyk7XG5cbiAgICAgICAgdmFyIGNvbWVudGFyaW9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyQ29tZW50YXJpb3MoZGF0b3MuaWRSZWNldGFBY3R1YWwpO1xuICAgICAgICBjb25zb2xlLmxvZyhjb21lbnRhcmlvcyk7XG4gICAgICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5hY3R1YWxpemFyQ29tZW50YXJpb3MoY29tZW50YXJpb3MpO1xuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8oKTtcbiAgICB9XG59XG4iLCJjb25zdCBiYWNrZW5kID0gcmVxdWlyZShcIi4uL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzXCIpO1xuY29uc3QgdmlzdGFQYWdQcmluY2lwYWwgPSByZXF1aXJlKFwiLi4vVmlzdGEvUGFnUHJpbmNpcGFsLmpzXCIpO1xuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xuY29uc3QgdmlzdGFSZWNldGFFc3BlY2lmaWNhID0gcmVxdWlyZShcIi4uL1Zpc3RhL1JlY2V0YUVzcGVjaWZpY2FcIik7XG5cbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IGFzeW5jICgpID0+IHtcbiAgICB2YXIgcmVzcHVlc3RhID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyUmVjZXRhcygpO1xuICAgIGNvbnNvbGUubG9nKHJlc3B1ZXN0YSk7XG4gICAgdmlzdGFQYWdQcmluY2lwYWwubGlzdGFyUmVjZXRhcyhyZXNwdWVzdGFbXCJyZWNldGFzXCJdKTtcbn1cblxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhID0gYXN5bmMgKGlkKSA9PiB7XG4gICAgdmFyIGRhdG9zID0gYXdhaXQgYmFja2VuZC5vYnRlbmVyUmVjZXRhRXNwZWNpZmljYShpZC5zcGxpdChcIi1cIikuam9pbihcIiBcIikpO1xuICAgIGNvbnNvbGUubG9nKGRhdG9zKTtcbiAgICB2aXN0YVRyYW5zaWNpb25lcy5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYSgpO1xuICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYShkYXRvcyk7XG59XG5cbmV4cG9ydHMuZ3VhcmRhck51ZXZhUmVjZXRhID0gKCkgPT4ge1xuICAgIC8vb2J0ZW5jaW9uIGRlIGRhdG9zXG4gICAgdmFyIGRhdG9zID0ge307XG4gICAgZGF0b3Mubm9tYnJlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXR1bG9OdWV2YVJlY2V0YVwiKS52YWx1ZTtcbiAgICBkYXRvcy5hdXRvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0b3JOdWV2YVJlY2V0YVwiKS52YWx1ZTtcbiAgICBkYXRvcy50aXBvQ29taWRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXBvQ29taWRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmluZ3JlZGllbnRlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW5ncmVkaWVudGVzTnVldmFSZWNldGFcIikudmFsdWU7XG4gICAgZGF0b3MuZGVzY3JpcGNpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXBjacOzbk51ZXZhUmVjZXRhXCIpLnZhbHVlO1xuICAgIGRhdG9zLmltYWdlbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJldmlld0ltYWdlblwiKS5zcmM7XG4gICAgY29uc29sZS5sb2coJ2ltYWdlJywgZGF0b3MuaW1hZ2VuKVxuICAgIC8vIFwiL1wiICsgZGF0b3Mubm9tYnJlLnNwbGl0KFwiIFwiKS5qb2luKFwiLVwiKSArIFwiLmpwZ1wiO1xuXG4gICAgYmFja2VuZC5ndWFyZGFyUmVjZXRhKGRhdG9zKTtcbiAgICB2aXN0YVRyYW5zaWNpb25lcy5pckFQYWdQcmluY2lwYWwoKTtcbiAgICB0aGlzLmxpc3RhclJlY2V0YXMoKTtcbn1cblxudmFyIHVwbG9hZGVyID0gJCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIC8+JylcblxuZXhwb3J0cy5hZ3JlZ2FySW1hZ2VuID0gKCkgPT4ge1xuICAgIHVwbG9hZGVyLmNsaWNrKClcblxuICAgIHVwbG9hZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJlYWRVcmwodGhpcylcbiAgICB9KVxufVxuXG52YXIgcmVhZFVybCA9IChpbnB1dCkgPT4ge1xuICAgIGlmIChpbnB1dC5maWxlcyAmJiBpbnB1dC5maWxlc1swXSkge1xuICAgICAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICQoJyNwcmV2aWV3SW1hZ2VuJykuYXR0cignc3JjJywgZS50YXJnZXQucmVzdWx0KTtcbiAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKGlucHV0LmZpbGVzWzBdKVxuICAgIH1cbn0iLCJjb25zdCByZWNldGEgPSByZXF1aXJlKFwiLi9SZWNldGEuanNcIik7XG5jb25zdCBjb21lbnRhcmlvcyA9IHJlcXVpcmUoXCIuL0NvbWVudGFyaW9zLmpzXCIpO1xuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xuXG5leHBvcnRzLmVzY3VjaGFyUG9yRXZlbnRvcyA9ICgpID0+IHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgcmVjZXRhLmxpc3RhclJlY2V0YXMoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FyUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhckFncmVnYXJSZWNldGEoKTtcbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhdHJhc1wiLCBhc3luYyBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLmF0cmFzKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJndWFyZGFyTnVldmFSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKCkge1xuICAgICAgICByZWNldGEuZ3VhcmRhck51ZXZhUmVjZXRhKCk7XG4gICAgfSlcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FySW1hZ2VuXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2VuIG1hbmVqbyBldmVudG9zJylcbiAgICAgICAgcmVjZXRhLmFncmVnYXJJbWFnZW4oKTtcbiAgICB9KVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vc3RyYXJSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJlY2V0YS5tb3N0cmFyUmVjZXRhKGlkLmRldGFpbCk7XG4gICAgfSk7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiYWdyZWdhckNvbWVudGFyaW9cIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGlkKTtcbiAgICAgICAgY29tZW50YXJpb3MubW9zdHJhckFncmVnYXJDb21lbnRhcmlvKGlkLmRldGFpbCk7XG4gICAgfSk7XG5cbn0iLCJjb25zdCB7IGFncmVnYXJJbWFnZW4gfSA9IHJlcXVpcmUoXCIuLi9TZXJ2aWNpb3MvUmVjZXRhXCIpO1xuXG5cbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IChyZWNldGFzKSA9PiB7XG4gICAgdmFyIGh0bWwgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVjZXRhcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgbm9tYnJlSW1nID0gcmVjZXRhc1tpXS5ub21icmUuc3BsaXQoXCIgXCIpLmpvaW4oXCItXCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhyZWNldGFzW2ldLCByZWNldGFzW2ldLmltYWdlbilcbiAgICAgICAgaHRtbCArPSBcIjxkaXYgaWQ9XFxcIlwiICsgcmVjZXRhc1tpXS5pZCArIFwiXFxcIiBjbGFzcz1cXFwiY29sLWxnLTQgY29sLW1kLTYgZWxlbWVudG8tZ3JpZC1yZWNldGFzIFwiICsgcmVjZXRhc1tpXS50aXBvQ29taWRhICsgXCJcXFwiIHN0eWxlPVxcXCJ3aWR0aD0yNDdweFxcXCI+XCIgK1xuICAgICAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJnYWxsZXJ5LXNpbmdsZSBmaXhcXFwiPlwiICtcbiAgICAgICAgICAgIGFncmVnYXJJbWFnZW5jaXRhKHJlY2V0YXNbaV0pICtcbiAgICAgICAgICAgIFwiPGRpdiBjbGFzcz1cXFwid2h5LXRleHRcXFwiPlwiICtcbiAgICAgICAgICAgIFwiPGg0IGNsYXNzPW5vbWJyZVJlY2V0YT5cIiArIHJlY2V0YXNbaV0ubm9tYnJlICsgXCI8L2g0PlwiICtcbiAgICAgICAgICAgIFwiPHAgc3R5bGU9XFxcImRpc3BsYXk6bm9uZTtcXFwiIGNsYXNzPW5vbWJyZUF1dG9yPlwiICsgcmVjZXRhc1tpXS5hdXRvciArIFwiPC9wPlwiK1xuICAgICAgICBcIjxhIGNsYXNzPVxcXCJidG4tbGcgYnRuLWNpcmNsZSBidG4tb3V0bGluZS1uZXctd2hpdGVcXFwiIGlkPVxcXCJcIiArIG5vbWJyZUltZyArIFwiXFxcIiBvbmNsaWNrPVxcXCJtb3N0cmFyUmVjZXRhKHRoaXMuaWQpXFxcIiBzdHlsZT1cXFwiY29sb3I6d2hpdGU7XFxcIj5WZXIgcmVjZXRhPC9hPlwiICtcbiAgICAgICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICAgICAgXCI8L2Rpdj5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiO1xuICAgIH1cbiAgICBodG1sICs9IGFncmVnYXJIVE1MQWdyZWdhclJlY2V0YSgpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdGFSZWNldGFzXCIpLmlubmVySFRNTCA9IGh0bWw7XG59XG5cbmZ1bmN0aW9uIGFncmVnYXJJbWFnZW5jaXRhKHJlY2V0YSkge1xuICAgIGlmIChyZWNldGEuaW1hZ2VuKSB7XG4gICAgICAgIHZhciBpbWdEYXRhID0gcmVjZXRhLmltYWdlbi5kYXRhO1xuICAgICAgICByZXR1cm4gXCI8aW1nIHNyYz1cXFwiXCIgKyBVaW50OFRvU3RyaW5nKGltZ0RhdGEpICsgXCJcXFwiIGNsYXNzPVxcXCJpbWctZmx1aWQgYWRqdXN0LWltZ1xcXCIgYWx0PVxcXCJJbWFnZVxcXCI+XCJcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gXCJcIlxuICAgIH1cbn1cblxuZnVuY3Rpb24gYWdyZWdhckhUTUxBZ3JlZ2FyUmVjZXRhKCkge1xuICAgIHZhciBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBlbGVtZW50by1ncmlkLXJlY2V0YXMgc2llbXByZVZpc2libGVcXFwiIGlkPWVsZW1lbnRvQWdyZWdhclJlY2V0YT5cIiArXG4gICAgICAgIFwiPGRpdiBjbGFzcz1cXFwiZ2FsbGVyeS1zaW5nbGUgZml4IGFncmVnYXJSZWNldGFcXFwiPlwiICtcbiAgICAgICAgXCI8YSBjbGFzcz1cXFwiYnRuLWxnIGJ0bi1jaXJjbGUgYnRuLW91dGxpbmUtbmV3LXdoaXRlXFxcIiBpZD1cXFwiYWdyZWdhclJlY2V0YUJ0blxcXCIgb25jbGljaz1cXFwiYWdyZWdhclJlY2V0YSgpXFxcIiBzdHlsZT1cXFwiZGlzcGxheTpibG9jazsgY29sb3I6d2hpdGU7XFxcIj5BZ3JlZ2FyIHJlY2V0YTwvYT5cIiArXG4gICAgICAgIFwiPC9kaXY+XCIgK1xuICAgICAgICBcIjwvZGl2PlwiICtcbiAgICAgICAgXCI8L2Rpdj5cIjtcbiAgICByZXR1cm4gaHRtbDtcbn1cblxuZnVuY3Rpb24gVWludDhUb1N0cmluZyh1OGEpIHtcbiAgICB2YXIgQ0hVTktfU1ogPSAweDgwMDA7XG4gICAgdmFyIGMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHU4YS5sZW5ndGg7IGkgKz0gQ0hVTktfU1opIHtcbiAgICAgICAgYy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdThhLnNsaWNlKGksIGkgKyBDSFVOS19TWikpKTtcbiAgICB9XG4gICAgcmV0dXJuIGMuam9pbihcIlwiKTtcbn1cbiIsInZhciBpZFJlY2V0YUFjdHVhbCA9ICcnO1xuXG5leHBvcnRzLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhID0gKGRhdG9zKSA9PiB7XG4gICAgaWRSZWNldGFBY3R1YWwgPSBkYXRvc1snaWQnXTtcbiAgICAvL1Jlc2V0ZWFyIHRvZG9zIGxvcyBodG1sXG4gICAgdmFyIGVsZW1lbnRvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJlbGVtUmVjZXRhRXNwZWNpZmljYVwiKTtcbiAgICBjb25zb2xlLmxvZyhlbGVtZW50b3MpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudG9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGVsZW1lbnRvc1tpXS5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH1cblxuICAgIC8vc2V0IHRpdHVsb1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0dWxvXCIpLmlubmVySFRNTCA9IGRhdG9zLm5vbWJyZTtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaW1hZ2VuUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBcIjxpbWcgY2xhc3M9XFxcImltZy1mbHVpZFxcXCIgc3JjPVxcXCJcIiArIFVpbnQ4VG9TdHJpbmcoZGF0b3MuaW1hZ2VuLmRhdGEpICsgXCJcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiBhbHQ9XFxcIlxcXCI+XCI7XG4gICAgZm9yIChrZXkgaW4gZGF0b3MpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhrZXkpO1xuICAgICAgICBpZiAoa2V5ICE9IFwidGlwb0NvbWlkYVwiICYmIGtleSAhPSBcImNyZWF0ZWRBdFwiICYmIGtleSAhPSBcInVwZGF0ZWRBdFwiICYmIGtleSAhPSBcImlkXCIgJiYga2V5ICE9IFwibm9tYnJlXCIpIHtcbiAgICAgICAgICAgIGlmIChrZXkgPT0gXCJpbmdyZWRpZW50ZXNcIikge1xuICAgICAgICAgICAgICAgIHZhciBodG1sID0gXCJcIjtcbiAgICAgICAgICAgICAgICB2YXIgaW5ncmVkaWVudGVzID0gZGF0b3Nba2V5XS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmdyZWRpZW50ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBcIjxwIGNsYXNzPVxcXCJlbGVtUmVjZXRhRXNwZWNpZmljYSBpbmdyZWRpZW50ZVxcXCI+LSBcIiArIGluZ3JlZGllbnRlc1tpXSArIFwiPC9wPlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09IFwiY29tZW50YXJpb3NcIikge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0dWFsaXphckNvbWVudGFyaW9zKGRhdG9zW2tleV0pXG4gICAgICAgICAgICB9IGVsc2UgaWYoa2V5ID09ICdpbWFnZW4nKXtcbiAgICAgICAgICAgICAgICAvL2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBkYXRvc1trZXldO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5ICsgXCJSZWNldGFFc3BlY2lmaWNhXCIpLnNyYyA9IGRhdG9zW2tleV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coa2V5LCBkYXRvc1trZXldKTtcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gZGF0b3Nba2V5XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0cy5vYnRlbmVySWRSZWNldGFBY3R1YWwgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGlkUmVjZXRhQWN0dWFsO1xufVxuXG5leHBvcnRzLmFjdHVhbGl6YXJDb21lbnRhcmlvcyA9IChhcnJDb21lbnRhcmlvcykgPT4ge1xuICAgIGlmIChhcnJDb21lbnRhcmlvcy5sZW5ndGggPT0gMCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gXCI8cD5Qb3IgYWhvcmEgbm8gaGF5IGNvbWVudGFyaW9zIHBhcmEgZXN0YSByZWNldGEuPC9wPlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnJDb21lbnRhcmlvcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoa2V5ICsgXCJSZWNldGFFc3BlY2lmaWNhXCIpLmlubmVySFRNTCArPSBhZGRDb21tZW50KGFyckNvbWVudGFyaW9zW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRDb21tZW50KGNvbW1lbnQpIHtcbiAgICBjb25zdCBmZWNoYSA9IGNvbW1lbnRbJ2NyZWF0ZWRBdCddID8gY29tbWVudFsnY3JlYXRlZEF0J10uc2xpY2UoMCwxMCk6ICcnO1xuICAgIHJldHVybiBcIjxkaXYgY2xhc3M9XFxcImNvbW1lbnQtaXRlbVxcXCI+XCIgK1xuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcInB1bGwtbGVmdFxcXCI+XCIgK1xuICAgICAgICBcIjxhPlwiICsgY29tbWVudFsnYXV0b3InXSArIFwiPC9hPjwvZGl2PlwiICtcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJwdWxsLXJpZ2h0XFxcIiBzdHlsZT1cXFwicGFkZGluZzogNXB4IDEwcHg7XFxcIj5cIiArXG4gICAgICAgIFwiPGkgY2xhc3M9XFxcImZhIGZhLWNsb2NrLW9cXFwiIGFyaWEtaGlkZGVuPXRydWU+PC9pPiA8c3Bhbj5cIiArIGZlY2hhICsgXCI8L3NwYW4+PC9kaXY+XCIgK1xuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcImRlcy1sXFxcIj5cIiArXG4gICAgICAgIFwiPHA+XCIgKyBjb21tZW50Wydjb250ZW5pZG8nXSArIFwiPC9wPjwvZGl2PlwiICtcbiAgICAgICAgXCI8L2Rpdj5cIjtcbn1cblxuXG5mdW5jdGlvbiBVaW50OFRvU3RyaW5nKHU4YSkge1xuICAgIHZhciBDSFVOS19TWiA9IDB4ODAwMDtcbiAgICB2YXIgYyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdThhLmxlbmd0aDsgaSArPSBDSFVOS19TWikge1xuICAgICAgICBjLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCB1OGEuc2xpY2UoaSwgaSArIENIVU5LX1NaKSkpO1xuICAgIH1cbiAgICByZXR1cm4gYy5qb2luKFwiXCIpO1xufVxuXG5cbiIsIlxuXG5leHBvcnRzLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wXCIpLnNjcm9sbEludG9WaWV3KHtcbiAgICAgICAgYmVoYXZpb3I6ICdzbW9vdGgnLFxuICAgIH0pO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZWNldGFFc3BlY2lmaWNhXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuaW5uZXJIVE1MID0gJ0FncmVnYXIgY29tZW50YXJpbyc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiYWdyZWdhclwiKTtcbn1cblxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhclJlY2V0YSA9ICgpID0+IHtcbiAgICBjb25zb2xlLmxvZyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWdhclJlY2V0YVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG59XG4gICAgXG5leHBvcnRzLmF0cmFzID0gKCkgPT4ge1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVjZXRhRXNwZWNpZmljYVwiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbn1cblxuZXhwb3J0cy5pckFQYWdQcmluY2lwYWwgPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbnRlbmVkb3JMaXN0YVJlY2V0YXNcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbn1cblxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhckNvbWVudGFyaW8gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FncmVnYXJDb21lbnRhcmlvUmVjZXRhRXNwZWNpZmljYScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW5pZG9Db21lbnRhcmlvJykudmFsdWUgPSAnJztcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYnRuQ29tZW50YXJpb3MnKS5pbm5lckhUTUwgPSAnR3VhcmRhcic7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiZ3VhcmRhclwiKTtcbn1cblxuZXhwb3J0cy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8gPSAoKSA9PiB7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FncmVnYXJDb21lbnRhcmlvUmVjZXRhRXNwZWNpZmljYScpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuaW5uZXJIVE1MID0gJ0FncmVnYXIgY29tZW50YXJpbyc7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiYWdyZWdhclwiKTtcbn1cblxuIiwiY29uc3Qgc2VydmljaW9zID0gcmVxdWlyZShcIi4vU2VydmljaW9zL21hbmVqb0V2ZW50b3MuanNcIik7XG5cbnZhciBicm93c2VyaWZ5ID0gXCJicm93c2VyaWZ5IC4vanMvbWFpbi5qcyAtbyAuL2pzL2J1aWxkL21haW4uanMgLWR2XCI7XG5cblxuc2VydmljaW9zLmVzY3VjaGFyUG9yRXZlbnRvcygpOyJdfQ==
