// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure
const accountSid = process.env.twilio_sid;
const authToken = process.env.authToken;
const verifySid = 'VA627c33ab3023aa319bf6351a0367d2c8';
const client = require('twilio')(accountSid, authToken);

const sendOtp = (req:any, res:any) => {
  const { phone } = req.body;
  client.verify.v2
    .services(verifySid)
    .verifications.create({ to: phone, channel: 'sms' })
    .then(() => {
      res.send('otp sent');
    });
};
export default sendOtp;
