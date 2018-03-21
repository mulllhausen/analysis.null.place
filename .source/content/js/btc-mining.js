// init globals
var passColor = '#7db904'; // green
var failColor = 'red';
var stopHashingForm = {}; // eg {2: false}
var difficultyChars = {}; // eg {1:64, 2:64, 3:0}
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
addEvent(window, 'load', function () {
    // form 0 - hashing demo
    addEvent(document.getElementById('btnRunHash0'), 'click', runHash0Clicked);
    addEvent(document.getElementById('inputMessage0'), 'keyup', function (e) {
        if (e.keyCode != 13) return; // only allow the enter key
        runHash0Clicked();
    });
    addEvent(
        document.getElementById('form0').querySelector('button.wrap-nowrap'),
        'click',
        runHashWrapClicked
    );

    // form 1 - hashing manually to match hash
    var hash1Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match1').innerText,
        matchFound: false,
        previousNonce: '',
        formNum: 1,
        hashRateData: [],
        prefix: '' // no prefix
    };
    stopHashingForm[1] = false;
    difficultyChars[1] = 64; // match all characters
    addEvent(document.getElementById('btnRunHash1'), 'click', function () {
        runHash1Or2Or3Clicked(hash1Params);
    });
    addEvent(document.getElementById('inputMessage1'), 'keyup', function (e) {
        if (e.keyCode != 13) return; // only allow the enter key
        runHash1Or2Or3Clicked(hash1Params);
    });
    addEvent(
        document.getElementById('form1').querySelector('button.wrap-nowrap'),
        'click',
        runHashWrapClicked
    );

    // form 2 - hashing automatically to match hash
    var hash2Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match2').innerText,
        matchFound: false,
        previousNonce: '',
        formNum: 2,
        state: 'stopped',
        hashRateData: [],
        prefix: '' // no prefix
    };
    stopHashingForm[2] = false;
    difficultyChars[2] = 64; // match all characters
    addEvent(document.getElementById('btnRunHash2'), 'click', function (e) {
        runHash2Clicked(e, hash2Params);
    });
    addEvent(
        document.getElementById('form2').querySelector('button.wrap-nowrap'),
        'click',
        runHashWrapClicked
    );

    // form 3 - proof of work
    var hash3Params = {
        firstTime: true,
        hashMatch: document.getElementById('match3').innerText,
        matchFound: false,
        previousNonce: '',
        formNum: 3,
        state: 'stopped',
        hashRateData: [],
        attempts: {}, // eg 5 chars: 10 attempts
        prefix: initProofOfWorkForm()
    };
    addEvent(document.getElementById('btnRunHash3'), 'click', function (e) {
        runHash3Clicked(e, hash3Params);
    });
    difficultyChars[3] = 1; // init: match first character only
    addEvent(document.getElementById('difficulty3'), 'change', difficulty3Changed);
    addEvent(
        document.getElementById('form3').querySelector('button.wrap-nowrap'),
        'click',
        runHashWrapClicked
    );

    // dragable blockchain svg
    initBlockchainSVG();

    // form 4 - bitcoin mining
    addEvent(document.getElementById('version4'), 'keyup, change', version4Changed);
    triggerEvent(document.getElementById('version4'), 'change');

    addEvent(document.getElementById('prevHash4'), 'keyup, change', prevHash4Changed);
    triggerEvent(document.getElementById('prevHash4'), 'change');

    addEvent(document.getElementById('merkleRoot4'), 'keyup, change', merkleRoot4Changed);
    triggerEvent(document.getElementById('merkleRoot4'), 'change');

    addEvent(document.getElementById('timestamp4'), 'keyup, change', timestamp4Changed);
    triggerEvent(document.getElementById('timestamp4'), 'change');

    addEvent(document.getElementById('bits4'), 'keyup, change', bits4Changed);
    triggerEvent(document.getElementById('bits4'), 'change');

    addEvent(document.getElementById('nonce4'), 'keyup, change', nonce4Changed);
    triggerEvent(document.getElementById('nonce4'), 'change');

    addEvent(document.getElementById('btnRunHash4'), 'click', mine4AndRenderResults);
    addEvent(
        document.getElementById('form4').querySelector('button.wrap-nowrap'),
        'click',
        runHashWrapClicked
    );
});

