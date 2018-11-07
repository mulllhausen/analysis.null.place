// this file was generated by merging:
//- js/polyfills.js
//- js/utils.js
//- js/matrix-animation.js
//- js/autofooter.js
//- js/cookie-warning-notice.js
//- js/ads.js
//- js/register-service-worker.js

// original file: polyfills.js
// string repeat polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat#Polyfill
if (!String.prototype.repeat) String.prototype.repeat = function (count) {
    'use strict';
    if (this == null) {
        throw new TypeError('can\'t convert ' + this + ' to object');
    }
    var str = '' + this;
    count = +count;
    if (count != count) {
        count = 0;
    }
    if (count < 0) {
        throw new RangeError('repeat count must be non-negative');
    }
    if (count == Infinity) {
        throw new RangeError('repeat count must be less than infinity');
    }
    count = Math.floor(count);
    if (str.length == 0 || count == 0) {
        return '';
    }
    // Ensuring count is a 31-bit integer allows us to heavily optimize the
    // main part. But anyway, most current (August 2014) browsers can't handle
    // strings 1 << 28 chars or longer, so:
    if (str.length * count >= 1 << 28) {
        throw new RangeError('repeat count must not overflow maximum string size');
    }
    var rpt = '';
    for (var i = 0; i < count; i++) {
        rpt += str;
    }
    return rpt;
};

// polyfill for ie to do negative substr (github.com/tommymessbauer/substr-polyfill)
if ('ab'.substr(-1) != 'b') String.prototype.substr = function (substr) {
    return function (start, length) {
        // did we get a negative start?
        if (start < 0) {
            // calculate how much it is from the beginning of the string
            start = this.length + start;

            // if start is still negative then set it to the beginning of
            // the string
            if (start < 0) start = 0;
        }
        // call the original function
        return substr.call(this, start, length);
    }
}(String.prototype.substr);

if (!String.prototype.trim) String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

// modified from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches) Element.prototype.matches =
Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest) Element.prototype.closest = function (query) {
    var el = this;
    if (Element.prototype.matches) { // ie 9+
        if (!document.documentElement.contains(el)) return null;
        while (true) {
            if (el.matches(query)) return el;
            el = el.parentNode;
            if (el == null) return null;
            if (el.nodeType !== 1) return null;
        }
    } else if (window.Element) { // ie 8- (slow)
        // walk up through parent nodes until we reach a match
        var matches = (this.document || this.ownerDocument).querySelectorAll(query);
        while (true) {
            for (var i = 0; i < matches.length; i++) {
                if (matches.item(i) === el) return el;
            }
            el = el.parentNode;
            if (el == null) return null;
            if (el.nodeType !== 1) return null;
        }
    }
    return null;
};

// add console support for stupid ie. thanks to
// https://github.com/h5bp/html5-boilerplate/blob/v5.0.0/dist/js/plugins.js
function fixConsole(browser) {
    var methods = [ // note: group must come before log in this list
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',  'table',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp',
        'trace', 'warn'
    ];
    var console = (window.console = window.console || {});
    var browserShouldWork = (browser.chrome || browser.safari);
    for (var i = 0; i < methods.length; i++) {
        var method = methods[i];

        // stub undefined methods
        if (!console[method]) {
            if (method == 'group' && console['log']) console.group = console.log;
            else console[method] = function() { return 'not implemented'; };
        }
    }
}

// fix for stupid ie. thanks to
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
if (!Math.trunc) {
    Math.trunc = function (v) {
        v = +v;
        if (!isFinite(v)) return v;
        return (v - (v % 1)) || ((v < 0) ? -0 : (v === 0 ? v : 0));

        // returns:
        //  0        ->  0
        // -0        -> -0
        //  0.2      ->  0
        // -0.2      -> -0
        //  0.7      ->  0
        // -0.7      -> -0
        //  Infinity ->  Infinity
        // -Infinity -> -Infinity
        //  NaN      ->  NaN
        //  null     ->  0
    };
}

window.requestAnimationFrame = function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (f) {
            window.setTimeout(f, 1e3/60);
        }
}();

