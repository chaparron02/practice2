const express = require("express");
const app = express();
const { conection } = require("../libs/libs-dbconnection");
const getClienteSchema = require("../model/clientes");
const { urlencoded, json } = require("body-parser");
const csv = require("csvtojson");
const busboy = require("connect-busboy");
var path = require("path");
const { mongo } = require("mongoose");

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

app.post("/crearCliente", async (req, res) => {
  const Cliente = getClienteSchema();
  const db = await conection();
  const body = req.body;
  body.state = "recibido";
  const cliente1 = new Cliente(body);
  const res1 = await cliente1.save();

  res.status(200).send({ id: res1._id.toString() });
});

app.post("/convertirCsv", async (req, res) => {
  try {
    const Cliente = getClienteSchema();
    const db = await conection();
    req.pipe(req.busboy);
    req.busboy.on("file", function (fieldname, file, filename) {
      file.on("data", async (data) => {
        // const csv = fs.readFileSync(data)
        const daticos = await new Promise((resolve, reject) => {
          csv()
            .fromString(data.toString())
            .then((jsonobj) => {
              resolve(jsonobj);
            });
        });
        daticos.forEach(async (cliente) => {
          cliente.state = "Cliente ha recibido paquete";
          const cliente1 = new Cliente(cliente);
          await cliente1.save();
        });
      });
    });

    res.send("todo bien");
  } catch (error) {
    res.status(500).send({ message: "incorrecto" });
  }
});

app.get("/consultarEnvio", async (req, res) => {
  const Cliente = getClienteSchema();
  const db = await conection();
  const props = req.query;

  if (props.id) {
    let newid;
    try {
      newid = mongo.ObjectId(props.id);
    } catch (error) {
      res.status(500).send({ message: "id invalido" });
      return;
    }
    const envio = await Cliente.findById(newid);
    if (envio) {
      res.send(envio);
    } else {
      res.status(500).send({ message: "envio no existe" });
      return;
    }
  } else if (props.cedula) {
    const envio = await Cliente.find({ cedula: props.cedula }).exec();
    if (envio) {
      res.send(envio);
    } else {
      res.status(500).send({ message: "envio no existe" });
      return;
    }
  } else {
    res.status(500).send({ message: "debe tener id o cedula" });
  }
});

app.get("/cambiarEstado", async (req, res) => {
  const Cliente = getClienteSchema();
  const db = await conection();
  const props = req.query;

  if (props.cod_envio && props.state) {
    const docres = await Cliente.find({ cod_envio: props.cod_envio }).exec();
    if (docres) {
      const envio = docres[0];
      envio.state = props.state;
      console.log(envio);
      const cliente1 = new Cliente(envio);
      const resul = await cliente1.save();
      res.send(resul);
    } else {
      res.status(500).send({ message: "envio no existe" });
      return;
    }
  } else {
    res.status(500).send({ message: "debe tener state y cod_envio" });
  }
});
