const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

var sequelize = "";
if (process.env.DATABASE_URL) {
  // the application is executed on Heroku ... use the postgres database
  var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/)

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging:  true //false
  });
} else {
  // the application is executed on the local machine ... use mysql
  sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    port: dbConfig.PORT
  });
}
const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.receta = require("./recetas.db.js")(sequelize, Sequelize);
db.comentario = require("./comentarios.db.js")(sequelize, Sequelize);

db.receta.hasMany(db.comentario);
db.comentario.belongsTo(db.receta);

module.exports = db;