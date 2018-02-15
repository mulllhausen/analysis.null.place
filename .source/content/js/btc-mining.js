var passColor = '#7db904'; // green
var failColor = 'red';
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

    addEvent(document.getElementById('btnRunHash1'), 'click', mine1AndRenderResults);
    addEvent(
        document.getElementById('btnRunHash1').parentNode.
        querySelector('button.wrap-nowrap'),
        'click',
        runHash1WrapClicked
    );
    initBlockchainSVG();
});

function runHash0WrapClicked(e) {
    var btn = e.currentTarget;
    var codeblock_text = btn.parentNode.parentNode.querySelector('.codeblock').innerText;
    if (btn.getAttribute('wrapped') == 'true') {
        btn.parentNode.parentNode.querySelector('.codeblock').innerText =
        codeblock_text.replace(/\n/g, '\n\n').replace(/[ ]* -> SHA256/g, ' -> SHA256');
    } else {
        btn.parentNode.parentNode.querySelector('.codeblock').innerText =
        alignText(codeblock_text.replace(/\n\n/g, '\n'), '-> SHA256');
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

// align text from the splitter position onwards. the splitter must be unique.
function alignText(text, splitter) {
    var lines = text.split('\n');
    if (lines.length == 1) return text;

    var biggest_indent_pos = 0; // init
    for (var line_i = 0; line_i < lines.length; line_i++) {
        var indent_pos = lines[line_i].indexOf(splitter); // -1 if not found
        if (indent_pos > biggest_indent_pos) biggest_indent_pos = indent_pos;
    }
    for (var line_i = 0; line_i < lines.length; line_i++) {
        var this_line = lines[line_i];
        var line_parts = this_line.split(splitter);
        if (line_parts.length == 1) continue;

        lines[line_i] = line_parts[0] +
        ' '.repeat(biggest_indent_pos - line_parts[0].length) + splitter +
        line_parts[1];
    }
    return lines.join('\n');
}

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

function version1Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.versionRaw) return;
    deleteElementById('version1Error1');
    deleteElementById('version1Error2');
    deleteElementById('version1Error3');
    resetMiningStatus();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'version1Error1',
            'the version must be an integer'
        );
        setButtons(false, 'RunHash1');
        miningData.versionRaw = this.value; // last
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
        miningData.versionRaw = this.value; // last
        return;
    }
    if (version1 > 0xffffffff) {
        addLi2Ul(
            'blockHeader1Error',
            'version1Error2',
            'the version must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash1');
        miningData.versionRaw = this.value; // last
        return;
    }
    miningData.version = toLittleEndian(int2hex(version1, 8));
    setButtons(true, 'RunHash1');
    miningData.versionRaw = this.value; // last
}

function prevHash1Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.prevHashRaw) return;
    deleteElementById('prevHash1Error1');
    deleteElementById('prevHash1Error2');
    resetMiningStatus();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'prevHash1Error1',
            'the previous block hash must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash1');
        miningData.prevHashRaw = this.value; // last
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader1Error',
            'prevHash1Error2',
            'the previous block hash must be 32 bytes long'
        );
        setButtons(false, 'RunHash1');
        miningData.prevHashRaw = this.value; // last
        return;
    }
    miningData.prevHash = toLittleEndian(this.value);
    setButtons(true, 'RunHash1');
    miningData.prevHashRaw = this.value; // last
}

function merkleRoot1Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.merkleRootRaw) return;
    deleteElementById('merkleRoot1Error1');
    deleteElementById('merkleRoot1Error2');
    resetMiningStatus();
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'merkleRoot1Error1',
            'the merkle root must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash1');
        miningData.merkleRootRaw = this.value; // last
        return;
    }
    if (this.value.length != 64) {
        addLi2Ul(
            'blockHeader1Error',
            'merkleRoot1Error2',
            'the merkle root must be 32 bytes long'
        );
        setButtons(false, 'RunHash1');
        miningData.merkleRootRaw = this.value; // last
        return;
    }
    miningData.merkleRoot = toLittleEndian(this.value);
    setButtons(true, 'RunHash1');
    miningData.merkleRootRaw = this.value; // last
}

// the timetstamp can be either an integer (unixtime) or a date string
function timestamp1Changed() {
    // do not trim, or the user will not be able to put spaces between words
    if (this.value == miningData.timestampRaw) return;
    deleteElementById('timestamp1Error1');
    deleteElementById('timestamp1Error2');
    deleteElementById('timestamp1Error3');
    resetMiningStatus();
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
        miningData.timestampRaw = this.value; // last
        return;
    }
    if (timestamp1 < 1231006505) {
        addLi2Ul(
            'blockHeader1Error',
            'timestamp1Error1',
            'the timestamp cannot come before 03 Jan 2009, 18:15:05 (GMT)'
        );
        setButtons(false, 'RunHash1');
        miningData.timestampRaw = this.value; // last
        return;
    }
    if (timestamp1 > 0xffffffff) {
        addLi2Ul(
            'blockHeader1Error',
            'timestamp1Error1',
            'the timestamp cannot come after 07 Feb 2106, 06:28:15 (GMT)'
        );
        setButtons(false, 'RunHash1');
        miningData.timestampRaw = this.value; // last
        return;
    }
    miningData.timestamp = toLittleEndian(int2hex(timestamp1, 8));
    setButtons(true, 'RunHash1');
    miningData.timestampRaw = this.value; // last
}

