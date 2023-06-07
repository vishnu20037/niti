const Joi = require("joi");
// Define the schema for the Detail object
const detailSchema = Joi.object({
  consentStart: Joi.date().iso(),
  consentExpiry: Joi.date().iso(),
  Customer: Joi.object({
    id: Joi.string(),
  }),
  FIDataRange: Joi.object({
    from: Joi.date().iso(),
    to: Joi.date().iso(),
  }),
  consentMode: Joi.string(),
  consentTypes: Joi.array().items(Joi.string()),
  fetchType: Joi.string(),
  Frequency: Joi.object({
    value: Joi.number().integer(),
    unit: Joi.string(),
  }),
  DataFilter: Joi.array().items(
    Joi.object({
      type: Joi.string(),
      value: Joi.string(),
      operator: Joi.string(),
    })
  ),
  DataLife: Joi.object({
    value: Joi.number().integer(),
    unit: Joi.string(),
  }),
  DataConsumer: Joi.object({
    id: Joi.string(),
  }),
  Purpose: Joi.object({
    Category: Joi.object({
      type: Joi.string(),
    }),
    code: Joi.string(),
    text: Joi.string(),
    refUri: Joi.string().uri(),
  }),
  fiTypes: Joi.array().items(Joi.string()),
}).options({ allowUnknown: true });
module.exports = detailSchema;
