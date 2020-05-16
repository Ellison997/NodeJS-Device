let util = require('util');
let bleno = require('bleno');

let SetCharacteristic = require('./device-set-characteristic');
let DataCharacteristic = require('./device-data-characteristic');


function Service(device) {
    bleno.PrimaryService.call(this, {
        uuid: '13333333333333333333333333333335',
        characteristics: [
            new SetCharacteristic(device),
            new DataCharacteristic(device)
        ]
    });
}

util.inherits(Service, bleno.PrimaryService);

module.exports = Service;
