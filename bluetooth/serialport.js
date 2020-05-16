const EventEmitter = require('events');
let event = new EventEmitter();
let SerialPort = require('serialport')


const sam = require('./../snode')
console.log("sam C 程序透出来的方法：", sam);
const fs = require('fs')

function isFileExisted(path) {
	return new Promise(function (resolve, reject) {
		fs.access(path, (err) => {
			if (err) {
				reject({
					result: false,
					msg: "未发现文件"
				});
			} else {
				resolve({
					result: true,
					msg: "文件存在"
				});
			}
		})
	})
}



let num = 0;

let device = {
	mode: 4, 	// 4 表示RMS模式
	rbw: 200000,	//200K
	start: 30,	//开始频率30MHz
	end: 6300, 	//结束频率6.3G
	tracepoints: 4000,	//频率点数
	logflag: 1 			// 1 打开日志，0 关闭日志
}

let intervalTime = ''


// 休眠
async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}


let port;
let sum = 0;

function createSerial(portPath) {
	console.log('需要打开的端口', portPath)
	port = new SerialPort(portPath, {
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


	port.on('open', () => {
		console.log('端口打开 Port opened:\t', port.path)

	})


	port.on('close', () => {
		console.log('端口关闭:\t', port.path)
		clearInterval(intervalTime)
		setTimeout(function () {
			start()
		}, 1000)
	})

	// Open errors will be emitted as an error event
	port.on('error', function (err) {
		console.log('出现错误: ', err.message)

	})

	port.on('data', data => {
		clearInterval(intervalTime)
		let buf = new Buffer(data)
		let strData = buf.toString()
		console.log('请求的数据：', strData)
		switch (strData) {
			case 'OPEN_DEVICE;':
				console.log('打开设备')
				openDevice()
				break;
			case 'CLOSE_DEVICE;':
				console.log('关闭设备')
				closeDevice()
				break;
			case 'SAFETY?;':
				console.log('获取列表数据')
				getData(0)
				break;
			case 'SPECTRUM?;':
				console.log('获取频谱数据')
				getData(1)
				break;

			default:
				inputSend('无效的命令！')
				break;
		}


	})


	return new Promise((resolve, reject) => {
		port.open(function (err) {
			if (err) {
				console.log("mserialport.open 错误:");
				console.log(err);
				reject(false);
			} else {
				console.log('mserialport.open 打开方法执行成功');
				resolve(true);
			}
		})
	})

}




function openDevice() {
	let sys = sam.OpenDevice(device.mode, device.rbw, device.start, device.end, device.tracepoints, device.logflag);
	console.log('设备信息', sys);
	inputSend(JSON.stringify(sys) + ';')
}

function closeDevice() {
	let device_status = sam.CloseDevice();
	console.log('设备关闭状态', device_status);
	let serialport_status = inputClose();
	console.log('串口关闭状态', serialport_status);

	inputSend(JSON.stringify(device_status) + ';')
}


function getData(type) {

	intervalTime = setInterval(function () {
		let restlt = sam.GetPartialSweep(type);
		console.log(type == 0 ? `列表数据 ${JSON.stringify(restlt).length}` : `频谱数据 ${JSON.stringify(restlt).length},${typeof restlt},${typeof restlt.Data}`)

		if (type == 1) {
			let pinpudata = JSON.parse(restlt.Data)
			restlt.Data = []
			for (const pd of pinpudata) {
				restlt.Data.push([Number(pd.x), pd.y])
			}
		}
		let strData = JSON.stringify(restlt) + ';'
		// inputSend(type == 1 ? strData.substring(0, 500) + ';' : strData)
		inputSend(strData)
	}, 1000)

}



// 异步写数据
function inputSend(data) {

	let bufData = Buffer.from(data)
	port.write(bufData, function (err) {
		if (err) {
			console.log("mserialport.send 错误:");
		} else {
			++num;
			console.log(`写入数据成功${num}`)
		}
	})
}

function inputClose() {
	return new Promise((resolve, reject) => {
		port.close(function (err) {
			if (err) {
				console.log("mserialport.close 错误:");
				console.log(err);
				reject(false);
			} else {
				console.log('关闭方法执行成功');
				resolve(true);
			}
		})
	})
}







async function start() {
	try {
		let res = await isFileExisted('/dev/rfcomm0');
		console.log(res, '正在打开串口')
		createSerial('/dev/rfcomm0')
	} catch (error) {
		clearInterval(intervalTime)
		console.log('报错了', error);
		console.log('未找到蓝牙串口标识！')
		setTimeout(start, 1000)
	}
}
start()
