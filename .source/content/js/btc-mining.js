var passColor = '#7db904'; // green
var failColor = 'red';
var txsPerBlock = [];
var miningData = { // note: raw values are taken directly from the input field
    versionRaw: null,
    version: null,

    prevHashRaw: null,
    prevHash: null,

    merkleRootRaw: null,
    merkleRoot: null,

    timestampRaw: null,
    timestamp: null,

    bitsRaw: null,
    bits: null,

    nonceRaw: null,
    nonceInt: null,
    nonce: null,

    target: null
};
addEvent(window, 'load', function() {
    // form 0 - hashing demo
    addEvent(document.getElementById('btnRunHash0'), 'click', runHash0Clicked);
    addEvent(document.getElementById('inputMessage0'), 'keyup', function(e) {
        if (e.keyCode != 13) return; // only allow the enter key
        runHash0Clicked();
    });
    addEvent(
        document.getElementById('btnRunHash0').parentNode.
        querySelector('button.wrap-nowrap'),
        'click',
        runHash0WrapClicked
    );

    // form 1 - hashing manually to match hash
    addEvent(document.getElementById('btnRunHash1'), 'click', runHash1Clicked);
    addEvent(document.getElementById('inputMessage1'), 'keyup', function(e) {
        if (e.keyCode != 13) return; // only allow the enter key
        runHash1Clicked();
    });
    runHash1Clicked();
    (function() {
        var codeblock = document.getElementById('codeblock1HashResults');
        addEvent(
            document.getElementById('btnRunHash1').parentNode.
            querySelector('button.wrap-nowrap'),
            'click',
            function(e) { runHash1And2WrapClicked(e, codeblock); }
        );
    })();

    // form 2 - hashing automatically to match hash
    addEvent(document.getElementById('btnRunHash2'), 'click', runHash2Clicked);
    addEvent(document.getElementById('inputMessage2'), 'keyup', function(e) {
        if (e.keyCode != 13) return; // only allow the enter key
        runHash2Clicked();
    });
    runHash2Clicked();
    (function() {
        var codeblock = document.getElementById('codeblock2HashResults');
        addEvent(
            document.getElementById('btnRunHash2').parentNode.
            querySelector('button.wrap-nowrap'),
            'click',
            function(e) { runHash1And2WrapClicked(e, codeblock); }
        );
    })();

    // form 3 - bitcoin mining
    addEvent(document.getElementById('version3'), 'keyup, change', version3Changed);
    triggerEvent(document.getElementById('version3'), 'change');

    addEvent(document.getElementById('prevHash3'), 'keyup, change', prevHash3Changed);
    triggerEvent(document.getElementById('prevHash3'), 'change');

    addEvent(document.getElementById('merkleRoot3'), 'keyup, change', merkleRoot3Changed);
    triggerEvent(document.getElementById('merkleRoot3'), 'change');

    addEvent(document.getElementById('timestamp3'), 'keyup, change', timestamp3Changed);
    triggerEvent(document.getElementById('timestamp3'), 'change');

    addEvent(document.getElementById('bits3'), 'keyup, change', bits3Changed);
    triggerEvent(document.getElementById('bits3'), 'change');

    addEvent(document.getElementById('nonce3'), 'keyup, change', nonce3Changed);
    triggerEvent(document.getElementById('nonce3'), 'change');

    addEvent(document.getElementById('btnRunHash3'), 'click', mine3AndRenderResults);
    addEvent(
        document.getElementById('btnRunHash3').parentNode.
        querySelector('button.wrap-nowrap'),
        'click',
        runHash3WrapClicked
    );
    initBlockchainSVG();
});

function runHash0WrapClicked(e) {
    var btn = e.currentTarget;
    var codeblockText = btn.parentNode.parentNode.querySelector('.codeblock').innerText;
    if (btn.getAttribute('wrapped') == 'true') {
        btn.parentNode.parentNode.querySelector('.codeblock').innerText =
        codeblockText.replace(/\n/g, '\n\n').replace(/[ ]* -> SHA256/g, ' -> SHA256');
    } else {
        btn.parentNode.parentNode.querySelector('.codeblock').innerText =
        alignText(codeblockText.replace(/\n\n/g, '\n'), '-> SHA256');
    }
}

