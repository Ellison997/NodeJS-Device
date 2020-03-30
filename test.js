var util = require('util');

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

function TestCharacteristic() {
    //dev/ttyUSB0
    let ret = 0;
    //ret = await async_serialport.initport("COM5");
    mserialport.
    open("COM4", 115200, 'none', 8, 1, fnData, fnError)
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
            setTimeout(function() {
                log.info(" REMOTE ON; ");
                mserialport.send("REMOTE ON;")
            }, 1000);

            setTimeout(function() {
                log.info("SPEC?;");
                mserialport.send("SPEC?;")
            }, 2000);

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

}


TestCharacteristic();