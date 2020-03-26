var name = 'PizzaSquat';
var pizzaServiceUuid = '00001101-0000-1000-8000-00805F9B34FB';
var characteristics = {
    crust: '13333333-3333-3333-3333-333333330001',
    toppings: '13333333-3333-3333-3333-333333330002',
    bake: '13333333-3333-3333-3333-333333330003'
};
var PizzaBakeResult = {
    HALF_BAKED: 0,
    BAKED: 1,
    CRISPY: 2,
    BURNT: 3,
    ON_FIRE: 4
};
var crustSelectEl = document.getElementById('crust-type');
var toppingsEls = document.querySelectorAll('[name=toppings]');
var ovenTempEl = document.getElementById('oven-temperature');
var crustTypeEl = document.getElementById('crust-type');
var outputEl = document.getElementById('output');

// ¯\_(ツ)_/¯
function swap16(val) {
    // le to be
    return ((val & 0xFF) << 8) |
        ((val >> 8) & 0xFF);
}

// store characteristics after retrieval
var cachedCharacteristics = {};

// current bluetooth connection obj
var ovenServer = null;

// connect to bluetooth peripheral   获取到所有的特征值
var readyOven = function() {
    return navigator.bluetooth.requestDevice({
        filters: [{ services: [pizzaServiceUuid], name: name }]

    }).then(function(device) {
        return device.gatt.connect();

    }).then(function(server) {
        ovenServer = server;
        return server.getPrimaryService(pizzaServiceUuid);

    }).then(function(service) {
        return Promise.all(Object.values(characteristics).map((uuid) => service.getCharacteristic(uuid)));

    }).then(function(characteristicObjs) {
        Object.keys(characteristics).forEach((name, i) => {
            cachedCharacteristics[name] = characteristicObjs[i];
        });

    }).catch(function(err) {
        alert('oven (bluetooth) error');
        throw err;
    });
};

// characteristic setup  特征值设置
var readyCrust = function(crustType) {
    var crust = new Uint8Array(1);
    crust[0] = crustType;

    var pizzaCrustCharacteristic = cachedCharacteristics['crust'];
    if (pizzaCrustCharacteristic == null) throw new Error('oven not ready!');
    return pizzaCrustCharacteristic.writeValue(crust).catch(function(err) {
        alert('crust error');
        throw err;
    });
};

// 读取配料
var readyToppings = function(toppings) {
    var toppingsBuff = new Uint8Array(2);
    toppingsBuff[0] = toppings.concat(0).reduce((a, b) => a | b);

    var pizzaToppingsCharacteristic = cachedCharacteristics['toppings'];
    if (pizzaToppingsCharacteristic == null) throw new Error('oven not ready');
    return pizzaToppingsCharacteristic.writeValue(toppingsBuff).catch(function(err) {
        alert('toppings error');
        throw err;
    });
};

// 烤制披萨
var bakePizza = function(temperature) {
    var pizzaBakeCharacteristic = cachedCharacteristics['bake'];
    if (pizzaBakeCharacteristic == null) throw new Error('oven not ready!');

    var tempBuff = new Uint16Array([swap16(temperature)]);
    return pizzaBakeCharacteristic.writeValue(tempBuff).then(function() {
        result = pizzaBakeCharacteristic.value.getUint8();
        log('The result is ' + (
            result == PizzaBakeResult.HALF_BAKED ? 'half baked.' :
            result == PizzaBakeResult.BAKED ? 'baked.' :
            result == PizzaBakeResult.CRISPY ? 'crispy.' :
            result == PizzaBakeResult.BURNT ? 'burnt.' :
            result == PizzaBakeResult.ON_FIRE ? 'on fire!' : 'unknown?'));

        return result;

    }).catch(function(err) {
        alert('bake error');
        throw err;
    });
};

// get values from dom   获取各种值
var getCrustType = function() {
    return Number(crustSelectEl.value);
};

var getToppings = function() {
    var toppings = [];
    [].slice.call(toppingsEls).forEach(function(el) {
        if (el.checked) toppings.push(Number(el.value));
    });
    return toppings;
};

var getOvenTemperature = function() {
    return ovenTempEl.value;
};

// button listeners   连接按钮
var onStartButtonClick = function(e) {
    if (ovenServer != null && ovenServer.connected) {
        alert('Already connected...');
        return;
    }
    readyOven().then(function() {
        alert('Connection successful!');
    });
};

// 开始考按钮
var onBakeButtonClick = function(e) {
    if (ovenServer == null || !ovenServer.connected) {
        alert('Not connected!');
        return;
    }
    readyCrust(Crust())
        .then(() => readyToppings(getToppings()))
        .then(() => bakePizza(getOvenTemperature()))
};

var log = function(text) {
    outputEl.textContent = text;
}

document.addEventListener('DOMContentLoaded', function() {
    if (navigator.bluetooth) {
        outputEl.textContent = 'ready.';
    }
});