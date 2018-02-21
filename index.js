const rp = require('request-promise');
const crypto = require('crypto');

const TIMEOUT = 5000;

class Abucoins {
    constructor() {
        this.endpoint = 'https://api.abucoins.com';
        this.credentials = {
            key: '10-30DWTDFOC17GE5IVL6ALUQBUN8Y4SF39',
            secret: 'M1Y1N0oHZ2RSW7teVE5mbzB7xX0iP0NZS7x6LyVVUE1PsVMqV2hfNEBbUSYuWiQj',
            passphrase: '34y42c2bfce',
        }
    }

    _jsonRequest(options) {
        options.timeout = TIMEOUT;
        options.json = true;

        return rp(options);
    }

    _getHeaders(sign, timestamp) {
        return {
            'AC-ACCESS-KEY': this.credentials.key,
            'AC-ACCESS-SIGN': sign,
            'AC-ACCESS-TIMESTAMP': timestamp,
            'AC-ACCESS-PASSPHRASE': this.credentials.passphrase,
        };
    }

    signAndRequest(method, path, body = {}) {
        const timestamp = Math.floor(new Date() / 1000);
        let options = {
            uri: `${this.endpoint}${path}`,
            method: method,
            body: body,
        };
        let string = timestamp + method + path;
        if (Object.keys(body).length > 0) {
            string += JSON.stringify(body);
        }
        const sign = crypto.createHmac('sha256', Buffer.from(this.credentials.secret, 'base64'))
            .update(string)
            .digest('base64');
        options.headers = this._getHeaders(sign, timestamp);

        return this._jsonRequest(options);
    }
}

module.exports = Abucoins;