import crypto from 'crypto';
const algorithm: string = 'aes-256-cbc';
const secret: string = 'd6F3Efeq';


const encrypt = (text: string) => {
  var cipher = crypto.createCipher(algorithm, secret)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

const decrypt = (text: string) => {
  var decipher = crypto.createDecipher(algorithm, secret)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

export default { encrypt, decrypt };