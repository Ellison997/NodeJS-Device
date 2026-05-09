const HID = require('node-hid');

// 查找VIA兼容键盘
function findKeyboard() {
    const devices = HID.devices();
    // console.log(JSON.stringify(devices));
    return devices.find(dev =>
        dev.vendorId === 0x5262 && dev.productId === 0x4b4b && dev.interface === 1 // 替换为你的键盘VID和PID
    );
}

let device = null;

// 开启背光
function turnBacklightOn() {
    const keyboardInfo = findKeyboard(); // 使用之前定义的findKeyboard函数
    // console.log(keyboardInfo);
    if (!keyboardInfo) return;

    device = new HID.HID(keyboardInfo.path);
    device.on("data", function (data) {
        console.log("Data received: ", data);
    });
    const paddedArraySetting = new Array(33).fill(0);
    const commandBytesSetting = [0, 7, 3, 2]
    commandBytesSetting.forEach((val, idx) => {
        paddedArraySetting[idx] = val;
    });

    device.write(paddedArraySetting); // 设置亮度

    const paddedArraySave = new Array(33).fill(0);
    const commandBytesSave = [0, 9, 3]
    commandBytesSave.forEach((val, idx) => {
        paddedArraySave[idx] = val;
    });

    device.write(paddedArraySave); // 保存
}

// 使用示例
findKeyboard()
turnBacklightOn(); // 开启
setTimeout(() => turnBacklightOn(), 3000); // 3秒后再触发关闭

setTimeout(() => {
    if (device) {
        device.close();
    }
}, 3000); // 3秒后再触发关闭

