// init globals
var passColor = '#7db904'; // green
var failColor = 'red';
var stopHashingForm = {}; // eg {2: false}
var difficultyChars = {}; // eg {1:64, 2:64, 3:0}
var txsPerBlock = [];
var miningData = { // note: raw values are taken directly from the input field
    versionRaw: null,
    versionInt : null,
    version: null,

    prevHashRaw: null,
    prevHash: null,

    merkleRootRaw: null,
    merkleRoot: null,

    timestampRaw: null,
    timestampUnixtime: null,
    timestamp: null,

    bitsRaw: null,
    bits: null,

    nonceRaw: null,
    nonceInt: null,
    nonce: null,

    target: null
};
addEvent(window, 'load', function () {
    // border the digits anywhere on the page initially (grey only)
    initBorderTheDigits();

    // put newlines in codeblocks
    addEvent(document.querySelectorAll('button.wrap-nowrap'), 'click', runHashWrapClicked);

    // form 0 - hashing demo
    addEvent(document.getElementById('btnRunHash0'), 'click', runHash0Clicked);
    addEvent(document.getElementById('inputMessage0'), 'keyup', function (e) {
        if (e.keyCode != 13) return; // only allow the enter key
        runHash0Clicked();
    });

    // form 1 - hashing manually to match hash
    var hash1Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match1').innerText,
        matchFound: false,
        previousNonce: '',
        formNum: 1,
        hashRateData: [],
        checkboxPurpose: 'increment preimage',
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

    // form 2 - hashing automatically to match hash
    var hash2Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match2').innerText,
        matchFound: false,
        previousNonce: '',
        formNum: 2,
        state: 'stopped',
        hashRateData: [],
        checkboxPurpose: 'increment preimage',
        prefix: '' // no prefix
    };
    stopHashingForm[2] = false;
    difficultyChars[2] = 64; // match all characters
    addEvent(document.getElementById('btnRunHash2'), 'click', function (e) {
        runHash2Clicked(e, hash2Params);
    });

    // form 3 - proof of work
    var hash3Params = {
        firstTime: true,
        hashMatch: document.getElementById('match3').innerText,
        matchFound: false,
        previousNonce: '',
        formNum: 3,
        state: 'stopped',
        hashRateData: [],
        checkboxPurpose: 'mine automatically',
        attempts: {}, // eg 5 chars: 10 attempts
        prefix: initProofOfWorkForm()
    };
    addEvent(document.getElementById('btnRunHash3'), 'click', function (e) {
        runHash3Clicked(e, hash3Params);
    });
    difficultyChars[3] = 1; // init: match first character only
    addEvent(document.getElementById('difficulty3'), 'change', difficulty3Changed);
    addEvent(document.getElementById('inputCheckbox3'), 'click', checkbox3Changed);

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

    addEvent(document.getElementById('makeBlockPass4'), 'click', function () {
        scrollToElement(document.getElementById('form4'));
        resetBlock4(true);
    });

    // annex - form 5
    addEvent(document.getElementById('version5'), 'keyup, change', version5Changed);
    triggerEvent(document.getElementById('version5'), 'change');

    // annex - form 6
    addEvent(document.getElementById('timestamp6'), 'keyup, change', timestamp6Changed);
    triggerEvent(document.getElementById('timestamp6'), 'change');

    // annex - form 7
    addEvent(document.getElementById('bits7'), 'keyup, change', bits7Changed);
    triggerEvent(document.getElementById('bits7'), 'change');

    // annex - form 8
    addEvent(document.getElementById('nonce8'), 'keyup, change', nonce8Changed);
    triggerEvent(document.getElementById('nonce8'), 'change');

    // annex - form 9
    addEvent(document.getElementById('version9'), 'keyup, change', version9Changed);
    triggerEvent(document.getElementById('version9'), 'change');

    addEvent(document.getElementById('prevHash9'), 'keyup, change', prevHash9Changed);
    triggerEvent(document.getElementById('prevHash9'), 'change');

    addEvent(document.getElementById('merkleRoot9'), 'keyup, change', merkleRoot9Changed);
    triggerEvent(document.getElementById('merkleRoot9'), 'change');

    addEvent(document.getElementById('timestamp9'), 'keyup, change', timestamp9Changed);
    triggerEvent(document.getElementById('timestamp9'), 'change');

    addEvent(document.getElementById('bits9'), 'keyup, change', bits9Changed);
    triggerEvent(document.getElementById('bits9'), 'change');

    addEvent(document.getElementById('nonce9'), 'keyup, change', nonce9Changed);
    triggerEvent(document.getElementById('nonce9'), 'change');

    // form 10 - hashing hex and ascii
    addEvent(document.getElementById('inputMessage10'), 'keyup, change', runHash10Changed);
    triggerEvent(document.getElementById('inputMessage10'), 'change');
    addEvent(document.getElementById('inputCheckbox10'), 'click', runHash10Changed);

    switch (deviceType) {
        case 'phone':
            toggleAllCodeblockWrapsMobile();
            break;
        case 'tablet':
            break;
        case 'pc':
            break;
    }
});