function runHashWrapClicked(e) {
    var btn = e.currentTarget;
    var codeblock = btn.closest('.form-container').querySelector('.codeblock');
    if (btn.getAttribute('wrapped') == 'true') codeblock.innerHTML = codeblock.
    innerHTML.replace(/\n/g, '\n\n');
    else codeblock.innerHTML = codeblock.innerHTML.replace(/\n\n/g, '\n');
}

// form 0
function runHash0Clicked() {
    var form0 = document.getElementById('form0');
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
        form0.querySelector('button.wrap-nowrap').getAttribute('wrapped') == 'true'
    );
    var hash0Results = document.getElementById('hash0Results');
    hash0Results.innerHTML = (
        message + ' <span class="aligner"></span>-> SHA256 -> ' + sha256Hash +
        ' ' + durationExplanationShort + '\n' + (wrapButtonIsOn ? '\n' : '') +
        hash0Results.innerHTML
    ).trim();
    if (!wrapButtonIsOn) alignText(hash0Results);
    hash0Results.closest('.codeblock-container').style.display = 'block';
}

// form 2
function runHash2Clicked(e, params) {
    switch (params.state) {
        case 'running':
            stopHashingForm[2] = true;
            params.state = 'stopped';
            e.currentTarget.innerHTML = 'Run SHA256 Automatically';
            renderHashing2Duration(params.hashRateData); // update the paragraph
            break;
        case 'stopped':
            stopHashingForm[2] = false;
            params.state = 'running';
            e.currentTarget.innerHTML = 'Stop';
            (function loop(params) {
                if (stopHashingForm[2]) return;
                runHash1Or2Or3Clicked(params);
                setTimeout(function () { loop(params); }, 0);
            })(params);
            break;
    }
}

// update the paragraph text with stats
function renderHashing2Duration(hashRateData) {
    var hashRate = getAverageHashRate(hashRateData, true);
    if (hashRate < 1) return;
    document.getElementsByClassName('hash2Rate')[0].innerText = hashRate;
    document.getElementsByClassName('hash2Rate')[1].innerText = hashRate;
    document.getElementById('showHowLongForThisDevice').style.display = 'inline';
    // x hashes per second takes ((2^256) / x) seconds =
    // = ((2^256) / (x * 60 * 60 *  24 * 365)) years
    // = ((2^256) / (x * 60 * 60 *  24 * 365 * 1000000)) million years
    // = ((2^256) / (x * 60 * 60 *  24 * 365 * (1000000^10))) million^10 years
    // = (3671743063 / x) million^10 years
    var durationInMillionPow10Years = addThousandCommas(Math.round(3671743063 / hashRate));
    document.getElementById('howLongForThisDeviceWords').innerText =
    durationInMillionPow10Years + ' million'.repeat(10) + ' years';

    document.getElementById('howLongForThisDeviceNumber').innerText =
    durationInMillionPow10Years + ',000'.repeat(20) + ' years';
}

// form 3
function initProofOfWorkForm() {
    // init the dropdown list for the number of characters to match
    var dropdownNumChars = '<option value="1">match first character only</option>\n';
    for (var i = 2; i < 64; i++) {
        dropdownNumChars += '<option value="' + i + '">match first ' + i +
        ' characters only</option>\n';
    }
    dropdownNumChars += '<option value="64">match all 64 characters</option>\n';
    document.getElementById('difficulty3').innerHTML = dropdownNumChars;

    // border the target digits
    borderTheDigits('#match3', new Array(64));

    // init the mining prefix
    var prefix = getRandomAlpha(10);
    document.getElementById('inputMessage3Prefix').value = prefix;
    return prefix;
}

function difficulty3Changed(e) {
    difficultyChars[3] = parseInt(e.currentTarget.value);
    // enable mining again after a difficulty change
    document.getElementById('btnRunHash3').disabled = false;
}

