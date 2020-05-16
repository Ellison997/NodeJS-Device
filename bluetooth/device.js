let util = require('util');
let events = require('events');

const sam = require('./../snode')
console.log("sam C 程序透出来的方法：", sam);

function Device() {
  events.EventEmitter.call(this);

  this.mode = 4; // 4 表示RMS模式
  this.rbw = 200000;//200K
  this.start = 30;//开始频率30MHz
  this.end = 6300; //结束频率6.3G
  this.tracepoints = 4000;//频率点数
  this.logflag = 1; // 1 打开日志，0 关闭日志
}

util.inherits(Device, events.EventEmitter);

Device.prototype.bake = function (temperature) {
  let time = temperature * 10;
  let self = this;
  console.log('baking pizza at', temperature, 'degrees for', time, 'milliseconds');
  setInterval(function () {
    let result =
      (temperature < 350) ? DeviceBakeResult.HALF_BAKED :
        (temperature < 450) ? DeviceBakeResult.BAKED :
          (temperature < 500) ? DeviceBakeResult.CRISPY :
            (temperature < 600) ? DeviceBakeResult.BURNT :
              DeviceBakeResult.ON_FIRE;
    console.log('走定时器了吗', time)
    self.emit('ready', result);
  }, time);
};


// 获取列表数据
Device.prototype.getList = function () {
  let self = this;
  console.log('开始获取列表数据')

  setInterval(function () {
    console.log('定时器启动哈哈哈哈')
    ret = sam.GetPartialSweep(0);
    self.emit('list', ret);
  }, 1000);
};



// 打开设备
Device.prototype.open = function () {
  let self = this;
  console.log('打开设备的配置', this.mode, this.rbw, this.start, this.end, this.tracepoints, this.logflag)
  let sys = sam.OpenDevice(this.mode, this.rbw, this.start, this.end, this.tracepoints, this.logflag);
  console.log('设备信息', sys);

  return sys;
};


// 关闭设备
Device.prototype.close = function () {

};




module.exports.Device = Device;