window.cancelAnimationFrame = function () {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        function (id) {
            window.clearTimeout(id);
        }
}();
// end original file: polyfills.js

// original file: utils.js
// common functions used on many pages

function getDeviceType() {
    return window.getComputedStyle(
        document.getElementsByTagName('body')[0], ':before'
    ).getPropertyValue('content').replace(/"/g, '');
}

function trim(str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}

function trimLeft(str) {
    return str.replace(/^[\s\uFEFF\xA0]+/g, '');
}

function trimRight(str) {
    return str.replace(/[\s\uFEFF\xA0]+$/g, '');
}

function unixtime(date) {
    switch (typeof date) {
        case 'string': // eg 03 Jan 2009 18:15:05 GMT
            return Math.round(Date.parse(date) / 1000);
        case 'object': // ie a Date() object
            return Math.round(date.getTime() / 1000);
        default:
            return Math.round((new Date()).getTime() / 1000);
    }
}

NodeList.prototype.isNodeList = HTMLCollection.prototype.isNodeList = function () {
    return true;
};

function isNodeList(elements) {
    try {
        return (elements.isNodeList() === true);
    } catch (err) {
        return false;
    }
}

function foreach(els, callback) {
    if (isNodeList(els) || (els instanceof Array)) {
        for (var i = 0; i < els.length; i++) {
            if (callback(i, els[i]) === false) break;
        }
    } else if (typeof els === 'object') {
        for (var key in els) {
            if (!els.hasOwnProperty(key)) continue;
            if (callback(key, els[key]) === false) break;
        }
    }
}

function addEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    var typesArr = types.split(',');
    foreach(elements, function (elI, el) {
        foreach(typesArr, function (typeI, type) {
            type = type.replace(/ /g, '');
            if (el.addEventListener) {
                el.addEventListener(type, callback, false);
            } else if (el.attachEvent) { // ie
                el.attachEvent('on' + type, callback);
            } else {
                el['on' + type] = callback;
            }
        });
    });
}

function triggerEvent(element, type) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    foreach(elements, function (elI, el) {
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(type, false, true);
            el.dispatchEvent(evt);
        }
        else el.fireEvent('on' + type);
    });
}

function popup(heading, detail) {
    document.getElementById('fullpagePopupHeading').innerHTML = heading;
    document.getElementById('fullpagePopupDetail').innerHTML = detail;
    document.getElementById('fullpagePopupNotification').style.display = 'table';
    setTimeout(hidePopup, 3000);
}

function hidePopup() {
    document.getElementById('fullpagePopupNotification').style.display = 'none';
}

function addLi2Ul(ul, liID, text, className) {
    if (typeof ul == 'string') ul = document.querySelector(ul);
    var li = document.createElement('li');
    if (liID != null) li.id = liID;
    if (className != null) li.className = className;
    li.appendChild(document.createTextNode(text));
    ul.appendChild(li);
}

function deleteElementById(elID) {
    deleteElement(document.getElementById(elID));
}

function deleteElement(el) {
    if (el == null) return;
    el.parentNode.removeChild(el);
}

function deleteElements(element) {
    var elements = (isNodeList(element) ? element : [element]);
    if (elements.length == 0) return;
    foreach(elements, function (i, el) {
        deleteElement(el);
    });
}

function isHex(val) {
    var regex = /^-?[0-9a-f]+$/gi;
    return regex.test(val);
}

function stringIsInt(x)  {
    return (x == parseInt(x, 10));
}

function stringIsFloat(x)  {
    return (x == parseFloat(x));
}

function setButtons(enable) {
    foreach(arguments, function (i, arg) {
        if (i == 0) return; // continue
        document.getElementById('btn' + arg).disabled = !enable;
    });
}

// find needle in haystack - works for strings as well as arrays
function inArray(needle, haystack) {
    // note: does not work with with NaN or ie < 9
    return (haystack.indexOf(needle) > -1);
}

function mergeObjects(/*eg {a:1}, {b:2}, {c:3}*/) {
    var retObj = {};
    foreach(arguments, function (i, obj) {
        foreach(obj, function (k, v) {
            retObj[k] = v;
        });
    });
    return retObj;// eg {a:1, b:2, c:3}
}

