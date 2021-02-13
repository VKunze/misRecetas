const fs = require('fs');
const db = require("./db/index.js");
const Receta = db.receta;
const Comentarios = db.comentario;

/**
 * 
 * @param {dictionary}  datos   Ejemplo: 
 *                              {
 *                                  nombre: receta1,
 *                                  tipoComida: salado,
 *                                  autor: vaiti,
 *                                  descripcion: para hacer esta receta, haga X,
 *                                  rutaImagen: unaRuta,
 *                                  ingredientes: [{propsIng1}, {propsIng2}, {propsIng3}]    
 *                              }
 */
exports.guardar = async (datos) => {
    try {
        datos.imagen = fs.readFileSync(datos.rutaImagen);
    } catch (err) {
        console.log(err);
    }
    delete datos.rutaImagen;

    var ingredientes = datos.ingredientes
    delete datos.ingredientes;

    var receta = await Receta.create(datos)
        .catch(e => {
            throw e;
        });
    for (const ingrediente in ingredientes) {
        await receta.createIngrediente(ingrediente)
    }
    return receta
}


exports.guardarComentario = async (datos) => {
    var receta = await obtenerReceta(datos.nombreReceta);
    return receta.createComentario(datos.comentario)
        .then(data => {
            return data;
        }).catch(err => {
            throw err;
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
    return Receta.findOne({ where: { nombre: nombreReceta }, include: [{ model: Comentarios }, { model: Ingredientes }] })
        .then(data => {
            data["comentarios"] = data.getComentarios();
            data["ingredientes"] = data.getIngredientes();
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