function runHash3Clicked(e, params) {
    switch (params.state) {
        case 'running':
            stopHashingForm[3] = true;
            params.state = 'stopped';
            e.currentTarget.innerHTML = 'Mine with SHA256';
            document.getElementById('difficulty3').disabled = false;
            break;
        case 'stopped':
            stopHashingForm[3] = false;
            params.state = 'running';
            e.currentTarget.innerHTML = 'Stop';
            if (!params.attempts.hasOwnProperty(difficultyChars[3])) {
                params.attempts[difficultyChars[3]] = 0;
                params.attempts['matchFound' + difficultyChars[3]] = false;
            }
            document.getElementById('difficulty3').disabled = true;
            (function loop(params) {

                if (stopHashingForm[3]) return;
                runHash1Or2Or3Clicked(params);
                params.attempts[difficultyChars[3]]++;
                if (params.matchFound) {
                    stopHashingForm[3] = true;
                    params.state = 'stopped';
                    params.attempts['matchFound' + difficultyChars[3]] = true;
                    var btn = document.getElementById('btnRunHash3');
                    btn.disabled = true; // disabled until difficulty is changed
                    btn.innerHTML = 'Mine with SHA256';
                    document.getElementById('difficulty3').
                    getElementsByTagName('option')[difficultyChars[3] - 1].
                    disabled = true;
                    // allow the difficulty to be changed now we have stopped
                    document.getElementById('difficulty3').disabled = false;
                }
                var statistics = '\n' // init
                for (var numChars = 1; numChars <= 64; numChars++) {
                    if (!params.attempts.hasOwnProperty(numChars)) continue;
                    var attempts = params.attempts[numChars];
                    var minedStatus = ' not yet mined after '; // init
                    if (params.attempts['matchFound' + numChars]) minedStatus =
                    ' mined in ';
                    if (!params.attempts.hasOwnProperty('luck' + numChars)) {
                        params.attempts['luck' + numChars] = ''; // init
                    }
                    if (
                        params.attempts['matchFound' + numChars] &&
                        (params.attempts['luck' + numChars] == '')
                    ) {
                        // the average number of attempts is (16^numChars) / 2
                        // very lucky is less than half of that
                        var luckyThreshold = Math.floor(Math.pow(16, numChars) / 4);
                        var unluckyThreshold = 3 * luckyThreshold;
                        var lucky = '';
                        if (attempts < luckyThreshold) {
                            lucky = ' (very lucky';
                        } else if (attempts > unluckyThreshold) {
                            lucky = ' (very unlucky';
                        } else lucky = ' (pretty standard';
                        lucky += ' - the average is ' + (luckyThreshold * 2) +
                        ' attempts)';
                        params.attempts['luck' + numChars] = lucky;
                    }
                    statistics += numChars + ' digit' + plural('s', numChars > 1) +
                    minedStatus + attempts + ' attempt' +
                    plural('s', attempts > 1) +
                    params.attempts['luck' + numChars] + '\n';
                }
                document.getElementById('mining3Statistics').innerText = statistics;

                setTimeout(function () { loop(params); }, 0);
            })(params);
            break;
    }
}