function runHash0Clicked() {
    var message = document.getElementById('inputMessage0').value;
    var startTime = new Date();
    var bitArray = sjcl.hash.sha256.hash(message);
    var sha256Hash = sjcl.codec.hex.fromBits(bitArray);
    var endTime = new Date();
    var duration = endTime - startTime;
    var durationExplanationLong = '(hashing took ';
    var durationExplanationShort = '(took ';
    if (duration < 1) {
        durationExplanationLong += 'less than 1';
        durationExplanationShort += '<1';
    } else {
        durationExplanationLong += duration;
        durationExplanationShort += duration;
    }
    durationExplanationLong += ' millisecond' + (duration <= 1 ? '' : 's') + ')';
    durationExplanationShort += 'ms)';
    document.getElementById('hash0Duration').innerText = durationExplanationLong;
    var wrapButtonIsOn = (
        document.getElementById('hash0Results').parentNode.
        querySelector('button.wrap-nowrap').getAttribute('wrapped') == 'true'
    );
    var text = (
        message + ' -> SHA256 -> ' + sha256Hash + ' ' +
        durationExplanationShort + '\n' + (wrapButtonIsOn ? '\n' : '') +
        document.getElementById('hash0Results').innerText
    ).trim();
    if (!wrapButtonIsOn) text = alignText(text, '-> SHA256');
    document.getElementById('hash0Results').innerText = text;
    document.getElementById('hash0Results').parentNode.style.display = 'block';
}

var hash1Match = document.getElementById('match1').innerText;
var match1Found = false;
var previousMessage = '';
function runHash1Clicked() {
    var message = document.getElementById('inputMessage1').value;
    var overridePass = false;
    if (match1Found && (previousMessage == message)) {
        if (document.getElementById('inputCheckbox1').checked) overridePass = true;
        else return;
    }

    document.getElementById('preImage1').innerText = message;
    var startTime = new Date();
    var bitArray = sjcl.hash.sha256.hash(message);
    var sha256Hash = sjcl.codec.hex.fromBits(bitArray);
    var endTime = new Date();
    match1Found = (hash1Match == sha256Hash);
    if (match1Found && !overridePass) {
        document.getElementById('inputCheckbox1').checked = false;
    }
    var duration = endTime - startTime;
    var durationExplanationLong = '(hashing took ';
    if (duration < 1) {
        durationExplanationLong += 'less than 1';
    } else {
        durationExplanationLong += duration;
    }
    durationExplanationLong += ' millisecond' + (duration <= 1 ? '' : 's') + ')';
    document.getElementById('hash1Duration').innerText = durationExplanationLong;
    document.getElementById('hash1Result').innerHTML = sha256Hash;
    var wrapButtonIsOn = (
        document.getElementById('codeblock1HashResults').parentNode.
        querySelector('button.wrap-nowrap').getAttribute('wrapped') == 'true'
    );
    var incrementPreImage = document.getElementById('inputCheckbox1').checked;
    var currentMessage = message; // save before modification
    if (incrementPreImage) message = incrementAlpha(message);
    document.getElementById('inputMessage1').value = message;
    var html = document.getElementById('codeblock1HashResults').innerHTML;
    if (
        !wrapButtonIsOn
        && (previousMessage.length != message.length) // save some cpu power
    ) html = alignText(html, ':');
    document.getElementById('codeblock1HashResults').innerHTML = html;
    var matches = alphaInCommon(hash1Match, sha256Hash);
    borderTheDigits2('#codeblock1HashResults .individual-digits', matches);

    var numMatches = countMatches(matches);
    var status = (match1Found ? 'pass' : 'fail') + ' (because ';
    if (match1Found) status += 'all digits';
    else {
        if (numMatches == 0) status += '0';
        else if (numMatches > 0) status += 'only ' + numMatches;
        status += ' of ' + hash1Match.length + ' digits';
    }
    status += ' match)';
    document.getElementById('matchStatus1').innerText = status;
    document.getElementById('matchStatus1').style.color =
    (match1Found ? passColor : failColor);

    // prepare for next round
    previousMessage = currentMessage;
}

