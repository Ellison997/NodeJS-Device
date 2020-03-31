const SerialPort = require('serialport');
// const MockBinding = require('@serialport/binding-mock')
// const Delimiter = require('@serialport/port-delimiter')

// SerialPort.Binding = MockBinding

// const portPath = '/dev/ttyUSB0'
const portPath = 'COM4'


let tempArr = [];
let resultArr = [];
let commandArr = [];
let resultMap = new Map()

// The mock bindings can pretend to be an arduino with the `arduinoEcho` program loaded.
// This will echo any byte written to the port and will emit "READY" data after opening.
// You enable this by passing `echo: true`

// Another additional option is `record`, if `record: true` is present all
// writes will be recorded into a single buffer for the lifetime of the port
// it can be read from `port.binding.recording`.

// Create a port
// MockBinding.createPort(portPath, { echo: true, record: false })

const port = new SerialPort(portPath, {
    baudRate: 115200,
    autoOpen: false,
    // dataBits: 8,
    hupcl: true,
    lock: false, //若为true ，则重插usb线，再次open时会出现access denied
    parity: 'none',
    rtscts: false,
    // stopBits: 1,
    xany: false,
    xoff: false,
    xon: false,
})

// const port = port.pipe(new Delimiter({ delimiter: ';' }))

port.on('open', () => {
    console.log('端口打开 Port opened:\t', port.path)
})


// Open errors will be emitted as an error event
port.on('error', function(err) {
    console.log('出现错误: ', err.message)

})

port.on('data', data => {
    // 如果返回的有 ； 号就拆分成多个
    let utf8Data = data.toString('utf8');
    let resdata = [];
    if (utf8Data.indexOf(';') != -1) {
        // 有 ； 号
        resdata = utf8Data.split(';').filter(i => i != '')
        for (let rd in resdata) {
            resdata[rd] += ';'
        }
    } else {
        resdata.push(utf8Data)
    }
    console.log(resdata)
    for (const rd of resdata) {
        tempArr.push(rd)
        if (rd.charAt(rd.length - 1) === ';') {
            // let tampStr = tempArr.toString()
            // console.log(`${tampStr}`)
            if (tempArr.length == 1) tempArr = tempArr.toString();
            resultArr.push(tempArr)
            tempArr = [];
        }

        // 剔除 设置命令
        commandArr = commandArr.filter(c => c.charAt(c.length - 2) == '?')

        // 将数据按照顺序 封装到Map 中
        if (resultArr.length == commandArr.length) {
            for (const ra in resultArr) {
                resultMap.set(commandArr[ra], resultArr[ra])
            }
            console.log(resultMap)
            console.log(new Date())
            commandArr = []
            resultArr = []
            resultMap.clear()
        }
    }
})



// Read data that is available but keep the stream in "paused mode"

// port.on('readable', function() {
//     console.log('可读的数据Data:', port.read().toString('utf8'))
// })



//替换所有的回车换行  
function TransferString(content) {
    var string = content;
    try {
        string = string.replace(/\r\n/g, ",")
        string = string.replace(/\n/g, ",");
    } catch (e) {
        alert(e.message);
    }
    return string;
}

// 同步写数据，可以获得成功或者出错
function syncSend(data) {
    return new Promise((resolve, reject) => {
        port.write(data, function(err) {
            if (err) {
                console.log("mserialport.send 错误:");
                reject(false);
            } else {
                console.log(`写入${data}命令成功`)
                resolve(true);
            }
        })
    })

}


// 异步写数据
function send(data) {
    port.write(data, function(err) {
        if (err) {
            console.log("mserialport.send 错误:");
        } else {
            console.log(`写入${data}命令成功`)
        }
    })
}





