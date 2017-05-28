const AWS = require('aws-sdk');
const uuid = require('uuid');

const DocumentClient = new AWS.DynamoDB.DocumentClient();

const getResponse = ({statusCode, headers, result}) => {
    let response = {statusCode};

    if (headers) {
        response.headers = headers;
    }
    if (result) {
        response.body = JSON.stringify(result);
    }

    return response;
};

const processRequest = (event) => {
    switch (event.httpMethod) {
        case 'GET':
            return new Promise((resolve, reject) => {
                if (!event.queryStringParameters) {
                    return reject({
                        message: 'Query string is not provided'
                    });
                }

                let {id} = event.queryStringParameters;

                if (id == null) {
                    return reject({
                        message: 'Parameter "id" is not provided'
                    });
                }

                let params = {
                    TableName: 'todos',
                    Key: {id}
                };

                DocumentClient.get(params, function(err, data) {
                    if (err) {
                        return reject(err);
                    }

                    if (!data.Item) {
                        return reject({
                            message: `No item with id "${id}"`
                        });
                    }

                    resolve(data.Item);
                });
            });
        case 'PUT':
            return new Promise((resolve, reject) => {
                if (!event.body) {
                    return reject({
                        message: "No request body provided"
                    });
                }

                let {text} = JSON.parse(event.body);

                if (text == null) {
                    return reject({
                        message: 'Parameter "text" is not provided'
                    });
                }

                let item = {
                    id: uuid.v4(),
                    text
                };
                let params = {
                    TableName: 'todos',
                    Item: item
                }

                DocumentClient.put(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(item);
                });
            });
        case 'PATCH':
            return new Promise((resolve, reject) => {
                if (!event.body) {
                    return reject({
                        message: "No request body provided"
                    });
                }

                let {id, text} = JSON.parse(event.body);

                if (id == null) {
                    return reject({
                        message: 'Parameter "id" is not provided'
                    });
                }
                if (text == null) {
                    return reject({
                        message: 'Parameter "text" is not provided'
                    });
                }

                let item = {id, text};
                let params = {
                    TableName: 'todos',
                    Item: item
                };

                DocumentClient.put(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(item);
                });
            });
        case 'DELETE':
            return new Promise((resolve, reject) => {
                if (!event.queryStringParameters) {
                    return reject({
                        message: 'Query string is not provided'
                    });
                }

                let {id} = event.queryStringParameters;

                if (id == null) {
                    return reject({
                        message: 'Property "id" is not provided'
                    });
                }

                let params = {
                    TableName: 'todos',
                    Key: {
                        id
                    }
                };

                DocumentClient.delete(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve({id});
                });
            });
        default:
            return new Promise((resolve, reject) => {
                reject({
                    message: 'Unsupported HTTP method: ' + event.httpMethod
                });
            });
    }
}

exports.handler = (event, context, callback) => {
    let result;
    let statusCode = 200;
    let headers = {
        'Content-Type': 'application/json'
    };

    processRequest(event)
        .then(data => {
            result = data;
            callback(null, getResponse({statusCode, headers, result}));
        })
        .catch(err => {
             console.error(err);
             if (err.message) {
                 result = {
                     message: err.message
                 };
             }
             callback(null, getResponse({statusCode: 400, headers, result}));
        });

};