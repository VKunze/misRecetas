const fs = require('fs');
const db = require("./db/index.js");
const Receta = db.receta;
const Comentarios = db.comentario;

exports.guardar = async (datos) => {
    //datos.rutaImagen = "../frontend/utils/imagenes/" + datos.rutaImagen;
    try {
        datos.imagen = fs.readFileSync(datos.rutaImagen);
    } catch (err) {
        console.log(err);
    }
    delete datos.rutaImagen;
    return Receta.create(datos)
        .then(data => {
            return (data);
        })
        .catch(e => {
            throw e;
        });
}


exports.guardarComentario = async (datos) => {
    datos.recetumId = datos.idRecetaActual;
    delete datos.idRecetaActual;
    console.log(datos);
    return Comentarios.create(datos)
        .then(data => {
            return (data);
        })
        .catch(e => {
            throw e;
        });
}

exports.obtenerTodas = () => {
    return Receta.findAll()
        .then(data => {
            return data;
        }).catch(err => {
            throw err;
        });
}

exports.obtenerReceta = async (nombreReceta) => {
    return Receta.findOne({ where: { nombre: nombreReceta }, include: [{ model: Comentarios }] })
        .then(data => {
            data["comentarios"] = data.getComentarios();
            return data;
        })
        .catch(err => {
            throw err;
        });
};

exports.obtenerComentarios = async (idReceta) => {
    return Comentarios.findAll({ where: { recetumId: idReceta } })
        .then(data => {
            return data;
        })
        .catch(err => {
            throw err;
        });
};

exports.eliminarReceta = async (nombreReceta) => {
    return Receta.destroy({ where: { nombre: nombreReceta }, include: [{ model: Comentarios }] })
        .then(data => {
            return data;
        })
        .catch(err => {
            throw err;
        });
}