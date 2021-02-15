module.exports = (sequelize, Sequelize) => {
    const Ingrediente = sequelize.define("ingrediente", {
      nombre: {
        type: Sequelize.STRING
      },
      cantidad: {
        type: Sequelize.FLOAT
      },
      unidadDeMedida: {
          type: Sequelize.STRING
      }
    });
    return Ingrediente;
  };