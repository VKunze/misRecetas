const fs = require('fs');
const db = require("./db/index.js");
const Receta = db.receta;
const Comentarios = db.comentario;
const Ingredientes = db.ingrediente;

/**
 * 
 * @param {dictionary}  datos   Ejemplo: 
 *                              {
 *                                  nombre: receta1,
 *                                  tipoComida: salado,
 *                                  autor: vaiti,
 *                                  descripcion: para hacer esta receta, haga X,
 *                                  rutaImagen: unaRuta,
 *                                  ingredientes: [{nombre: a, cantidad: 1, unidadDeMedida: taza}, {nombre: b, cantidad: 1, unidadDeMedida: taza}]    
 *                              }
 */
exports.guardar = async (datos) => {
    try {
        if (datos.rutaImagen) {
            datos.imagen = fs.readFileSync(datos.rutaImagen);
        }
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
    for (const i in ingredientes) {
        await receta.createIngrediente(ingredientes[i])
    }
    return receta
}


/**
 * 
 * @param {dictionary}  datos   Ejemplo: 
 *                              {
 *                                  idReceta: receta1,
 *                                  comentario: {
 *                                      contenido: contenido,
 *                                      autor: autor
 *                                  }
 *                              }
 */
exports.guardarComentario = async (datos) => {
    var receta = await this.obtenerReceta(datos.idReceta); 
    return receta.createComentario(datos.comentario)
        .then(data => {
            return data;
        }).catch(err => {
            throw err;
        });
}

exports.obtenerTodas = () => {
    return Receta.findAll({include: [{ model: Ingredientes }] })
        .then(data => {
            console.log("data: ", data);
            return data;
        }).catch(err => {
            throw err;
        });
}

exports.obtenerReceta = async (idReceta) => {
    return Receta.findOne({ where: { id: idReceta }, include: [{ model: Comentarios }, { model: Ingredientes }] })
        .then(data => {
            data["comentarios"] = data.getComentarios();
            data["ingredientes"] = data.getIngredientes();
            return data;
        })
        .catch(err => {
            console.log("Error: ", err)
            throw err;
        });
};

exports.obtenerComentarios = async (idReceta) => {
    var receta = await this.obtenerReceta(idReceta); 
    return receta.getComentarios();
};

exports.eliminarReceta = async (idReceta) => {
    return Receta.destroy({ where: { id: idReceta }, include: [{ model: Comentarios }] })
        .then(data => {
            return data;
        })
        .catch(err => {
            throw err;
        });
}