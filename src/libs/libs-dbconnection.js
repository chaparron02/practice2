const mongoose = require("mongoose");

const conection = () => {
  return new Promise((resolve, reject) => {
    //mongoose.set("useFindAndModify", false);
    mongoose
      .connect(
        "mongodb+srv://chaparron02:chapito02@cluster0.few9i.mongodb.net/cluster0?retryWrites=true&w=majority"
      )
      .then((db) => {
        console.log("gatos conectados");
        resolve(db);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};

module.exports = {
  conection,
};
