var SerialPort = require('serialport')
var StringDecoder = require('string_decoder').StringDecoder;
var decoder = new StringDecoder('utf8');

const CMD_PASSWORD = 0x01; //Password
const CMD_ENROLID = 0x02; //Enroll in Device
const CMD_VERIFY = 0x03; //Verify in Device
const CMD_IDENTIFY = 0x04; //Identify in Device (Search)
const CMD_DELETEID = 0x05; //Delete in Device
const CMD_CLEARID = 0x06; //Clear in Device

const CMD_ENROLHOST = 0x07; //Enroll to Host
const CMD_CAPTUREHOST = 0x08; //Capture to Host
const CMD_MATCH = 0x09; //Match

const CMD_WRITEFPCARD = 0x0A; //Write Fingerprlet Card
const CMD_READFPCARD = 0x0B; //Read Fingerprlet Card
const CMD_FPCARDMATCH = 0x13; //Fingerprlet Card Match

const CMD_UPCARDSN = 0x43;
const CMD_CARDSN = 0x0E; //Read Card Sn

const CMD_WRITEDATACARD = 0x14; //Write Card Data
const CMD_READDATACARD = 0x15; //Read Card Data

const CMD_PRletCMD = 0x20;

const CMD_GETSN = 0x10;
const CMD_GETBAT = 0x21;

const CMD_GETIMAGE = 0x30;
const CMD_GETCHAR = 0x31;


let mIsWork = false;

let mDeviceCmd = 0x00;
let mCmdData = [];
let mCmdSize = 0;

let mUpImage = [];
let mUpImageSize = 0;

let mRefData = [];
let mMatData = [];

//Opening a Port
var serialPort = new SerialPort('COM3', {
        //波特率，可在设备管理器中对应端口的属性中查看
        baudRate: 9600,
        autoOpen: false
    })
    //连接串口后进行写入指令操作
serialPort.open(function(err) {
    console.log('IsOpen:', serialPort.isOpen)
    console.log('err:', err)
    if (!err) {
        //16进制Buffer流

        console.log("没有错误");
        // SendCommand(CMD_GETSN, [], 0);          // 获取SN
        SendCommand(CMD_ENROLHOST, [], 0); // 录入指纹模板

        mDeviceCmd = CMD_ENROLHOST;
    }
})

