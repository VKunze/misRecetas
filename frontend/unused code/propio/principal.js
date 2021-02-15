/* var recetas = {
    "arrollados-de-primavera": {
        "tipoComida": "salado",
        "autor": "Internet",
        "contenido": ["1 huevo", "3 tazas harina", "5 pancitos"],
        "descripcion": "Poner todo junto en una mezcla asombrosa y vualá, tremendos arrolladitos de primavera exquisitos!!"
    },
    "otra": {}
} */

async function listarRecetas() {
    var respuesta = await mandarABackend("GET", "/obtenerRecetas");
    var recetas = respuesta["recetas"];
    var html = "";
    for (var i = 0; i < recetas.length; i++) {
        var nombreImg = recetas[i].nombre.split(" ").join("-");
        html += "<div class=\"col-lg-4 col-md-6 special-grid " + recetas[i].tipoComida + "\" style=\"width=247px\">" +
            "<div class=\"gallery-single fix\">" +
            "<img src=\"utils/imagenes/" + nombreImg + ".jpg\" class=\"img-fluid adjust-img\" alt=\"Image\">" +
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
    for (var i = 0; i < elementos.length; i++) {
        elementos[i].innerHTML = "";
    }

    //conseguir datos
    var respuesta = await mandarABackend("POST", "/obtenerRecetaEspecifica", id.split("-").join(" "));
    var datos = respuesta.datos;
    //set titulo
    document.getElementById("titulo").innerHTML = datos.nombre;
    const nombreImg = datos.nombre.split(" ").join("-");

    document.getElementById("imagenRecetaEspecifica").innerHTML = "<img class=\"img-fluid\" src=\"utils/imagenes/" + nombreImg + ".jpg\" width=\"100%\" alt=\"\">";
    for (key in datos) {
        if (key != "tipoComida" && key != "createdAt" && key != "updatedAt" && key != "id" && key != "nombre") {
            if (key == "ingredientes") {
                var html = "";
                var ingredientes = datos[key].split(",");
                for (var i = 0; i < ingredientes.length; i++) {
                    html += "<p class=\"elemRecetaEspecifica ingrediente\">- " + ingredientes[i] + "</p>";
                }
                document.getElementById(key + "RecetaEspecifica").innerHTML = html;
            } else {
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
    var html = "<div class=\"col-lg-4 col-md-6 special-grid dulce salado\">" +
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
    if (params) {
        Http.setRequestHeader("Content-type", "application/json");
        if (uri == "/obtenerRecetaEspecifica") {
            params = '{"nombreReceta":"' + params + '"}'
        }
    }

    Http.send(params);

    if(uri != "/guardarReceta"){
        return JSON.parse(Http.responseText);
    } else {
        return "OK";
    }  
}

module.exports = {
    listarRecetas
}