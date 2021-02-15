const { Sequelize, DataTypes } = require('sequelize');

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