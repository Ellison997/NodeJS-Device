# BLE Pizza Service

This is an example program demonstrating BLE connectivity between a peripheral running bleno, and a central running noble.

The service represents a robotic pizza oven, with the following characteristics:

* crust - read / write. A value representing the type of pizza crust (normal, thin, or deep dish)
* toppings - read / write. A value representing which toppings to include (pepperoni, mushrooms, extra cheese, etc.)
* bake - write / notify. The value written is the temperature at which to bake the pizza. When baking is finished, the central is notified with a bake result (half baked, crispy, burnt, etc.)

To run the peripheral example:

    node peripheral

And on another computer, connect as a central from [noble](https://github.com/sandeepmistry/noble/tree/master/examples/pizza).
You can also use a [web app](http://strangesast.github.io/bleno-web-pizza-example) using [Web Bluetooth](https://developers.google.com/web/updates/2015/07/interact-with-ble-devices-on-the-web).




// let mode = 4; // 4 表示RMS模式
// let rbw = 200000;//200K
// let start = 30;//开始频率30MHz
// let end = 6300; //结束频率6.3G
// let tracepoints = 4000;//频率点数
// let logflag = 1; // 1 打开日志，0 关闭日志


// // 打开设备
// let sys = sam.OpenDevice(mode, rbw, start, end, tracepoints, logflag);
// console.log('设备信息', sys);


// let ret;

// let cc = 0;

// function GetPartialSweep() {
//     console.log("get pinpu...");
//     ret = sam.GetPartialSweep(1);
//     // "RetFlag":1,"Temp_C":"55.90","Data"
//     console.log("get pinpu ok tempc ", ret.RetFlag, ret.Temp_C, JSON.parse(ret.Data).length, JSON.parse(ret.Data)[1]);
//     console.log("get tab ...");
//     ret = sam.GetPartialSweep(0);
//     console.log("get tab ok...");
//     console.log(ret);
//     cc++;
//     if (cc < 10) {
//         setTimeout(GetPartialSweep, 1000);
//     }
//     else {
//         let closeInfo = sam.CloseDevice();
//         console.log('关闭设备返回', closeInfo)
//     }
// }

// GetPartialSweep();

