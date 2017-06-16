const AWS = require('aws-sdk');

const Lambda = new AWS.Lambda();

const processRequest = ({type, method, data}) => {
    return new Promise((resolve, reject) => {
        switch (type) {
            case 'dynamodb':
                Lambda.invoke({
                    FunctionName: 'dynamodb',
                    Payload: JSON.stringify({
                        method,
                        data
                    })
                }, (error, data) => {
                    if (error) {
                        return reject(error);
                    }

                    resolve(data);
                });

                break;
            case 's3':
                Lambda.invoke({
                    FunctionName: 's3',
                    Payload: JSON.stringify({
                        method,
                        data
                    })
                }, (err, data) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(data);
                });

                break;
            default:
                reject({
                    message: 'No such DB type: ' + method
                });
        }
    });
};

exports.handler = (event, context, callback) => {
    console.log(event);

    let {data: {type}, method, data} = event;

    processRequest({type, method, data})
        .then(data => {
            callback(null, JSON.parse(data.Payload))
        })
        .catch(error => {
            callback(error);
        });
};