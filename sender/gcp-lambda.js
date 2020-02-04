const prepareMessage = (data) => {
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

exports.sendEmail = (req, res) => {
  const message = prepareMessage(Buffer.from(req.body.message.data, 'base64').toString());
  res.status(200).send(message || 'Message was corrupted');
};
