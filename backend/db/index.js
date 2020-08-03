// const dbConfig = require("../config/db.config.js");
// const Sequelize = require("sequelize");

// const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
//   host: dbConfig.HOST,
//   dialect: dbConfig.dialect,
//   port: dbConfig.PORT
// });

// const db = {};

// db.Sequelize = Sequelize;
// db.sequelize = sequelize;

// db.receta = require("./recetas.db.js")(sequelize, Sequelize);
// db.comentario = require("./comentarios.db.js")(sequelize, Sequelize);

// db.receta.hasMany(db.comentario);
// db.comentario.belongsTo(db.receta);

// module.exports = db;