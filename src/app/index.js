const express = require("express");
const app = express();
const { conection } = require("../libs/libs-dbconnection");
const getClienteSchema = require("../model/clientes");
const { urlencoded, json } = require("body-parser");
const busboy = require("connect-busboy");
const fs = require("fs");
var path = require("path");


/*
require("module-alias/register");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const emoji = require("node-emoji");
const passport = require("passport");


const strategyJWT = require("@appConfig/passport");
const Routes = require("./routes/createRouter");
*/
app.listen(3000, () => console.log(`App started listening at 3000`));

app.use(urlencoded({ extended: false }));
app.use(json());
app.use(busboy());
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", async (req, res) => {
  console.log(req.body);
  res.status(200).send(req.body);
});

app.get("/crearCliente", async (req, res) => {
  const Cliente = getClienteSchema();
  const db = await conection();
  const cliente1 = new Cliente({
    cod_envio: "ORD00001",
    address_from_name: "Juan Ruiz",
    address_from_email: "jr@example.com",
    address_from_street1: "Av. Principal #123",
    address_from_city: "Azcapotzalco",
    address_from_province: "Ciudad de México",
    address_from_postal_code: "2900",
    address_from_country_code: "MX",
    address_to_name: "Isabel Arredondo",
    address_to_email: "isabel@example.com",
    address_to_street1: "Av. las torres #123",
    address_to_city: "Puebla",
    address_to_province: "Puebla",
    address_to_postal_code: "72450",
    address_to_country_code: "MX",
    parcel_length: "40",
    parcel_width: "40",
    parcel_height: "40",
    parcel_dimensions_unit: "CM",
    parcel_weight: "5",
    parcel_weight_unit: "KG",
  });
  await cliente1.save();
  console.log(cliente1);
  res.status(200).send(`eso creo`);
});

app.post("/convertirCsv", async (req, res) => {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on("file", function (fieldname, file, filename) {
    file.on("data", (data) => {
     // const csv = fs.readFileSync(data)
      console.log(data.toString());
    });
  });
  res.send("todo bien");
});
