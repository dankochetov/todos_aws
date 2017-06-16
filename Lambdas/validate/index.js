const AWS = require('aws-sdk');
const Joi = require('joi');

const idSchema = Joi.string().guid({
    version: 'uuidv4'
});

const textSchema = Joi.string().min(1);

const getSchema = Joi.object().keys({
    queryStringParameters: Joi.object().keys({
        id: idSchema.required()
    }).required()
}).required();

const putSchema = Joi.object().keys({
    body: Joi.object().keys({
        text: textSchema.required()
    }).required()
}).required();

const patchSchema = Joi.object().keys({
    body: Joi.object().keys({
        id: idSchema.required(),
        text: textSchema.required()
    }).required()
}).required();

const deleteSchema = Joi.object().keys({
    queryStringParameters: Joi.object().keys({
        id: idSchema.required()
    })
}).required();

const methodSchema = Joi.any().valid([
    'GET',
    'PUT',
    'PATCH',
    'DELETE'
]).required();

exports.handler = (event, context, callback) => {
    let {method, data} = event;
    let result = Joi.validate(method, methodSchema, {allowUnknown: true});

    if (!result.error) {
        switch (event.method) {
            case 'GET':
                result = Joi.validate(data, getSchema, {allowUnknown: true});
                break;
            case 'PUT':
                result = Joi.validate(data, putSchema, {allowUnknown: true});
                break;
            case 'PATCH':
                result = Joi.validate(data, patchSchema, {allowUnknown: true});
                break;
            case 'DELETE':
                result = Joi.validate(data, deleteSchema, {allowUnknown: true});
                break;
        }
    }

    if (result.error) {
        callback(result.error);
    }
    else {
        callback(null, {isValid: true});
    }
};