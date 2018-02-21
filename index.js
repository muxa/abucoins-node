const rp = require('request-promise');
const crypto = require('crypto');
const extend = require('extend');
const qs = require('querystring');

const TIMEOUT = 5000;

function urlWithParameters(path, parameters) {
    const queryString = qs.stringify(parameters);
    if (queryString) {
        return path + '?' + queryString;
    } else {
        return path;
    }
}

/**
 * @typedef Fill
 * @property {string} trade_id identifier of the last trade
 * @property {string} product_id	product identifier
 * @property {string} price	trade price
 * @property {string} size	trade size
 * @property {string} order_id	identifier of order
 * @property {string} created_at	time in UTC
 * @property {string} liquidity	indicates if the fill was the result of a liquidity provider (maker) or liquidity taker. M indicates Maker and T indicates Taker
 * @property {string} fee	indicates the fees charged for this individual fill
 * @property {string} side	user side(buy or sell)
 */

/**
 * @typedef DepositHistory
 * @property {string} deposit_id Deposit transaction ID
 * @property {string} currency	Deposit currency
 * @property {string} date	Date of deposit
 * @property {string} amount	Deposit amount
 * @property {string} fee	Deposit fee
 * @property {string} status	Deposit status
 * @property {string} url	blockchain explorer url (null if not available)
 */

 /**
 * @typedef WithdrawalHistory
 * @property {string} withdraw_id	Withdraw transaction ID
 * @property {string} currency	Withdraw currency
 * @property {string} date	Date of withdraw
 * @property {string} amount	Withdraw amount
 * @property {string} fee	Withdraw fee
 * @property {string} status	Withdraw status
 * @property {string} url	blockchain explorer url (null if not available)
 */

class Abucoins {
    constructor(options) {
        this.options = extend({
            timeout: TIMEOUT,
            endpoint: 'https://api.abucoins.com',
            key: '',
            secret: '',
            passphrase: '',
        }, options);
    }

    _jsonRequest(options) {
        options.timeout = this.options.timeout;
        options.json = true;

        return rp(options);
    }

    _getHeaders(sign, timestamp) {
        return {
            'AC-ACCESS-KEY': this.options.key,
            'AC-ACCESS-SIGN': sign,
            'AC-ACCESS-TIMESTAMP': timestamp,
            'AC-ACCESS-PASSPHRASE': this.options.passphrase,
        };
    }

    signAndRequest(method, path, body = {}) {
        const timestamp = Math.floor(new Date() / 1000);
        let options = {
            uri: `${this.options.endpoint}${path}`,
            method: method,
            body: body,
        };
        let string = timestamp + method + path;
        if (Object.keys(body).length > 0) {
            string += JSON.stringify(body);
        }
        const sign = crypto.createHmac('sha256', Buffer.from(this.options.secret, 'base64'))
            .update(string)
            .digest('base64');
        options.headers = this._getHeaders(sign, timestamp);

        return this._jsonRequest(options);
    }

    /**
     * Gets completed trade history
     * @async
     * @param parameters Query parameters
     * @param {number?} paramerers.before Request page before (newer) this pagination id.
     * @param {number?} paramerers.after Request page after (older) this pagination id.
     * @param {number?} paramerers.limit Number of results per request. Maximum 1000. (default 100)
     * @returns {Promise<Fill[]>}
     */
    async tradeHistory(parameters) {
        return this.signAndRequest('GET', urlWithParameters('/fills', parameters))
            .then(data => {
                if (data.message) {
                    return Promise.reject(data.message);
                } else {
                    return data;
                }
            });
    }

    /**
     * Gets withdrawals history
     * @async
     * @param parameters Query parameters
     * @param {number?} paramerers.before Request page before (newer) this pagination id.
     * @param {number?} paramerers.after Request page after (older) this pagination id.
     * @param {number?} paramerers.limit Number of results per request. Maximum 1000. (default 100)
     * @returns {Promise<WithdrawalHistory[]>}
     */
    async withdrawalHistory(parameters) {
        return this.signAndRequest('GET', urlWithParameters('/withdrawals/history', parameters))
            .then(data => {
                if (data.message) {
                    return Promise.reject(data.message);
                } else {
                    return data;
                }
            });
    }

    /**
     * Gets deposit history
     * @async
     * @param parameters Query parameters
     * @param {number?} paramerers.before Request page before (newer) this pagination id.
     * @param {number?} paramerers.after Request page after (older) this pagination id.
     * @param {number?} paramerers.limit Number of results per request. Maximum 1000. (default 100)
     * @returns {Promise<DepositHistory[]>}
     */
    async depositHistory(parameters) {
        return this.signAndRequest('GET', urlWithParameters('/deposits/history', parameters))
            .then(data => {
                if (data.message) {
                    return Promise.reject(data.message);
                } else {
                    return data;
                }
            });
    }
}

module.exports = Abucoins;