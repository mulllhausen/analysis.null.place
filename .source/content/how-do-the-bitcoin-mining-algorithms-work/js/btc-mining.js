// init globals
var passColor = '#7db904'; // green
var failColor = 'red';
var stopHashingForm = {}; // eg {2: false}
var difficultyChars = {}; // eg {1:64, 2:64, 3:0}
var difficultyAttempts = {}; // ie {1:8, 2: 128, etc}
var txsPerBlock = [];
var probabilitySVGs = {
    coin: {
        bins: ['heads', 'tails'],
        countPerBin: [],
        totalCount: 0, // init
        digitEls: {},
        enableSpeed: false
    },
    dice: {
        bins: [1, 2, 3, 4, 5, 6],
        countPerBin: [],
        totalCount: 0, // init
        digitEls: {},
        enableSpeed: false
    },
    sha256Digit: {
        bins: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'a', 'b', 'c', 'd', 'e', 'f'],
        countPerBin: [],
        totalCount: 0, // init
        digitEls: {},
        selectedDigit: 0, // init 0-63
        matchList: [],
        enableSpeed: true
    }
};
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
var permanently = true;
var keyCodeENTER = 13;

addEvent(window, 'load', function () {
    initSpans_BorderTheDigitsGreyOnly();
    initButtons_CodeblockWrap();
    initForm0_HashingDemo();
    initTable_Dec2Hex();
    initForm1_HashingManuallyToMatchHash();
    initForm2_HashingAutomaticallyToMatchHash();
    initForm3_ProofOfWork();
    initForm_probabilityDistributionGraph('coin');
    initForm_probabilityDistributionGraph('dice');
    initForm_probabilityDistributionGraph('sha256Digit');
    initSVG_DragableBlockchain();
    initForm4_BitcoinMining();
    initForm5_AnnexVersion();
    initForm6_AnnexTimestamp();
    initForm7_AnnexDifficulty();
    initForm8_AnnexNonce();
    initForm9_AnnexVersion();
    initForm10_HashingHexAndAscii();
    initForm11_LuckCalculator();
    initCodeblocks_ToggleWrapsMobileOnly();
});

function initSpans_BorderTheDigitsGreyOnly() {
    var elementsToBorder = document.querySelectorAll('.individual-digits');
    foreach(elementsToBorder, function (i, el) {
        borderTheDigits(el, new Array(el.textContent.length));
    });
}

function initButtons_CodeblockWrap() {
    // put newlines in codeblocks when wrap button is clicked
    addEvent(
        document.querySelectorAll('button.wrap-nowrap'),
        'click',
        function(e) {
            e.preventDefault();
            runHashWrapClicked(e);
            return false; // do not submit form
        }
    );
}

function initForm0_HashingDemo() {
    addEvent(document.getElementById('btnRunHash0'), 'click', function (e) {
        e.preventDefault();
        runHash0Clicked();
        return false; // do not submit form
    });
    addEvent(document.getElementById('inputMessage0'), 'keyup', function (e) {
        e.preventDefault();
        if (e.keyCode != keyCodeENTER) return;
        runHash0Clicked(e);
        return false; // do not submit the form
    });
    removeGlassCase('form0', permanently);
}

function initTable_Dec2Hex() {
    addEvent(
        document.querySelector('#dec2hexTable .instructions'),
        'click',
        function (e) {
            e.preventDefault();
            showMoreDec2Hex();
            return false; // do not submit form
        }
    );
}

function initForm1_HashingManuallyToMatchHash() {
    var hash1Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match1').textContent,
        matchFound: false,
        previousNonce: '',
        formNum: 1,
        hashRateData: [],
        checkboxPurpose: 'increment preimage',
        prefix: '' // no prefix
    };
    stopHashingForm[1] = false;
    difficultyChars[1] = 64; // match all characters
    addEvent(document.getElementById('btnRunHash1'), 'click', function (e) {
        e.preventDefault();
        runHash1Or2Or3Clicked(hash1Params);
        return false; // do not submit form
    });
    addEvent(document.getElementById('inputMessage1'), 'keyup', function (e) {
        e.preventDefault();
        if (e.keyCode != keyCodeENTER) return;
        runHash1Or2Or3Clicked(hash1Params);
        return false; // do not submit form
    });
    removeGlassCase('form1', permanently);
}

function initForm2_HashingAutomaticallyToMatchHash() {
    var hash2Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match2').textContent,
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
        e.preventDefault();
        runHash2Clicked(e, hash2Params);
        return false; // do not submit form
    });
    removeGlassCase('form2', permanently);
}

function initForm3_ProofOfWork() {
    var hash3Params = { // use an object for pass-by-reference
        firstTime: true,
        hashMatch: document.getElementById('match3').textContent,
        matchFound: false,
        previousNonce: '',
        formNum: 3,
        state: 'stopped',
        hashRateData: [],
        checkboxPurpose: 'mine automatically',
        attempts: {}, // eg 5 chars: 10 attempts
        prefix: initProofOfWorkForm()
    };
    initDifficultyLevelDropdown(3);
    addEvent(document.getElementById('btnRunHash3'), 'click', function (e) {
        e.preventDefault();
        runHash3Clicked(e, hash3Params);
        return false; // do not submit form
    });
    difficultyChars[3] = 1; // init: match first character only
    addEvent(document.getElementById('difficulty3'), 'change', function (e) {
        e.preventDefault();
        difficulty3Changed(e);
        return false; // do not submit form
    });
    addEvent(document.getElementById('inputCheckbox3'), 'click', function (e) {
        // e.preventDefault(); // don't do this - it prevents checkbox toggle
        checkbox3Changed(e);
        return false; // do not submit form
    });
    removeGlassCase('form3', permanently);
}