function ReceivedCommand(byteRead, size) {
    let text = "";
    if (mDeviceCmd == CMD_GETIMAGE) {
        mUpImage.copyWithin(byteRead, 0, size)
        mUpImage = byteRead.slice(0, size)
            // Array.Copy(byteRead, 0, mUpImage, mUpImageSize, size);
        mUpImageSize = mUpImageSize + size;
        if (mUpImageSize >= 15200) {
            let rawData = getFingerprletImage(mUpImage, 152, 200);
            let bm = new Bitmap(152, 200);
            for (let y = 0; y < 200; y++) {
                for (let x = 0; x < 152; x++) {
                    bm.SetPixel(x, 199 - y, Color.FromArgb(rawData[y * 152 + x], rawData[y * 152 + x], rawData[y * 152 + x]));
                }
            }
            mUpImageSize = 0;
            text = "Get Image"
            return {
                bm,
                text
            }
        }
    } else {
        Array.Copy(byteRead, 0, mCmdData, mCmdSize, size);
        mCmdSize = mCmdSize + size;
        let totalsize = (mCmdData[5] + ((mCmdData[6]) << 8)) + 9;
        if (mCmdSize >= totalsize) {
            mCmdSize = 0;
            mIsWork = false;
            if ((mCmdData[0] == 0x46) && (mCmdData[1] == 0x54)) {
                switch (mCmdData[4]) {
                    case CMD_ENROLID:
                        if (mCmdData[7] == 1) {
                            let id = ((mCmdData[8])) + (mCmdData[9] * 256);
                            text = "Enrol Succeed:" + id.ToString();
                        } else
                            text = "Enrol Fail";
                        break;
                    case CMD_VERIFY:
                        if (mCmdData[7] == 1)
                            text = "Verify Succeed";
                        else
                            text = "Verify Fail";
                        break;
                    case CMD_IDENTIFY:
                        if (mCmdData[7] == 1) {
                            let id = ((mCmdData[8])) + (mCmdData[9] * 256);
                            text = "Search Succeed:" + id.ToString();
                            textBox3.Text = id.ToString();
                        } else
                            text = "Search Fail";
                        break;
                    case CMD_DELETEID:
                        if (mCmdData[7] == 1)
                            text = "Delete Succeed";
                        else
                            text = "Delete Fail";
                        break;
                    case CMD_CLEARID:
                        if (mCmdData[7] == 1)
                            text = "Clear Succeed";
                        else
                            text = "Clear Fail";
                        break;
                    case CMD_ENROLHOST:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (mCmdData[7] == 1) {
                                Array.Copy(mCmdData, 8, mRefData, 0, datasize);
                                text = "Enrol Succeed,Size=" + datasize.ToString();
                            } else {
                                text = "Enrol Fail";
                            }
                        }
                        break;
                    case CMD_CAPTUREHOST:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (mCmdData[7] == 1) {
                                Array.Copy(mCmdData, 8, mMatData, 0, datasize);
                                text = "Capture Succeed,Size=" + datasize.ToString();
                            } else {
                                text = "Capture Fail";
                            }
                        }
                        break;
                    case CMD_MATCH:
                        if (mCmdData[7] == 1) {
                            let score = ((mCmdData[8])) + (mCmdData[9] * 256);
                            text = "Match Succeed:" + score.ToString();
                        } else
                            text = "Match Fail";
                        break;
                    case CMD_GETCHAR:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (mCmdData[7] == 1) {
                                Array.Copy(mCmdData, 8, mMatData, 0, datasize);
                                text = "Get Data Succeed,Size=" + datasize.ToString();

                                textBox5.Clear();
                                textBox5.AppendText(Byte2Hex(mMatData, datasize));
                            } else {
                                text = "Get Data Fail";
                            }
                        }
                        break;
                    case CMD_WRITEFPCARD:
                        if (mCmdData[7] == 1)
                            text = "Write Fingerprlet Card Succeed";
                        else
                            text = "Write Fingerprlet Card Fail";
                        break;
                    case CMD_READFPCARD:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (datasize > 0) {
                                if (datasize > 4096) {
                                    text = "Size Error";
                                    return;
                                }
                                let carddata = new byte[4096];
                                Array.Copy(mCmdData, 8, carddata, 0, datasize);
                                text = "Read Fingerprlet Card Succeed";

                                textBox5.Clear();
                                textBox5.AppendText(Byte2Hex(carddata, datasize));
                            } else {
                                text = "Read Fingerprlet Card Fail";
                            }
                        }
                        break;
                    case CMD_FPCARDMATCH:
                        {
                            if (mCmdData[7] == 1) {
                                let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                                let tmpbuf = new byte[datasize];
                                Array.Copy(mCmdData, 8, tmpbuf, 0, datasize);
                                let txt = System.Text.Encoding.Default.GetString(tmpbuf);
                                text = "Match Fingerprlet Card Succeed:" + txt;
                            } else
                                text = "Match Fingerprlet Card Fail";
                        }
                        break;
                    case CMD_UPCARDSN:
                    case CMD_CARDSN:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (datasize > 0) {
                                let cardsn = new byte[4];
                                Array.Copy(mCmdData, 8, cardsn, 0, datasize);
                                let sn = Convert.ToString(cardsn[0], 16) + Convert.ToString(cardsn[1], 16) + Convert.ToString(cardsn[2], 16) + Convert.ToString(cardsn[3], 16);
                                text = "Read Card SN Succeed:" + sn.ToUpper();
                            } else {
                                text = "Read Card SN Fail";
                            }
                        }
                        break;
                    case CMD_WRITEDATACARD:
                        if (mCmdData[7] == 1)
                            text = "Write Card Data Succeed";
                        else
                            text = "Write Card Data Fail";
                        break;
                    case CMD_READDATACARD:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (datasize > 0) {
                                if (datasize > 4096) {
                                    text = "Size Error";
                                    return;
                                }
                                let carddata = new byte[4096];
                                Array.Copy(mCmdData, 8, carddata, 0, datasize);
                                text = "Read Card Data Succeed";

                                textBox5.Clear();
                                textBox5.AppendText(Byte2Hex(carddata, datasize));
                            } else {
                                text = "Read Card Data Fail";
                            }
                        }
                        break;
                    case CMD_GETSN:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (mCmdData[7] == 1) {
                                let snb = new byte[32];
                                Array.Copy(mCmdData, 8, snb, 0, datasize);
                                let sn = Byte2String(snb, datasize);
                                label3.Text = "SN:" + sn;
                            } else {
                                label3.Text = "Get Device SN Fail";
                            }
                        }
                        break;
                    case CMD_GETBAT:
                        {
                            let datasize = (mCmdData[5]) + (mCmdData[6] << 8 & 0xFF00) - 1;
                            if (datasize > 0)
                                label4.Text = "Battery Value:" + (mCmdData[8] / 10).ToString() + "." + (mCmdData[8] % 10).ToString() + "V";
                            else
                                label4.Text = "Get Battery Value Fail";
                        }
                        break;
                }
            }
        }
        return text;
    }
}

function SendCommand(cmdid, data, size) {
    if (!serialPort.isOpen) {
        console.log('没有打开');
        return;
    }

    let sendsize = 9 + size;

    let sendbuf = [];
    sendbuf[0] = 0x46;
    sendbuf[1] = 0x54;
    sendbuf[2] = 0x00;
    sendbuf[3] = 0x00;
    sendbuf[4] = cmdid;
    sendbuf[5] = size;
    sendbuf[6] = (size >> 8);
    if (size > 0) {
        for (let i = 0; i < size; i++) {
            sendbuf[7 + i] = data[i];
        }
    }
    let sum = calcCheckSum(sendbuf, 7 + size);
    sendbuf[7 + size] = sum;
    sendbuf[8 + size] = sum >> 8;

    console.log("sendbuf:", sendbuf)
    serialPort.write(sendbuf, function(error, result) {
        console.log(error)
        console.log(result)
    })

}

function calcCheckSum(buffer, size) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
        sum = sum + buffer[i];
    }
    return (sum & 0xffff);
}


function Byte2String(arrByte, size) {
    let tmp = new byte[size / 2];
    for (let i = 0; i < size / 2; i++) {
        tmp[i] = arrByte[i * 2 + 1];
    }
    return decoder(tmp);
}

//指令监听
serialPort.on('data', function(data) {
        console.log('data received: ' + typeof(data))
        console.log('data received: ', data)
        console.log('data received: ' + decoder(data))
    })
    //错误监听
serialPort.on('error', function(error) {
    console.log('error: ' + error)
})

//获取端口列表
SerialPort.list(function(error, ports) {
    ports.forEach(function(port) {
        console.log("端口名称：", port.comName);
        console.log("设备ID:", port.pnpId);
        console.log("制造商：", port.manufacturer);
    });
})