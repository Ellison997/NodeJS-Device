// Modules to control application life and create native browser window
const path = require('path')
let util = require('util');

let bleno = require('bleno');


var device = require('./device');

//
// The BLE Pizza Service!
//
var Service = require('./device-service');

//
// A name to advertise our  Service.
//
var name = '5gDataService';
var service = new Service(new device.Device());

//等到收听到无线电信号再打广播。
//如果你没有一台收音机，它就永远开不了!
bleno.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        //我们也会在广播包中宣传服务ID，
        //这样就容易找到了。
        bleno.startAdvertising(name, [service.uuid], function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
    else {
        bleno.stopAdvertising();
    }
});

bleno.on('advertisingStart', function (err) {
    if (!err) {
        console.log('advertising...');

        //一旦我们做了广播，就该建立我们的服务了，
        //以及我们的特点。
        bleno.setServices([
            service
        ]);
    }
});


bleno.on('accept', function (clientAddress) {
    console.log('clientAddress accept.......', clientAddress)
});



bleno.on('disconnect', function (clientAddress) {
    console.log('clientAddress disconnect.......', clientAddress)
});

bleno.on('rssiUpdate', function (rssi) {
    console.log('rssi.......', rssi)
});





