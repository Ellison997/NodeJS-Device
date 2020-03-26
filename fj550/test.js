var util = require('util');
var bleno = require('../index');
var pizza = require('./pizza');
var mserialport = require('./mserialport.js');
var log = require('./log');
var recvData = '...'; // 读取到的数据
// 披萨饼选项

async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


// 错误回调
function fnError(error) {
    log.info("fnError...")
        //log.info(data)
}

// 成功回调
async function fnData(data) {
    log.info("fnData..." + data)
    recvData = data;

    //let dataArr= recvData.split(';');
    //log.info("---------------dataArr.length = "+dataArr.length);

}

function TestCharacteristic(pizza) {
    bleno.Characteristic.call(this, {
        uuid: '13333333333333333333333333330004',
        properties: ['read', 'write', 'notify'],
        descriptors: [
            new bleno.Descriptor({
                uuid: '2901',
                value: '测试蓝牙读写程序.'
            })
        ]
    });
    log.info("test init");


    let ret = 0;
    //ret = await async_serialport.initport("COM5");
    mserialport.
    open("/dev/ttyUSB0", 460800, 'none', 8, 1, fnData, fnError)
        .then(res => {
            log.info('打开串口成功：', res)
            log.info(`serialport.open`);

            // if(ret==0) {
            //    log.info("初始串口失败");
            //await sleep(1000)
            //   process.exit(1);
            // }else{
            //    log.info("初始串口成功");

            //设置远程才能读数
            setTimeout(remoteon, 1000);
            //  mserialport.send("REMOTE ON;");
            /*
            if(ret==0)
            {
                sleep(1000)
                process.exit(0);
            }
            */
            log.info(" REMOTE ON; ");

            // proc();
        })
        .catch(err => {
            log.info('打开串口失败', err)
                (async() => {
                    await sleep(1000)
                })
            process.exit(1);
        })

    //}



    this.pizza = pizza;
}

function remoteon() {
    mserialport.send("REMOTE ON;").then(res => {
        log.info('发送REMOTE ON; 成功', res)
    }).catch(err => {
        if (err == 0) {
            log.info('串口未打开哦')
        } else if (err == 1) {
            log.info('发送失败哦')
        } else {
            log.info('未知的错误', err)
        }
    });
    setTimeout(meas, 1000);
}


function meas() {
    mserialport.send("MEAS?;").then(res => {
        log.info('发送MEAS?; 成功', res)
    }).catch(err => {
        if (err == 0) {
            log.info('串口未打开哦')
        } else if (err == 1) {
            log.info('发送失败哦')
        } else {
            log.info('未知的错误', err)
        }
    })
    setTimeout(meas, 2000);
}

function proc() {
    log.info('proc');
    mserialport.recv().then(res => {
            log.info("读取数据啦啦啦啦:", res)
        }).catch(err => {
            log.info("串口未打开：", err)
        })
        /*
while(true)
{
await sleep(3000)
	
let ret = await mserialport.send("MEAS?;");
if(ret==0)
{
    sleep(1000)
    process.exit(0);
    	
}
log.info(" meas time ");
	
	
//		let sql_insert = `INSERT INTO roms1000_datatemp(id,createtime,yd2g,yd3g,yd4g,dx2g,dx3g,dx4g,lt2g,lt3g,lt4g,totalvalue,temperature,humidity,devbattery) 
//		SELECT UUID(),NOW(),yd2g,yd3g,yd4g,dx2g,dx3g,dx4g,lt2g,lt3g,lt4g,totalvalue,temperature,humidity,devbattery FROM roms1000_term`;
//		log.info(`readPortData sql_insert=` + sql_insert);
//		let back_insert = db.raw_select(sql_insert, [])
//			.catch(err => {
//				errno = 1;
//				log.info(err);
//				return
//			})
    //
//      //判断如果接收不到数据就重启程序
//  	if(moment().diff(g_time)>10000)
//  	{
//  		// await sleep(1000)
//  		log.info("process exit");
//  		await sleep(1000)
// 			 process.exit(1);
//  	}
}
*/
}

util.inherits(TestCharacteristic, bleno.Characteristic);


// 写入请求
TestCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    log.info('测试蓝牙程序----onWriteRequest')
    if (offset) { // 长时间没有返回     
        callback(this.RESULT_ATTR_NOT_LONG);
    } else if (data.length !== 1) { // 返回属性长度无效
        callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
    } else {
        log.info('测试蓝牙程序，回调：', this.RESULT_SUCCESS, Math.random())

        callback(this.RESULT_SUCCESS);
        // callback(this.RESULT_SUCCESS, Math.random())
    }
};


// 读取请求
TestCharacteristic.prototype.onReadRequest = function(offset, callback) {
    log.info('测试蓝牙程序----onReadRequest')
    if (offset) {
        callback(this.RESULT_ATTR_NOT_LONG, null);
    } else {
        //var data = new Buffer(200);
        // data.writeFloatBE(Math.random(), 0);
        //data = Buffer.from(recvData);
        //data = 
        // data.writeFloatBE(Math.random(), 0);
        // var res = new Buffer('hello word');
        // var recvData = new Buffer('7468697320697320612074c3a97374', 'hex');
        // callback(this.RESULT_SUCCESS, res);

        mserialport.recv().then(res => {

            // var data = new Buffer(100);
            // data.writeFloatBE(num, 0);
            let num = Number(new Buffer(res, 'base64').toString().split(',')[0]).toFixed(2);
            log.info("返回的数据：", num)

            var data = new Buffer(num.toString());
            callback(this.RESULT_SUCCESS, data);
        }).catch(err => {
            callback(this.RESULT_SUCCESS, err);
            log.info("串口未打开：", err)
        })
    }
};


// 只通知通道 订阅方法
TestCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
    log.info('TestCharacteristic subscribe');

    this.counter = 0;
    this.changeInterval = setInterval(function() {
        var data = new Buffer(4);
        data.writeUInt32LE(this.counter, 0);

        log.info('TestCharacteristic update value: ' + this.counter);
        updateValueCallback(data);
        this.counter++;
    }.bind(this), 5000);
};


// 取消订阅
TestCharacteristic.prototype.onUnsubscribe = function() {
    log.info('TestCharacteristic unsubscribe');

    if (this.changeInterval) {
        clearInterval(this.changeInterval);
        this.changeInterval = null;
    }
};

// 通知
TestCharacteristic.prototype.onNotify = function() {
    log.info('TestCharacteristic on notify');
};


module.exports = TestCharacteristic;