function initBorderTheDigits() {
    var elementsToBorder = document.getElementsByClassName('individual-digits');
    foreach(elementsToBorder, function (i, el) {
        borderTheDigits(el, new Array(el.innerText.length));
    });
}

function runHashWrapClicked(e) {
    var btn = e.currentTarget;
    var codeblock = btn.closest('.codeblock-container').querySelector('.codeblock');
    if (btn.getAttribute('wrapped') == 'true') {
        codeblock.innerHTML = codeblock.innerHTML.replace(/\n\n/g, '\n').
        replace(/\n/g, '\n\n');
        foreach(codeblock.querySelectorAll('.preserve-newline'), function (i, el) {
            el.innerHTML = '';
        });
    } else {
        codeblock.innerHTML = codeblock.innerHTML.replace(/\n\n/g, '\n');
        foreach(codeblock.querySelectorAll('.preserve-newline'), function (i, el) {
            el.innerHTML = '\n';
        });
    }
    // always one newline except when wrapped on phone
    foreach(codeblock.querySelectorAll('.always-one-newline'), function (i, el) {
        if (btn.getAttribute('wrapped') == 'true' && deviceType == 'phone') {
            el.style.display = 'none';
        } else {
            el.innerHTML = '\n';
            el.style.display = 'inline';
        }
    });
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

function checkbox3Changed(e) {
    document.getElementById('btnRunHash3').innerText = 'Mine ' + (
        e.currentTarget.checked ? 'automatically' : 'manually'
    ) + ' with SHA256';
}

function runHash3Clicked(e, params) {
    var mineAutomatically = document.getElementById('inputCheckbox3').checked;
    var btnText = 'Mine ' + (mineAutomatically ? 'automatically' : 'manually') +
    ' with SHA256';

    switch (params.state) {
        case 'running':
            stopHashingForm[3] = true;
            params.state = 'stopped';
            e.currentTarget.innerText = btnText;
            // allow the inputs to be changed now we have stopped
            document.getElementById('difficulty3').disabled = false;
            document.getElementById('inputCheckbox3').disabled = false;
            break;
        case 'stopped':
            stopHashingForm[3] = false;
            params.state = 'running';
            if (mineAutomatically) {
                e.currentTarget.innerText = 'Stop';
                document.getElementById('difficulty3').disabled = true;
                document.getElementById('inputCheckbox3').disabled = true;
            }
            if (!params.attempts.hasOwnProperty(difficultyChars[3])) {
                params.attempts[difficultyChars[3]] = 0;
                params.attempts['matchFound' + difficultyChars[3]] = false;
            }
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
                    btn.innerText = btnText;
                    document.getElementById('difficulty3').
                    getElementsByTagName('option')[difficultyChars[3] - 1].
                    disabled = true;
                    // allow the inputs to be changed now we have stopped
                    document.getElementById('difficulty3').disabled = false;
                    document.getElementById('inputCheckbox3').disabled = false;
                } else if (!mineAutomatically) params.state = 'stopped';
                var statistics = '\n<span class="preserve-newline">\n</span>'; // init
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
                        var lucky = ' (';
                        if (attempts < luckyThreshold) {
                            lucky += 'very lucky';
                        } else if (attempts > unluckyThreshold) {
                            lucky += 'very unlucky';
                        } else if (attempts < (luckyThreshold * 2)) {
                            lucky += 'a bit lucky';
                        } else if (attempts > (luckyThreshold * 2)) {
                            lucky += 'a bit unlucky';
                        } else lucky += 'pretty standard';
                        lucky += ' - the average is ' + (luckyThreshold * 2) +
                        ' attempts)';
                        params.attempts['luck' + numChars] = lucky;
                    }
                    statistics += numChars + ' digit' + plural('s', numChars > 1) +
                    minedStatus + attempts + ' attempt' +
                    plural('s', attempts > 1) +
                    params.attempts['luck' + numChars] + '\n';
                }
                document.getElementById('mining3Statistics').innerHTML =
                trimRight(statistics);

                if (mineAutomatically) setTimeout(function () { loop(params); }, 0);
            })(params);
            break;
    }
}