// 1000 -> 1,000
function addThousandCommas(number) {
    number += ''; // convert to string
    var numberParts = number.split('.');
    var whole = numberParts[0];
    var decimals = ((numberParts.length > 1) ? '.' + numberParts[1] : '');
    var regex = /(\d+)(\d{3})/;
    while (regex.test(whole)) {
        whole = whole.replace(regex, '$1' + ',' + '$2');
    }
    return whole + decimals;
}

function ajax(url, callback) {
    // doesn't work on opera mini :(
    var xhttp = new XMLHttpRequest();
    addEvent(xhttp, 'readystatechange', function () {
        if (this.readyState != XMLHttpRequest.DONE) return;
        if (this.status != 200) return;
        callback(this.responseText);
    });
    xhttp.open('GET', url);
    xhttp.send();
}

Element.prototype.up = function (num) {
    var el = this;
    for (var i = 0; i < num; i++) el = el.parentNode;
    return el;
}

// align text at <span class="aligner"/>. currently only 1 aligner is supported
// per line
var uniqueTextAligner = '|%|'; // something never used in the codeblock
function alignText(codeblock) {
    codeblock.style.whiteSpace = 'pre';
    var lines = codeblock.innerHTML.split('\n');
    if (lines.length == 1) return;

    // put the aligners in
    foreach(codeblock.querySelectorAll('.aligner'), function (i, el) {
        el.innerHTML = uniqueTextAligner;
    });
    lines = codeblock.innerHTML.split('\n');

    // find the biggest index position from any line
    var biggestIndentPos = 0; // init
    var linesWithoutAlignment = []; // init
    var linesNoHTML = {}; // init (avoid unnecessary dom operations)
    foreach(lines, function (lineI, line) {
        if (!inArray(uniqueTextAligner, line)) {
            linesWithoutAlignment.push(lineI);
            return; // continue
        }
        // strip html tags out (but keep content between)
        if (inArray('<', line) && inArray('>', line)) {
            var tmp = document.createElement('div');
            tmp.innerHTML = line;
            line = tmp.textContent;
        }
        linesNoHTML[lineI] = line;
        var indentPos = line.indexOf(uniqueTextAligner); // -1 if not found
        if (indentPos > biggestIndentPos) biggestIndentPos = indentPos;
    });

    // do the indentation on each line
    var alignerNum = 0;
    foreach(lines, function (lineI, line) {
        if (inArray(lineI, linesWithoutAlignment)) return; // continue
        var linePartsForCalc = linesNoHTML[lineI].split(uniqueTextAligner);
        // remove the unique aligner and align the text
        codeblock.querySelectorAll('.aligner')[alignerNum].innerHTML =
        ' '.repeat(biggestIndentPos - linePartsForCalc[0].length);
        alignerNum++;
    });
}

function unalignText(codeblock) {
    codeblock.style.whiteSpace = 'pre-wrap';
    foreach(codeblock.querySelectorAll('.aligner'), function (i, el) {
        el.innerHTML = '';
    });
}

function plural(wordEnding, plural) {
    switch (wordEnding) {
        case 's':
            if (plural) return 's';
            else return '';
    }
}

function scrollToElement(element) {
    element.scrollIntoView();
}

// trim an <input type="text"> and maintain cursor position
function trimInputValue(inputEl) {
    var noChange = true;
    var value = inputEl.value;
    var initialLength = value.length;
    if (initialLength == 0) return value;
    var newValue = trim(value);
    if (value == newValue) return value;

    // from here on, we know there are trim-related changes

    var cursor = { start: inputEl.selectionStart, end: inputEl.selectionEnd };

    var trimmedLeft = trimLeft(value);
    if (trimmedLeft.length != initialLength) {
        cursor.start -= (initialLength - trimmedLeft.length);
        cursor.end -= (initialLength - trimmedLeft.length);
    }
    inputEl.value = newValue;
    inputEl.setSelectionRange(cursor.start, cursor.end);
    return newValue;
}

