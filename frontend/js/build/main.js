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
    datos.rutaImagen = "/" + datos.nombre.split(" ").join("-") + ".jpg";

    backend.guardarReceta(datos);
    vistaTransiciones.irAPagPrincipal();
    this.listarRecetas();
}

var uploader = $('<input type="file" accept="image/*" />')
    
exports.agregarImagen = () => {
    console.log('llega 3', uploader)
    uploader.click()

    uploader.on('change', function(){
        var reader = new FileReader()
        var campo = $('#imagenNuevaReceta')
        reader.onload = function(event) {
            campo.after('<div class="img" style="background-image: url(\'' + event.target.result + '\');" rel="'+ event.target.result  +'"><span>remove</span></div>')
        }
        reader.readAsDataURL($('#imagenNuevaReceta')[0].files[0])    
    })
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

    document.addEventListener("agregarImagen1", async function () {
        console.log('llega a agregar 2');
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
exports.listarRecetas = (recetas) => {
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

function agregarHTMLAgregarReceta() {
    var html = "<div class=\"col-lg-4 col-md-6 special-grid\">" +
        "<div class=\"gallery-single fix agregarReceta\">" +
        "<a class=\"btn-lg btn-circle btn-outline-new-white\" id=\"agregarRecetaBtn\" onclick=\"agregarReceta()\" style=\"display:block; color:white;\">Agregar receta</a>" +
        "</div>" +
        "</div>" +
        "</div>";
    return html;
}
},{}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImpzL1BlcnNpc3RlbmNpYS9CYWNrZW5kLmpzIiwianMvU2VydmljaW9zL0NvbWVudGFyaW9zLmpzIiwianMvU2VydmljaW9zL1JlY2V0YS5qcyIsImpzL1NlcnZpY2lvcy9tYW5lam9FdmVudG9zLmpzIiwianMvVmlzdGEvUGFnUHJpbmNpcGFsLmpzIiwianMvVmlzdGEvUmVjZXRhRXNwZWNpZmljYS5qcyIsImpzL1Zpc3RhL1RyYW5zaWNpb25lcy5qcyIsImpzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IEh0dHAgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuY29uc3QgdXJsID0gJ2h0dHBzOi8vYm9pbGluZy1kdXNrLTk0MTk4Lmhlcm9rdWFwcC5jb20nO1xyXG5cclxuZXhwb3J0cy5vYnRlbmVyUmVjZXRhcyA9IGFzeW5jICgpID0+IHtcclxuICAgIHJldHVybiBtYW5kYXJBQmFja2VuZChcIkdFVFwiLCBcIi9vYnRlbmVyUmVjZXRhc1wiLCBudWxsLCB0cnVlKTtcclxufVxyXG5cclxuZXhwb3J0cy5vYnRlbmVyUmVjZXRhRXNwZWNpZmljYSA9IGFzeW5jIChpZCkgPT4ge1xyXG4gICAgcmV0dXJuIG1hbmRhckFCYWNrZW5kKFwiUE9TVFwiLCBcIi9vYnRlbmVyUmVjZXRhRXNwZWNpZmljYVwiLCAne1wibm9tYnJlUmVjZXRhXCI6XCInICsgaWQgKyAnXCJ9JywgdHJ1ZSkuZGF0b3M7XHJcbn1cclxuXHJcbmV4cG9ydHMuZ3VhcmRhclJlY2V0YSA9IGFzeW5jIChkYXRvcykgPT4ge1xyXG4gICAgbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL2d1YXJkYXJSZWNldGFcIiwgSlNPTi5zdHJpbmdpZnkoZGF0b3MpKTtcclxufVxyXG5cclxuZXhwb3J0cy5ndWFyZGFyQ29tZW50YXJpbyA9IGFzeW5jIChkYXRvcykgPT4ge1xyXG4gICAgbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL2d1YXJkYXJDb21lbnRhcmlvXCIsIEpTT04uc3RyaW5naWZ5KGRhdG9zKSk7XHJcbn1cclxuXHJcbmV4cG9ydHMub2J0ZW5lckNvbWVudGFyaW9zID0gYXN5bmMgKGlkKSA9PiB7XHJcbiAgICByZXR1cm4gbWFuZGFyQUJhY2tlbmQoXCJQT1NUXCIsIFwiL29idGVuZXJDb21lbnRhcmlvc1wiLCAne1wiaWRSZWNldGFcIjpcIicgKyBpZCArICdcIn0nLCB0cnVlKS5jb21lbnRhcmlvcztcclxufVxyXG5cclxuLy9SZXF1ZXN0c1xyXG5cclxuZnVuY3Rpb24gbWFuZGFyQUJhY2tlbmQodGlwb1JlcXVlc3QsIHVyaSwgcGFyYW1zLCByZXR1cm5WYWx1ZSA9IGZhbHNlKSB7XHJcbiAgICBIdHRwLm9wZW4odGlwb1JlcXVlc3QsIHVybCArIHVyaSwgZmFsc2UpO1xyXG4gICAgaWYgKHBhcmFtcykge1xyXG4gICAgICAgIEh0dHAuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICB9XHJcblxyXG4gICAgSHR0cC5zZW5kKHBhcmFtcyk7XHJcblxyXG4gICAgaWYgKHJldHVyblZhbHVlKSB7XHJcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UoSHR0cC5yZXNwb25zZVRleHQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gXCJPS1wiO1xyXG4gICAgfVxyXG5cclxufSIsImNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcclxuY29uc3QgdmlzdGFSZWNldGFFc3BlY2lmaWNhID0gcmVxdWlyZSgnLi4vVmlzdGEvUmVjZXRhRXNwZWNpZmljYScpO1xyXG5jb25zdCBiYWNrZW5kID0gcmVxdWlyZSgnLi4vUGVyc2lzdGVuY2lhL0JhY2tlbmQnKTtcclxuXHJcbmV4cG9ydHMubW9zdHJhckFncmVnYXJDb21lbnRhcmlvID0gYXN5bmMgKHRpcG9FdmVudG8pID0+IHtcclxuICAgIGNvbnNvbGUubG9nKHRpcG9FdmVudG8pO1xyXG4gICAgaWYgKHRpcG9FdmVudG8gPT0gJ2FncmVnYXInKSB7XHJcbiAgICAgICAgdmlzdGFUcmFuc2ljaW9uZXMubW9zdHJhckFncmVnYXJDb21lbnRhcmlvKCk7XHJcbiAgICB9IGVsc2UgaWYgKHRpcG9FdmVudG8gPT0gJ2d1YXJkYXInKSB7XHJcbiAgICAgICAgZGF0b3MgPSB7fVxyXG4gICAgICAgIGRhdG9zLmlkUmVjZXRhQWN0dWFsID0gdmlzdGFSZWNldGFFc3BlY2lmaWNhLm9idGVuZXJJZFJlY2V0YUFjdHVhbCgpO1xyXG4gICAgICAgIGRhdG9zLmNvbnRlbmlkbyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb250ZW5pZG9Db21lbnRhcmlvJykudmFsdWU7XHJcbiAgICAgICAgZGF0b3MuYXV0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYXV0b3JDb21lbnRhcmlvJykudmFsdWU7XHJcblxyXG4gICAgICAgIGF3YWl0IGJhY2tlbmQuZ3VhcmRhckNvbWVudGFyaW8oZGF0b3MpO1xyXG5cclxuICAgICAgICB2YXIgY29tZW50YXJpb3MgPSBhd2FpdCBiYWNrZW5kLm9idGVuZXJDb21lbnRhcmlvcyhkYXRvcy5pZFJlY2V0YUFjdHVhbCk7XHJcbiAgICAgICAgY29uc29sZS5sb2coY29tZW50YXJpb3MpO1xyXG4gICAgICAgIHZpc3RhUmVjZXRhRXNwZWNpZmljYS5hY3R1YWxpemFyQ29tZW50YXJpb3MoY29tZW50YXJpb3MpO1xyXG4gICAgICAgIHZpc3RhVHJhbnNpY2lvbmVzLm9jdWx0YXJBZ3JlZ2FyQ29tZW50YXJpbygpO1xyXG4gICAgfVxyXG59XHJcbiIsImNvbnN0IGJhY2tlbmQgPSByZXF1aXJlKFwiLi4vUGVyc2lzdGVuY2lhL0JhY2tlbmQuanNcIik7XHJcbmNvbnN0IHZpc3RhUGFnUHJpbmNpcGFsID0gcmVxdWlyZShcIi4uL1Zpc3RhL1BhZ1ByaW5jaXBhbC5qc1wiKTtcclxuY29uc3QgdmlzdGFUcmFuc2ljaW9uZXMgPSByZXF1aXJlKFwiLi4vVmlzdGEvVHJhbnNpY2lvbmVzXCIpO1xyXG5jb25zdCB2aXN0YVJlY2V0YUVzcGVjaWZpY2EgPSByZXF1aXJlKFwiLi4vVmlzdGEvUmVjZXRhRXNwZWNpZmljYVwiKTtcclxuXHJcbmV4cG9ydHMubGlzdGFyUmVjZXRhcyA9IGFzeW5jICgpID0+IHtcclxuICAgIHZhciByZXNwdWVzdGEgPSBhd2FpdCBiYWNrZW5kLm9idGVuZXJSZWNldGFzKCk7XHJcbiAgICBjb25zb2xlLmxvZyhyZXNwdWVzdGEpO1xyXG4gICAgdmlzdGFQYWdQcmluY2lwYWwubGlzdGFyUmVjZXRhcyhyZXNwdWVzdGFbXCJyZWNldGFzXCJdKTtcclxufVxyXG5cclxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhID0gYXN5bmMgKGlkKSA9PiB7XHJcbiAgICB2YXIgZGF0b3MgPSBhd2FpdCBiYWNrZW5kLm9idGVuZXJSZWNldGFFc3BlY2lmaWNhKGlkLnNwbGl0KFwiLVwiKS5qb2luKFwiIFwiKSk7XHJcbiAgICBjb25zb2xlLmxvZyhkYXRvcyk7XHJcbiAgICB2aXN0YVRyYW5zaWNpb25lcy5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYSgpO1xyXG4gICAgdmlzdGFSZWNldGFFc3BlY2lmaWNhLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhKGRhdG9zKTtcclxufVxyXG5cclxuZXhwb3J0cy5ndWFyZGFyTnVldmFSZWNldGEgPSAoKSA9PiB7XHJcbiAgICAvL29idGVuY2lvbiBkZSBkYXRvc1xyXG4gICAgdmFyIGRhdG9zID0ge307XHJcbiAgICBkYXRvcy5ub21icmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdHVsb051ZXZhUmVjZXRhXCIpLnZhbHVlO1xyXG4gICAgZGF0b3MuYXV0b3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dG9yTnVldmFSZWNldGFcIikudmFsdWU7XHJcbiAgICBkYXRvcy50aXBvQ29taWRhID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXBvQ29taWRhXCIpLnZhbHVlO1xyXG4gICAgZGF0b3MuaW5ncmVkaWVudGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJpbmdyZWRpZW50ZXNOdWV2YVJlY2V0YVwiKS52YWx1ZTtcclxuICAgIGRhdG9zLmRlc2NyaXBjaW9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwY2nDs25OdWV2YVJlY2V0YVwiKS52YWx1ZTtcclxuICAgIGRhdG9zLnJ1dGFJbWFnZW4gPSBcIi9cIiArIGRhdG9zLm5vbWJyZS5zcGxpdChcIiBcIikuam9pbihcIi1cIikgKyBcIi5qcGdcIjtcclxuXHJcbiAgICBiYWNrZW5kLmd1YXJkYXJSZWNldGEoZGF0b3MpO1xyXG4gICAgdmlzdGFUcmFuc2ljaW9uZXMuaXJBUGFnUHJpbmNpcGFsKCk7XHJcbiAgICB0aGlzLmxpc3RhclJlY2V0YXMoKTtcclxufVxyXG5cclxudmFyIHVwbG9hZGVyID0gJCgnPGlucHV0IHR5cGU9XCJmaWxlXCIgYWNjZXB0PVwiaW1hZ2UvKlwiIC8+JylcclxuICAgIFxyXG5leHBvcnRzLmFncmVnYXJJbWFnZW4gPSAoKSA9PiB7XHJcbiAgICBjb25zb2xlLmxvZygnbGxlZ2EgMycsIHVwbG9hZGVyKVxyXG4gICAgdXBsb2FkZXIuY2xpY2soKVxyXG5cclxuICAgIHVwbG9hZGVyLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xyXG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXHJcbiAgICAgICAgdmFyIGNhbXBvID0gJCgnI2ltYWdlbk51ZXZhUmVjZXRhJylcclxuICAgICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgY2FtcG8uYWZ0ZXIoJzxkaXYgY2xhc3M9XCJpbWdcIiBzdHlsZT1cImJhY2tncm91bmQtaW1hZ2U6IHVybChcXCcnICsgZXZlbnQudGFyZ2V0LnJlc3VsdCArICdcXCcpO1wiIHJlbD1cIicrIGV2ZW50LnRhcmdldC5yZXN1bHQgICsnXCI+PHNwYW4+cmVtb3ZlPC9zcGFuPjwvZGl2PicpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlYWRlci5yZWFkQXNEYXRhVVJMKCQoJyNpbWFnZW5OdWV2YVJlY2V0YScpWzBdLmZpbGVzWzBdKSAgICBcclxuICAgIH0pXHJcbn0iLCJjb25zdCByZWNldGEgPSByZXF1aXJlKFwiLi9SZWNldGEuanNcIik7XHJcbmNvbnN0IGNvbWVudGFyaW9zID0gcmVxdWlyZShcIi4vQ29tZW50YXJpb3MuanNcIik7XHJcbmNvbnN0IHZpc3RhVHJhbnNpY2lvbmVzID0gcmVxdWlyZShcIi4uL1Zpc3RhL1RyYW5zaWNpb25lc1wiKTtcclxuXHJcbmV4cG9ydHMuZXNjdWNoYXJQb3JFdmVudG9zID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgcmVjZXRhLmxpc3RhclJlY2V0YXMoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FyUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5tb3N0cmFyQWdyZWdhclJlY2V0YSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImF0cmFzXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2aXN0YVRyYW5zaWNpb25lcy5hdHJhcygpO1xyXG4gICAgfSlcclxuXHJcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiZ3VhcmRhck51ZXZhUmVjZXRhXCIsIGFzeW5jIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICByZWNldGEuZ3VhcmRhck51ZXZhUmVjZXRhKCk7XHJcbiAgICB9KVxyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FySW1hZ2VuMVwiLCBhc3luYyBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2xsZWdhIGEgYWdyZWdhciAyJyk7XHJcbiAgICAgICAgcmVjZXRhLmFncmVnYXJJbWFnZW4oKTtcclxuICAgIH0pXHJcblxyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vc3RyYXJSZWNldGFcIiwgYXN5bmMgZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgcmVjZXRhLm1vc3RyYXJSZWNldGEoaWQuZGV0YWlsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJhZ3JlZ2FyQ29tZW50YXJpb1wiLCBhc3luYyBmdW5jdGlvbiAoaWQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhpZCk7XHJcbiAgICAgICAgY29tZW50YXJpb3MubW9zdHJhckFncmVnYXJDb21lbnRhcmlvKGlkLmRldGFpbCk7XHJcbiAgICB9KTtcclxuXHJcbn0iLCJleHBvcnRzLmxpc3RhclJlY2V0YXMgPSAocmVjZXRhcykgPT4ge1xyXG4gICAgdmFyIGh0bWwgPSBcIlwiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNldGFzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIG5vbWJyZUltZyA9IHJlY2V0YXNbaV0ubm9tYnJlLnNwbGl0KFwiIFwiKS5qb2luKFwiLVwiKTtcclxuICAgICAgICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiY29sLWxnLTQgY29sLW1kLTYgc3BlY2lhbC1ncmlkIFwiICsgcmVjZXRhc1tpXS50aXBvQ29taWRhICsgXCJcXFwiIHN0eWxlPVxcXCJ3aWR0aD0yNDdweFxcXCI+XCIgK1xyXG4gICAgICAgICAgICBcIjxkaXYgY2xhc3M9XFxcImdhbGxlcnktc2luZ2xlIGZpeFxcXCI+XCIgK1xyXG4gICAgICAgICAgICBcIjxpbWcgc3JjPVxcXCJ1dGlscy9pbWFnZW5lcy9cIiArIG5vbWJyZUltZyArIFwiLmpwZ1xcXCIgY2xhc3M9XFxcImltZy1mbHVpZFxcXCIgYWx0PVxcXCJJbWFnZVxcXCI+XCIgK1xyXG4gICAgICAgICAgICBcIjxkaXYgY2xhc3M9XFxcIndoeS10ZXh0XFxcIj5cIiArXHJcbiAgICAgICAgICAgIFwiPGg0PlwiICsgcmVjZXRhc1tpXS5ub21icmUgKyBcIjwvaDQ+XCIgK1xyXG4gICAgICAgICAgICBcIjxhIGNsYXNzPVxcXCJidG4tbGcgYnRuLWNpcmNsZSBidG4tb3V0bGluZS1uZXctd2hpdGVcXFwiIGlkPVxcXCJcIiArIG5vbWJyZUltZyArIFwiXFxcIiBvbmNsaWNrPVxcXCJtb3N0cmFyUmVjZXRhKHRoaXMuaWQpXFxcIiBzdHlsZT1cXFwiY29sb3I6d2hpdGU7XFxcIj5WZXIgcmVjZXRhPC9hPlwiICtcclxuICAgICAgICAgICAgXCI8L2Rpdj5cIiArXHJcbiAgICAgICAgICAgIFwiPC9kaXY+XCIgK1xyXG4gICAgICAgICAgICBcIjwvZGl2PlwiO1xyXG4gICAgfVxyXG4gICAgaHRtbCArPSBhZ3JlZ2FySFRNTEFncmVnYXJSZWNldGEoKTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibGlzdGFSZWNldGFzXCIpLmlubmVySFRNTCA9IGh0bWw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGFncmVnYXJIVE1MQWdyZWdhclJlY2V0YSgpIHtcclxuICAgIHZhciBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJjb2wtbGctNCBjb2wtbWQtNiBzcGVjaWFsLWdyaWRcXFwiPlwiICtcclxuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcImdhbGxlcnktc2luZ2xlIGZpeCBhZ3JlZ2FyUmVjZXRhXFxcIj5cIiArXHJcbiAgICAgICAgXCI8YSBjbGFzcz1cXFwiYnRuLWxnIGJ0bi1jaXJjbGUgYnRuLW91dGxpbmUtbmV3LXdoaXRlXFxcIiBpZD1cXFwiYWdyZWdhclJlY2V0YUJ0blxcXCIgb25jbGljaz1cXFwiYWdyZWdhclJlY2V0YSgpXFxcIiBzdHlsZT1cXFwiZGlzcGxheTpibG9jazsgY29sb3I6d2hpdGU7XFxcIj5BZ3JlZ2FyIHJlY2V0YTwvYT5cIiArXHJcbiAgICAgICAgXCI8L2Rpdj5cIiArXHJcbiAgICAgICAgXCI8L2Rpdj5cIiArXHJcbiAgICAgICAgXCI8L2Rpdj5cIjtcclxuICAgIHJldHVybiBodG1sO1xyXG59IiwidmFyIGlkUmVjZXRhQWN0dWFsID0gJyc7XHJcblxyXG5leHBvcnRzLm1vc3RyYXJSZWNldGFFc3BlY2lmaWNhID0gKGRhdG9zKSA9PiB7XHJcbiAgICBpZFJlY2V0YUFjdHVhbCA9IGRhdG9zWydpZCddO1xyXG4gICAgLy9SZXNldGVhciB0b2RvcyBsb3MgaHRtbFxyXG4gICAgdmFyIGVsZW1lbnRvcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoXCJlbGVtUmVjZXRhRXNwZWNpZmljYVwiKTtcclxuICAgIGNvbnNvbGUubG9nKGVsZW1lbnRvcyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGVsZW1lbnRvcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGVsZW1lbnRvc1tpXS5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgIC8vc2V0IHRpdHVsb1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXR1bG9cIikuaW5uZXJIVE1MID0gZGF0b3Mubm9tYnJlO1xyXG4gICAgY29uc3Qgbm9tYnJlSW1nID0gZGF0b3Mubm9tYnJlLnNwbGl0KFwiIFwiKS5qb2luKFwiLVwiKTtcclxuXHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImltYWdlblJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gXCI8aW1nIGNsYXNzPVxcXCJpbWctZmx1aWRcXFwiIHNyYz1cXFwidXRpbHMvaW1hZ2VuZXMvXCIgKyBub21icmVJbWcgKyBcIi5qcGdcXFwiIHdpZHRoPVxcXCIxMDAlXFxcIiBhbHQ9XFxcIlxcXCI+XCI7XHJcbiAgICBmb3IgKGtleSBpbiBkYXRvcykge1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coa2V5KTtcclxuICAgICAgICBpZiAoa2V5ICE9IFwidGlwb0NvbWlkYVwiICYmIGtleSAhPSBcImNyZWF0ZWRBdFwiICYmIGtleSAhPSBcInVwZGF0ZWRBdFwiICYmIGtleSAhPSBcImlkXCIgJiYga2V5ICE9IFwibm9tYnJlXCIpIHtcclxuICAgICAgICAgICAgaWYgKGtleSA9PSBcImluZ3JlZGllbnRlc1wiKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW5ncmVkaWVudGVzID0gZGF0b3Nba2V5XS5zcGxpdChcIixcIik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluZ3JlZGllbnRlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgKz0gXCI8cCBjbGFzcz1cXFwiZWxlbVJlY2V0YUVzcGVjaWZpY2EgaW5ncmVkaWVudGVcXFwiPi0gXCIgKyBpbmdyZWRpZW50ZXNbaV0gKyBcIjwvcD5cIjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBodG1sO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGtleSA9PSBcImNvbWVudGFyaW9zXCIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWN0dWFsaXphckNvbWVudGFyaW9zKGRhdG9zW2tleV0pXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZihrZXkgPT0gJ2ltYWdlbicpe1xyXG4gICAgICAgICAgICAgICAgLy9kb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuaW5uZXJIVE1MID0gZGF0b3Nba2V5XTtcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChrZXkgKyBcIlJlY2V0YUVzcGVjaWZpY2FcIikuc3JjID0gZGF0b3Nba2V5XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coa2V5LCBkYXRvc1trZXldKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBkYXRvc1trZXldO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnRzLm9idGVuZXJJZFJlY2V0YUFjdHVhbCA9ICgpID0+IHtcclxuICAgIHJldHVybiBpZFJlY2V0YUFjdHVhbDtcclxufVxyXG5cclxuZXhwb3J0cy5hY3R1YWxpemFyQ29tZW50YXJpb3MgPSAoYXJyQ29tZW50YXJpb3MpID0+IHtcclxuICAgIGlmIChhcnJDb21lbnRhcmlvcy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSBcIjxwPlBvciBhaG9yYSBubyBoYXkgY29tZW50YXJpb3MgcGFyYSBlc3RhIHJlY2V0YS48L3A+XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyckNvbWVudGFyaW9zLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGtleSArIFwiUmVjZXRhRXNwZWNpZmljYVwiKS5pbm5lckhUTUwgKz0gYWRkQ29tbWVudChhcnJDb21lbnRhcmlvc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5cclxuZnVuY3Rpb24gYWRkQ29tbWVudChjb21tZW50KSB7XHJcbiAgICBjb25zdCBmZWNoYSA9IGNvbW1lbnRbJ2NyZWF0ZWRBdCddID8gY29tbWVudFsnY3JlYXRlZEF0J10uc2xpY2UoMCwxMCk6ICcnO1xyXG4gICAgcmV0dXJuIFwiPGRpdiBjbGFzcz1cXFwiY29tbWVudC1pdGVtXFxcIj5cIiArXHJcbiAgICAgICAgXCI8ZGl2IGNsYXNzPVxcXCJwdWxsLWxlZnRcXFwiPlwiICtcclxuICAgICAgICBcIjxhPlwiICsgY29tbWVudFsnYXV0b3InXSArIFwiPC9hPjwvZGl2PlwiICtcclxuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcInB1bGwtcmlnaHRcXFwiIHN0eWxlPVxcXCJwYWRkaW5nOiA1cHggMTBweDtcXFwiPlwiICtcclxuICAgICAgICBcIjxpIGNsYXNzPVxcXCJmYSBmYS1jbG9jay1vXFxcIiBhcmlhLWhpZGRlbj10cnVlPjwvaT4gPHNwYW4+XCIgKyBmZWNoYSArIFwiPC9zcGFuPjwvZGl2PlwiICtcclxuICAgICAgICBcIjxkaXYgY2xhc3M9XFxcImRlcy1sXFxcIj5cIiArXHJcbiAgICAgICAgXCI8cD5cIiArIGNvbW1lbnRbJ2NvbnRlbmlkbyddICsgXCI8L3A+PC9kaXY+XCIgK1xyXG4gICAgICAgIFwiPC9kaXY+XCI7XHJcbn1cclxuXHJcblxyXG5cclxuXHJcbiIsIlxyXG5cclxuZXhwb3J0cy5tb3N0cmFyUmVjZXRhRXNwZWNpZmljYSA9ICgpID0+IHtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9wXCIpLnNjcm9sbEludG9WaWV3KHtcclxuICAgICAgICBiZWhhdmlvcjogJ3Ntb290aCcsXHJcbiAgICB9KTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdBZ3JlZ2FyIGNvbWVudGFyaW8nO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiYWdyZWdhclwiKTtcclxufVxyXG5cclxuZXhwb3J0cy5tb3N0cmFyQWdyZWdhclJlY2V0YSA9ICgpID0+IHtcclxuICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWdyZWdhclJlY2V0YVwiKSk7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29udGVuZWRvckxpc3RhUmVjZXRhc1wiKS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbn1cclxuICAgIFxyXG5leHBvcnRzLmF0cmFzID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlY2V0YUVzcGVjaWZpY2FcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZ3JlZ2FyUmVjZXRhXCIpLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxufVxyXG5cclxuZXhwb3J0cy5pckFQYWdQcmluY2lwYWwgPSAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFncmVnYXJSZWNldGFcIikuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb250ZW5lZG9yTGlzdGFSZWNldGFzXCIpLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XHJcbn1cclxuXHJcbmV4cG9ydHMubW9zdHJhckFncmVnYXJDb21lbnRhcmlvID0gKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FncmVnYXJDb21lbnRhcmlvUmVjZXRhRXNwZWNpZmljYScpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvbnRlbmlkb0NvbWVudGFyaW8nKS52YWx1ZSA9ICcnO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuaW5uZXJIVE1MID0gJ0d1YXJkYXInO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiZ3VhcmRhclwiKTtcclxufVxyXG5cclxuZXhwb3J0cy5vY3VsdGFyQWdyZWdhckNvbWVudGFyaW8gPSAoKSA9PiB7XHJcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWdyZWdhckNvbWVudGFyaW9SZWNldGFFc3BlY2lmaWNhJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdidG5Db21lbnRhcmlvcycpLmlubmVySFRNTCA9ICdBZ3JlZ2FyIGNvbWVudGFyaW8nO1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2J0bkNvbWVudGFyaW9zJykuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiYWdyZWdhclwiKTtcclxufVxyXG5cclxuIiwiY29uc3Qgc2VydmljaW9zID0gcmVxdWlyZShcIi4vU2VydmljaW9zL21hbmVqb0V2ZW50b3MuanNcIik7XHJcblxyXG52YXIgYnJvd3NlcmlmeSA9IFwiYnJvd3NlcmlmeSAuL2pzL21haW4uanMgLW8gLi9qcy9idWlsZC9tYWluLmpzIC1kdlwiO1xyXG5cclxuXHJcblxyXG5cclxuc2VydmljaW9zLmVzY3VjaGFyUG9yRXZlbnRvcygpOyJdfQ==