function open() {
    return new Promise((resolve, reject) => {
        port.open(function(err) {
            if (err) {
                console.log("mserialport.open 错误:");
                console.log(err);
                reject(false);
            } else {
                console.log('打开方法执行成功');
                resolve(true);
            }
        })
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}



function response(res) {
    console.log(res)
}


// 先询问有没有远程
async function isREMOTE() {
    commandArr = ['REMOTE?;']
    send(commandArr[0])
}

// 安卓端 判断是否开启远程，没开启就调用开启
async function startREMOTE() {
    commandArr = ['REMOTE ON;', 'ERROR?;']
    send(commandArr[0])
    send(commandArr[1])
}

// 开启远程成功后获取仪器的基本信息
async function getInfo() {
    commandArr = ['BATTERY?;', 'DEV_INFO?;']
    for (const ca of commandArr) {
        send(ca);
    }
}


// 设置为列表模式
async function setSAFETY() {
    commandArr = ['MODE?;', 'MODE SAFETY;', 'ERROR?;', 'MODE?;', 'DEV_INFO?;']
    for (const ca of commandArr) {
        send(ca);
    }
}

// 设置RBW模式 为自动高解析度模式
async function setRBW_AUTO() {
    commandArr = ['RBW_AUTO?;', 'RBW_AUTO HIGH_RES;', 'ERROR?;', 'RBW_AUTO?;']
    for (const ca of commandArr) {
        send(ca);
    }
}


// 设置MR 模式  'MR_AUTO?;', 'MR_AUTO ON;', 'ERROR?;',        
async function setMR() {
    commandArr = ['MR_SEARCH_MODE?;', 'MR_SEARCH_MODE NORMAL;', 'ERROR?;', 'MR_SEARCH_MODE?;', 'MR_SEARCH_AUTO?;', 'MR_SEARCH_AUTO START;', 'ERROR?;', 'MR_SEARCH_AUTO?;']
    for (const ca of commandArr) {
        send(ca);
    }
}

// 获取列表数据
async function getTAB() {
    commandArr = ['TAB?;']
    send(commandArr[0]);

}


// 设置 RBW 手动模式
async function setRBW_Manual() {
    commandArr = ['RBW_AUTO?;', 'RBW_AUTO OFF;', 'ERROR?;', 'RBW_AUTO?;', 'RBW_LIMITS?;', 'RBW?;', 'RBW 1E+006;', 'ERROR?;', 'RBW?;']
    for (const ca of commandArr) {
        send(ca);
    }
}


// 设置量程  稳健模式
async function setMR_CONSERVATIVE() {
    commandArr = ['MR_SEARCH_MODE?;', 'MR_SEARCH_MODE CONSERVATIVE;', 'ERROR?;', 'MR_SEARCH_MODE?;']
    for (const ca of commandArr) {
        send(ca);
    }
}

// 设置量程  常规模式
async function setMR_NORMAL() {
    commandArr = ['MR_SEARCH_MODE?;', 'MR_SEARCH_MODE NORMAL;', 'ERROR?;', 'MR_SEARCH_MODE?;']
    for (const ca of commandArr) {
        send(ca);
    }
}



// 设置MR  手动模式
async function setMR_Manual() {
    commandArr = ['MR_SEARCH_AUTO?;', 'MR_SEARCH_AUTO STOP;', 'ERROR?;', 'MR_SEARCH_AUTO?;', 'MR_LIMITS?;', 'MR 100;', 'ERROR?;', 'MR?;']
    for (const ca of commandArr) {
        send(ca);
    }
}





// 使用 sleep 模拟安卓端操作
async function testComm() {
    await open();

    console.log('isREMOTE开始时间', new Date())
        // 询问是否远程
    await isREMOTE()
    await sleep(2000)

    console.log('startREMOTE开始时间', new Date())
        // 如果灭有远程就开启远程
    await startREMOTE();
    await sleep(2000)

    console.log('getInfo开始时间', new Date())
        // 获取仪器基本信息
    await getInfo();
    await sleep(2000)

    // 设置为列表模式
    console.log('setSAFETY开始时间', new Date())
    await setSAFETY();
    await sleep(2000)


    // 设置为RBM_AUTO HIGH_RES模式
    console.log('setRBW_AUTO开始时间', new Date())
    await setRBW_AUTO()
    await sleep(2000)

    // 设置MR 模式
    console.log('setMR开始时间', new Date())
    await setMR()
    await sleep(30000)


    // 读取列表数据
    console.log('getTAB开始时间', new Date())
    await getTAB()
    await sleep(2000)

    // 设置RBW 手动
    console.log('setRBW_Manual开始时间', new Date())
    await setRBW_Manual()
    await sleep(4000)


    // 读取列表数据
    console.log('getTAB开始时间', new Date())
    await getTAB()
    await sleep(3000)

    // 设置量程  稳健模式
    console.log('setMR_CONSERVATIVE开始时间', new Date())
    await setMR_CONSERVATIVE();
    await sleep(3000)

    // 读取列表数据
    console.log('getTAB开始时间', new Date())
    await getTAB()
    await sleep(3000)

    // 设置量程 常规模式
    console.log('setMR_NORMAL开始时间', new Date())
    await setMR_NORMAL();
    await sleep(3000)

    // 读取列表数据
    console.log('getTAB开始时间', new Date())
    await getTAB()
    await sleep(3000)

    // 设置MR 手动
    console.log('setMR_Manual开始时间', new Date())
    await setMR_Manual()
    await sleep(6000)

    // 读取列表数据
    console.log('getTAB开始时间', new Date())
    await getTAB()
    await sleep(3000)

}



// 开炮
testComm();






// When you're done you can destroy all ports with
// MockBinding.reset()