// forms 1, 2 and 3
function runHash1Or2Or3Clicked(params) {
    // stop running if in a loop
    if (stopHashingForm[params.formNum]) return false;

    if (params.firstTime) {
        document.getElementById('info' + params.formNum).style.display =
        'inline';
        document.getElementById('showResults' + params.formNum).style.display =
        'inline';
        params.firstTime = false;
    }
    var nonce = document.getElementById('inputMessage' + params.formNum).value;
    var overridePass = false; // keep going after a match is found?
    var inputCheckbox = document.getElementById('inputCheckbox' + params.formNum);
    if (params.matchFound && (params.previousNonce == nonce)) {
        if (inputCheckbox != null && inputCheckbox.checked) {
            overridePass = true;
        }
        else return;
    }

    document.getElementById('preImage' + params.formNum).innerText =
    params.prefix + nonce;
    var bitArray = sjcl.hash.sha256.hash(params.prefix + nonce);
    var sha256Hash = sjcl.codec.hex.fromBits(bitArray);

    // update the latest hash times for averaging later
    params.hashRateData.push((new Date()).getTime()); // push on the end
    while (params.hashRateData.length > 10) {
        params.hashRateData.shift(); // pop from the start
    }
    document.getElementById('info' + params.formNum).getElementsByTagName('span')[0].
    innerText = getAverageHashRate(params.hashRateData);

    params.matchFound = (
        params.hashMatch.substr(0, difficultyChars[params.formNum]) ==
        sha256Hash.substr(0, difficultyChars[params.formNum])
    );
    if (params.matchFound && !overridePass && inputCheckbox != null) {
        inputCheckbox.checked = false;
    }
    document.getElementById('hash' + params.formNum + 'Result').innerHTML = sha256Hash;
    var wrapButtonIsOn = (
        document.getElementById('form' + params.formNum).
        querySelector('button.wrap-nowrap').getAttribute('wrapped') == 'true'
    );
    var incrementPreImage = (inputCheckbox == null || inputCheckbox.checked);
    var currentNonce = nonce; // save before modification
    if (incrementPreImage) nonce = incrementAlpha(nonce);
    document.getElementById('inputMessage' + params.formNum).value = nonce;

    // fix up the alignment if the pre-image length hash changed
    if (
        !wrapButtonIsOn
        && (params.previousNonce.length != nonce.length)
    ) alignText(document.getElementById('codeblock' + params.formNum + 'HashResults'));

    var matches = alphaInCommon(params.hashMatch, sha256Hash);
    // only show matches upto the difficulty
    matches = matchResolution(matches, difficultyChars[params.formNum]);
    borderTheDigits(
        '#codeblock' + params.formNum + 'HashResults .individual-digits', matches
    );

    var numMatches = countMatches(matches);
    var status = (params.matchFound ? 'pass' : 'fail') + ' (because ';
    if (params.matchFound) status += 'all digits';
    else {
        if (numMatches == 0) status += '0';
        else if (numMatches > 0) status += 'only ' + numMatches;
        status += ' of ' + difficultyChars[params.formNum] + ' digits';
    }
    status += ' match)';
    document.getElementById('matchStatus' + params.formNum).innerText = status;
    document.getElementById('matchStatus' + params.formNum).style.color =
    (params.matchFound ? passColor : failColor);

    // prepare for next round
    params.previousNonce = currentNonce;
    return true; // keep running if in a loop
}

function getAverageHashRate(hashRateData, numberOnly) {
    // add up the diffs between each item in the list
    var sum = 0;
    for (var i = 1; i < hashRateData.length; i++) {
        sum += (hashRateData[i] - hashRateData[i - 1]);
    }
    var average = 0;
    if (sum == 0) average = 0; // avoid div by 0
    else average = Math.round((1000 * (hashRateData.length - 1)) / sum);
    if (average < 1 && (numberOnly != true)) average = 'less than 1';
    return average;
}

function matchResolution(matches, resolution) {
    foreach (matches, function (i) {
        if (i < resolution) return; // continue
        matches[i] = null;
    });
    return matches;
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

function getRandomAlpha(length) {
    var randomAlpha = ''; // init
    for (var i = 0; i < length; i++) {
        randomAlpha += alphabet[Math.round((alphabet.length - 1) * Math.random())];
    }
    return randomAlpha;
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
    foreach (matchArray, function (i, el) {
        if (el === true) matches++;
    });
    return matches;
}

function borderTheDigits(cssSelectors, matchArray, failPrecedence) {
    failPrecedence = (failPrecedence == true); // off by default
    var passPrecedence = !failPrecedence; // on by default
    foreach (document.querySelectorAll(cssSelectors), function (i, el) {
        var text = el.innerText; // get
        var newHTML = '';
        foreach (matchArray, function (letterI) {
            var border = '';
            var borderLeft = '';
            switch (matchArray[letterI]) {
                case true:
                    border = 'border:1px solid ' + passColor + ';';
                    break;
                case false:
                    border = 'border:1px solid ' + failColor + ';';
                    break;
            }
            switch (matchArray[letterI - 1]) {
                case true:
                    if ((matchArray[letterI] != null) && failPrecedence) break;
                    borderLeft = 'border-left:1px solid ' + passColor + ';';
                    break;
                case false:
                    if ((matchArray[letterI] != null) && passPrecedence) break;
                    borderLeft = 'border-left:1px solid ' + failColor + ';';
                    break;
            }
            newHTML += '<span class="individual-digit" style="' + border +
            borderLeft + '">' + text[letterI] + '</span>';
        });
        el.innerHTML = newHTML; // set
    });
}

function version4Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.versionRaw) return;
    deleteElementById('version4Error1');
    deleteElementById('version4Error2');
    deleteElementById('version4Error3');
    resetMiningStatus();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader4Error',
            'version4Error1',
            'the version must be an integer'
        );
        setButtons(false, 'RunHash4');
        miningData.versionRaw = this.value; // last
        return;
    }
    var version4 = parseInt(this.value);
    if (version4 < 0) {
        addLi2Ul(
            'blockHeader4Error',
            'version4Error1',
            'the version must be greater than 0'
        );
        setButtons(false, 'RunHash4');
        miningData.versionRaw = this.value; // last
        return;
    }
    if (version4 > 0xffffffff) {
        addLi2Ul(
            'blockHeader4Error',
            'version4Error2',
            'the version must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash4');
        miningData.versionRaw = this.value; // last
        return;
    }
    miningData.version = toLittleEndian(int2hex(version4, 8));
    setButtons(true, 'RunHash4');
    miningData.versionRaw = this.value; // last
}