function runHash1And2WrapClicked(e, codeblock) {
    var btn = e.currentTarget;
    var codeblockHTML = codeblock.innerHTML;
    if (btn.getAttribute('wrapped') == 'true') {
        codeblock.innerHTML =
        codeblockHTML.replace(/\n/g, '\n\n').replace(/[ ]*:/g, ':');
    } else {
        codeblockHTML = codeblockHTML.replace(/^([\s\S]*?):([\s\S]*?)$/gm, '$1 :$2').
        replace(/\n\n/g, '\n');
        codeblock.innerHTML = alignText(codeblockHTML, ':');
    }
}

// iterate the given text through the alphabet, such that:
// a -> b
// z -> aa
// az -> ba
// ba -> bb
// zz -> aaa
// zaz -> zba
// @ -> a (@ is anything not in the alphabet)
// @z -> aa
var alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_-+=.\'';
var lastAlphabetChar = alphabet.substr(-1);
function incrementAlpha(text) {
    if (text.length == 0) return alphabet[0];
    var lastTextChar = text.substr(-1);
    if (lastTextChar == lastAlphabetChar) {
        // put all but the last char through this function recursively
        // set last char to first letter of alphabet
        return incrementAlpha(text.substr(0, text.length - 1)) + alphabet[0];
    } else {
        // we get here both when:
        // - the last char does not exist in the alphabet and
        // - the last char is not the last char of the alphabet
        // just increment the last char
        return text.substr(0, text.length - 1) + alphabet[alphabet.indexOf(lastTextChar) + 1];
    }
}

function alphaInCommon(text1, text2) {
    var inCommon = [];
    for (var i = 0; i < text1.length; i++) { // undefined when dne
        inCommon[i] = ((text1[i] === text2[i]) && (text1[i] != null));
    }
    return inCommon;
}

function countMatches(matchArray) {
    var matches = 0; // init
    for (var i = 0; i < matchArray.length; i++) {
        if (matchArray[i] === true) matches++;
    }
    return matches;
}

// align text from the splitter position onwards. the splitter must be unique.
var withinTag = false;
function alignText(text, splitter) {
    var lines = text.split('\n');
    if (lines.length == 1) return text;

    // first, find the biggest index position from any line
    var biggestIndentPos = 0; // init
    for (var lineI = 0; lineI < lines.length; lineI++) {
        var thisLine = lines[lineI];

        // strip html tags out (but keep content between)
        if (inArray('<', thisLine) && inArray('>', thisLine)) {
            var tmp = document.createElement('div');
            tmp.innerHTML = thisLine;
            thisLine = tmp.textContent;
        }
        var indentPos = thisLine.indexOf(splitter); // -1 if not found
        if (indentPos > biggestIndentPos) biggestIndentPos = indentPos;
    }

    // then do the indentation on each line
    for (var lineI = 0; lineI < lines.length; lineI++) {
        var thisLine = lines[lineI];
        if (!inArray(splitter, thisLine)) continue;

        var thisLineNoHTML = thisLine;
        if (inArray('<', thisLine) && inArray('>', thisLine)) {
            var tmp = document.createElement('div');
            tmp.innerHTML = thisLine;
            thisLineNoHTML = tmp.textContent;
        }
        var linePartsForCalc = thisLineNoHTML.split(splitter);
        var lineParts = thisLine.split(splitter);
        var beforeSplitter = lineParts.shift();
        lines[lineI] = beforeSplitter +
        ' '.repeat(biggestIndentPos - linePartsForCalc[0].length) + splitter +
        lineParts.join(splitter);
    }
    return lines.join('\n');
}