function bits1Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.bitsRaw) return;
    resetMiningStatus();
    deleteElementById('bits1Error1');
    deleteElementById('bits1Error2');
    if (this.value.length != 8) {
        addLi2Ul(
            'blockHeader1Error',
            'bits1Error1',
            'the difficulty must be 4 bytes long'
        );
        setButtons(false, 'RunHash1');
        miningData.bitsRaw = this.value; // last
        return;
    }
    if (!isHex(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'bits1Error2',
            'the difficulty must only contain hexadecimal digits'
        );
        setButtons(false, 'RunHash1');
        miningData.bitsRaw = this.value; // last
        return;
    }
    miningData.bits = toLittleEndian(this.value);
    miningData.target = bits2target(this.value);
    document.getElementById('target1').innerText = miningData.target;
    borderTheDigits('#target1'); // erase colors
    setButtons(true, 'RunHash1');
    miningData.bitsRaw = this.value; // last
}

function nonce1Changed() {
    if (this.value != this.value.trim()) this.value = this.value.trim();
    if (this.value == miningData.nonceRaw) return;
    deleteElementById('nonce1Error1');
    deleteElementById('nonce1Error2');
    deleteElementById('nonce1Error3');
    resetMiningStatus();
    if (!stringIsInt(this.value)) {
        addLi2Ul(
            'blockHeader1Error',
            'nonce1Error1',
            'the nonce must be an integer'
        );
        setButtons(false, 'RunHash1');
        miningData.nonceRaw = this.value; // last
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
        miningData.nonceRaw = this.value; // last
        return;
    }
    if (miningData.nonceInt > 0xffffffff) {
        addLi2Ul(
            'blockHeader1Error',
            'nonce1Error3',
            'the nonce must be lower than ' + 0xffffffff
        );
        setButtons(false, 'RunHash1');
        miningData.nonceRaw = this.value; // last
        return;
    }
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    setButtons(true, 'RunHash1');
    miningData.nonceRaw = this.value; // last
}

function resetMiningStatus() {
    document.getElementById('blockhash1').innerText = '';
    document.getElementById('mineStatus1').innerText = '';
    borderTheDigits('#target1'); // erase colors
}

