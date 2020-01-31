const prepareSesParams = clientIp => ({
  Destination: {
    ToAddresses: ['receiver@gmail.com']
  },
  Message: {
    Body: {
      Text: {
        Data: `Too many visits from the following IP address: ${clientIp}`
      }
    },
    Subject: {
      Data: 'Warning test'
    }
  },
  Source: 'sender@gmail.com'
});

exports.handler = (event, context, callback) => {
  event.Records.forEach(record => {
    let clientIp = null;
    console.log("EVENT: \n" + JSON.stringify(event, null, 2));
    try {
      clientIp = JSON.parse(record.body).clientIp;
    } catch (e) {
      console.error("ERROR: While parsing the message content", e);
    }
    if (clientIp) {
      console.log("SEND EMAIL: \n", `Too many visits from the following IP address: ${clientIp}`);
    }

  });
  return context.logStreamName;
};
