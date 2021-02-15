var servicio = require("./servicio");

exports.guardarReceta = async (req, res) => {
    try {
        const resultado = await servicio.guardar(req.body);
        res.status(200).send({
            resultado,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado, intente de nuevo mas tarde!'
        });
    }
}

exports.guardarComentario = async (req, res) => {
    try {
        const resultado = await servicio.guardarComentario(req.body);
        res.status(200).send({
            resultado,
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado, intente de nuevo mas tarde!'
        });
    }
}

exports.obtenerRecetas = async (req, res) => {
    try {
        const respuesta = await servicio.obtenerTodas();
        res.status(200).send({
            success: true,
            recetas: respuesta
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado, intente de nuevo mas tarde!'
        });
    }
}

exports.obtenerComentarios = async (req, res) => {
    try {
        const respuesta = await servicio.obtenerComentarios(req.body.idReceta);
        res.status(200).send({
            success: true,
            comentarios: respuesta
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado, intente de nuevo mas tarde!'
        });
    }
}

exports.obtenerRecetaEspecifica = async (req, res) => {
    try {
        console.log(req.body);
        const idReceta = req.body.idReceta;
        const respuesta = await servicio.obtenerReceta(idReceta);
        res.status(200).send({
            success: true,
            datos: respuesta
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado, intente de nuevo mas tarde!'
        });
    }
}

exports.eliminarReceta = async (req, res) => {
    try {
        const idReceta = req.body.idReceta;
        const respuesta = await servicio.eliminarReceta(idReceta);
        res.status(200).send({
            success: true,
            datos: respuesta
        });
    } catch (e) {
        res.status(500).send({
            success: false,
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Ha ocurrido un error inesperado, intente de nuevo mas tarde!'
        });
    }
}