// todo - merge with borderTheDigits2
function borderTheDigits(cssSelectors, num2Color, pass) {
    var subjectEls = document.querySelectorAll(cssSelectors);
    for (var i = 0; i < subjectEls.length; i++) {
        var text = subjectEls[i].innerText; // get
        var newText = '';
        for (var letterI = 0; letterI < text.length; letterI++) {
            var style = '';
            if (num2Color != null) {
                if (letterI < num2Color) style = 'style="border: 1px solid ' + passColor + '"';
                else if (letterI == num2Color) {
                    style = 'style="border: 1px solid ' + (pass ? passColor : failColor) + '"';
                }
                else if (letterI == (num2Color + 1)) {
                    style = 'style="border-left: 1px solid ' + (pass ? passColor : failColor) + '"';
                }
            }
            newText += '<span class="individual-digit"' + style + '>' +
                text[letterI] +
            '</span>';
        }
        subjectEls[i].innerHTML = newText; // set
    }
}

function borderTheDigits2(cssSelectors, matchArray) {
    var subjectEls = document.querySelectorAll(cssSelectors);
    for (var i = 0; i < subjectEls.length; i++) {
        var text = subjectEls[i].innerText; // get
        var newText = '';
        for (var letterI = 0; letterI < matchArray.length; letterI++) {
            var border = '';
            var borderLeft = '';
            if (matchArray[letterI] === true) {
                border = 'border:1px solid ' + passColor + ';';
            } else if (matchArray[letterI] === false) {
                border = 'border:1px solid ' + failColor + ';';
            }
            if (matchArray[letterI - 1] === true) {
                borderLeft = 'border-left:1px solid ' + passColor + ';';
            }
            newText += '<span class="individual-digit" style="' + border +
            borderLeft + '">' +
                text[letterI] +
            '</span>';
        }
        subjectEls[i].innerHTML = newText; // set
    }
}

function version3Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.versionRaw) return;
    deleteElementById('version3Error1');
    deleteElementById('version3Error2');
    deleteElementById('version3Error3');
    resetMiningStatus();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader3Error',
            'version3Error1',
            'the version must be an integer'
        );
        setButtons(false, 'RunHash3');
        miningData.versionRaw = this.value; // last
        return;
    }
    var version3 = parseInt(this.value);
    if (version3 < 0) {
        addLi2Ul(
            'blockHeader3Error',
            'version3Error1',
            'the version must be greater than 0'
        );
        setButtons(false, 'RunHash3');
        miningData.versionRaw = this.value; // last
        return;
    }
    if (version3 > 0xffffffff) {
        addLi2Ul(
            'blockHeader3Error',
            'version3Error2',
            'the version must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash3');
        miningData.versionRaw = this.value; // last
        return;
    }
    miningData.version = toLittleEndian(int2hex(version3, 8));
    setButtons(true, 'RunHash3');
    miningData.versionRaw = this.value; // last
}

function prevHash3Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.prevHashRaw) return;
    deleteElementById('prevHash3Error1');
    deleteElementById('prevHash3Error2');
    resetMiningStatus();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader3Error',
            'prevHash3Error1',
            'the previous block hash must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash3');
        miningData.prevHashRaw = this.value; // last
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader3Error',
            'prevHash3Error2',
            'the previous block hash must be 32 bytes long'
        );
        setButtons(false, 'RunHash3');
        miningData.prevHashRaw = this.value; // last
        return;
    }
    miningData.prevHash = toLittleEndian(this.value);
    setButtons(true, 'RunHash3');
    miningData.prevHashRaw = this.value; // last
}

