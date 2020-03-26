var log = require('./log');
const util = require('util')
var SerialPort = require('serialport')
var serialPort;
var recvdata = "";

module.exports = {
    open,
    send,
    recv,
    startrecv,
    close
}


// 像串口发送写入数据   0:串口未打开   1.发送失败   2：发送成功
function send(data) {
    return new Promise((resolve, reject) => {
        if (!serialPort.isOpen) {
            log.info("mserialport.send 错误,串口未打开");
            reject(0);
        }
        serialPort.write(data, function(err, result) {
            if (err) {
                log.info("mserialport.send 错误:");
                reject(0);
            } else {

                resolve(1);
            }
        })
    })

}


// 关闭串口    0:串口未打开   1.关闭失败   2：关闭成功
function close() {
    return new Promise((resolve, reject) => {
        if (!serialPort.isOpen) {
            log.info("mserialport.close 错误:串口未打开");
            reject(0);
        }
        serialPort.close(function(err, result) {
            if (err) {
                log.info("mserialport.close 错误:");
                log.info(err);
                reject(1);
            } else {
                resolve(2);
            }
        })
    })
}


function startrecv() {
    recvdata = ""

}

// 接收数据
function recv() {

    return new Promise((resolve, reject) => {
        if (!serialPort.isOpen) {
            reject(0)
        } else {
            resolve(recvdata);
        }
        // recvdata=""
        // log.info("清除")

    })

}
//9600
//8
//none
//1

// 打开串口
function open(port, baudRate, parity, dataBits, stopBits, fnData, fnError) {
    return new Promise((resolve, reject) => {

        serialPort = new SerialPort(port, {
            baudRate: baudRate,
            autoOpen: false,
            dataBits: dataBits,
            hupcl: true,
            lock: false, //若为true ，则重插usb线，再次open时会出现access denied
            parity: 'none',
            rtscts: false,
            stopBits: stopBits,
            xany: false,
            xoff: false,
            xon: false,
        })

        serialPort.open(function(err) {
            if (err) {
                log.info("mserialport.open 错误:");
                log.info(err);
                reject(0);

            } else {
                serialPort.on('data', async function(data) {
                        console.log("data:" + data);
                        recvdata = data;
                        fnData(data);
                        //  recvdata += data;
                        // console.log("recvdata:"+recvdata);
                        // log.info('recvdata:'+recvdata);
                    })
                    //错误监听
                serialPort.on('error', function(error) {
                    // recvdata = '';
                    fnError(error);
                })
                resolve(1);
            }
        })
    })
}