function prevHash4Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.prevHashRaw) return;
    deleteElementById('prevHash4Error1');
    deleteElementById('prevHash4Error2');
    resetMiningStatus();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader4Error',
            'prevHash4Error1',
            'the previous block hash must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash4');
        miningData.prevHashRaw = this.value; // last
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader4Error',
            'prevHash4Error2',
            'the previous block hash must be 32 bytes long'
        );
        setButtons(false, 'RunHash4');
        miningData.prevHashRaw = this.value; // last
        return;
    }
    miningData.prevHash = toLittleEndian(this.value);
    setButtons(true, 'RunHash4');
    miningData.prevHashRaw = this.value; // last
}

function merkleRoot4Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.merkleRootRaw) return;
    deleteElementById('merkleRoot4Error1');
    deleteElementById('merkleRoot4Error2');
    resetMiningStatus();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader4Error',
            'merkleRoot4Error1',
            'the merkle root must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash4');
        miningData.merkleRootRaw = this.value; // last
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader4Error',
            'merkleRoot4Error2',
            'the merkle root must be 32 bytes long'
        );
        setButtons(false, 'RunHash4');
        miningData.merkleRootRaw = this.value; // last
        return;
    }
    miningData.merkleRoot = toLittleEndian(this.value);
    setButtons(true, 'RunHash4');
    miningData.merkleRootRaw = this.value; // last
}

// the timetstamp can be either an integer (unixtime) or a date string
function timestamp4Changed() {
    // do not trim, or the user will not be able to put spaces between words
    if (this.value == miningData.timestampRaw) return;
    deleteElementById('timestamp4Error1');
    deleteElementById('timestamp4Error2');
    deleteElementById('timestamp4Error3');
    resetMiningStatus();
    if (stringIsInt(Date.parse(this.value))) {
        var timestamp4 = unixtime(this.value);
        document.getElementById('timestamp4Explanation').innerText = '';
    } else if (stringIsInt(this.value)) {
        var timestamp4 = parseInt(this.value);
        document.getElementById('timestamp4Explanation').innerText = '(unixtime)';
    } else {
        addLi2Ul(
            'blockHeader4Error',
            'timestamp4Error1',
            'the timestamp must either be a valid date-time, or be an integer (unixtime)'
        );
        setButtons(false, 'RunHash4');
        miningData.timestampRaw = this.value; // last
        return;
    }
    if (timestamp4 < 1231006505) {
        addLi2Ul(
            'blockHeader4Error',
            'timestamp4Error1',
            'the timestamp cannot come before 03 Jan 2009, 18:15:05 (GMT)'
        );
        setButtons(false, 'RunHash4');
        miningData.timestampRaw = this.value; // last
        return;
    }
    if (timestamp4 > 0xffffffff) {
        addLi2Ul(
            'blockHeader4Error',
            'timestamp4Error1',
            'the timestamp cannot come after 07 Feb 2106, 06:28:15 (GMT)'
        );
        setButtons(false, 'RunHash4');
        miningData.timestampRaw = this.value; // last
        return;
    }
    miningData.timestamp = toLittleEndian(int2hex(timestamp4, 8));
    setButtons(true, 'RunHash4');
    miningData.timestampRaw = this.value; // last
}

