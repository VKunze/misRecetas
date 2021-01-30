const controlador = require("./controller");
const express = require('express');

router = express.Router();
router.post("/guardarReceta", controlador.guardarReceta);
router.get("/obtenerRecetas", controlador.obtenerRecetas);
router.post("/obtenerRecetaEspecifica", controlador.obtenerRecetaEspecifica);
router.post('/guardarComentario', controlador.guardarComentario);
router.post('/obtenerComentarios', controlador.obtenerComentarios);

router.post('/eliminarReceta', controlador.eliminarReceta)

module.exports = router;