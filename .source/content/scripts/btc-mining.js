var miningData = {
    version: null,
    prevHash: null,
    merkleRoot: null,
    timestamp: null,
    bits: null,
    nonceInt: null,
    nonce: null,
    target: null
};
addEvent(window, 'load', function() {
    addEvent(document.getElementById('version1'), 'keyup, change', version1Changed);
    triggerEvent(document.getElementById('version1'), 'change');

    addEvent(document.getElementById('prevHash1'), 'keyup, change', prevHash1Changed);
    triggerEvent(document.getElementById('prevHash1'), 'change');

    addEvent(document.getElementById('merkleRoot1'), 'keyup, change', merkleRoot1Changed);
    triggerEvent(document.getElementById('merkleRoot1'), 'change');

    addEvent(document.getElementById('timestamp1'), 'keyup, change', timestamp1Changed);
    triggerEvent(document.getElementById('timestamp1'), 'change');

    addEvent(document.getElementById('bits1'), 'keyup, change', bits1Changed);
    triggerEvent(document.getElementById('bits1'), 'change');

    addEvent(document.getElementById('nonce1'), 'keyup, change', nonce1Changed);
    triggerEvent(document.getElementById('nonce1'), 'change');

    addEvent(document.getElementById('btnRunHash0'), 'click', function() {
        var preImage = document.getElementById('inputPreImage0').value;
        var bitArray = sjcl.hash.sha256.hash(preImage);
        var sha256Hash = sjcl.codec.hex.fromBits(bitArray);
        document.getElementById('spanHash0').innerText = sha256Hash;
    });

    addEvent(document.getElementById('btnRunHash1'), 'click', mine1AndRenderResults);
    borderTheDigits('.individual-digits');
});

function borderTheDigits(cssSelectors) {
    var subjectEls = document.querySelectorAll(cssSelectors);
    for (var i = 0; i < subjectEls.length; i++) {
        var text = subjectEls[i].innerText; // get
        var newText = '';
        for (var letterI = 0; letterI < text.length; letterI++) {
            newText += '<span class="individual-digit">' + text[letterI] + '</span>';
        }
        subjectEls[i].innerHTML = newText; // set
    }
}

