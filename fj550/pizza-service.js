var util = require('util');
var bleno = require('../index');


var TestCharacteristic = require('./test');

function PizzaService(pizza) {
    bleno.PrimaryService.call(this, {
        uuid: '13333333333333333333333333333332',
        // uuid: '0000110100001000800000805F9B34FB',
        characteristics: [
            new TestCharacteristic(pizza)
        ]
    });
}

util.inherits(PizzaService, bleno.PrimaryService);

module.exports = PizzaService;