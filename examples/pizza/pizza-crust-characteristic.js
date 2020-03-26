var util = require('util');
var bleno = require('../..');
var pizza = require('./pizza');

// 披萨饼选项

function PizzaCrustCharacteristic(pizza) {
    bleno.Characteristic.call(this, {
        uuid: '13333333333333333333333333330001',
        properties: ['read', 'write'],
        descriptors: [
            new bleno.Descriptor({
                uuid: '2901',
                value: 'Gets or sets the type of pizza crust.'
            })
        ]
    });

    this.pizza = pizza;
}

util.inherits(PizzaCrustCharacteristic, bleno.Characteristic);


// 写入请求
PizzaCrustCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    console.log('选择披萨规格，啦啦啦啦啦啦，正常的、厚的、薄的----onWriteRequest')
    if (offset) { // 长时间没有返回     
        callback(this.RESULT_ATTR_NOT_LONG);
    } else if (data.length !== 1) { // 返回属性长度无效
        callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    } else {

        var crust = data.readUInt8(0); // 读取返回
        console.log(`披萨规格: ${crust}`)
        switch (crust) {
            case pizza.PizzaCrust.NORMAL: // 正常
            case pizza.PizzaCrust.DEEP_DISH: // 厚的
            case pizza.PizzaCrust.THIN: // 薄的
                this.pizza.crust = crust;
                callback(this.RESULT_SUCCESS); // 返回正常
                // callback(Math.random())
                break;
            default:
                callback(this.RESULT_UNLIKELY_ERROR); // 无法理解的
                break;
        }
    }
};


// 读取请求
PizzaCrustCharacteristic.prototype.onReadRequest = function(offset, callback) {
    console.log('选择披萨规格，啦啦啦啦啦啦，正常的、厚的、薄的----onReadRequest')
    if (offset) {
        callback(this.RESULT_ATTR_NOT_LONG, null);
    } else {
        var data = new Buffer(1);
        data.writeUInt8(this.pizza.crust, 0);
        callback(this.RESULT_SUCCESS, data);
    }
};

module.exports = PizzaCrustCharacteristic;