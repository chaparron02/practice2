const express = require("express");
const app = express();
const { conection } = require("./src/libs/libs-dbconnection");
const getClienteSchema = require("./src/model/clientes");
const { urlencoded, json } = require("body-parser");
const csv = require("csvtojson");
const busboy = require("connect-busboy");
var path = require("path");
const { mongo } = require("mongoose");
const cors = require("cors");
const { copyFileSync } = require("fs");

// const helmet = require("helmet");
// const morgan = require("morgan");

const puerto = process.env.PORT || 3000;
app.options('*', cors({ credentials: true }))

app.listen(puerto, () => console.log(`App started listening at 3000`));
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(busboy());
app.use(express.static(path.join(__dirname, "public")));



app.get("/health", async (req, res) => {
  //se mira que sirva la api
  console.log(req.body);
  res.status(200).send(req.body);
});

app.post("/crearCliente",  async (req, res) => {
  //crea un cliente nuevo
  
  const db = await conection();
  const Cliente = getClienteSchema();
  const body = req.body;
  body.state = "recibido";
  const cliente1 = new Cliente(body);
  const res1 = await cliente1.save();

  res.status(200).send({ id: res1._id.toString() });
});

app.post("/convertirCsv", async (req, res) => {
  //recibe el archivo, y lo convierte en json y lo envia a la db
  try {
    const Cliente = getClienteSchema();
    const db = await conection();
    req.pipe(req.busboy);
    req.busboy.on("file", function (fieldname, file, filename) {
      file.on("data", async (data) => {
        // const csv = fs.readFileSync(data)
        console.log(data);
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
    console.log(error);
    res.status(500).send({ message: "incorrecto" });
  }
});

app.get("/consultarEnvio", async (req, res) => {
  //consulta por id y por cedula
  
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
  //cambia el estado del envio
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

app.get("/enviadoRecibido", async (req, res) => {
  //consultar cliente
  const db = await conection();
  const Cliente = getClienteSchema();
  const props = req.query;

  if (props.name) {
    let envios = await Cliente.find({ address_from_name: props.name }).exec();
    let recibidos = await Cliente.find({
      address_from_name: props.name,
    }).exec();
    if (envios) {
      envios = envios.map((envio) => {
        return { ...envio._doc, tipo_cliente: "envia" };
      });
    }

    if (recibidos) {
      recibidos = recibidos.map((recibido) => {
        return { ...recibido._doc, tipo_cliente: "recibe" };
      });
    }
    const res2 = [...envios, ...recibidos];
    if (res2) {
      res.send(res2);
    } else {
      res
        .status(500)
        .send({ message: "este nombre no ha enviado ningun paquete" });
      return;
    }
  } else {
    res.status(500).send({ message: "Falta el nombre" });
  }
});
