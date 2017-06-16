const AWS = require('aws-sdk');
const uuid = require('uuid');

const DocumentClient = new AWS.DynamoDB.DocumentClient();

const processRequest = (method, data) => {
    return new Promise((resolve, reject) => {
        let id, params, text, item;

        switch (method) {
            case 'GET':
                id = data.id;
                params = {
                    TableName: 'todos',
                    Key: {id}
                };

                DocumentClient.get(params, function (err, data) {
                    if (err) {
                        return reject(err);
                    }

                    if (!data.Item) {
                        reject({
                            message: `No item with id "${id}"`
                        });
                    }
                    else {
                        resolve(data.Item);
                    }
                });
                break;
            case 'PUT':
                text = data.text;
                item = {
                    id: uuid.v4(),
                    text
                };
                params = {
                    TableName: 'todos',
                    Item: item
                };

                DocumentClient.put(params, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(item);
                    }
                });
                break;
            case 'PATCH':
                id = data.id;
                text = data.text;
                item = {id, text};
                params = {
                    TableName: 'todos',
                    Item: item
                };

                DocumentClient.put(params, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(item);
                    }
                });
                break;
            case 'DELETE':
                id = data.id;
                params = {
                    TableName: 'todos',
                    Key: {
                        id
                    }
                };

                DocumentClient.delete(params, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve({id});
                    }
                });
                break;
            default:
                reject({
                    message: 'Unsupported method: ' + method
                });
        }
    });
};

exports.handler = (event, context, callback) => {
    let {method, data} = event;
    processRequest(method, data)
        .then(data => {
            console.log(typeof data);

            callback(null, data)
        })
        .catch(error => {
            console.error(error);
            callback(error.message);
        });
};