function merkleRoot3Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.merkleRootRaw) return;
    deleteElementById('merkleRoot3Error1');
    deleteElementById('merkleRoot3Error2');
    resetMiningStatus();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader3Error',
            'merkleRoot3Error1',
            'the merkle root must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash3');
        miningData.merkleRootRaw = this.value; // last
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader3Error',
            'merkleRoot3Error2',
            'the merkle root must be 32 bytes long'
        );
        setButtons(false, 'RunHash3');
        miningData.merkleRootRaw = this.value; // last
        return;
    }
    miningData.merkleRoot = toLittleEndian(this.value);
    setButtons(true, 'RunHash3');
    miningData.merkleRootRaw = this.value; // last
}

// the timetstamp can be either an integer (unixtime) or a date string
function timestamp3Changed() {
    // do not trim, or the user will not be able to put spaces between words
    if (this.value == miningData.timestampRaw) return;
    deleteElementById('timestamp3Error1');
    deleteElementById('timestamp3Error2');
    deleteElementById('timestamp3Error3');
    resetMiningStatus();
    if (stringIsInt(Date.parse(this.value))) {
        var timestamp3 = unixtime(this.value);
        document.getElementById('timestamp3Explanation').innerText = '';
    } else if (stringIsInt(this.value)) {
        var timestamp3 = parseInt(this.value);
        document.getElementById('timestamp3Explanation').innerText = '(unixtime)';
    } else {
        addLi2Ul(
            'blockHeader3Error',
            'timestamp3Error1',
            'the timestamp must either be a valid date-time, or be an integer (unixtime)'
        );
        setButtons(false, 'RunHash3');
        miningData.timestampRaw = this.value; // last
        return;
    }
    if (timestamp3 < 1231006505) {
        addLi2Ul(
            'blockHeader3Error',
            'timestamp3Error1',
            'the timestamp cannot come before 03 Jan 2009, 18:15:05 (GMT)'
        );
        setButtons(false, 'RunHash3');
        miningData.timestampRaw = this.value; // last
        return;
    }
    if (timestamp3 > 0xffffffff) {
        addLi2Ul(
            'blockHeader3Error',
            'timestamp3Error1',
            'the timestamp cannot come after 07 Feb 2106, 06:28:15 (GMT)'
        );
        setButtons(false, 'RunHash3');
        miningData.timestampRaw = this.value; // last
        return;
    }
    miningData.timestamp = toLittleEndian(int2hex(timestamp3, 8));
    setButtons(true, 'RunHash3');
    miningData.timestampRaw = this.value; // last
}

function bits3Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.bitsRaw) return;
    resetMiningStatus();
    deleteElementById('bits3Error1');
    deleteElementById('bits3Error2');
    if (this.value.length != 8) {
        addLi2Ul(
            'blockHeader3Error',
            'bits3Error1',
            'the difficulty must be 4 bytes long'
        );
        setButtons(false, 'RunHash3');
        miningData.bitsRaw = this.value; // last
        return;
    }
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader3Error',
            'bits3Error2',
            'the difficulty must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash3');
        miningData.bitsRaw = this.value; // last
        return;
    }
    miningData.bits = toLittleEndian(this.value);
    miningData.target = bits2target(this.value);
    document.getElementById('target3').innerText = miningData.target;
    borderTheDigits('#target3'); // erase colors
    setButtons(true, 'RunHash3');
    miningData.bitsRaw = this.value; // last
}

function nonce3Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.nonceRaw) return;
    deleteElementById('nonce3Error1');
    deleteElementById('nonce3Error2');
    deleteElementById('nonce3Error3');
    resetMiningStatus();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader3Error',
            'nonce3Error1',
            'the nonce must be an integer'
        );
        setButtons(false, 'RunHash3');
        miningData.nonceRaw = this.value; // last
        return;
    }
    miningData.nonceInt = parseInt(this.value);
    if (miningData.nonceInt < 0) {
        addLi2Ul(
            'blockHeader3Error',
            'nonce3Error2',
            'the nonce must be greater than 0'
        );
        setButtons(false, 'RunHash3');
        miningData.nonceRaw = this.value; // last
        return;
    }
    if (miningData.nonceInt > 0xffffffff) {
        addLi2Ul(
            'blockHeader3Error',
            'nonce3Error3',
            'the nonce must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash3');
        miningData.nonceRaw = this.value; // last
        return;
    }
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    setButtons(true, 'RunHash3');
    miningData.nonceRaw = this.value; // last
}

