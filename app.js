const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./backend/db/index.js");
const ruter = require("./backend/rutas");
var app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '5mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

db.sequelize.sync();
app.use(ruter);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