function mine1AndRenderResults() {
    miningData.nonceInt += 1;
    if (miningData.nonceInt > 0xffffffff) miningData.nonceInt = 0;
    document.getElementById('nonce1').value = miningData.nonceInt;
    miningData.nonceRaw = miningData.nonceInt;
    miningData.nonce = toLittleEndian(int2hex(miningData.nonceInt, 8));
    var minedResult = mine(); // using global var miningData
    document.getElementById('blockhash1').innerText = minedResult.blockhash;
    borderTheDigits(
        '#block1MiningResults .individual-digits',
        minedResult.resolution,
        minedResult.status
    );

    if (minedResult.status) {
        popup('success!', 'you mined a block');
        setTimeout(function() { hidePopup(); }, 2000);
        setButtons(false, 'RunHash1');
        document.getElementById('mineStatus1').innerHTML = 'pass';
        document.getElementById('mineStatus1').style.color = passColor;
        return;
    }
    var explanation = 'because ' + minedResult.blockhash[minedResult.resolution] +
    ' is greater than ' + miningData.target[minedResult.resolution];
    document.getElementById('mineStatus1').innerText = 'fail (' + explanation + ')';
    document.getElementById('mineStatus1').style.color = failColor;
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
function runHash1WrapClicked(e) {
    var btn = e.currentTarget;
    var codeblock_html = btn.parentNode.parentNode.querySelector('.codeblock').innerHTML;
    if (btn.getAttribute('wrapped') == 'true') {
        btn.parentNode.parentNode.querySelector('.codeblock').innerHTML =
        codeblock_html.replace('status:     ', 'status: ');
    } else {
        btn.parentNode.parentNode.querySelector('.codeblock').innerHTML =
        codeblock_html.replace('status: ', 'status:     ');
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
    var svg_viewport = svg.getElementById('viewport');
    var border_top = 1;

    // create 20 transactions for each block
    var tx_height = svg.getElementsByClassName('btc-tx')[0].getBoundingClientRect().
    height;
    var txs = svg.getElementsByClassName('btc-txs')[0];
    for (var i = 1; i < 20; i++) {
        var tx = txs.getElementsByClassName('btc-tx')[0].cloneNode(true);
        tx.setAttribute('transform', 'translate(0,' + (tx_height * i) + ')');
        tx.getElementsByTagName('text')[0].textContent = 'transaction ' + (i + 1);
        txs.appendChild(tx);
    }

    // copy blocks and braces to render a blockchain 3x as wide as the svg
    var svg_width = svg.getBoundingClientRect().width; // pre-compute
    var horizontal_padding = 0; // between blocks and braces (init)
    var block_width = svg.getElementById('block').getBoundingClientRect().width;
    var braces_width = svg.getElementById('braces').getBoundingClientRect().width;
    var viewport_width = 0; // init
    for (var block_num = 0; viewport_width <= (svg_width * 3); block_num++) {
        var block = svg.getElementById('block').cloneNode(true);
        block.getElementsByTagName('text')[0].textContent = 'block ' + block_num;
        block.id = 'block' + block_num;
        block.setAttribute(
            'transform',
            'translate(' + (viewport_width + horizontal_padding) + ')'
        );
        svg_viewport.appendChild(block);
        viewport_width += horizontal_padding + block_width;
        horizontal_padding = 15; // always 15 after the first block

        var braces = svg.getElementById('braces').cloneNode(true);
        braces.setAttribute(
            'transform',
            'translate(' + (viewport_width + horizontal_padding) + ',20)'
        );
        svg_viewport.appendChild(braces);
        viewport_width += horizontal_padding + braces_width;
    }

    // center the viewport in the x direction and offset to give the illiusion
    // that the blocks are positioned the same as they currently are
    var block_and_braces_width = block_width + braces_width + (2 * horizontal_padding);
    var num_visible_blocks = Math.floor(svg_width / block_and_braces_width);
    var resetViewport = function() {
        var viewport_left = svg_viewport.getBoundingClientRect().left;
        var all_blocks = svg_viewport.getElementsByClassName('btc-block');
        var leftmost_block = parseInt(all_blocks[0].id.replace(/[a-z]/g, ''));
        if ((viewport_left > -svg_width) && (leftmost_block == 0)) return null;

        // put viewport_left somewhere back between -svg_width and action_zone
        var blocks_past_action_zone = Math.trunc(
            (svg_width + viewport_left) / block_and_braces_width
        );
        if (blocks_past_action_zone == 0) return null;
        // never let the leftmost block index be less than 0
        if (leftmost_block < blocks_past_action_zone) blocks_past_action_zone = leftmost_block;
        var translate_x = viewport_left - (blocks_past_action_zone * block_and_braces_width);
        var viewport_top = svg_viewport.getBoundingClientRect().top + border_top;
        svg_viewport.setAttribute(
            'transform', 'translate(' + translate_x + ',' + viewport_top + ')'
        );
        // alternate between 'block' and 'bloc' otherwise ids may not be
        // overwritten in some browsers?
        var new_id_prefix = (all_blocks[0].id.replace(/[0-9]/g, '') == 'block') ?
        'bloc' : 'block';
        var current_block_num = leftmost_block;
        for (var i = 0; i < all_blocks.length; i++) {
            var new_block_num = current_block_num - blocks_past_action_zone;
            all_blocks[i].id = new_id_prefix + new_block_num;
            all_blocks[i].getElementsByTagName('text')[0].textContent = 'block ' + new_block_num;
            current_block_num++
        }
        return {dx: translate_x, dy: viewport_top};
    }

    // drag-events
    var mouse_start_x = 0, mouse_start_y = 0; // init scope
    var prev_dx = 0, prev_dy = 0; // init scope
    var dx = 0, dy = 0; // init scope
    var dragging = false; // init scope
    var viewport_height = svg_viewport.getBoundingClientRect().height; // pre-compute
    var svg_height = svg.getBoundingClientRect().height; // pre-compute
    addEvent(svg, 'mousedown', function(e) {
        e.preventDefault();
        mouse_start_x = e.clientX;
        mouse_start_y = e.clientY;
        dragging = true;
    });
    addEvent(svg, 'mousemove', function(e) {
        e.preventDefault();
        if (!dragging) return;

        dx = prev_dx + e.clientX - mouse_start_x;
        if (dx > 0) dx = 0; // only allow dragging to the left

        dy = prev_dy + e.clientY - mouse_start_y;
        if (dy > 0) dy = 0; // only allow dragging up

        // don't allow dragging up past the viewport height
        if (dy < (svg_height - viewport_height - border_top)) {
            dy = svg_height - viewport_height - border_top;
        }
        svg_viewport.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
    });
    addEvent(svg, 'mouseup, mouseleave', function(e) {
        if (!dragging) return;
        dragging = false;
        var translation = resetViewport();
        prev_dx = (translation == null) ? dx : translation.dx;
        prev_dy = (translation == null) ? dy : translation.dy;
    });
}