function resetMiningStatus() {
    document.getElementById('blockhash3').innerText = '';
    document.getElementById('mineStatus3').innerText = '';
    borderTheDigits('#target3'); // erase colors
}

function mine3AndRenderResults() {
    miningData.nonceInt += 1;
    if (miningData.nonceInt > 0xffffffff) miningData.nonceInt = 0;
    document.getElementById('nonce3').value = miningData.nonceInt;
    miningData.nonceRaw = miningData.nonceInt;
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    var minedResult = mine(); // using global var miningData
    document.getElementById('blockhash3').innerText = minedResult.blockhash;
    borderTheDigits(
        '#block3MiningResults .individual-digits',
        minedResult.resolution,
        minedResult.status
    );

    if (minedResult.status) {
        popup('success!', 'you mined a block');
        setTimeout(function() { hidePopup(); }, 2000);
        setButtons(false, 'RunHash3');
        document.getElementById('mineStatus3').innerHTML = 'pass';
        document.getElementById('mineStatus3').style.color = passColor;
        return;
    }
    var explanation = 'because ' + minedResult.blockhash[minedResult.resolution] +
    ' is greater than ' + miningData.target[minedResult.resolution];
    document.getElementById('mineStatus3').innerText = 'fail (' + explanation + ')';
    document.getElementById('mineStatus3').style.color = failColor;
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
    var miningStatus = hexCompare(sha256Hash, miningData.target, true); // sha256 <= target ?
    return {
        blockhash: sha256Hash,
        status: miningStatus.status,
        resolution: miningStatus.resolution
    };
}

