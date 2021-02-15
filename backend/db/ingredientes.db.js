const { DataTypes } = require("sequelize/types");

module.exports = (sequelize, Sequelize) => {
  const Ingrediente = sequelize.define("ingrediente", {
    nombre: {
      type: Sequelize.STRING
    },
    cantidad: {
      type: DataTypes.DOUBLE
    },
    unidadDeMedida: {
      type: Sequelize.STRING
    }
  });
  return Ingrediente;
};