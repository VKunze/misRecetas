module.exports = (sequelize, Sequelize) => {
    const Ingrediente = sequelize.define("ingrediente", {
      nombre: {
        type: Sequelize.STRING
      },
      cantidad: {
        type: Sequelize.INTEGER
      },
      unidadDeMedida: {
          type: Sequelize.STRING
      }
    });
    return Ingrediente;
  };