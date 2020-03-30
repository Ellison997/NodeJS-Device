const SerialPort = require('serialport');
// const MockBinding = require('@serialport/binding-mock')
// const Delimiter = require('@serialport/port-delimiter')

// SerialPort.Binding = MockBinding

// const portPath = '/dev/ttyUSB0'
const portPath = 'COM5'


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
    let resdata = (data.toString('utf8'))
    tempArr.push(resdata)
    if (resdata.charAt(resdata.length - 1) === ';') {
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


async function isREMOTE() {
    // 先询问有没有远程
    commandArr = ['REMOTE?;']
    send(commandArr[0])

    // // 设置为列表模式
    // commandArr=['MODE?;','MODE SAFETY;']

    // commandArr = ['REMOTE?;', 'REMOTE ON;', 'ERROR?;', 'MODE?;', 'DEV_INFO?;', 'CT_SRV_LST?;', 'DEV_ID?;', 'SPEC?;']
    // console.log(new Date())
    // for (const ca of commandArr) {
    //     send(ca);
    // }


    // await sleep(6000)


}

async function startREMOTE() {
    // 安卓端 判断是否开启远程，没开启就调用开启
    commandArr = ['REMOTE ON;', 'ERROR?;']
    send(commandArr[0])
    send(commandArr[1])
}

async function getInfo() {
    // 开启远程成功后获取仪器的基本信息
    commandArr = ['BATTERY?;', 'DEV_INFO?;']
    for (const ca of commandArr) {
        send(ca);
    }
}


async function setSAFETY() {
    // 设置为列表模式
    commandArr = ['MODE?;', 'MODE SAFETY;', 'ERROR?;', 'MODE?;', 'DEV_INFO?;']
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
    await sleep(3000)

    console.log('startREMOTE开始时间', new Date())
        // 如果灭有远程就开启远程
    await startREMOTE();
    await sleep(3000)

    console.log('getInfo开始时间', new Date())
        // 获取仪器基本信息
    await getInfo();
    await sleep(3000)

    // 设置为列表模式
    console.log('setSAFETY开始时间', new Date())
    await setSAFETY();
}



// 开炮
testComm();






// When you're done you can destroy all ports with
// MockBinding.reset()