function toggleCodeblockWrap(e) {
    var btn = e.currentTarget;
    var codeblock = btn.parentNode.parentNode.querySelector('.codeblock');
    if (btn.getAttribute('wrapped') == 'true') {
        btn.querySelector('.icon-level-left').style.display = 'inline-block';
        btn.querySelector('.icon-arrows-h').style.display = 'none';
        alignText(codeblock);
        btn.setAttribute('wrapped', 'false');
    } else {
        btn.querySelector('.icon-level-left').style.display = 'none';
        btn.querySelector('.icon-arrows-h').style.display = 'inline-block';
        unalignText(codeblock);
        btn.setAttribute('wrapped', 'true');
    }
}

// note: this function should only be called when on mobile
function toggleAllCodeblockWrapsMobile() {
    triggerEvent(
        document.querySelectorAll('.auto-wrap-on-mobile button.wrap-nowrap'),
        'click'
    );
}

// convert a list like [1,2,3] to something like "1, 2, and 3"
function englishList(list, joinWord, finalJoinWord) {
    var english = ''; // init
    foreach(list, function (i, el) {
        english += el;
        switch(i) {
            case (list.length - 2): // penultimate
                english += finalJoinWord;
                break;
            case (list.length - 1): // last
                break;
            default:
                english += joinWord;
                break;
        }
    });
    return english;
}

// browser detect - only use when absolutely necessary. it may break for future
// versions of all these browses. thanks to stackoverflow.com/a/9851769 - check
// this link regularly for updates.
function browserDetect() {
    // Opera 8.0+
    var isOpera = (
        (!!window.opr && !!opr.addons) ||
        !!window.opera ||
        navigator.userAgent.indexOf(' OPR/') >= 0
    );

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    // Safari 3.0+ "[object HTMLElementConstructor]"
    var isSafari = (
        /constructor/i.test(window.HTMLElement) ||
        (function (p) {
            return p.toString() === "[object SafariRemoteNotification]";
        })(
            !window['safari'] ||
            (typeof safari !== 'undefined' && safari.pushNotification)
        )
    );

    // Internet Explorer 6-11
    var isIE9OrLess = (typeof isIE9OrLess !== 'undefined');
    var isIE = isIE9OrLess || !!document.documentMode;

    // Edge 20+
    var isEdge = !isIE && !!window.StyleMedia;

    // Chrome 1+
    var isChrome = !!window.chrome && !!window.chrome.webstore;

    // Blink engine detection
    var isBlink = (isChrome || isOpera) && !!window.CSS;
    return {
        opera: isOpera,
        firefox: isFirefox,
        safari: isSafari,
        ie: isIE,
        edge: isEdge,
        chrome: isChrome,
        blink: isBlink
    };
}
siteGlobals.browser = browserDetect();

function Save(k, v) {
    if (typeof Storage !== 'undefined') {
        localStorage.setItem(k, v);
    } else {
        // save to cookie
        var d = new Date();
        var exdays = 100;
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toGMTString();
        window.document.cookie = k + '=' + v + '; ' + expires;
    }
}

function Retrieve(k) {
    if (typeof Storage !== 'undefined') {
        return localStorage.getItem(k);
    } else {
        var cookieName = k + '=';
        var cookieArray = window.document.cookie.split(';');
        foreach(cookieArray, function (i, c) {
            c = c.trim();
            if (c.indexOf(cookieName) == 0) {
                return c.substring(cookieName.length, c.length);
            }
        });
        return '';
    }
}

// events for all pages

if (!inArray(siteGlobals.siteURL, window.location.origin)) {
    window.location.href = siteGlobals.siteURL + window.location.pathname;
}

// nav-menu open/close (mobile only)
addEvent(document.getElementById('btnNavbar'), 'click', function (e) {
    var btn = e.currentTarget;
    var menu = document.getElementById('navMenu');
    if (btn.getAttribute('menu-is-collapsed') == 'true') {
        btn.setAttribute('menu-is-collapsed', 'false');
        menu.style.display = 'block';
    } else {
        btn.setAttribute('menu-is-collapsed', 'true');
        menu.style.display = 'none';
    }
});

// prevent css :focus from persisting after a click, but allow it to remain
// after focus via keyboard tabbing
addEvent(document.getElementsByTagName('button'), 'click', function (e) {
    e.currentTarget.blur();
});