function bits4Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.bitsRaw) return;
    resetMiningStatus();
    deleteElementById('bits4Error1');
    deleteElementById('bits4Error2');
    if (this.value.length != 8) {
        addLi2Ul(
            'blockHeader4Error',
            'bits4Error1',
            'the difficulty must be 4 bytes long'
        );
        setButtons(false, 'RunHash4');
        miningData.bitsRaw = this.value; // last
        return;
    }
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader4Error',
            'bits4Error2',
            'the difficulty must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash4');
        miningData.bitsRaw = this.value; // last
        return;
    }
    miningData.bits = toLittleEndian(this.value);
    miningData.target = bits2target(this.value);
    document.getElementById('target4').innerText = miningData.target;
    borderTheDigits('#target4', new Array(64)); // erase colors
    setButtons(true, 'RunHash4');
    miningData.bitsRaw = this.value; // last
}

function nonce4Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.nonceRaw) return;
    deleteElementById('nonce4Error1');
    deleteElementById('nonce4Error2');
    deleteElementById('nonce4Error3');
    resetMiningStatus();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader4Error',
            'nonce4Error1',
            'the nonce must be an integer'
        );
        setButtons(false, 'RunHash4');
        miningData.nonceRaw = this.value; // last
        return;
    }
    miningData.nonceInt = parseInt(this.value);
    if (miningData.nonceInt < 0) {
        addLi2Ul(
            'blockHeader4Error',
            'nonce4Error2',
            'the nonce must be greater than 0'
        );
        setButtons(false, 'RunHash4');
        miningData.nonceRaw = this.value; // last
        return;
    }
    if (miningData.nonceInt > 0xffffffff) {
        addLi2Ul(
            'blockHeader4Error',
            'nonce4Error3',
            'the nonce must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash4');
        miningData.nonceRaw = this.value; // last
        return;
    }
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    setButtons(true, 'RunHash4');
    miningData.nonceRaw = this.value; // last
}

function resetMiningStatus() {
    document.getElementById('blockhash4').innerText = '';
    document.getElementById('mineStatus4').innerText = '';
    borderTheDigits('#target4', new Array(64)); // erase colors
}

function mine4AndRenderResults() {
    miningData.nonceInt += 1;
    if (miningData.nonceInt > 0xffffffff) miningData.nonceInt = 0;
    document.getElementById('nonce4').value = miningData.nonceInt;
    miningData.nonceRaw = miningData.nonceInt;
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    var minedResult = mine(); // using global var miningData
    document.getElementById('blockhash4').innerText = minedResult.blockhash;
    borderTheDigits(
        '#block4MiningResults .individual-digits',
        minedResult.matches,
        true // fail precedence
    );

    if (minedResult.status) {
        popup('success!', 'you mined a block');
        setTimeout(function () { hidePopup(); }, 2000);
        setButtons(false, 'RunHash4');
        document.getElementById('mineStatus4').innerHTML = 'pass';
        document.getElementById('mineStatus4').style.color = passColor;
        return;
    }
    var explanation = 'because ' + minedResult.blockhash[minedResult.resolution] +
    ' is greater than ' + miningData.target[minedResult.resolution];
    document.getElementById('mineStatus4').innerText = 'fail (' + explanation + ')';
    document.getElementById('mineStatus4').style.color = failColor;
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
    var matches = [];
    for (var i = 0; i < 64; i++) {
        if (i < miningStatus.resolution) matches.push(true);
        else if (i == miningStatus.resolution) matches.push(false)
        else matches.push(null);
    }
    return {
        blockhash: sha256Hash,
        status: miningStatus.status,
        resolution: miningStatus.resolution,
        matches: matches
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
    var getNumBlockTxs = function (blockNum) {
        if (blockNum < txsPerBlock.length) return;

        var endRange = (Math.ceil(blockNum / 1000) * 1000) - 1;
        if (txsPerBlock.length > endRange) return;

        var startRange = Math.floor(blockNum / 1000) * 1000;
        ajax(
            '/json/btc_txs_per_block_' + startRange + '-' + endRange + '.json',
            function (json) {
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
    var renderBlockTxs = function (blockEl, blockNum) {
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
    var resetView = function () {
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
    addEvent(svg, 'mousedown, touchstart', function (e) {
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
    addEvent(svg, 'mousemove, touchmove', function (e) {
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
    addEvent(svg, 'mouseup, mouseleave, touchend', function (e) {
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
