const SerialPort = require('serialport');
// const MockBinding = require('@serialport/binding-mock')
// const Delimiter = require('@serialport/port-delimiter')

// SerialPort.Binding = MockBinding

const portPath = '/dev/ttyUSB0'

let resultData = null;

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
    autoOpen: false
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
    console.log('接收到的数据:\t', data.toString('utf8'))
        // resultData = data.toString('utf8')
})



// Read data that is available but keep the stream in "paused mode"

port.on('readable', function() {
    resultData = port.read().toString('utf8')
    console.log('可读的数据Data:', port.read().toString('utf8'))
})


// Pipe the data into another stream (like a port or standard out)
// const lineStream = port.pipe(new Readline())

function send(data) {
    return new Promise((resolve, reject) => {
        port.write(data, function(err, result) {
            if (err) {
                console.log("mserialport.send 错误:");
                reject(false);
            } else {
                console.log("写入命令成功", result)
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
    await send("REMOTE ON;");
    console.log('第一组数据', resultData);

    // await send(Buffer.from('6 666 66 '));
    // await send(Buffer.from('3333322 222222 嘻嘻 嘻;'));
    // console.log('第二组数据', resultData);

    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));

    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));

    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));

    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ', '));
    // // await sleep(6000)

    // await send(Buffer.from((Math.random() * 10).toFixed(2) + ';'));

    // console.log('第三组数据', resultData);


    // await send(Buffer.from('Lets write data!啦啦啦啦德玛西亚'));
    // await send(Buffer.from('222222222222'));
    // await send(Buffer.from('333333333333;'));
    // console.log('第四组数据', resultData);

}



tetsWrite()




SerialPort.list().then(ports => {
        // 假设选择第一个串口实例化
        console.log(ports.length)
        ports.forEach(port => {
            console.log(port)
        });
    })
    .catch(err => console.log(err))




// When you're done you can destroy all ports with
// MockBinding.reset()