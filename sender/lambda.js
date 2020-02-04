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

module.exports = (data) => {
  let clientIp = null;
  console.log("EVENT: \n" + JSON.stringify(data, null, 2));
  try {
    clientIp = JSON.parse(data).clientIp;
  } catch (e) {
    console.error("ERROR: While parsing the message content", e);
  }
  const message = `Too many visits from the following IP address: ${clientIp}`;
  if (clientIp) {
    console.log("SEND EMAIL: \n", `Too many visits from the following IP address: ${clientIp}`);
  }
  return message;
};
