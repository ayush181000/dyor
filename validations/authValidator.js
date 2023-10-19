const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required().email(),
    referId: Joi.string().optional()
})

const loginSchema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required()
})

module.exports = {
    signupSchema,
    loginSchema
}