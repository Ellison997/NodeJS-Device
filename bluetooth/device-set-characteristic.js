let util = require('util');
let bleno = require('bleno');


function DeviceSetCharacteristic(device) {
  bleno.Characteristic.call(this, {
    uuid: '13333333333333333333333333330001',
    properties: ['notify', 'read', 'write'],
    descriptors: [
      new bleno.Descriptor({
        uuid: '2901',
        value: '设备的打开与关闭和设置。'
      })
    ]
  });

  this.device = device;


}

util.inherits(DeviceSetCharacteristic, bleno.Characteristic);



DeviceSetCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  console.log('设备操作写入请求')
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG);
  }
  else if (data.length !== 1) {
    callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
  }
  else {


    callback(this.RESULT_SUCCESS);
  }
};


DeviceSetCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log('maxValueSize:', maxValueSize)

  this.device.on('deviceInfo', function (result) {
    console.log('获取到设备信息了', result)
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

DeviceSetCharacteristic.prototype.onReadRequest = function (offset, callback) {
  console.log('数据读取请求,偏移量：', offset)
  if (offset) {
    callback(this.RESULT_ATTR_NOT_LONG, null);
  }
  else {
    let result = this.device.open();
    let str = JSON.stringify(result) + ';'
    // buf = Buffer.alloc(256);
    // len = buf.write("www.runoob.com");

    data = Buffer.from(str, 'ascii');
    callback(this.RESULT_SUCCESS, data);
  }
};

module.exports = DeviceSetCharacteristic;