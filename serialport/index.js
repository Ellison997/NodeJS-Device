const SerialPort = require('serialport');
// const MockBinding = require('@serialport/binding-mock')
const Delimiter = require('@serialport/parser-delimiter')

// SerialPort.Binding = MockBinding

// const portPath = '/dev/ttyUSB0'
const portPath = 'COM5'



let resultArr = [];
let commandArr = []

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
    dataBits: 8,
    hupcl: true,
    lock: false, //若为true ，则重插usb线，再次open时会出现access denied
    parity: 'none',
    rtscts: false,
    stopBits: 1,
    xany: false,
    xoff: false,
    xon: false,
})

const parser = port.pipe(new Delimiter({ delimiter: ';' }))

parser.on('open', () => {
    console.log('端口打开 Port opened:\t', port.path)
})


// Open errors will be emitted as an error event
parser.on('error', function(err) {
    console.log('出现错误: ', err.message)

})

parser.on('data', data => {
    console.log(data.toString('utf8'))
    console.log(new Date())
        // resultArr.push(data.toString('utf8'))
})



// Read data that is available but keep the stream in "paused mode"

// parser.on('readable', function() {
//     console.log('可读的数据Data:', parser.read().toString('utf8'))
// })



function send(data) {
    return new Promise((resolve, reject) => {
        parser.write(data, function(err) {
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



async function tetsWrite(callback) {
    await open();
    console.log('打开了吗?')

    await send("REMOTE?;");
    await send("REMOTE ON;");
    await send("ERROR?;");
    await send("MODE?");
    await send("MODE SPECTRUM;");
    await send("ERROR?;");

    await send("DEV_INFO?;");
    await send("DEV_ID?;");

    await send("SPEC?;");



    await sleep(2000)
    console.log(resultArr);


    // // await sleep(6000)

    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ';'));

    // console.log('第三组数据', resultData);


    // await send(Buffer.from('Lets write data!啦啦啦啦德玛西亚'));
    // await send(Buffer.from('222222222222'));
    // await send(Buffer.from('333333333333;'));
    // console.log('第四组数据', resultData);

}



tetsWrite()









// When you're done you can destroy all ports with
// MockBinding.reset()