function runHashWrap3Clicked(e) {
    runHashWrapClicked(e);
    var mining3Statistics = document.getElementById('mining3Statistics');
    mining3Statistics.innerText = '\n\n' + mining3Statistics.innerText.trim();
}

// forms 1, 2 and 3
function runHash1Or2Or3Clicked(params) {
    // stop running if in a loop
    if (stopHashingForm[params.formNum]) return false;

    if (params.firstTime) {
        document.getElementById('info' + params.formNum).style.display =
        'inline-block';
        document.getElementById('showResults' + params.formNum).style.display =
        'inline';
        params.firstTime = false;
    }
    var nonce = document.getElementById('inputMessage' + params.formNum).value;
    var overridePass = false; // keep going after a match is found?
    var inputCheckbox = document.getElementById('inputCheckbox' + params.formNum);
    if (params.matchFound && (params.previousNonce == nonce)) {
        // not able to mine again after success for 'mine automatically'
        if (params.checkboxPurpose == 'increment preimage' && inputCheckbox.checked) {
            overridePass = true;
        }
        else return;
    }

    document.getElementById('preImage' + params.formNum).innerText =
    params.prefix + nonce;
    var bitArray = sjcl.hash.sha256.hash(params.prefix + nonce);
    var sha256Hash = sjcl.codec.hex.fromBits(bitArray);

    // update the latest hash times and render the average rate
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
    if (
        params.matchFound &&
        !overridePass &&
        params.checkboxPurpose == 'increment preimage'
    ) {
        inputCheckbox.checked = false;
    }
    document.getElementById('hash' + params.formNum + 'Result').innerHTML = sha256Hash;
    var wrapButtonIsOn = (
        document.getElementById('form' + params.formNum).
        querySelector('button.wrap-nowrap').getAttribute('wrapped') == 'true'
    );
    var incrementPreImage = (
        params.checkboxPurpose == 'mine automatically' || inputCheckbox.checked
    );
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

function borderTheDigits(elements, matchArray, failPrecedence) {
    failPrecedence = (failPrecedence == true); // off by default
    var passPrecedence = !failPrecedence; // on by default
    if (typeof elements == 'string') elements = document.querySelectorAll(elements);
    else if (elements.length == null) elements = [elements];

    foreach (elements, function (i, el) {
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

function borderTheBytes(bytes) {
    var bytesArray = bytes.match(/.{2}/g);
    var open = '<span class="individual-digit">';
    var close = '</span>';
    return open + bytesArray.join(close + open) + close;
}

function addError(formNum, errorType, errorText) {
    addLi2Ul('#form' + formNum + ' .error', null, errorText, errorType + 'Error');
}

function noOtherErrors4() {
    return (document.querySelectorAll('#form4 ul.error li').length == 0);
}

function versionChanged(versionFromInput, formNum) {
    var data = { // init
        status: true,
        versionInt: null,
        version: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .versionError'));
    function addError2(errorText) { addError(formNum, 'version', errorText); }
    if (!stringIsInt(versionFromInput)) {
        addError2('the version must be an integer');
        data.status = false;
        return data;
    }
    var versionInt = parseInt(versionFromInput);
    if (versionInt < 0) {
        addError2('the version must be greater than 0');
        data.status = false;
        return data;
    }
    if (versionInt > 0xffffffff) {
        addError2('the version must be lower than ' + 0xffffffff);
        data.status = false;
        return data;
    }
    data.versionInt = versionInt;
    data.version = toLittleEndian(int2hex(versionInt, 8));
    return data;
}

function version4Changed(e) {
    var newVersion = trimInputValue(e.currentTarget);
    if (newVersion == miningData.versionRaw) return; // exit if no change

    var data = versionChanged(newVersion, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.versionRaw = newVersion; // last
        return;
    }
    miningData.version = data.version;
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.versionRaw = newVersion; // last
}

function prevHashChanged(prevHashFromInput, formNum) {
    var data = { // init
        status: true,
        prevHash: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .prevHashError'));
    function addError2(errorText) { addError(formNum, 'prevHash', errorText); }
    if (!isHex(prevHashFromInput)) {
        addError2('the previous block hash must only contain hexadecimal digits');
        data.status = false;
        return data;
    }
    if (prevHashFromInput.length != 64) {
        addError2('the previous block hash must be 32 bytes long');
        data.status = false;
        return data;
    }
    data.prevHash = toLittleEndian(prevHashFromInput);
    return data;
}

function prevHash4Changed(e) {
    var newPrevHash = trimInputValue(e.currentTarget);
    if (newPrevHash == miningData.prevHashRaw) return; // exit if no change
    var data = prevHashChanged(newPrevHash, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.prevHashRaw = newPrevHash; // last
        return;
    }
    miningData.prevHash = data.prevHash;
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.prevHashRaw = newPrevHash; // last
}

function merkleRootChanged(merkleRootFromInput, formNum) {
    var data = { // init
        status: true,
        merkleRoot: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .merkleRootError'));
    function addError2(errorText) { addError(formNum, 'merkleRoot', errorText); }
    if (!isHex(merkleRootFromInput)) {
        addError2('the merkle root must only contain hexadecimal digits');
        data.status = false;
        return data;
    }
    if (merkleRootFromInput.length != 64) {
        addError2('the merkle root must be 32 bytes long');
        data.status = false;
        return data;
    }
    data.merkleRoot = toLittleEndian(merkleRootFromInput);
    return data;
}

function merkleRoot4Changed(e) {
    var newMerkleRoot = trimInputValue(e.currentTarget);
    if (newMerkleRoot == miningData.merkleRootRaw) return; // exit if no change

    var data = merkleRootChanged(newMerkleRoot, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.merkleRootRaw = newMerkleRoot; // last
        return;
    }
    miningData.merkleRoot = data.merkleRoot;
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.merkleRootRaw = newMerkleRoot; // last
}

// the timetstamp can be either an integer (unixtime) or a date string
function timestampChanged(timestampFromInput, formNum) {
    var data = { // init
        status: true,
        timestampUnixtime: null,
        timestamp: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .timestampError'));
    function addError2(errorText) { addError(formNum, 'timestamp', errorText); }
    var timestampUnixtime;
    if (stringIsInt(Date.parse(timestampFromInput))) {
        var timestampUnixtime = unixtime(timestampFromInput);
        document.getElementById('timestamp' + formNum + 'Explanation').innerText = '';
    } else if (stringIsInt(timestampFromInput)) {
        var timestampUnixtime = parseInt(timestampFromInput);
        document.getElementById('timestamp' + formNum + 'Explanation').innerText =
        ' (unixtime)';
    } else {
        addError2(
            'the timestamp must either be a valid date-time, or be an integer' +
            ' (unixtime)'
        );
        data.status = false;
        return data;
    }
    if (timestampUnixtime < 1231006505) {
        addError2('the timestamp cannot come before 03 Jan 2009, 18:15:05 (GMT)');
        data.status = false;
        return data;
    }
    if (timestampUnixtime > 0xffffffff) {
        addError2('the timestamp cannot come after 07 Feb 2106, 06:28:15 (GMT)');
        data.status = false;
        return data;
    }
    data.timestampUnixtime = timestampUnixtime;
    data.timestamp = toLittleEndian(int2hex(data.timestampUnixtime, 8));
    return data;
}

function timestamp4Changed(e) {
    // do not trim, or the user will not be able to put spaces between words
    var newTimestamp = e.currentTarget.value;
    if (newTimestamp == miningData.timestampRaw) return; // exit if no change
    var data = timestampChanged(newTimestamp, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.timestampRaw = newTimestamp; // last
        return;
    }
    miningData.timestamp = data.timestamp;
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.timestampRaw = newTimestamp; // last
}

function bitsChanged(bitsFromInput, formNum) {
    var data = { // init
        status: true,
        bits: null,
        target: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .bitsError'));
    function addError2(errorText) { addError(formNum, 'bits', errorText); }
    if (bitsFromInput.length != 8) {
        addError2('the difficulty must be 4 bytes long');
        data.status = false;
        return data;
    }
    if (!isHex(bitsFromInput)) {
        addError2('the difficulty must only contain hexadecimal digits');
        data.status = false;
        return data;
    }
    var target = bits2target(bitsFromInput);
    if (target == null) {
        addError2('the target length cannot be more than 32 bytes');
        data.status = false;
        return data;
    }
    data.target = target;
    data.bits = toLittleEndian(bitsFromInput);
    return data;
}

function bits4Changed(e) {
    var newBits = trimInputValue(e.currentTarget);
    if (newBits == miningData.bitsRaw) return; // exit if no change

    var data = bitsChanged(newBits, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.bitsRaw = newBits; // last
        return;
    }
    miningData.bits = data.bits;
    miningData.target = data.target;
    document.getElementById('target4').innerText = miningData.target;
    borderTheDigits('#target4', new Array(64)); // erase colors
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.bitsRaw = newBits; // last
}

function nonceChanged(nonceFromInput, formNum) {
    var data = { // init
        status: true,
        nonce: null,
        nonceInt: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .nonceError'));
    function addError2(errorText) { addError(formNum, 'nonce', errorText); }
    if (!stringIsInt(nonceFromInput)) {
        addError2('the nonce must be an integer');
        data.status = false;
        return data;
    }
    var nonceInt = parseInt(nonceFromInput);
    if (nonceInt < 0) {
        addError2('the nonce must be greater than 0');
        data.status = false;
        return data;
    }
    if (nonceInt > 0xffffffff) {
        addError2('the nonce must be lower than ' + 0xffffffff);
        data.status = false;
        return data;
    }
    data.nonceInt = nonceInt;
    data.nonce = toLittleEndian(int2hex(nonceInt, 8));
    return data;
}

function nonce4Changed(e) {
    var newNonce = trimInputValue(e.currentTarget);
    if (newNonce == miningData.nonceRaw) return; // exit if no change

    var data = nonceChanged(newNonce, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.nonceRaw = newNonce; // last
        return;
    }
    miningData.nonceInt = data.nonceInt;
    miningData.nonce = data.nonce;
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.nonceRaw = newNonce; // last
}

// reset the block and clear any errors
function resetBlock4(pass) {
    document.getElementById('version4').value = 1;
    triggerEvent(document.getElementById('version4'), 'change');

    document.getElementById('prevHash4').value =
    '0000000000000000000000000000000000000000000000000000000000000000';
    triggerEvent(document.getElementById('prevHash4'), 'change');

    document.getElementById('merkleRoot4').value =
    '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b';
    triggerEvent(document.getElementById('merkleRoot4'), 'change');

    document.getElementById('timestamp4').value = '03 Jan 2009 18:15:05 GMT';
    triggerEvent(document.getElementById('timestamp4'), 'change');

    document.getElementById('bits4').value = '1d00ffff';
    triggerEvent(document.getElementById('bits4'), 'change');

    document.getElementById('nonce4').value = pass ? 2083236893 : 0;
    triggerEvent(document.getElementById('nonce4'), 'change');
}

function resetMiningStatus() {
    document.getElementById('blockhash4').innerText = '';
    document.getElementById('mineStatus4').innerText = '';
    borderTheDigits('#target4', new Array(64)); // erase colors
}

function mine4AndRenderResults() {
    document.getElementById('nonce4Results').innerText = miningData.nonceInt;
    var minedResult = mine(); // using global var miningData
    document.getElementById('blockhash4').innerText = minedResult.blockhash;
    borderTheDigits(
        '#form4 .codeblock .individual-digits',
        minedResult.matches,
        true // fail precedence
    );

    if (minedResult.status) {
        popup('success!', 'you mined a block');
        setTimeout(function () { hidePopup(); }, 2000);
        setButtons(false, 'RunHash4');
        document.getElementById('mineStatus4').innerText = 'pass (because ' +
        minedResult.blockhash[minedResult.resolution] + ' is less than ' +
        miningData.target[minedResult.resolution] + ')';
        document.getElementById('mineStatus4').style.color = passColor;
    } else {
        document.getElementById('mineStatus4').innerText = 'fail (because ' +
        minedResult.blockhash[minedResult.resolution] + ' is greater than ' +
        miningData.target[minedResult.resolution] + ')';
        document.getElementById('mineStatus4').style.color = failColor;
    }

    // increment the nonce
    miningData.nonceInt += 1;
    if (miningData.nonceInt > 0xffffffff) miningData.nonceInt = 0;
    document.getElementById('nonce4').value = miningData.nonceInt;
    miningData.nonceRaw = miningData.nonceInt;
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
    var miningStatus = hexCompare(sha256Hash, miningData.target, true); // sha256 <= target ?
    var matches = [];
    for (var i = 0; i < 64; i++) {
        if (i < miningStatus.resolution) matches.push(true);
        else if (i == miningStatus.resolution) {
            if (miningStatus.status) matches.push(true);
            else matches.push(false);
        } else matches.push(null);
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
            status: hex2int(hex1Nibble) < hex2int(hex2Nibble),
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

// form 5 (understanding 'version')
function version5Changed(e) {
    var version = trimInputValue(e.currentTarget);
    var data = versionChanged(version, 5);
    var codeblockContainer = document.querySelector('#form5 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.getElementById('version5Hex').innerText = int2hex(data.versionInt);
    document.getElementById('version5Bytes').innerHTML =
    borderTheBytes(int2hex(data.versionInt, 8));

    document.getElementById('version5BytesLE').innerHTML =
    borderTheBytes(data.version);
}

// form 6 (understanding 'timestamp')
function timestamp6Changed(e) {
    var data = timestampChanged(e.currentTarget.value, 6);
    var codeblockContainer = document.querySelector('#form6 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';

    // for visually checking bad inputs
    var dateGMT = (new Date((data.timestampUnixtime * 1000))).toGMTString();

    document.getElementById('timestamp6GMT').innerText = dateGMT;
    document.getElementById('timestamp6Unixtime').innerText = data.timestampUnixtime;
    document.getElementById('timestamp6Bytes').innerHTML =
    borderTheBytes(int2hex(data.timestampUnixtime, 8));

    document.getElementById('timestamp6BytesLE').innerHTML =
    borderTheBytes(data.timestamp);
}

// form 7 (understanding 'difficulty')
function bits7Changed(e) {
    var difficulty = trimInputValue(e.currentTarget);
    var data = bitsChanged(difficulty, 7);
    var codeblockContainer = document.querySelector('#form7 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';

    var lenHex = difficulty.substring(0, 2);
    var len = hex2int(lenHex); // just byte 1
    var msbytes = difficulty.substring(2);

    document.getElementById('difficulty7').innerHTML = borderTheBytes(difficulty);
    document.getElementById('lenHex7').innerText = lenHex;
    document.getElementById('len7').innerText = len;
    document.getElementById('msBytes7').innerHTML = borderTheBytes(msbytes);
    document.getElementById('target7').innerHTML = borderTheBytes(data.target);
    document.getElementById('bits7LE').innerHTML = borderTheBytes(data.bits)
}

// form 8 (understanding 'nonce')
function nonce8Changed(e) {
    var nonce = trimInputValue(e.currentTarget);
    var data = nonceChanged(nonce, 8);
    var codeblockContainer = document.querySelector('#form8 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.getElementById('nonce8Hex').innerText = int2hex(data.nonceInt);
    document.getElementById('nonce8Bytes').innerHTML =
    borderTheBytes(int2hex(data.nonceInt, 8));
    document.getElementById('nonce8BytesLE').innerHTML = borderTheBytes(data.nonce);
}

// form 9 - block header bytes from header fields
function version9Changed(e) {
    var version = trimInputValue(e.currentTarget);
    var data = versionChanged(version, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#version9Output').innerHTML = borderTheBytes(data.version);
    renderHashes9();
}

function prevHash9Changed(e) {
    var prevHash = trimInputValue(e.currentTarget);
    var data = prevHashChanged(prevHash, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#prevHash9Output').innerHTML = borderTheBytes(data.prevHash);
    renderHashes9();
}

function merkleRoot9Changed(e) {
    var merkleRoot = trimInputValue(e.currentTarget);
    var data = merkleRootChanged(merkleRoot, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#merkleRoot9Output').innerHTML = borderTheBytes(data.merkleRoot);
    renderHashes9();
}

function timestamp9Changed(e) {
    var data = timestampChanged(e.currentTarget.value, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#timestamp9Output').innerHTML = borderTheBytes(data.timestamp);
    renderHashes9();
}

function bits9Changed(e) {
    var bits = trimInputValue(e.currentTarget);
    var data = bitsChanged(bits, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#bits9Output').innerHTML = borderTheBytes(data.bits);
    renderHashes9();
}

function nonce9Changed(e) {
    var nonce = trimInputValue(e.currentTarget);
    var data = nonceChanged(nonce, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#nonce9Output').innerHTML = borderTheBytes(data.nonce);
    renderHashes9();
}

function renderHashes9() {
    var block9Hex = document.getElementById('block9Bytes').textContent;
    if (block9Hex.length != 160) return;

    var bitArray = sjcl.codec.hex.toBits(block9Hex);
    var sha256BitArray1 = sjcl.hash.sha256.hash(bitArray);
    var sha256BitArray2 = sjcl.hash.sha256.hash(sha256BitArray1);
    var sha256Hash1 = sjcl.codec.hex.fromBits(sha256BitArray1);
    var sha256Hash2 = sjcl.codec.hex.fromBits(sha256BitArray2);

    document.getElementById('firstSHA256Output9').innerHTML =
    borderTheBytes(sha256Hash1);

    document.getElementById('firstSHA256OutputLE9').innerHTML =
    borderTheBytes(toLittleEndian(sha256Hash1));

    document.getElementById('secondSHA256Output9').innerHTML =
    borderTheBytes(sha256Hash2);

    document.getElementById('secondSHA256OutputLE9').innerHTML =
    borderTheBytes(toLittleEndian(sha256Hash2));
}

function runHash10Changed() {
    var isHexCheckbox = document.getElementById('inputCheckbox10');
    var preImage = document.getElementById('inputMessage10').value;
    if (isHexCheckbox.checked && isHex(preImage)) {
        preImage = sjcl.codec.hex.toBits(preImage);
    } else {
        isHexCheckbox.checked = false;
    }
    var sha256Hash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(preImage));
    document.getElementById('sha256Output10').innerHTML = borderTheBytes(sha256Hash);
    document.getElementById('sha256OutputLE10').innerHTML = borderTheBytes(
        toLittleEndian(sha256Hash)
    );
}

// dragable blockchain svg
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
