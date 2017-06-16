const AWS = require('aws-sdk');
const uuid = require('uuid');

const DocumentClient = new AWS.DynamoDB.DocumentClient();
const Lambda = new AWS.Lambda();

const getResponse = ({statusCode = 200, result = {}}) => {
    let headers = {
        'Content-Type': 'application/json'
    };

    return {
        statusCode,
        headers,
        body: JSON.stringify(result)
    }
};

const validate = (data) => {
    return new Promise((resolve, reject) => {
        Lambda.invoke({
            FunctionName: 'validate',
            Payload: JSON.stringify(data)
        }, (error, data) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(data);
            }
        });
    });
};

const processRequest = (event) => {
    return new Promise((resolve, reject) => {
        let method = event.httpMethod;

        validate({
            method,
            data: {
                body: event.body,
                queryStringParameters: event.queryStringParameters
            }
        })
            .then((validateResult) => {
                let payload = JSON.parse(validateResult.Payload);

                if (!payload.isValid) {
                    return reject({
                        message: payload.errorMessage
                    });
                }

                Lambda.invoke({
                    FunctionName: 'DB',
                    Payload: JSON.stringify({
                        method,
                        data: Object.assign({}, JSON.parse(event.body || '{}'), event.queryStringParameters || {})
                    })
                }, (error, data) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(JSON.parse(data.Payload));
                });
            })
            .catch(error => {
                reject(error);
            });
    });
};

exports.handler = (event, context, callback) => {
    processRequest(event)
        .then(data => {
            let result = data;
            callback(null, getResponse({result}));
        })
        .catch(err => {
            console.error(err);
            let result;
            if (err.message) {
                result = {
                    message: err.message
                };
            }
            callback(null, getResponse({statusCode: 400, result}));
        });

};