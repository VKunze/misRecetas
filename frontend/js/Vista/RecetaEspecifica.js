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