// prevent css :focus from persisting after a <select> change - internet
// explorer keeps the selection highlighted, which is ugly. apply the onchange
// to the body to cover dynamically added <select> elements
addEvent(document.getElementsByTagName('body')[0], 'change', function (e) {
    if (e.target.tagName.toLowerCase() != 'select') return;
    e.target.blur();
});

// button to toggle between word-wrap and no-wrap on a codeblock
addEvent(
    document.querySelectorAll('.codeblock-container button.wrap-nowrap'),
    'click',
    toggleCodeblockWrap
);
// end original file: utils.js

// original file: matrix-animation.js
// code to run a matrix-movie animation in a <canvas>

function init_all_matrix_canvases(green_text_canvas_class_name, white_text_canvas_class_name) {
    var green_text_canvases = document.querySelectorAll(green_text_canvas_class_name);
    var white_text_canvases = document.querySelectorAll(white_text_canvas_class_name);
    for (var i = 0; i < green_text_canvases.length; i++) {
        init_matrix_canvas(green_text_canvases[i], white_text_canvases[i]);
    }
}

// we use a lot of variables between functions, so keep them out of the global
// scope with a closure
function init_matrix_canvas(green_text_canvas, white_text_canvas) {
    // clear old canvases so only 1 animation can run at a time
    if (green_text_canvas.hasOwnProperty('animation_id')) {
        cancelAnimationFrame(green_text_canvas.animation_id);
    }

    // exit if this canvas is not visible.
    // this way we can call this function every page resize and hide the canvas
    // if it becomes invisible to prevent unnecessary cpu load
    function is_hidden(el) {
        return (el.offsetParent === null);
    }
    if (is_hidden(green_text_canvas)) return;

    // init vars
    var green_text_ctx = green_text_canvas.getContext('2d');
    var white_text_ctx = white_text_canvas.getContext('2d');
    var cw = 300;
    var ch = 200;
    var charArr = ['杕','の','丂','七','丄','当','次','万','丈','三','国','下',
    '丌','不','与','丏','よ','丑','丒','专','且','丕','世','丗','丘','丙','业'];
    var fallingCharArr = [];

    // we want (canvas.width, fontsize) = (42px, 30) = (270px, 16)
    // so plot a line, using www.mathportal.org/calculators/analytic-geometry/two-point-form-calculator.php
    var fontSize = (619 / 19) - (7 * green_text_canvas.scrollWidth / 114);
    var font = 'bold ' + fontSize + 'px monospace';

    var maxColumns = cw / fontSize;

    // init each canvas
    green_text_canvas.width = white_text_canvas.width = cw;
    green_text_canvas.height = white_text_canvas.height = ch;
    green_text_ctx.fillStyle = 'black';
    green_text_ctx.fillRect(0, 0, cw, ch);
    white_text_ctx.fillStyle = 'black';
    white_text_ctx.fillRect(0, 0, cw, ch);

    function RandomInt(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function RandomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }

    function FatRandomFloat(min, max, fatness) {
        var x = fatness * RandomFloat(min, max);
        if (x > max) return max;
        if (x < min) return min;
        return x;
    }

    function Point(x, y) {
        this.x = x;
        this.y = y;
    }

    Point.prototype.draw = function() {
        //randomly skip 1/10 of the columns every frame
        if (RandomFloat(0, 10) < 1) return;

        this.value = charArr[RandomInt(0, charArr.length - 1)];
        if (this.speed == null) this.speed = RandomFloat(1, 10);
        if (this.maxY == null) this.maxY = FatRandomFloat(ch/4, ch, 2);

        white_text_ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        white_text_ctx.font = font;
        white_text_ctx.fillText(this.value, this.x, this.y);

        green_text_ctx.fillStyle = 'green';
        green_text_ctx.font = font;
        green_text_ctx.fillText(this.value, this.x, this.y);

        this.y += this.speed;
        if (this.y > this.maxY) {
            this.y = RandomFloat(-ch/4, 0);
            this.speed = RandomFloat(1, 10);
            this.maxY = FatRandomFloat(ch/4, ch, 2);
        }
    }

    // initialize all points
    for (var i = 0; i < maxColumns; i++) {
        fallingCharArr.push(new Point(i * fontSize, RandomFloat(-ch/4, 0)));
    }

    var freq_counter = 0;
    function update() {
        // queue up to re-run on next screen paint
        green_text_ctx.canvas.animation_id = requestAnimationFrame(update);

        // requestAnimationFrame runs at 60fps. make it 6fps = every 100ms
        freq_counter++;
        if (freq_counter < 6) return;
        freq_counter = 0;

        green_text_ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        green_text_ctx.fillRect(0, 0, cw, ch);
        white_text_ctx.clearRect(0, 0, cw, ch);

        for (var i = 0; i < maxColumns; i++) {
            fallingCharArr[i].draw();
        }
    }
    green_text_ctx.canvas.animation_id = requestAnimationFrame(update);
}
// end original file: matrix-animation.js

