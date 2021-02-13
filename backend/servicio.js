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
 *                                  ingredientes: [{propsIng1}, {propsIng2}, {propsIng3}]    
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
 *                                  nombreReceta: receta1,
 *                                  comentario: {
 *                                      contenido: contenido,
 *                                      autor: autor
 *                                  }
 *                              }
 */
exports.guardarComentario = async (datos) => {
    console.log("datos", datos, "nombre: ", datos.nombreReceta);
    var receta = await obtenerReceta(datos.nombreReceta); 
    console.log("receta: ", receta)
    console.log("comentario: ", datos.comentario)   
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
    console.log("obteniendo receta: ", nombreReceta)
    return Receta.findOne({ where: { nombre: nombreReceta }, include: [{ model: Comentarios }, { model: Ingredientes }] })
        .then(data => {
            console.log("data: ", data)
            data["comentarios"] = data.getComentarios();
            data["ingredientes"] = data.getIngredientes();
            console.log("Data 2 ", data)
            return data;
        })
        .catch(err => {
            console.log("Error: ", err)
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