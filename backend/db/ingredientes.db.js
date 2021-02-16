const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize, Sequelize) => {
  const Ingrediente = sequelize.define("ingrediente", {
    nombre: {
      type: Sequelize.STRING
    },
    cantidad: {
      type: DataTypes.STRING
    },
    unidadDeMedida: {
      type: Sequelize.STRING
    }
  });
  return Ingrediente;
};