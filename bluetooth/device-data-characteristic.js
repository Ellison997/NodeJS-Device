var util = require('util');
let bleno = require('bleno');
var device = require('./device');

function DeviceDataCharacteristic(device) {
  bleno.Characteristic.call(this, {
    uuid: '13333333333333333333333333330002',
    properties: ['notify', 'read', 'write'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: '监测数据的获取。'
      })
    ]
  });

  this.device = device;
}

util.inherits(DeviceDataCharacteristic, bleno.Characteristic);

DeviceDataCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('数据写入请求')
  console.log('接收到的指令！', data)
  if (offset) {
    console.log('1111111')
    callback(this.RESULT_ATTR_NOT_LONG);
  }
  else {
    let instruction = data.toString();
    console.log('接收到的指令！', instruction)

    this.device.getList();
    // if (instruction == 0) {
    // }
    callback(this.RESULT_SUCCESS);
  }
};

DeviceDataCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('maxValueSize:', maxValueSize)

  this.device.on('list', function (result) {
    console.log('获取到列表数据了', result)
    console.log(updateValueCallback)
    if (updateValueCallback) {
      let str = JSON.stringify(result) + ';'
      for (let index = 0; index < Math.ceil(str.length / 250); index++) {
        data = Buffer.from(str.substring(index * 250, (index + 1) * 250), 'utf8');
        updateValueCallback(data);
      }
    }
  });
}



DeviceDataCharacteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('厚度读取请求')
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG, null);
  }
  else {
    var data = new Buffer(2);
    data.writeUInt16BE(this.device.toppings, 0);
    callback(this.RESULT_SUCCESS, data);
  }
};

module.exports = DeviceDataCharacteristic;