const AWS = require('aws-sdk');
const uuid = require('uuid');

const S3 = new AWS.S3();

const processRequest = ({method, data}) => {
    return new Promise((resolve, reject) => {
        let id, params, text, item, content;

        switch (method) {
            case 'GET':
                params = {
                    Bucket: 's3todos',
                    Key: data.id
                };

                S3.getObject(params, function(err, data) {
                    if (err) {
                        console.error(err);

                        reject(err);
                    }
                    else {
                        resolve(JSON.parse(data.Body.toString('ascii')));
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
                    Bucket: 's3todos',
                    Body: JSON.stringify(item),
                    Key: item.id
                };

                S3.putObject(params, function(err, data) {
                    if (err) {
                        console.error(err);

                        reject(err);
                    }
                    else {
                        resolve(item);
                    }
                });

                break;
            case 'PATCH':
                ({id, text} = data);

                params = {
                    Bucket: 's3todos',
                    Key: id
                };

                S3.getObject(params, function(err, data) {
                    if (err) {
                        console.error(err);

                        callback(err);
                    }
                    else {
                        content = JSON.parse(data.Body.toString('ascii'));

                        content.text = text;

                        params.Body = JSON.stringify(content);

                        S3.putObject(params, (err, data) => {
                            if (err) {
                                return reject(err);
                            }

                            resolve({
                                id,
                                text
                            });
                        });
                    }
                });

                break;
            case 'DELETE':
                ({id} = data);

                params = {
                    Bucket: 's3todos',
                    Key: id
                };

                S3.deleteObject(params, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve({id});
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
    processRequest({method, data})
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            console.error(error);

            callback(error.message);
        });
};