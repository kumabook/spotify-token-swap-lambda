const AWS = require('aws-sdk');

const argv = process.argv;

const env = process.env.ENV || 'develop';

AWS.config.update({ region: process.env.AWS_DEFAULT_REGION });

const lambda = new AWS.Lambda({ apiVersion: '2015-03-31' });

const params = {
  code: 'xxxx',
};

const functionName = 'spotify_token_swap';

const parameters = {
  FunctionName:   functionName,
  InvocationType: "RequestResponse",
  LogType:        "Tail",
  Payload:        JSON.stringify(params),
};
lambda.invoke(parameters, (err, data) => {
  if (err) {
    console.log(err, err.stack);
  } else {
    console.log(data);
  }
});
