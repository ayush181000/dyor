const Joi = require('joi');

const signupSchema = Joi.object({
    name: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().required().email(),
    referId: Joi.string().optional()
})

module.exports = {
    signupSchema
}