// insecure code sample
exports.handler = async (event, context) => {
    const policy = {
      Action: '*',
      Resource: '*'
    };
    const awsSecret = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";

  };