function initForm4_BitcoinMining() {
    addEvent(document.getElementById('version4'), 'keyup, change', function (e) {
        e.preventDefault();
        version4Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('version4'), 'change');

    addEvent(document.getElementById('prevHash4'), 'keyup, change', function (e) {
        e.preventDefault();
        prevHash4Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('prevHash4'), 'change');

    addEvent(document.getElementById('merkleRoot4'), 'keyup, change', function (e) {
        e.preventDefault();
        merkleRoot4Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('merkleRoot4'), 'change');

    addEvent(document.getElementById('timestamp4'), 'keyup, change', function (e) {
        e.preventDefault();
        timestamp4Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('timestamp4'), 'change');

    addEvent(document.getElementById('bits4'), 'keyup, change', function (e) {
        e.preventDefault();
        bits4Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('bits4'), 'change');

    addEvent(document.getElementById('nonce4'), 'keyup, change', function (e) {
        e.preventDefault();
        nonce4Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('nonce4'), 'change');

    addEvent(document.getElementById('btnRunHash4'), 'click', function (e) {
        e.preventDefault();
        mine4AndRenderResults(e);
        return false; // do not submit form
    });

    addEvent(document.getElementById('makeBlockPass4'), 'click', function (e) {
        e.preventDefault();
        scrollToElement(document.getElementById('form4'));
        resetBlock4(true);
        return false; // do not submit form
    });
    removeGlassCase('form4', permanently);
}

function initForm5_AnnexVersion() {
    addEvent(document.getElementById('version5'), 'keyup, change', function (e) {
        e.preventDefault();
        version5Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('version5'), 'change');
    removeGlassCase('form5', permanently);
}

function initForm6_AnnexTimestamp() {
    addEvent(document.getElementById('timestamp6'), 'keyup, change', function (e) {
        e.preventDefault();
        timestamp6Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('timestamp6'), 'change');
    removeGlassCase('form6', permanently);
}

function initForm7_AnnexDifficulty() {
    addEvent(document.getElementById('difficulty7'), 'keyup, change', function (e) {
        e.preventDefault();
        difficulty7Changed(e);
        return false; // do not submit form
    });
    addEvent(document.getElementById('bits7'), 'keyup, change', function (e) {
        e.preventDefault();
        bits7Changed(e);
        return false; // do not submit form
    });
    addEvent(document.getElementById('bitsAreHex7'), 'click', function (e) {
        // e.preventDefault(); // don't do this - it prevents checkbox toggle
        bitsAreHex7Changed(e);
        return false; // do not submit form
    });
    addEvent(document.getElementById('target7'), 'keyup, change', function (e) {
        e.preventDefault();
        target7Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('bits7'), 'change');
    addEvent(document.getElementById('runDifficultyUnitTests'), 'click', function (e) {
        e.preventDefault();
        runDifficultyUnitTests(e);
        return false; // do not submit form
    });
    removeGlassCase('form7', permanently);
}

function initForm8_AnnexNonce() {
    addEvent(document.getElementById('nonce8'), 'keyup, change', function (e) {
        e.preventDefault();
        nonce8Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('nonce8'), 'change');
    removeGlassCase('form8', permanently);
}

function initForm9_AnnexVersion() {
    addEvent(document.getElementById('version9'), 'keyup, change', function (e) {
        e.preventDefault();
        version9Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('version9'), 'change');

    addEvent(document.getElementById('prevHash9'), 'keyup, change', function (e) {
        e.preventDefault();
        prevHash9Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('prevHash9'), 'change');

    addEvent(document.getElementById('merkleRoot9'), 'keyup, change', function (e) {
        e.preventDefault();
        merkleRoot9Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('merkleRoot9'), 'change');

    addEvent(document.getElementById('timestamp9'), 'keyup, change', function (e) {
        e.preventDefault();
        timestamp9Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('timestamp9'), 'change');

    addEvent(document.getElementById('bits9'), 'keyup, change', function (e) {
        e.preventDefault();
        bits9Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('bits9'), 'change');

    addEvent(document.getElementById('nonce9'), 'keyup, change', function (e) {
        e.preventDefault();
        nonce9Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('nonce9'), 'change');
    removeGlassCase('form9', permanently);
}

function initForm10_HashingHexAndAscii() {
    addEvent(document.getElementById('inputMessage10'), 'keyup, change', function (e) {
        e.preventDefault();
        runHash10Changed(e);
        return false; // do not submit form
    });
    triggerEvent(document.getElementById('inputMessage10'), 'change');
    addEvent(document.getElementById('inputCheckbox10'), 'click', function (e) {
        // e.preventDefault(); // don't do this - it prevents checkbox toggle
        runHash10Changed(e);
        return false; // do not submit form
    });
    removeGlassCase('form10', permanently);
}

function initForm11_LuckCalculator() {
    initDifficultyLevelDropdown(11);
    addEvent(document.getElementById('difficulty11'), 'change', function (e) {
        e.preventDefault();
        difficulty11Changed(e);
        return false; // do not submit form
    });
    initDifficultyAttempts();
}

function initCodeblocks_ToggleWrapsMobileOnly() {
    switch (getDeviceType()) {
        case 'phone':
            toggleAllCodeblockWrapsMobile();
            break;
        case 'tablet':
        case 'pc':
            break;
    }
}

function initForm_probabilityDistributionGraph(which) {
debugger;
    var model = probabilitySVGs[which];
    model.countPerBin = newList(model.bins.length, 0);

    // must come before triggering the dropdown to reset this graph
    initProbabilitySVG(which);

    // models that have a selected digit need a dropdown to choose the diigit
    if (model.hasOwnProperty('selectedDigit')) {
        initDropdownProbabilityOptions(which);
        var dropdownEl = document.getElementById('selectBin_' + which);
        addEvent(dropdownEl, 'change', function (e) {
            e.preventDefault();
            probabilityDigitChanged(e, which);
            return false; // do not submit form
        });
        dropdownEl.value = 0;
        triggerEvent(dropdownEl, 'change');
    }

    var probParams = { // use an object for pass-by-reference
        which: which,
        state: 'stopped'
    };
    stopHashingForm[which] = false;
    var btn = '#probabilityForm_' + which + ' .btn';
    addEvent(document.querySelector(btn + 'Run'), 'click', function (e) {
        e.preventDefault();
        runProbabilityGraphClicked(e, probParams);
        return false; // do not submit form
    });

    addEvent(document.querySelector(btn + 'Reset'), 'click', function (e) {
        e.preventDefault();
        resetProbabilityForm(which);
        return false; // do not submit form
    });

    removeGlassCase('probabilityForm_' + which, permanently);
}

// end initializations

function runHashWrapClicked(e) {
    var btn = e.currentTarget;
    var codeblock = btn.closest('.codeblock-container').querySelector('.codeblock');
    var makeWrapped = (btn.getAttribute('wrapped') == 'true');
    fixCodeblockNewlines(codeblock, makeWrapped);
}

function fixCodeblockNewlines(codeblock, makeWrapped) {
    if (makeWrapped) {
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
        if (makeWrapped && getDeviceType() == 'phone') {
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
    document.getElementById('hash0Duration').innerHTML = durationExplanationLong;
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

var latestDec = 19;
function showMoreDec2Hex() {
    var table = document.getElementById('dec2hexData');
    var chunkOfRows = table.innerHTML; // init
    var stopAt = latestDec + 15;
    for (; latestDec <= stopAt; latestDec++) {
        chunkOfRows += '<tr>' +
            '<td>' + latestDec + '</td><td>' + int2hex(latestDec) + '</td>' +
        '</tr>';
    }
    try {
        table.innerHTML = chunkOfRows;
    } catch (err) {
        // fucking internet explorer!
        // http://webbugtrack.blogspot.com.au/2007/12/bug-210-no-innerhtml-support-on-tables.html
        table.outerHTML = '<table id="dec2hexData">' + chunkOfRows + '</table>';
    }

    var scrollDiv = document.querySelector('#dec2hexTable .vertical-scroll');
    scrollDiv.scrollTop = scrollDiv.scrollHeight;
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
    document.querySelectorAll('.hash2Rate')[0].innerHTML = hashRate;
    document.querySelectorAll('.hash2Rate')[1].innerHTML = hashRate;
    document.getElementById('showHowLongForThisDevice').style.display = 'inline';
    // x hashes per second takes ((2^256) / x) seconds =
    // = ((2^256) / (x * 60 * 60 *  24 * 365)) years
    // = ((2^256) / (x * 60 * 60 *  24 * 365 * 1000000)) million years
    // = ((2^256) / (x * 60 * 60 *  24 * 365 * (1000000^10))) million^10 years
    // = (3671743063 / x) million^10 years
    var durationInMillionPow10Years = addThousandCommas(Math.round(3671743063 / hashRate));
    document.getElementById('howLongForThisDeviceWords').innerHTML =
    durationInMillionPow10Years + ' million'.repeat(10) + ' years';

    document.getElementById('howLongForThisDeviceNumber').innerHTML =
    durationInMillionPow10Years + ',000'.repeat(20) + ' years';
}

// form 3 and form 11
function initDifficultyLevelDropdown(formNum) {
    // init the dropdown list for the number of characters to match
    var dropdownNumChars = '<option value="1">match first character only</option>\n';
    for (var i = 2; i < 64; i++) {
        dropdownNumChars += '<option value="' + i + '">match first ' + i +
        ' characters only</option>\n';
    }
    dropdownNumChars += '<option value="64">match all 64 characters</option>\n';
    // use outerhtml because ie cannot handle innerhtml for select elements
    // stackoverflow.com/a/8557846
    document.getElementById('difficulty' + formNum).outerHTML =
    '<select id="difficulty' + formNum + '">' + dropdownNumChars + '</select>';
}

// form 3
function initProofOfWorkForm() {
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
    document.getElementById('btnRunHash3').innerHTML = 'Mine ' + (
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
            e.currentTarget.innerHTML = btnText;
            // allow the inputs to be changed now we have stopped
            document.getElementById('difficulty3').disabled = false;
            document.getElementById('inputCheckbox3').disabled = false;
            break;
        case 'stopped':
            stopHashingForm[3] = false;
            params.state = 'running';
            if (mineAutomatically) {
                e.currentTarget.innerHTML = 'Stop';
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
                    btn.innerHTML = btnText;
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
                    params.attempts['luck' + numChars] +
                    (getDeviceType() == 'phone' ? '\n\n' : '\n');
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
    mining3Statistics.innerHTML = '\n\n' + mining3Statistics.textContent.trim();
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

    document.getElementById('preImage' + params.formNum).innerHTML =
    params.prefix + nonce;
    var bitArray = sjcl.hash.sha256.hash(params.prefix + nonce);
    var sha256Hash = sjcl.codec.hex.fromBits(bitArray);

    // update the latest hash times and render the average rate
    params.hashRateData.push((new Date()).getTime()); // push on the end
    while (params.hashRateData.length > 10) {
        params.hashRateData.shift(); // pop from the start
    }
    document.getElementById('info' + params.formNum).getElementsByTagName('span')[0].
    innerHTML = getAverageHashRate(params.hashRateData);

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
    if (params.matchFound) status += 'the required digits';
    else {
        if (numMatches == 0) status += '0';
        else if (numMatches > 0) status += 'only ' + numMatches;
        status += ' of ' + difficultyChars[params.formNum] + ' digits';
    }
    status += ' match)';
    document.getElementById('matchStatus' + params.formNum).innerHTML = status;
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
        var text = el.textContent; // get
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

function borderTheChars(bytes, numChars) {
    var re = new RegExp('.{' + numChars + '}', 'g');
    var bytesArray = bytes.match(re);
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
        document.getElementById('timestamp' + formNum + 'Explanation').innerHTML = '';
    } else if (stringIsInt(timestampFromInput)) {
        var timestampUnixtime = parseInt(timestampFromInput);
        document.getElementById('timestamp' + formNum + 'Explanation').innerHTML =
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

function bitsChanged(bitsFromInput, inHex, formNum) {
    var data = { // init
        status: true,
        bits: null, // in little endian hex
        bitsDec: null,
        bitsBE: null, // in big endian hex
        target: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .bitsError'));
    function addError2(errorText) { addError(formNum, 'bits', errorText); }

    var h = 'bits'; // init
    if (!inHex) { // is base 10
        bitsFromInput = bitsFromInput.toString();
        if (inArray('.', bitsFromInput)) { // just 1 check for base 10 bits
            addError2('when bits is base 10 it cannot contain decimal places');
            data.status = false;
            return data;
        }
        bitsFromInput = bitsFromInput.replace(/,/g, '');
        if (!stringIsInt(bitsFromInput)) {
            addError2('when bits is not hex, it can only contain numbers 0 to 9');
            data.status = false;
            return data;
        }
        data.bitsDec = parseInt(bitsFromInput);
        bitsFromInput = int2hex(data.bitsDec);
        h = 'hex bits (derived from base 10 bits)';
    }
    var targetx = bits2target(bitsFromInput);
    if (targetx.status == false) {
        addError2(targetx.statusMessage.replace('bits', h));
        data.status = false;
        return data;
    }
    data.target = targetx.target;
    data.bitsBE = bitsFromInput;
    data.bits = toLittleEndian(bitsFromInput);
    if (data.bitsDec == null) data.bitsDec = hex2int(bitsFromInput);
    return data;
}

function bits4Changed(e) {
    var newBits = trimInputValue(e.currentTarget);
    if (newBits == miningData.bitsRaw) return; // exit if no change

    var inHex = true;
    var data = bitsChanged(newBits, inHex, 4);
    resetMiningStatus();
    if (!data.status) {
        setButtons(false, 'RunHash4');
        miningData.bitsRaw = newBits; // last
        return;
    }
    miningData.bits = data.bits;
    miningData.target = data.target;
    document.getElementById('target4').innerHTML = miningData.target;
    borderTheDigits('#target4', new Array(64)); // erase colors
    if (noOtherErrors4()) setButtons(true, 'RunHash4');
    miningData.bitsRaw = newBits; // last
}

function targetChanged(targetFromInput, formNum) {
    var data = { // init
        status: true,
        target: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .targetError'));
    function addError2(errorText) { addError(formNum, 'target', errorText); }
    if (!isHex(targetFromInput)) {
        addError2('the target must only contain hexadecimal digits');
        data.status = false;
        return data;
    }
    var bitsx = target2bits(targetFromInput); // [status, bits (int), error message]
    if (bitsx.status == false) {
        addError2(bitsx.statusMessage);
        data.status = false;
        return data;
    }
    data.target = targetFromInput;
    return data;
}

function difficultyChanged(difficultyFromInput, formNum) {
    var data = { // init
        status: true,
        difficulty: null
    };
    deleteElements(document.querySelectorAll('#form' + formNum + ' .difficultyError'));
    function addError2(errorText) { addError(formNum, 'difficulty', errorText); }
    difficultyFromInput = difficultyFromInput.replace(/,/g, '');

    var bitsx = difficulty2bits(difficultyFromInput);
    if (bitsx.status == false) {
        addError2(bitsx.statusMessage);
        data.status = false;
        return data;
    }
    var difficultyFloat = parseFloat(difficultyFromInput);
    data.difficulty = difficultyFloat;
    return data;
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
    document.getElementById('blockhash4').innerHTML = '';
    document.getElementById('mineStatus4').innerHTML = '';
    borderTheDigits('#target4', new Array(64)); // erase colors
}

function mine4AndRenderResults() {
    document.getElementById('nonce4Results').innerHTML = miningData.nonceInt;
    var minedResult = mine(); // using global var miningData
    document.getElementById('blockhash4').innerHTML = minedResult.blockhash;
    borderTheDigits(
        '#form4 .codeblock .individual-digits',
        minedResult.matches,
        true // fail precedence
    );

    if (minedResult.status) {
        popup('success!', 'you mined a block', 3000);
        setButtons(false, 'RunHash4');
        document.getElementById('mineStatus4').innerHTML = 'pass (because ' +
        minedResult.blockhash[minedResult.resolution] + ' is less than ' +
        miningData.target[minedResult.resolution] + ')';
        document.getElementById('mineStatus4').style.color = passColor;
    } else {
        document.getElementById('mineStatus4').innerHTML = 'fail (because ' +
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

// same logic as arith_uint256::SetCompact() in bitcoin/src/arith_uint256.cpp
// input is the bits value: 4 byte hex string
function setCompact(compact, levelOfDetail) {
    var results = {
        status: false, // init
        target: null,
        isNegative: null,
        isOverflow: null,
        statusMessage: '',
        steps: []
    };
    // in the bitcoin src, typeof compact = uint32_t. enforce the same here.
    if (compact.length != 8) {
        results.statusMessage = 'bits must be 4 bytes long';
        return results;
    }
    if (!isHex(compact)) {
        results.statusMessage = 'bits must only contain hexadecimal digits';
        return results;
    }
    if (levelOfDetail >= 1) results.steps.push({
        left: 'in the Bitcoin source code this conversion uses function' +
        ' setCompact(). \'bits\' here is made up of 1 \'size\' byte followed' +
        ' by 3 \'compact\' bytes',
        right: null
    });
    results.target = ''; // init
    var compactHex = compact;
    compact = hex2int(compact);
    if (levelOfDetail >= 2) results.steps.push({
        left: 'bits',
        right: '0x' + borderTheChars(compactHex, 2) + ' = ' + compact
    });
    // javascript's zero-fill right shift is equivalent to c++'s >> on a uint32_t
    var size = compact >>> 24;
    var sizeHex = int2hex(size, 2);
    if (levelOfDetail >= 2) results.steps.push({
        left: 'extract the \'size\' byte',
        right: '0x' + compactHex + ' >> 24 = 0x' + sizeHex + ' = ' + size
    });
    var word = compact & 0x007fffff;
    var wordHex = int2hex(word, 8);
    if (levelOfDetail >= 2) results.steps.push({
        left: 'extract the 3 \'word\' bytes',
        right: '0x' + compactHex + ' & 0x007fffff = 0x' + wordHex + ' = ' + word
    });
    if (size <= 3) {
        var rightShiftBy = 8 * (3 - size);
        word >>= rightShiftBy;
        if (levelOfDetail >= 2) results.steps.push({
            left: 'the size is <= 3, so shift the mantissa right by ' +
            ' 8 * (3 - size) = ' + rightShiftBy + ' bits to get',
            right: word
        });
        results.target = int2hex(word, 64);
        if (levelOfDetail >= 2) results.steps.push({
            left: 'convert the mantissa to 32 bytes to get the target value',
            right: '0x' + results.target
        });
    } else {
        // bitcoin src uses:
        // uint256 target = word << 8 * (size - 3);
        // use a string instead since javascript cannot handle 256bit integers
        results.target = leftPad(int2hex(word) + '00'.repeat(size - 3), 64).substr(-64);
        if (levelOfDetail >= 2) results.steps.push({
            left: 'the \'size\' is > 3 so shift the \'word\' left by' +
            ' 8 * (size - 3) = ' + (8 * (size - 3)) + ' bits and convert to' +
            ' 32 bytes to get the target value',
            right: '0x' + results.target
        });
    }
    results.isNegative = (word != 0) && ((compact & 0x00800000) != 0);
    if (levelOfDetail >= 2) {
        var not = results.isNegative ? '' : ' not';
        var posneg = results.isNegative ? 'negative' : 'positive';
        results.steps.push({
            left: 'the target is ' + posneg + ' because the 0x00800000 bit is' +
            not + ' set in the original bits value',
            right: null
        });
        results.steps.push({
            left: 'negative status',
            right: posneg
        });
    }

    var overflowReason1 = (size > 34);
    var overflowReason2 = (word > 0xff) && (size > 33);
    var overflowReason3 = (word > 0xffff) && (size > 32);
    if (word == 0) {
        results.isOverflow = false;
        if (levelOfDetail >= 2) results.steps.push({
            left: 'the target is zero. overflow status',
            right: 'false'
        });
    } else {
        if (overflowReason1) {
            results.isOverflow = true;
            if (levelOfDetail >= 2) results.steps.push({
                left: 'the \'size\' is greater than 34. overflow status',
                right: 'true'
            });
        } else if (overflowReason2) {
            results.isOverflow = true;
            if (levelOfDetail >= 2) results.steps.push({
                left: 'the \'size\' is greater than 33 and the mantissa (' +
                word + ') is greater than 0xff. overflow status',
                right: 'true'
            });
        } else if (overflowReason3) {
            results.isOverflow = true;
            if (levelOfDetail >= 2) results.steps.push({
                left: 'the \'size\' is greater than 32 and the mantissa (' +
                word + ') is greater than 0xffff. overflow status',
                right: 'true'
            });
        } else {
            results.isOverflow = false;
            if (levelOfDetail >= 2) results.steps.push({
                left: 'overflow status',
                right: 'false'
            });
        }
    }
    results.status = true;
    return results;
}

function bits2target(bits, levelOfDetail) {
    if (levelOfDetail == null) levelOfDetail = 0;
    var targetx = setCompact(bits, levelOfDetail);
    if (levelOfDetail >= 1) targetx.steps.unshift({ // prepend
        left: '<u>bits -> target</u>',
        right: null
    });
    if (targetx.isNegative) targetx.target = '-' + targetx.target;
    return targetx;
}

// the bitcoin wiki gives this method of converting from bits to difficulty. the
// logic is different to the bitcoin src code.
// https://en.bitcoin.it/wiki/Difficulty#How_is_difficulty_calculated.3F_What_is_the_difference_between_bdiff_and_pdiff.3F
var diffCalcMaxBody = Math.log(0x00ffff);
var diffCalcScaland = Math.log(256);
function bits2difficultyWiki(bits) {
    var bitsInt = (typeof bits == 'number') ? bits : hex2int(bits);
    return Math.exp(
        diffCalcMaxBody - Math.log(bitsInt & 0x00ffffff) +
        (diffCalcScaland * (0x1d - ((bitsInt & 0xff000000) >>> 24)))
    );
}

// same logic as double GetDifficulty(const CChain& chain, const CBlockIndex* blockindex)
// in src/rpc/blockchain.cpp
// input is the bits value (a 4 byte hex string, or equivalent int)
function bits2difficulty(bits, levelOfDetail) {
    if (levelOfDetail == null) levelOfDetail = 0;
    var results = {
        status: false, // init
        statusMessage: '',
        difficulty: null,
        steps: []
    };
    if (levelOfDetail >= 1) {
        results.steps.push({
            left: '<u>bits -> difficulty</u>',
            right: null
        });
        results.steps.push({
            left: 'in the Bitcoin source code this conversion uses function' +
            ' getDifficulty()',
            right: null
        });
    }
    if (typeof bits == 'number') {
        var bitsInt = bits;
        if (bitsInt > 0xffffffff) {
            results.statusMessage = 'bits value must be 4 bytes';
            return results;
        }
    } else {
        if (bits.length != 8) {
            results.statusMessage = 'bits value must be 4 bytes';
            return results;
        }
        var bitsInt = hex2int(bits);
        if (levelOfDetail >= 2) results.steps.push({
            left: 'bits',
            right: '0x' + borderTheChars(bits, 2) + ' = ' + bitsInt
        });
    }
    var shift = (bitsInt >>> 24) & 0xff;
    var shiftHex = int2hex(shift, 2);
    if (levelOfDetail >= 2) results.steps.push({
        left: 'extract the first byte (called the \'shift\' value here)',
        right: '(0x' + bits + ' >> 24) & 0xff = 0x' + shiftHex + ' = ' + shift
    });
    results.difficulty = parseFloat(0x0000ffff) / parseFloat(bitsInt & 0x00ffffff);
    if (levelOfDetail >= 2) results.steps.push({
        left: 'initialise the difficulty to 0x0000ffff / (bits & 0x00ffffff)',
        right: '0x0000ffff / (0x' + bits + ' & 0x00ffffff) = ' + results.difficulty
    });
    if ((shift < 29) && (levelOfDetail >= 2)) results.steps.push({
        left: 'begin looping until \'shift\' (' + shift + ') increases to 29',
        right: null
    });
    while (shift < 29) {
        var prevDifficulty = results.difficulty;
        results.difficulty *= 256.0;
        shift++;
        if (levelOfDetail >= 2) {
            results.steps.push({
                left: 'multiply difficulty by 256 to get',
                right: prevDifficulty + ' * 256 = ' + results.difficulty
            });
            results.steps.push({
                left: 'increment the \'shift\' value to',
                right: shift
            });
            if (shift < 29) results.steps.push({
                left: 'continue looping until \'shift\' value increases to 29',
                right: null
            });
        }
    }
    if ((shift > 29) && (levelOfDetail >= 2)) results.steps.push({
        left: 'begin looping until \'shift\' (' + shift + ') decreases to 29',
        right: null
    });
    while (shift > 29) {
        results.difficulty /= 256.0;
        shift--;
        if (levelOfDetail >= 2) {
            results.steps.push({
                left: 'divide difficulty by 256 to get',
                right: results.difficulty
            });
            results.steps.push({
                left: 'decrement the \'shift\' value to',
                right: shift
            });
            if (shift > 29) results.steps.push({
                left: 'continue looping until \'shift\' value decreases to 29',
                right: null
            });
        }
    }
    if (levelOfDetail >= 1) results.steps.push({
        left: 'the \'shift\' value is equal to 29 so we\'re finished. the' +
        ' final difficulty is',
        right: results.difficulty
    });
    results.status = true;
    return results;
}

// returns the position of the highest bit set plus one, or 0 if the value is 0
// same logic as base_uint<BITS>::bits() const in bitcoin/src/arith_uint256.cpp
// input 1 is the target value: 32 byte hex string
// input 2 is the levelOfDetail: [null|0], 1, 2
// returns an object containing the unsigned int result between 0 and 288
function bits(target, levelOfDetail) {
    var results = {
        size: null,
        steps: []
    };
    if (levelOfDetail >= 1) results.steps.push({
        left: 'begin finding the target\'s \'size\'',
        right: null
    });
    var width = 8; // = 256 bits / int32
    if (levelOfDetail >= 2) results.steps.push({
        left: 'split the target into 8 chunks of 4 bytes',
        right: '0x' + borderTheChars(target, 8)
    });
    if (levelOfDetail >= 2) results.steps.push({
        left: 'begin looping through the chunks, starting from chunk 7 - the' +
        ' leftmost chunk',
        right: null
    });
    for (var pos = width - 1, i = 0; pos >= 0; pos--, i++) {
        var chunk = target.substr(i * width, width);
        var int32 = hex2int(chunk);
        if (levelOfDetail >= 2) results.steps.push({
            left: 'chunk ' + pos,
            right: '0x' + chunk + ' = ' + int32
        });
        if (int32 == 0) {
            if (levelOfDetail >= 2) results.steps.push({
                left: 'the chunk value is 0. ' +
                ((pos == 0) ? 'exit the loop here.' : 'skip to next chunk.'),
                right: null
            });
            continue;
        }
        if (levelOfDetail >= 2) results.steps.push({
            left: 'the chunk value is not 0. begin looping through each bit' +
            ' of the chunk, starting from the most significant bit.',
            right: null
        });
        for (var nbits = 31; nbits > 0; nbits--) {
            if (int32 & Math.pow(2, nbits)) {
                var size = (32 * pos) + nbits + 1;
                if (levelOfDetail >= 2) {
                    results.steps.push({
                        left: 'bit ' + nbits + ' in chunk ' + pos + ' is set.' +
                        ' so the \'size\' is the number of bits in the ' + pos +
                        ' chunks to the right (32 bits per chunk), plus the' +
                        ' number of bits in this chunk (' + nbits + ') plus 1.' +
                        ' size',
                        right: '(32 * ' + pos + ') + ' + nbits + ' + 1 = ' +
                        size + ' bits = 0x' + int2hex(size, 2) + ' bits'
                    });
                } else if (levelOfDetail == 1) results.steps.push({
                    left: 'calculated the \'size\' to be',
                    right: size + ' bits = 0x' + int2hex(size, 2) + ' bits'
                });
                results.size = size;
                return results;
            }
            if (levelOfDetail >= 2) results.steps.push({
                left: 'bit ' + nbits + ' is not set. skip to the next bit',
                right: null
            });
        }
        var size = (32 * pos) + 1;
        if (levelOfDetail >= 2) {
            results.steps.push({
                left: 'just return the number of bits in the chunks',
                right: '(32 * ' + pos + ') + 1 = ' + size + ' bits = 0x' +
                int2hex(size, 2) + ' bits'
            });
        } else if (levelOfDetail == 1) results.steps.push({
            left: 'calculated the \'size\' to be',
            right: size + ' bits = 0x' + int2hex(size, 2) + ' bits'
        });
        results.size = size;
        return results;
    }
    if (levelOfDetail >= 1) results.steps.push({
        left: 'calculated the \'size\' to be',
        right: '0 bits = 0x00 bits'
    });
    results.size = 0;
    return results;
}

// same logic as uint64_t GetLow64() in bitcoin/src/arith_uint256.h
// input is the target value: 32 byte hex string
// returns the last 64 bits (8 bytes)
function getLow64(target) {
    // bitcoin src uses:
    // return pn[0] | (uint64_t)pn[1] << 32;
    return target.substr(-16);
}

// same logic as arith_uint256::GetCompact() in bitcoin/src/arith_uint256.cpp
// input is the target value: 32 byte hex string
function getCompact(target, negative, levelOfDetail) {
    var results = {
        status: false, // init
        finalBitsInt: null,
        finalBitsHex: null,
        statusMessage: '',
        sizeInt: null,
        steps: []
    };
    if (target.length != 64) {
        results.statusMessage = 'the target must be 32 bytes';
        return results;
    }
    var bitsResult = bits(target, levelOfDetail);
    results.steps = results.steps.concat(bitsResult.steps);

    results.size = Math.floor((bitsResult.size + 7) / 8);
    if (levelOfDetail >= 2) results.steps.push({
        left: 'convert the \'size\' from bits to bytes - add 7 and divide by 8',
        right: '(' + bitsResult.size + ' + 7) / 8 = ' + results.size + ' = 0x' +
        int2hex(results.size, 2)
    });

    // in bitcoin src this is a uint32_t, which javascript can handle
    var compact = 0; // init

    target = target.replace(/^0+/, ''); // strip leading zeros
    if (results.size <= 3) {
        // bitcoin src uses:
        // nCompact = GetLow64() << 8 * (3 - nSize);
        // use a hex string since javascript cannot handle 64 bit ints
        var low64 = leftPad(getLow64(target), 8);
        if (levelOfDetail >= 2) results.steps.push({
            left: '\'size\' (' + results.size + ') is <= 3. initialize' +
            ' \'compact\' to the lowest 64 bits of the target',
            right: '0x' + low64 + ' = ' + hex2int(low64)
        });
        var compactHex = low64 + '00'.repeat(3 - results.size);
        compactHex = leftPad(compactHex.substr(-8), 8);
        compact = hex2int(compactHex);
        if (levelOfDetail >= 2) results.steps.push({
            left: '\'compact\' <<= 8 * (3 - size)',
            right: '0x' + low64 + ' << 8 * (3 - ' + results.size + ') = 0x' +
            compactHex + ' = ' + compact
        });
    } else {
        // bitcoin src uses:
        // arith_uint256 bn = *this >> 8 * (nSize - 3);
        // compact = bn.GetLow64();
        // ie chop off (size - 3) bytes from the right to always keep 3 bytes
        var chopped = leftPad(target.substring(
            0, target.length - (2 * (results.size - 3))
        ), 6);
        var compactHex = leftPad(getLow64(chopped), 8);
        compact = hex2int(compactHex);
        if (levelOfDetail >= 2) {
            results.steps.push({
                left: '\'size\' (' + results.size + ') is > 3. initialize' +
                ' \'compact\' by extracting 3 bytes from the target - from' +
                ' 3 bytes below \'size\' (' + (results.size - 3) + ') to the' +
                ' \'size\' byte (' + results.size + ')',
                right: '0x' + chopped
            });
            results.steps.push({
                left: 'keep only the lowest 64 bits in \'compact\'',
                right: '0x' + compactHex + ' = ' + compact
            });
        }
    }
    // the 0x00800000 bit denotes the sign. thus, if it is already set, divide
    // the mantissa by 256 and increase the exponent.
    if (compact & 0x00800000) {
        var prevCompact = compact;
        compact >>= 8;
        if (levelOfDetail >= 2) results.steps.push({
            left: '\'compact\' bit 0x00800000 is set which would make \'bits\'' +
            ' negative. so shift \'compact\' right by 8 bits',
            right: '0x' + int2hex(prevCompact, 8) + ' >> 8 = 0x' +
            int2hex(compact, 8)
        });
        results.size++;
        if (levelOfDetail >= 2) results.steps.push({
            left: 'and increment the \'size\' to',
            right: results.size + ' = 0x' + int2hex(results.size, 2)
        });
    }
    if ((compact & ~0x007fffff) !== 0) {
        results.statusMessage = '(compact & ~0x007fffff) !== 0, where compact' +
        ' = 0x' + int2hex(compact, 8);
        return results;
    }
    if (results.size >= 256) {
        results.statusMessage = 'size >= 256, where size = ' +
        results.size;
        return results;
    }
    // bitcoin src uses:
    // nCompact |= nSize << 24;
    compact |= (results.size * Math.pow(2, 24)); // splice size into bits value
    if (levelOfDetail >= 2) results.steps.push({
        left: 'combine the \'size\' and \'compact\' to get \'bits\'',
        right: '0x' + int2hex(compact, 8) + ' = ' + compact
    });

    if ((negative === true) && (compact & 0x007fffff)) {
        compact |= 0x00800000;
        if (levelOfDetail >= 2) results.steps.push({
            left: 'the target is negative but the \'bits\' did not have the' +
            ' bit at 0x00800000 set, so set it',
            right: '0x' + int2hex(compact, 8) + ' = ' + compact
        });
    }
    results.status = true;
    results.finalBitsInt = compact;
    results.finalBitsHex = int2hex(compact, 8);
    return results;
}

// target is a hex string
function target2bits(target, levelOfDetail) {
    if (levelOfDetail == null) levelOfDetail = 0;
    var isNegative = false;
    if (target[0] == '-') {
        isNegative = true;
        target = target.substr(1);
    }
    var bitsx = getCompact(target, isNegative, levelOfDetail);
    if (levelOfDetail >= 1) { // prepend
        bitsx.steps = [{
            left: '<u>target -> bits</u>',
            right: null
        }, {
            left: 'in the Bitcoin source code this conversion uses function' +
            ' getCompact(). \'bits\' here is made up of 1 \'size\' byte' +
            ' followed by 3 \'compact\' bytes',
            right: null
        }].concat(bitsx.steps);
    }
    return bitsx;
}

function target2difficulty(target, levelOfDetail) {
    if (levelOfDetail == null) levelOfDetail = 0;
    var bitsx = target2bits(target, levelOfDetail);
    if (!bitsx.status) return bitsx;
    var difficultyx = bits2difficulty(bitsx.finalBitsInt, levelOfDetail);
    difficultyx.steps = bitsx.steps.concat(difficultyx.steps);
    return difficultyx;
}

function difficulty2target(difficulty, levelOfDetail) {
    if (levelOfDetail == null) levelOfDetail = 0;
    var bitsx = difficulty2bits(difficulty);
    if (!bitsx.status) return bitsx;
    var targetx = bits2target(bitsx.finalBitsHex, levelOfDetail);
    targetx.steps = bitsx.steps.concat(targetx.steps);
    return targetx;
}

// the initial bits are 0x1d00ffff
// ie 0xffff << (0x1d * 2)
// current_target = difficulty_1_target / difficulty
// note that the bitcoin src does not do this conversion
function difficulty2bits(difficulty, levelOfDetail) {
    if (levelOfDetail == null) levelOfDetail = 0;
    var results = {
        status: false, // init
        finalBitsInt: null,
        finalBitsHex: null,
        statusMessage: '',
        sizeInt: null,
        steps: []
    };
    if (levelOfDetail >= 1) {
        results.steps.push({
            left: '<u>difficulty -> bits</u>',
            right: null
        });
        results.steps.push({
            left: 'the Bitcoin source code never has a need to do this' +
            ' calculation so the results here may vary from other' +
            ' implementations. \'bits\' here is made up of 1 \'size\' byte' +
            ' followed by 3 \'word\' bytes.',
            right: null
        });
    }
    var isNegative = false;
    if (typeof difficulty == 'string') {
        if (!stringIsFloat(difficulty)) {
            results.statusMessage = 'the difficulty must be a number in base 10';
            return results;
        }
        difficulty = parseFloat(difficulty);
    }
    if (difficulty < 0) {
        results.statusMessage = 'difficulty cannot be negative';
        // unlike target, which can be
        return results;
        isNegative = true;
        difficulty *= -1;
    }
    if (!isFinite(difficulty)) {
        results.statusMessage = 'difficulty cannot be infinite';
        return results;
    }
    if (levelOfDetail >= 2) results.steps.push({
        left: 'begin looping and checking the \'word\' value for each' +
        ' incremented \'shift\' value. word = (0x00ffff * (0x100 ^ shift)) / ' +
        ' difficulty, where \'difficulty\'',
        right: difficulty
    });
    for (var shiftBytes = 1; true; shiftBytes++) {
        var word = (0x00ffff * Math.pow(0x100, shiftBytes)) / difficulty;
        var wordHex = word < 1 ? '' : '0x' + int2hex(word, 6) + ' = ';
        if (levelOfDetail >= 2) results.steps.push({
            left: 'when \'shift\' = ' + shiftBytes + ', \'word\'',
            right: '(0x00ffff * (0x100 ^ ' + shiftBytes + ')) / ' + difficulty
            + ' = ' + wordHex + word
        });
        if (word >= 0xffff) {
            if (levelOfDetail >= 2) results.steps.push({
                left: '\'word\' >= 0xffff so exit the loop here. \'shift\'',
                right: shiftBytes
            });
            break;
        }
        if (levelOfDetail >= 2) results.steps.push({
            left: '\'word\' < 0xffff so continue looping',
            right: null
        });
    }
    word &= 0xffffff; // convert to int < 0xffffff
    if (levelOfDetail >= 2) results.steps.push({
        left: 'cap \'word\' to a maximum of 0xffffff',
        right: '0x' + int2hex(word, 6) + ' = ' + word
    });
    var size = 0x1d - shiftBytes;
    if (levelOfDetail >= 2) results.steps.push({
        left: 'calculate size = 0x1d - shift',
        right: '0x1d - ' + shiftBytes + ' = 0x' + int2hex(size, 2) + ' = ' + size
    });

    // the 0x00800000 bit denotes the sign, so if it is already set, divide the
    // mantissa by 0x100 and increase the size by a byte
    if (word & 0x800000) {
        var oldWord = word;
        word >>= 8;
        size++;
        if (levelOfDetail >= 2) {
            results.steps.push({
                left: 'the sign bit (0x800000) is set so shift \'word\' right' +
                ' by 8 bits and increase the \'size\' by a byte',
                right: '0x' + int2hex(oldWord, 6) + ' >> 8 = 0x' +
                int2hex(word, 6) + ' = ' + word
            });
            results.steps.push({
                left: 'new \'size\'',
                right: '0x' + int2hex(size, 2) + ' = ' + size
            });
        }
    }
    if ((word & ~0x007fffff) != 0) {
        results.statusMessage = 'the \'bits\' \'word\' is out of bounds';
        return results;
    }
    if (size > 0xff) {
        results.statusMessage = 'the \'bits\' \'size\' is out of bounds';
        return results;
    }
    var bits = (size << 24) | word;
    if (levelOfDetail >= 2) results.steps.push({
        left: 'combine the \'size\' and the \'word\' to get \'bits\'. bits' +
        ' = (size << 24) | word',
        right: '(0x' + int2hex(size, 2) + ' << 24) | 0x' + int2hex(word, 6) +
        ' = 0x' + int2hex(bits, 8) + ' = ' + bits
    });

    // this never happens because the difficulty is not permitted to be negative
    if (isNegative && (bits & 0x007fffff)) {
        bits |= 0x00800000;
        if (levelOfDetail >= 2) results.steps.push({
            left: 'the difficulty is negative but the bits did not have the' +
            ' bit at 0x00800000 set, so set it',
            right: '0x' + int2hex(bits, 8) + ' = ' + bits
        });
    }
    results.sizeInt = size;
    results.finalBitsInt = bits;
    results.finalBitsHex = int2hex(bits, 8);
    results.status = true;
    return results;
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

function int2hex(intiger, leftPadLen) {
    intiger = Math.trunc(intiger); // zero the decimal places
    var hex = intiger.toString(16);
    if (leftPadLen == null) return hex;
    return leftPad(hex, leftPadLen);
}

function toLittleEndian(hexStr) {
    if (hexStr.length <= 2) return hexStr;
    if (hexStr.length % 2 == 1) hexStr = '0' + hexStr;
    return hexStr.match(/.{2}/g).reverse().join('');
}

// javascript is accurate to 15 sig digits (ieee754 double precision)
// number arg could be: -123,456,798.123456 or 1.2e+10 or -3.33333e-10 or 0.001
function to15SigDigits(number) {
    return number.toPrecision(15);
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
    document.getElementById('version5Hex').innerHTML = int2hex(data.versionInt);
    document.getElementById('version5Bytes').innerHTML =
    borderTheChars(int2hex(data.versionInt, 8), 2);

    document.getElementById('version5BytesLE').innerHTML =
    borderTheChars(data.version, 2);
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

    document.getElementById('timestamp6GMT').innerHTML = dateGMT;
    document.getElementById('timestamp6Unixtime').innerHTML = data.timestampUnixtime;
    document.getElementById('timestamp6Bytes').innerHTML =
    borderTheChars(int2hex(data.timestampUnixtime, 8), 2);

    document.getElementById('timestamp6BytesLE').innerHTML =
    borderTheChars(data.timestamp, 2);
}

// form 7 (understanding bits/difficulty/target)
function difficulty7Changed(e) {
    var difficulty = trimInputValue(e.currentTarget);
    var data = difficultyChanged(difficulty, 7);
    var bits = null; // not yet known
    var bitsDec = null; // not yet known
    var target = null; // not yet known
    renderForm7Codeblock(data.status, data.difficulty, bits, bitsDec, target);
}

function target7Changed(e) {
    var target = trimInputValue(e.currentTarget);
    var data = targetChanged(target, 7);
    var difficulty = null; // not yet known
    var bits = null; // not yet known
    var bitsDec = null; // not yet known
    renderForm7Codeblock(data.status, difficulty, bits, bitsDec, data.target);
}

function bitsAreHex7Changed(e) {
    var inHex = e.currentTarget.checked;
    var bits = trimInputValue(document.getElementById('bits7'));
    var data = bitsChanged(bits, !inHex, 7);
    document.getElementById('bits7').value = inHex ? data.bitsBE : data.bitsDec;
}

function bits7Changed() {
    var bits = trimInputValue(document.getElementById('bits7'));
    var inHex = document.getElementById('bitsAreHex7').checked;
    var data = bitsChanged(bits, inHex, 7);
    var difficulty = null; // not yet known
    var target = null; // not yet known
    renderForm7Codeblock(data.status, difficulty, data.bitsBE, data.bitsDec, target);
}

var alignedOnce = false;
function renderForm7Codeblock(ok, difficulty, bits, bitsDec, target) {
    var levelOfDetail = 2;
    var n = '<span class="always-one-newline">\n</span>';
    var codeblockContainer = document.querySelector('#form7 .codeblock-container');
    var codeblock = codeblockContainer.querySelector('.codeblock');
    codeblock.innerHTML = '';
    var warningsEl = document.querySelector('#form7 .warnings');
    warningsEl.style.display = 'none';
    if (!ok) {
        codeblockContainer.style.display = 'none';
        return;
    }
    deleteElements(document.querySelectorAll('#form7 .bitsError'));
    deleteElements(document.querySelectorAll('#form7 .difficultyError'));
    deleteElements(document.querySelectorAll('#form7 .targetError'));
    codeblockContainer.style.display = 'block';
    var showDifficultyErrors = false;
    var bitsInHex = document.getElementById('bitsAreHex7').checked;
    var steps = [];
    if (difficulty !== null) {
        showDifficultyErrors = true;
        if (bits === null) {
            var bitsx = difficulty2bits(difficulty, levelOfDetail);
            bits = bitsx.finalBitsHex;
            document.getElementById('bits7').value = bitsInHex ?
            bits : bitsx.finalBitsInt;
            steps = steps.concat(bitsx.steps);
        }
        if (target === null) {
            var targetx = difficulty2target(difficulty, levelOfDetail);
            target = targetx.target;
            document.getElementById('target7').value = target;
            steps = steps.concat(targetx.steps);
        }
    } else if (bits !== null) {
        if (difficulty === null) {
            var difficultyx = bits2difficulty(bits, levelOfDetail);
            difficulty = difficultyx.difficulty;
            document.getElementById('difficulty7').value = difficulty;
            steps = steps.concat(difficultyx.steps);
        }
        if (target === null) {
            var targetx = bits2target(bits, levelOfDetail);
            target = targetx.target;
            document.getElementById('target7').value = target;
            steps = steps.concat(targetx.steps);
        }
    } else if (target !== null) {
        if (bits === null) {
            var bitsx = target2bits(target, levelOfDetail);
            bitsDec = bitsx.finalBitsInt;
            bits = int2hex(bitsDec, 8);
            document.getElementById('bits7').value = bitsInHex ? bits : bitsDec;
            steps = steps.concat(bitsx.steps);
        }
        if (difficulty === null) {
            var difficultyx = bits2difficulty(bits, levelOfDetail);
            difficulty = difficultyx.difficulty;
            document.getElementById('difficulty7').value = difficulty;
            steps = steps.concat(difficultyx.steps);
        }
    }
    codeblock.innerHTML = formatCodeblockSteps(steps, 50);
    var wrapButtonIsOn = (
        codeblockContainer.querySelector('button.wrap-nowrap').
        getAttribute('wrapped') == 'true'
    );
    fixCodeblockNewlines(codeblock, wrapButtonIsOn);
    if (wrapButtonIsOn) unalignText(codeblock);
    else alignText(codeblock);
}

var aligner = '<span class="aligner"> </span>';
function formatCodeblockSteps(steps, leftMaxChars) {
    var p = '<span class="preserve-newline">\n</span>\n';
    var codeblockHTML = '';
    foreach(steps, function (i, step) {
        if (step.left == '\n') {
            codeblockHTML += (p + p);
            return;
        }
        step.left = wrapCodeblockLeft(step.left, leftMaxChars).trim();
        if (step.right == null) step.right = '';
        else step.left += ': ';
        if (steps.length == (i + 1)) p = ''; // no newline on the end
        codeblockHTML += step.left + aligner + step.right + p;
    });
    return codeblockHTML;
}

function wrapCodeblockLeft(leftCol, leftMaxChars) {
    if (leftCol.length <= leftMaxChars) return leftCol;
    var n = '<span class="always-one-newline">\n</span>';
    var words = leftCol.split(' ');
    var charCount = 0; // init
    var newLeftCol = ''; // init
    foreach(words, function (i, word) {
        charCount += word.length + 1;
        if (charCount > leftMaxChars) { // too long
            newLeftCol += aligner + n + word + ' ';
            charCount = word.length + 1;
        } else {
            newLeftCol += word + ' ';
        }
    });
    return newLeftCol;
}

function runDifficultyUnitTests() {
    document.getElementById('unitTests7').style.display = 'block';
    var codeblockEl = document.querySelector('#unitTests7 .codeblock');
    ajax(siteGlobals.unittestBitsJSON, function (json) {
        try {
            var testsData = JSON.parse(json).tests;
        } catch (err) {
            codeblockEl.innerHTML = 'failed to fetch unit-test data';
        }
        renderTestResults(testsData);
    });
    function renderTestResults(testsData) {
        codeblockEl.innerHTML = ''; // init
        var pass = '<span style="color:' + passColor + '">pass</span>';
        var fail = '<span style="color:' + failColor + '">fail</span>';
        var s = '<span class="aligner">'; // start aligner
        var e = '</span>'; // end aligner
        var n = '\n<span class="preserve-newline">\n</span>\n';
        var failedTests = [];
        foreach(testsData, function (testNum, testData) {
            var targetx = bits2target(testData['original_bits']);
            var bitsx = target2bits(targetx.target);
            var reconvertedBits = bitsx.finalBitsHex;
            var targetPass = (testData['target'] == targetx.target);
            var targetPassText = targetPass ? pass : fail;
            var reconvertedBitsPass =
            (testData['reconverted_bits'] == reconvertedBits);
            var reconvertedBitsPassText = reconvertedBitsPass ? pass : fail;
            var negativePass = (targetx.isNegative == testData['negative']);
            var negativePassText = negativePass ? pass : fail;
            var overflowPass = (targetx.isOverflow == testData['overflow']);
            var overflowPassText = overflowPass ? pass : fail;
            var difficultyx = bits2difficulty(testData['original_bits']);
            var difficulty = difficultyx.difficulty;
            var difficultyLower = testData['difficulty_threshold_low'];
            var difficultyUpper = testData['difficulty_threshold_high'];
            var difficultyPass = true; // init
            if (
                (difficultyLower == 'Infinity' && difficulty != Infinity) ||
                (difficultyUpper == 'Infinity' && difficulty != Infinity) ||
                (difficulty < difficultyLower) ||
                (difficulty > difficultyUpper)
            ) difficultyPass = false;
            var difficultyPassText = difficultyPass ? pass : fail;
            var thisTestPass = (
                targetPass && reconvertedBitsPass && negativePass &&
                overflowPass && difficultyPass
            );
            if (!thisTestPass) failedTests.push(testNum);

            var tmp = ((testNum == 0) ? '' : n) + '<u>test ' + testNum +
            '</u>: ' + (thisTestPass ? pass : fail) + '\n' +
            'bits: ' + s + '                         ' + e +
            testData['original_bits'] + '\n' +

            'target (expected): ' + s + '            ' + e +
            testData['target'] + '\n' +

            'target (derived): ' + s + '             ' + e + targetx.target +
            '\n' +
            'target check: ' + s + '                 ' + e + targetPassText +
            '\n' +
            'reconverted bits (expected): ' + s + '  ' + e +
            testData['reconverted_bits'] + '\n' +

            'reconverted bits (derived): ' + s + '   ' + e + reconvertedBits +
            '\n' +
            'reconverted bits check: ' + s + '       ' + e +
            reconvertedBitsPassText + '\n' +

            'target is negative (expected): ' + s + e +
            (testData['negative'] ? 'yes' : 'no') + '\n' +

            'target is negative (derived): ' + s + ' ' + e +
            (targetx.isNegative ? 'yes' : 'no') + '\n' +

            'target is negative check: ' + s + '     ' + e + negativePassText +
            '\n' +
            'target overflowed (expected): ' + s + ' ' + e +
            (targetx.isOverflow ? 'yes' : 'no') + '\n' +

            'target overflowed (derived): ' + s + '  ' + e +
            (testData['overflow'] ? 'yes' : 'no') + '\n' +

            'target overflow check: ' + s + '        ' + e + overflowPassText +
            '\n' +
            'difficulty lower threshold: ' + s + '   ' + e + difficultyLower +
            '\n' +
            'difficulty upper threshold: ' + s + '   ' + e + difficultyUpper +
            '\n' +
            'difficulty (derived): ' + s + '         ' + e + difficulty + '\n' +
            'difficulty check: ' + s + '             ' + e + difficultyPassText;

            codeblockEl.innerHTML = (codeblockEl.innerHTML + tmp).trim();
        });
        document.getElementById('overallStatus7').style.display = 'block';
        document.getElementById('overallStatusPass7').innerHTML =
        (failedTests.length == 0) ? pass : fail + ' (due to test' +
        (failedTests.length > 1 ? 's' : '') + ' ' +
        englishList(failedTests, ', ', ' and ') + ')';
        var wrapButtonIsOn = (
            document.querySelector('#unitTests7 button.wrap-nowrap').
            getAttribute('wrapped') == 'true'
        );
        fixCodeblockNewlines(codeblockEl, wrapButtonIsOn);
        if (wrapButtonIsOn) unalignText(codeblockEl);
        else alignText(codeblockEl);
    }
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
    document.getElementById('nonce8Hex').innerHTML = int2hex(data.nonceInt);
    document.getElementById('nonce8Bytes').innerHTML =
    borderTheChars(int2hex(data.nonceInt, 8), 2);
    document.getElementById('nonce8BytesLE').innerHTML = borderTheChars(data.nonce, 2);
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
    document.querySelector('#version9Output').innerHTML = borderTheChars(data.version, 2);
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
    document.querySelector('#prevHash9Output').innerHTML = borderTheChars(data.prevHash, 2);
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
    document.querySelector('#merkleRoot9Output').innerHTML = borderTheChars(data.merkleRoot, 2);
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
    document.querySelector('#timestamp9Output').innerHTML = borderTheChars(data.timestamp, 2);
    renderHashes9();
}

function bits9Changed(e) {
    var bits = trimInputValue(e.currentTarget);
    var inHex = true;
    var data = bitsChanged(bits, inHex, 9);
    var codeblockContainer = document.querySelector('#form9 .codeblock-container');
    if (!data.status) {
        codeblockContainer.style.display = 'none';
        return;
    }
    codeblockContainer.style.display = 'block';
    document.querySelector('#bits9Output').innerHTML = borderTheChars(data.bits, 2);
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
    document.querySelector('#nonce9Output').innerHTML = borderTheChars(data.nonce, 2);
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
    borderTheChars(sha256Hash1, 2);

    document.getElementById('firstSHA256OutputLE9').innerHTML =
    borderTheChars(toLittleEndian(sha256Hash1), 2);

    document.getElementById('secondSHA256Output9').innerHTML =
    borderTheChars(sha256Hash2, 2);

    document.getElementById('secondSHA256OutputLE9').innerHTML =
    borderTheChars(toLittleEndian(sha256Hash2), 2);
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
    document.getElementById('sha256Output10').innerHTML = borderTheChars(sha256Hash, 2);
    document.getElementById('sha256OutputLE10').innerHTML = borderTheChars(
        toLittleEndian(sha256Hash), 2
    );
}

function initDifficultyAttempts() {
    ajax(siteGlobals.hexTrialAttemptsJSON, function (json) {
        try {
            difficultyAttempts = JSON.parse(json).attemptsForHexCharacters;
            triggerEvent(document.getElementById('difficulty11'), 'change');
            removeGlassCase('form11', permanently);
        }
        catch (err) {}
    });
}

function difficulty11Changed(e) {
    var numDifficultyChars = parseInt(e.currentTarget.value);
    document.getElementById('difficulty11Calculation').innerHTML =
    '(16<sup>' + numDifficultyChars + '</sup>)/2 = ' +
    addThousandCommas(difficultyAttempts[numDifficultyChars]) +
    ' hashes on average';
}

// probability distribution graph
function initDropdownProbabilityOptions(which) {
    var dropdownEl = document.getElementById('selectBin_' + which);
    var contentHTML = '';
    for (var i = 0; i < 64; i++) {
        contentHTML += '<option value="' + i + '">digit ' + (i + 1) + '</option>';
    }
    dropdownEl.innerHTML = contentHTML;
}

// note: we only get here for sha256 hash probabilities
function probabilityDigitChanged(e, which) {
    var model = probabilitySVGs[which];

    model.selectedDigit = parseInt(e.currentTarget.value);
    var adHocStyleSheetID = 'probabilityDigitsStyleSheet';
    var codeblockIDSelector = '#codeblockRandomResults_sha256Digit ';
    var adHocStyleSheet = codeblockIDSelector +
    '.individual-digit:nth-child(' + (model.selectedDigit + 1) + ') {' +
        'border: 1px solid ' + passColor + ';' +
    '}' +
    codeblockIDSelector +
    '.individual-digit:nth-child(' + (model.selectedDigit + 2) + ') {' +
        'border-left: 1px solid ' + passColor + ';' +
    '}';
    removeHocStyleSheet(adHocStyleSheetID);
    addHocStyleSheet(adHocStyleSheetID, adHocStyleSheet);
    resetProbabilityForm(which);
}

function newList(length, initVal) {
    var newList = new Array(length);
    for (var i = 0; i < length; i++) {
        newList[i] = initVal;
    }
    return newList;
}

function runProbabilityGraphClicked(e, params) {
    switch (params.state) {
        case 'running':
            stopHashingForm[params.which] = true;
            params.state = 'stopped';
            switch (params.which) {
                case 'coin': e.currentTarget.innerHTML = 'Toss Coin'; break;
                case 'dice': e.currentTarget.innerHTML = 'Roll Dice'; break;
                case 'sha256Digit': e.currentTarget.innerHTML = 'Run SHA256'; break;
            }
            setProbabilityForm(params.which, true);
            break;
        case 'stopped':
            stopHashingForm[params.which] = false;
            params.state = 'running';
            e.currentTarget.innerHTML = 'Stop';
            setProbabilityForm(params.which, false);

            var automatically = document.
            getElementById('inputCheckboxAutomatic_' + params.which).checked;

            (function loop(params) {
                if (stopHashingForm[params.which]) return;
                incrementProbabilityCodeblock(params.which);
                updateProbabilitySVG(params.which);
                if (automatically) setTimeout(function () { loop(params); }, 0);
                else runProbabilityGraphClicked(e, params);
            })(params);
            break;
    }
}

function setProbabilityForm(which, enabled) {
    var queries = [
        '#inputCheckboxAutomatic_' + which,
        '#probabilityForm_' + which + ' .btnReset'
    ];
    if (which == 'sha256Digit') {
        queries.push('#inputCheckboxSpeed_sha256Digit');
        queries.push('#selectBin_sha256Digit');
        queries.push('#inputMessage_sha256Digit');
    }
    for (var i = 0; i < queries.length; i++) {
        document.querySelector(queries[i]).disabled = !enabled;
    }
}

function incrementProbabilityCodeblock(which) {
    var model = probabilitySVGs[which];
    var form = document.getElementById('probabilityForm_' + which);
    var randomlySelectedBin;
    var latestResult;
    switch (which) {
        case 'coin':
            randomlySelectedBin = Math.floor(Math.random() * model.bins.length);
            latestResult = model.bins[randomlySelectedBin][0].toUpperCase();
            break;
        case 'dice':
            randomlySelectedBin = Math.floor(Math.random() * model.bins.length);
            latestResult = model.bins[randomlySelectedBin];
            break;
        case 'sha256Digit':
            var messageEl = document.getElementById('inputMessage_sha256Digit');
            var message = messageEl.value;
            var bitArray = sjcl.hash.sha256.hash(message);
            var sha256HashResult = sjcl.codec.hex.fromBits(bitArray); // 64 digits
            randomlySelectedBin = parseInt(sha256HashResult[model.selectedDigit], 16);
            latestResult = '<span>' +
                borderTheChars(sha256HashResult, 1) +
            '</span>';
            messageEl.value = incrementAlpha(message);
            break;
    }
    model.countPerBin[randomlySelectedBin]++; // +1 for this digit's count
    model.totalCount++;
    updateRandomResults(which, latestResult);

    document.getElementById('randomResultCount_' + which).innerHTML =
    model.totalCount;
}

function updateRandomResults(which, latestResult) {
    var model = probabilitySVGs[which];
    var probResultsEl = document.getElementById('randomResult_' + which);
    var previousResultsStr = probResultsEl.innerHTML;
    if (
        which == 'sha256Digit' &&
        model.enableSpeed && // avoid a dom call if possible
        previousResultsStr.length > 0 &&
        document.getElementById('inputCheckboxSpeed_sha256Digit').checked
    ) {
        var previousResultsList = previousResultsStr.split('<br>');
        if (previousResultsList.length > 10) {
            previousResultsList = previousResultsList.slice(0, 9);
            previousResultsStr = previousResultsList.join('<br>');
        }
    }
    probResultsEl.innerHTML = latestResult + '<br>' + previousResultsStr;
}

function updateProbabilitySVG(which) {
    var model = probabilitySVGs[which];
    var binHeight = 0;
    for (var barI = 0; barI < model.bins.length; barI++) {
        if (model.totalCount > 0) {
            binHeight = probabilitySVGYAxisHeight * model.countPerBin[barI] /
            model.totalCount;
        }
        model.digitEls[barI].setAttribute('height', binHeight);
    }
}

function resetProbabilityForm(which) {
    var model = probabilitySVGs[which];
    stopHashingForm[which] = true;
    model.countPerBin = newList(model.bins.length, 0);
    model.totalCount = 0;
    document.getElementById('randomResult_' + which).innerHTML = '';
    document.getElementById('randomResultCount_' + which).innerHTML = '0';
    updateProbabilitySVG(which);
}

var probabilitySVGYAxisHeight;
function initProbabilitySVG(which) {
    var model = probabilitySVGs[which];

    var svg = document.getElementById('probabilityGraphSVG_' + which).
    contentDocument.getElementsByTagName('svg')[0];

    var svgView = svg.getElementById('view');
    var yAxisEl = svgView.querySelector('.yAxis');
    probabilitySVGYAxisHeight = yAxisEl.y2.baseVal.value - yAxisEl.y1.baseVal.value;

    // create the bars from bins
    var numBars = model.bins.length;
    var spacingBetweenBars = 5;
    var xAxisEl = svgView.querySelector('.xAxis');
    var xAxisLength = xAxisEl.x2.baseVal.value - xAxisEl.x1.baseVal.value;
    //xAxisLength = (numBars * barWidth) + (numBars + 1) * spacingBetweenBars
    var barWidth = (xAxisLength - ((numBars + 1) * spacingBetweenBars)) / numBars;

    var currentBarLeftX = xAxisEl.x1.baseVal.value;
    for (var barI = 0; barI < numBars; barI++) {
        currentBarLeftX += spacingBetweenBars;
        var caption = model.bins[barI].toString();
        var newSVGGroup = document.createElementNS(
            'http://www.w3.org/2000/svg', 'g'
        );
        newSVGGroup.setAttribute(
            'transform', 'translate(' + currentBarLeftX + ',' + 170 + ')'
        );
        var barXML = '<rect' +
            ' class="probabilityBar"' +
            ' id="p' + caption + '"' +
            ' x="0"' +
            ' y="0"' +
            ' width="' + barWidth + '"' +
            ' height="0"' +
            ' transform="scale(1,-1)"' +
        '/>';
        var barCaptionXML = '<text' +
            ' class="axisNumber xAxisNumber"' +
            ' x="' + (barWidth / 2) + '"' +
            ' y="20"' +
        '>' + caption + '</text>';
        newSVGGroup.innerHTML = barXML + barCaptionXML;
        svgView.appendChild(newSVGGroup);

        currentBarLeftX += barWidth;

        model.digitEls[barI] = newSVGGroup.getElementsByTagName('rect')[0];
    }
}

// todo: break this function down into manageable functions and move it to the
// initializations section above
function initSVG_DragableBlockchain() {
    var svg = document.getElementById('blockchainSVG').contentDocument.
    getElementsByTagName('svg')[0];
    var svgDefs = svg.getElementsByTagName('defs')[0];
    var svgView = svg.getElementById('view');
    var borderTop = 1; // border of the svg
    var borderLeft = 1; // border of the block

    // fetch the number of txs per block
    var getNumBlockTxs = function (blockNum) {
        if (blockNum < txsPerBlock.length) return;

        var endRange = (Math.ceil(blockNum / 1000) * 1000) - 1;
        if (txsPerBlock.length > endRange) return;

        var startRange = Math.floor(blockNum / 1000) * 1000;
        var range = startRange + '-' + endRange;
        ajax(siteGlobals.btcTxsPerBlockJSON[range], function (json) {
            try {
                var numTxsArray = JSON.parse(json).txsPerBlock;
                txsPerBlock = txsPerBlock.concat(numTxsArray);
                // this will create a huge array, but javascript can handle it :)
                removeGlassCase('dragableBlockchain', permanently);
            }
            catch (err) {}
        });
    };
    getNumBlockTxs(1); // fetch json via ajax to init the txsPerBlock array

    // render the correct number of transactions for each block
    var txHeight = svgDefs.querySelectorAll('.btc-tx')[0].getBoundingClientRect().
    height;
    if (txHeight == 0) txHeight = 30; // damn ff bug
    var renderBlockTxs = function (blockEl, blockNum) {
        // wipe all txs from the btc-txs group in this block
        var txs = blockEl.querySelectorAll('.btc-txs')[0];
        txs.parentNode.replaceChild(txs.cloneNode(false), txs);
        var newTxs = blockEl.querySelectorAll('.btc-txs')[0];

        for (var i = 0; i < txsPerBlock[blockNum]; i++) {
            var tx = svgDefs.querySelectorAll('.btc-tx')[0].cloneNode(true);
            tx.setAttribute('transform', 'translate(0,' + (txHeight * i) + ')');
            tx.getElementsByTagName('text')[0].textContent = 'transaction ' + (i + 1);
            newTxs.appendChild(tx);
        }
    };

    // copy blocks and braces to render a blockchain that is viewWidthMultiple
    // times as wide as the svg
    var svgWidth = svg.getBoundingClientRect().width; // pre-compute
    var horizontalPadding = borderLeft; // between blocks and braces (init)
    var blockWidth = svg.getElementById('block').getBoundingClientRect().width;
    var bracesWidth = svg.getElementById('braces').getBoundingClientRect().width;
    var viewWidth = 0; // init
    var viewWidthMultiple = 7; // view width = viewWidthMultiple x svg width
    for (var blockNum = 0; viewWidth <= (svgWidth * viewWidthMultiple); blockNum++) {
        var block = svg.getElementById('block').cloneNode(true);
        block.getElementsByTagName('text')[0].textContent = 'block ' + blockNum;
        block.id = 'block' + blockNum;
        block.setAttribute(
            'transform',
            'translate(' + (viewWidth + horizontalPadding) + ')'
        );
        svgView.appendChild(block);
        if (blockWidth == 0) blockWidth = svgView.querySelector('.btc-block').
        getBoundingClientRect().width; // damn ff bug

        viewWidth += horizontalPadding + blockWidth;
        horizontalPadding = 15; // always 15 after the first block

        var braces = svg.getElementById('braces').cloneNode(true);
        braces.setAttribute(
            'transform',
            'translate(' + (viewWidth + horizontalPadding) + ',20)'
        );
        svgView.appendChild(braces);
        if (bracesWidth == 0) bracesWidth = svgView.querySelector('.braces').
        getBoundingClientRect().width; // damn ff bug
        viewWidth += horizontalPadding + bracesWidth;
    }

    // append the instructions
    svg.appendChild(svgDefs.querySelectorAll('.big-instructions')[0]);

    // roughly center the view in the x direction and offset to give the illiusion
    // that the blocks are positioned the same as they currently are
    var blockAndBracesWidth = blockWidth + bracesWidth + (2 * horizontalPadding);
    var numVisibleBlocks = Math.floor(svgWidth / blockAndBracesWidth);
    var leftThreshold = svgWidth * Math.floor(viewWidthMultiple / 2);
    var resetView = function () {
        var viewLeft = svgView.getBoundingClientRect().left;
        var allBlocks = svgView.querySelectorAll('.btc-block');
        var leftmostBlock = parseInt(allBlocks[0].id.replace(/[a-z]/g, ''));
        if ((viewLeft > -leftThreshold) && (leftmostBlock == 0)) return null;

        // put viewLeft somewhere back between -leftThreshold and actionZone
        var blocksPastActionZone = Math.trunc(
            (leftThreshold + viewLeft) / blockAndBracesWidth
        );
        if (blocksPastActionZone == 0) return null;
        // never let the leftmost block index be less than 0
        if (leftmostBlock < blocksPastActionZone) blocksPastActionZone = leftmostBlock;
        var translateX = viewLeft - borderLeft -
        (blocksPastActionZone * blockAndBracesWidth);
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
            getNumBlockTxs(newBlockNum + (viewWidthMultiple * numVisibleBlocks)); // fetch ahead
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
            svg.removeChild(svg.querySelectorAll('.big-instructions')[0]);
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