// original file: autofooter.js
// make a sticky footer using js, since the css solution is ugly
addEvent(window, 'load, resize', make_sticky_footer);

var timeout_id_resize_footer;
function make_sticky_footer() {
    var footer_el = document.getElementsByTagName('footer')[0];
    footer_el.style.visibility = 'hidden';

    // note that bottom:0 has no effect with position:relative
    footer_el.style.position = 'relative';

    // debounce the resize
    clearTimeout(timeout_id_resize_footer);
    timeout_id_resize_footer = setTimeout(function() {
        var footer_bottom = footer_el.getBoundingClientRect().bottom;
        var body_bottom = document.documentElement.clientHeight;
        if (footer_bottom <= body_bottom) {
            // if the bottom of the footer is above the bottom of the body then
            // set position:absolute. the css already has bottom:0.
            footer_el.style.position = 'absolute';
        }
        footer_el.style.visibility = 'visible';
    }, 500);
}
// end original file: autofooter.js

// original file: cookie-warning-notice.js
addEvent(window, 'load', function () {
    if (Retrieve('cookie-warning-accepted') != 'ok') {
        document.querySelector('.cookie-warning-notice').style.display = 'block';
        addEvent(
            document.querySelector('.cookie-warning-notice button#ok'),
            'click',
            function () {
                Save('cookie-warning-accepted', 'ok');
                document.querySelector('.cookie-warning-notice').style.display =
                'none';
            }
        );
    }
});
// end original file: cookie-warning-notice.js

// original file: ads.js
function fillSkyscraperAds() {
    var topMargin = 30; // px (.col-0 margin-top)
    var adHeight = 630; // px (including margin)
    var contentHeight = document.querySelector('.col-1').offsetHeight;
    var adParent = document.querySelector('.col-0');
    var heightSoFar = topMargin + adHeight;

    // the first skyscraper ad already exists
    (adsbygoogle = window.adsbygoogle || []).push({});

    while (true) {
        var adEl = document.querySelector('.col-0 .adsbygoogle').cloneNode();
        heightSoFar += adHeight; // look-ahead
        if (heightSoFar > contentHeight) break;
        adParent.appendChild(adEl);
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
}
function loadInFeedAds() {
    var numInFeedAds = document.querySelectorAll('.adsbygoogle.in-feed').length;
    for (var i = 0; i < numInFeedAds; i++) {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
}
function loadAdsenseScript() {
    var s = document.createElement('script');
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    document.body.appendChild(s);
}
// todo: only load ads as they come into view
if (siteGlobals.enableAds) addEvent(window, 'load', function () {
    loadAdsenseScript();
    switch (getDeviceType()) {
        case 'phone':
            loadInFeedAds();
            break;
        case 'pc':
        case 'tablet':
            fillSkyscraperAds();
            break;
    }
});
// end original file: ads.js

// original file: register-service-worker.js
if ('serviceWorker' in navigator) {
    // wait until window load (late) to keep the service worker http requests
    // from slowing down more critical requests to get the page up and running
    addEvent(window, 'load', function () {
        navigator.serviceWorker.register('/sw.js');/*.then(function () {
            console.log("Service Worker Registered");
        });*/
    });
}
// end original file: register-service-worker.js