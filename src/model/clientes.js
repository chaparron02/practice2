const mongoose = require("mongoose");

const { Schema } = mongoose;
const getClienteSchema = () => {
  return mongoose.model(
    "clientes",
    new Schema({
      cod_envio: { type: String, required: true },
      address_from_name: { type: String, required: true },
      address_from_email: { type: String, required: true },
      address_from_street1: { type: String, required: true },
      address_from_city: { type: String, required: true },
      address_from_province: { type: String, required: true },
      address_from_postal_code: { type: String, required: true },
      address_from_country_code: { type: String, required: true },
      address_to_name: { type: String, required: true },
      address_to_email: { type: String, required: true },
      address_to_street1: { type: String, required: true },
      address_to_city: { type: String, required: true },
      address_to_province: { type: String, required: true },
      address_to_postal_code: { type: String, required: true },
      address_to_country_code: { type: String, required: true },
      parcel_length: { type: String, required: true },
      parcel_width: { type: String, required: true },
      parcel_height: { type: String, required: true },
      parcel_dimensions_unit: { type: String, required: true },
      parcel_weight: { type: String, required: true },
      parcel_weight_unit: { type: String, required: true },
      state: { type: String, required: true },
      cedula: { type: String, required: true },
    })
  );
};

module.exports = getClienteSchema;