// align the status when the 'wrap' button is clicked
function runHash3WrapClicked(e) {
    var btn = e.currentTarget;
    var codeblockHtml = btn.parentNode.parentNode.querySelector('.codeblock').innerHTML;
    if (btn.getAttribute('wrapped') == 'true') {
        btn.parentNode.parentNode.querySelector('.codeblock').innerHTML =
        codeblockHtml.replace('status:     ', 'status: ');
    } else {
        btn.parentNode.parentNode.querySelector('.codeblock').innerHTML =
        codeblockHtml.replace('status: ', 'status:     ');
    }
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
function hexCompare(hex1, hex2, getResolution) {
    var hex1bak = hex1;
    var hex2bak = hex2;
    var resolution = null; // init

    // first, chop off leading zeros
    hex1 = hex1.replace(/^0*/, '');
    hex2 = hex2.replace(/^0*/, '');

    if (getResolution) resolution = Math.min(
        hex1bak.length - hex1.length,
        hex2bak.length - hex2.length
    );

    // if hex1 is shorter than hex2 then it is smaller
    if (hex1.length != hex2.length) return {
        status: hex1.length < hex2.length,
        resolution: resolution
    }

    // loop through from msb to lsb until there is a difference
    for (var nibbleI = 0; nibbleI < hex1.length; nibbleI++) {
        var hex1Nibble = hex1[nibbleI];
        var hex2Nibble = hex2[nibbleI];
        if (hex1Nibble == hex2Nibble) continue;
        if (getResolution) resolution += nibbleI;
        return {
            status: hex2int(hex1Nibble) <= hex2int(hex2Nibble),
            resolution: resolution
        };
    }
    return {
        status: false,
        resolution: resolution
    };
}

function hex2int(hexStr) {
    return parseInt(hexStr, 16);
}

function int2hex(intiger, leftPad) {
    var hex = intiger.toString(16);
    if (leftPad == null || hex.length >= leftPad) return hex;
    return '0'.repeat(leftPad - hex.length) + hex;
}

function toLittleEndian(hexStr) {
    if (hexStr.length <= 2) return hexStr;
    if (hexStr.length % 2 == 1) hexStr = '0' + hexStr;
    return hexStr.match(/.{2}/g).reverse().join('')
}

function initBlockchainSVG() {
    var svg = document.getElementById('blockchainSVG').contentDocument.
    getElementsByTagName('svg')[0];
    var svgDefs = svg.getElementsByTagName('defs')[0];
    var svgView = svg.getElementById('view');
    var borderTop = 1;

    // fetch the number of txs per block
    var getNumBlockTxs = function(blockNum) {
        if (blockNum < txsPerBlock.length) return;

        var endRange = (Math.ceil(blockNum / 1000) * 1000) - 1;
        if (txsPerBlock.length > endRange) return;

        var startRange = Math.floor(blockNum / 1000) * 1000;
        ajax(
            '/json/btc_txs_per_block_' + startRange + '-' + endRange + '.json',
            function(json) {
            try {
                var numTxsArray = JSON.parse(json).txsPerBlock;
                txsPerBlock = txsPerBlock.concat(numTxsArray);
                // this will create a huge array, but javascript can handle it :)
            }
            catch(err) {}
        });
    };
    getNumBlockTxs(1); // fetch json via ajax to init the txsPerBlock array

    // render the correct number of transactions for each block
    var txHeight = svgDefs.getElementsByClassName('btc-tx')[0].getBoundingClientRect().
    height;
    var renderBlockTxs = function(blockEl, blockNum) {
        // wipe all txs from the btc-txs group in this block
        var txs = blockEl.getElementsByClassName('btc-txs')[0];
        txs.parentNode.replaceChild(txs.cloneNode(false), txs);
        var newTxs = blockEl.getElementsByClassName('btc-txs')[0];

        for (var i = 0; i < txsPerBlock[blockNum]; i++) {
            var tx = svgDefs.getElementsByClassName('btc-tx')[0].cloneNode(true);
            tx.setAttribute('transform', 'translate(0,' + (txHeight * i) + ')');
            tx.getElementsByTagName('text')[0].textContent = 'transaction ' + (i + 1);
            newTxs.appendChild(tx);
        }
    };

    // copy blocks and braces to render a blockchain 3x as wide as the svg
    var svgWidth = svg.getBoundingClientRect().width; // pre-compute
    var horizontalPadding = 0; // between blocks and braces (init)
    var blockWidth = svg.getElementById('block').getBoundingClientRect().width;
    var bracesWidth = svg.getElementById('braces').getBoundingClientRect().width;
    var viewWidth = 0; // init
    for (var blockNum = 0; viewWidth <= (svgWidth * 3); blockNum++) {
        var block = svg.getElementById('block').cloneNode(true);
        block.getElementsByTagName('text')[0].textContent = 'block ' + blockNum;
        block.id = 'block' + blockNum;
        block.setAttribute(
            'transform',
            'translate(' + (viewWidth + horizontalPadding) + ')'
        );
        svgView.appendChild(block);
        viewWidth += horizontalPadding + blockWidth;
        horizontalPadding = 15; // always 15 after the first block

        var braces = svg.getElementById('braces').cloneNode(true);
        braces.setAttribute(
            'transform',
            'translate(' + (viewWidth + horizontalPadding) + ',20)'
        );
        svgView.appendChild(braces);
        viewWidth += horizontalPadding + bracesWidth;
    }

    // append the instructions
    svg.appendChild(svgDefs.getElementsByClassName('big-instructions')[0]);

    // roughly center the view in the x direction and offset to give the illiusion
    // that the blocks are positioned the same as they currently are
    var blockAndBracesWidth = blockWidth + bracesWidth + (2 * horizontalPadding);
    var numVisibleBlocks = Math.floor(svgWidth / blockAndBracesWidth);
    var resetView = function() {
        var viewLeft = svgView.getBoundingClientRect().left;
        var allBlocks = svgView.getElementsByClassName('btc-block');
        var leftmostBlock = parseInt(allBlocks[0].id.replace(/[a-z]/g, ''));
        if ((viewLeft > -svgWidth) && (leftmostBlock == 0)) return null;

        // put viewLeft somewhere back between -svgWidth and actionZone
        var blocksPastActionZone = Math.trunc(
            (svgWidth + viewLeft) / blockAndBracesWidth
        );
        if (blocksPastActionZone == 0) return null;
        // never let the leftmost block index be less than 0
        if (leftmostBlock < blocksPastActionZone) blocksPastActionZone = leftmostBlock;
        var translateX = viewLeft - (blocksPastActionZone * blockAndBracesWidth);
        var viewTop = svgView.getBoundingClientRect().top + borderTop;
        svgView.setAttribute(
            'transform', 'translate(' + translateX + ',' + viewTop + ')'
        );
        // alternate between 'block' and 'bloc' otherwise ids may not be
        // overwritten in some browsers?
        var newIdPrefix = (allBlocks[0].id.replace(/[0-9]/g, '') == 'block') ?
        'bloc' : 'block';
        var currentBlockNum = leftmostBlock;
        for (var i = 0; i < allBlocks.length; i++) {
            var newBlockNum = currentBlockNum - blocksPastActionZone;
            allBlocks[i].id = newIdPrefix + newBlockNum;
            allBlocks[i].getElementsByTagName('text')[0].textContent = 'block ' +
            newBlockNum;
            renderBlockTxs(allBlocks[i], newBlockNum);
            getNumBlockTxs(newBlockNum + (3 * numVisibleBlocks)); // fetch ahead
            currentBlockNum++
        }
        return {dx: translateX, dy: viewTop};
    }

    // drag-events
    var mouseStartX = 0, mouseStartY = 0; // init scope
    var prevDx = 0, prevDy = 0; // init scope
    var dx = 0, dy = 0; // init scope
    var dragging = false; // init scope
    var svgHeight = svg.getBoundingClientRect().height; // pre-compute
    addEvent(svg, 'mousedown, touchstart', function(e) {
        switch (e.type) {
            case 'touchstart':
                e.cancelBubble = true;
                mouseStartX = e.touches[0].clientX;
                mouseStartY = e.touches[0].clientY;
                break;
            case 'mousedown':
                e.stopPropagation();
                mouseStartX = e.clientX;
                mouseStartY = e.clientY;
                break;
        }
        dragging = true;
    });
    var instructionsHidden = false; // init
    addEvent(svg, 'mousemove, touchmove', function(e) {
        switch (e.type) {
            case 'touchmove': e.cancelBubble = true; break;
            case 'mousemove': e.stopPropagation(); break;
        }
        if (!dragging) return;

        if (!instructionsHidden) {
            svg.removeChild(svg.getElementsByClassName('big-instructions')[0]);
            instructionsHidden = true;
        }
        switch (e.type) {
            case 'touchmove':
                var clientX = e.touches[0].clientX;
                var clientY = e.touches[0].clientY;
                break;
            case 'mousemove':
                var clientX = e.clientX;
                var clientY = e.clientY;
                break;
        }
        dx = prevDx + clientX - mouseStartX;
        if (dx > 0) dx = 0; // only allow dragging to the left

        dy = prevDy + clientY - mouseStartY;

        // don't allow dragging up past the view height
        var viewHeight = svgView.getBoundingClientRect().height; // pre-compute
        if (dy < (svgHeight - viewHeight - borderTop)) {
            dy = svgHeight - viewHeight - borderTop;
        }
        if (dy > 0) dy = 0; // only allow dragging up
        svgView.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
    });
    addEvent(svg, 'mouseup, mouseleave, touchend', function(e) {
        switch (e.type) {
            case 'touchmove': e.cancelBubble = true; break;
            case 'mousemove': e.stopPropagation(); break;
        }
        if (!dragging) return;
        dragging = false;
        var translation = resetView();
        prevDx = (translation == null) ? dx : translation.dx;
        prevDy = (translation == null) ? dy : translation.dy;
    });
}
