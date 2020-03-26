var util = require('util');
var bleno = require('../..');

var PizzaCrustCharacteristic = require('./pizza-crust-characteristic');
var PizzaToppingsCharacteristic = require('./pizza-toppings-characteristic');
var PizzaBakeCharacteristic = require('./pizza-bake-characteristic');
var TestCharacteristic = require('./test');

function PizzaService(pizza) {
    bleno.PrimaryService.call(this, {
        uuid: '13333333333333333333333333333337',
        // uuid: '0000110100001000800000805F9B34FB',
        characteristics: [
            new PizzaCrustCharacteristic(pizza),
            new PizzaToppingsCharacteristic(pizza),
            new PizzaBakeCharacteristic(pizza),
            new TestCharacteristic(pizza)
        ]
    });
}

util.inherits(PizzaService, bleno.PrimaryService);

module.exports = PizzaService;