// insecure code sample
// syntax of lambda function in node.js
// with exports.handler as the name of the handler function
// two main arguments: event is the input payload from the trigger that invoked lambda
//            context is the aws lambda metadata object about invocation and environment
// function code: instrtuctions for processing the event and using context
// return or callback with the result ad;
exports.handler = async (event, context) => {
  const policy = {
    Action: '*',
    Resource: '*',
  };
  const awsSecret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
};
