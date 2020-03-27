const SerialPort = require('serialport')

SerialPort.list().then(ports => {
        // 假设选择第一个串口实例化
        console.log(ports.length)
        ports.forEach(port => {
            console.log(port)
        });
    })
    .catch(err => console.log(err))