function version1Changed() {
    deleteElementById('version1Error1');
    deleteElementById('version1Error2');
    deleteElementById('version1Error3');
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'version1Error1',
            'the version must be an integer'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    var version1 = parseInt(this.value);
    if (version1 < 0) {
        addLi2Ul(
            'blockHeader1Error',
            'version1Error1',
            'the version must be greater than 0'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (version1 > 0xffffffff) {
        addLi2Ul(
            'blockHeader1Error',
            'version1Error2',
            'the version must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.version = toLittleEndian(int2hex(version1, 8));
    setButtons(true, 'RunHash1');
}

function prevHash1Changed() {
    deleteElementById('prevHash1Error1');
    deleteElementById('prevHash1Error2');
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'prevHash1Error1',
            'the previous block hash must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader1Error',
            'prevHash1Error2',
            'the previous block hash must be 32 bytes long'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.prevHash = toLittleEndian(this.value);
    setButtons(true, 'RunHash1');
}

function merkleRoot1Changed() {
    deleteElementById('merkleRoot1Error1');
    deleteElementById('merkleRoot1Error2');
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'merkleRoot1Error1',
            'the merkle root must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader1Error',
            'merkleRoot1Error2',
            'the merkle root must be 32 bytes long'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.merkleRoot = toLittleEndian(this.value);
    setButtons(true, 'RunHash1');
}

// the timetstamp can be either an integer (unixtime) or a date string
function timestamp1Changed() {
    deleteElementById('timestamp1Error1');
    deleteElementById('timestamp1Error2');
    deleteElementById('timestamp1Error3');
    if (stringIsInt(Date.parse(this.value))) {
        var timestamp1 = unixtime(this.value);
        document.getElementById('timestamp1Explanation').innerText = '';
    } else if (stringIsInt(this.value)) {
        var timestamp1 = parseInt(this.value);
        document.getElementById('timestamp1Explanation').innerText = '(unixtime)';
    } else {
        addLi2Ul(
            'blockHeader1Error',
            'timestamp1Error1',
            'the timestamp must either be a valid date-time, or be an integer (unixtime)'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (timestamp1 < 1231006505) {
        addLi2Ul(
            'blockHeader1Error',
            'timestamp1Error1',
            'the timestamp cannot come before 03 Jan 2009, 18:15:05 (GMT)'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (timestamp1 > 0xffffffff) {
        addLi2Ul(
            'blockHeader1Error',
            'timestamp1Error1',
            'the timestamp cannot come after 07 Feb 2106, 06:28:15 (GMT)'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.timestamp = toLittleEndian(int2hex(timestamp1, 8));
    setButtons(true, 'RunHash1');
}

function bits1Changed() {
    deleteElementById('bits1Error1');
    deleteElementById('bits1Error2');
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value.length != 8) {
        addLi2Ul(
            'blockHeader1Error',
            'bits1Error1',
            'the difficulty must be 4 bytes long'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'bits1Error2',
            'the difficulty must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.bits = toLittleEndian(this.value);
    miningData.target = bits2target(this.value);
    renderTarget1(miningData.target);
    setButtons(true, 'RunHash1');
}

function nonce1Changed() {
    deleteElementById('nonce1Error1');
    deleteElementById('nonce1Error2');
    deleteElementById('nonce1Error3');
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'nonce1Error1',
            'the nonce must be an integer'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.nonceInt = parseInt(this.value);
    if (miningData.nonceInt < 0) {
        addLi2Ul(
            'blockHeader1Error',
            'nonce1Error2',
            'the nonce must be greater than 0'
        );
        setButtons(false, 'RunHash1');
        return;
    }
    if (miningData.nonceInt > 0xffffffff) {
        addLi2Ul(
            'blockHeader1Error',
            'nonce1Error3',
            'the nonce must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash1');
        return;
    }
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    setButtons(true, 'RunHash1');
}

function renderTarget1(target1) {
    document.getElementById('target1').innerText = target1;
    borderTheDigits('#target1');
}

function resetMiningStatus() {
    document.getElementById('blockhash1').innerText = '';
    document.getElementById('mineStatus1').innerText = '';
}

function mine1AndRenderResults() {
    var minedResult = mine(); // using global var miningData
    document.getElementById('blockhash1').innerText = minedResult.blockhash;
    borderTheDigits('#blockhash1');

    if (minedResult.status) {
        document.getElementById('mineStatus1').innerText = 'pass';
        popup('success!', 'you mined a block');
        setTimeout(function() { hidePopup(); }, 2000);
        return;
    }
    document.getElementById('mineStatus1').innerText = 'fail';
    miningData.nonceInt += 1;
    if (miningData.nonceInt > 0xffffffff) miningData.nonceInt = 0;
    document.getElementById('nonce1').value = miningData.nonceInt;
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
}

function mine() {
    var bitArray = sjcl.codec.hex.toBits(
        miningData.version +
        miningData.prevHash +
        miningData.merkleRoot +
        miningData.timestamp +
        miningData.bits +
        miningData.nonce
    );
    var sha256BitArray = sjcl.hash.sha256.hash(sjcl.hash.sha256.hash(bitArray));
    var sha256Hash = toLittleEndian(sjcl.codec.hex.fromBits(sha256BitArray));
    return {
        blockhash: sha256Hash,
        status: hexCompare(sha256Hash, miningData.target) // sha256 <= target ?
    };
}

function bits2target(bits) {
    if (bits.length != 8) return null;

    var len = hex2int(bits.substring(0, 2)); // just byte 1
    if (len > 32) return null; // max length = 32 bytes

    var msbytes = bits.substring(2);
    var target = msbytes; // init
    var numTrailingBytes = len - (msbytes.length / 2);
    if (numTrailingBytes > 0) target += '00'.repeat(numTrailingBytes);

    if (target.length == 64) return target;

    // make up to 32 bytes
    if (target.length < 64) return '0'.repeat(64 - target.length) + target;

    // chop down to the last 32 bytes
    //if (target.length > 64) return target.substr(-64);
}

// true if hex1 <= hex2
function hexCompare(hex1, hex2) {
    // first, chop off leading zeros
    hex1 = hex1.replace(/^0*/, '');
    hex2 = hex2.replace(/^0*/, '');

    // if hex1 is shorter than hex2 then it is smaller
    if (hex1.length != hex2.length) return (hex1.length < hex2.length);

    // loop through from msb to lsb until there is a difference
    for (var nibbleI = 0; nibbleI < hex1.length; nibbleI++) {
        var hex1Nibble = hex1[nibbleI];
        var hex2Nibble = hex2[nibbleI];
        if (hex1Nibble == hex2Nibble) continue;
        return (hex2int(hex1Nibble) <= hex2int(hex2Nibble));
    }
    return false;
}

function hex2int(hexStr) {
    return parseInt(hexStr, 16);
}

function int2hex(intiger, leftPad) {
    var hex = intiger.toString(16);
    if (leftPad == null || hex.length >= leftPad) return hex;
    return Array(1 + leftPad - hex.length).join('0') + hex;
}

function toLittleEndian(hexStr) {
    if (hexStr.length <= 2) return hexStr;
    if (hexStr.length % 2 == 1) hexStr = '0' + hexStr;
    return hexStr.match(/.{2}/g).reverse().join('')
}
