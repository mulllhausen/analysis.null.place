// common functions used on many pages

// thanks to stackoverflow.com/a/13900163
function stopBubble(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true; // IE6-9
}

// thanks to stackoverflow.com/a/1147768
function getEntireHeight() {
    return Math.max(
        document.body.scrollHeight, document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    );
}

function isScrolledTo(el, position, amount) {
    // note: amount is optional. when omitted it defaults to 'either'
    if (el == null) return false;

    var rect = el.getBoundingClientRect();
    var elTop = rect.top; // distance down from the top of the window
    var elBottom = rect.bottom; // distance down from the top of the window
    switch (position) {
        case 'view': // the element is visible
            switch (amount) {
                case 'entirely': // the element is completely visible (top and bottom)
                    return ((elTop >= 0) && (elBottom <= window.innerHeight));
                default:
                case 'partially': // the element is partially visible
                    return ((elTop < window.innerHeight) && (elBottom >= 0));
            }
        case 'above': // the element is above the window of view
            switch (amount) {
                case 'entirely':
                    return (elBottom < 0);
                case 'partially': // only partially but not entirely
                    return ((elTop < 0) && (elBottom > 0));
                default: // either partially or entirely
                    return (elTop < 0);
            }
        case 'below': // the element is below the window
            switch (amount) {
                case 'entirely':
                    return (elTop > window.innerHeight);
                case 'partially': // only partially but not entirely
                    return ((elTop < window.innerHeight) && (elBottom > window.innerHeight));
                default: // either partially or entirely
                    return (elBottom > window.innerHeight);
            }
        default:
            throw 'error in isScrolledTo function: unknown position' +
            ((position == null) ? '' : position);
    }
}

// thanks to stackoverflow.com/a/26230989
function getCoordinates(el) {
    var box = el.getBoundingClientRect();

    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    return {
        top: Math.round(box.top + scrollTop - clientTop),
        left: Math.round(box.left + scrollLeft - clientLeft)
    };
}

function getDeviceType() {
    return window.getComputedStyle(
        document.getElementsByTagName('body')[0], ':before'
    ).getPropertyValue('content').replace(/"/g, '');
}

function isEven(i) {
    return ((i % 2) == 0);
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

function leftPad(strToPad, padToLen, padChar) {
    strToPad = strToPad.toString();
    if (strToPad.length >= padToLen) return strToPad;
    if (padChar == null) padChar = '0';
    return padChar.repeat(padToLen - strToPad.length) + strToPad;
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
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        for (var typeI = 0; typeI < typesArr.length; typeI++) {
            var type = typesArr[typeI].replace(/ /g, '');
            if (el.addEventListener) {
                el.addEventListener(type, callback, false);
            } else if (el.attachEvent) { // ie
                el.attachEvent('on' + type, callback);
            } else {
                el['on' + type] = callback;
            }
        }
    }
}

function removeEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    var typesArr = types.split(',');
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        for (var typeI = 0; typeI < typesArr.length; typeI++) {
            var type = typesArr[typeI].replace(/ /g, '');
            if (el.removeEventListener) {
                el.removeEventListener(type, callback, false);
            } else if (el.detachEvent) { // ie
                el.detachEvent('on' + type, callback);
            } else {
                delete el['on' + type];
            }
        }
    }
}

function triggerEvent(element, type) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(type, false, true);
            el.dispatchEvent(evt);
        }
        else el.fireEvent('on' + type);
    }
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

function addCSSClass(el, newClass) {
    if (el == null) return; // there is no element to add a class to
    var classList = el.className.split(/\s+/);
    var i = classList.indexOf(newClass);
    if (i != -1) return; // already found
    classList.push(newClass);
    el.className = classList.join(' ');
}

function removeCSSClass(el, removeClass) {
    if (el == null) return; // there is no element to remove a class from
    var classList = el.className.split(/\s+/);
    var i = classList.indexOf(removeClass);
    if (i == -1) return; // not found
    classList.splice(i, 1); // remove 1 list item
    el.className = classList.join(' ');
}

function addHocStyleSheet(id, styles) {
    // thanks to stackoverflow.com/a/524721
    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    head.appendChild(style);
    style.type = 'text/css';
    style.id = id;
    if (style.styleSheet) style.styleSheet.cssText = styles; // ie <= 8
    else style.appendChild(document.createTextNode(styles));
}

function removeHocStyleSheet(id) {
    deleteElementById(id);
}

var permanentlyRemovedGlassCases = [];
function removeGlassCase(formID, permanently) {
    if (inArray(formID, permanentlyRemovedGlassCases)) return;

    var formEl = document.getElementById(formID);
    foreach(formEl.querySelectorAll('button:not(.keep-disabled)'), function(i, el) {
        el.disabled = false;
    });
    foreach(formEl.querySelectorAll('input:not(.keep-disabled)'), function(i, el) {
        el.disabled = false;
    });
    foreach(formEl.querySelectorAll('select:not(.keep-disabled)'), function(i, el) {
        el.disabled = false;
    });
    removeCSSClass(formEl, 'glass-case');
    if (permanently) permanentlyRemovedGlassCases.push(formID);
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

function setButtonLoading(setLoading, buttonEl) {
    var spinnerHTML = '<span class="button-loading"></span> ';
    buttonEl.innerHTML = (
        setLoading ?
        spinnerHTML + buttonEl.innerHTML :
        buttonEl.innerHTML.replace(spinnerHTML, '')
    );
    return buttonEl;
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

function jsonCopyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
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
        //if (this.status != 304) return; // from cache stackoverflow.com/a/16817752
        callback(this.responseText);
    });
    xhttp.open('GET', url, true); // async
    xhttp.timeout = 5000; // ms
    addEvent(xhttp, 'timeout', function () {
        callback(null); // null = fail
    });
    addEvent(xhttp, 'error', function () {
        callback(null); // null = fail
    });
    xhttp.send();
}

// a download manager you can call as many times as you like for the same file,
// but will only download the file once and then run all the callbacks
var downloadProperties = {};
function downloadOnce(url, callback) {
    if (!downloadProperties.hasOwnProperty[url]) downloadProperties[url] = {
        setupCount: 0,
        runCount: 0,
        status_: 'not started',
        data: null
    };
    if (downloadProperties[url].status_ == 'complete') {
        return triggerEvent(document, 'done-download-' + url);
    }

    // run all the different callbacks when the download finishes
    var newCallback = function() {
        downloadProperties[url].runCount++;
        callback(downloadProperties[url]);
        if (
            downloadProperties[url].runCount <
            downloadProperties[url].setupCount
        ) return;
        removeEvent(document, 'done-download-' + url, newCallback);
        delete downloadProperties[url]; // clean up
    };
    downloadProperties[url].setupCount++;
    addEvent(document, 'done-download-' + url, newCallback);

    // 1 attempt at a time
    if (downloadProperties[url].status_ == 'in progress') return;

    downloadProperties[url].status_ = 'in progress'; // lock
    ajax(url, function (data) {
        downloadProperties[url].data = data;
        downloadProperties[url].status_ = 'complete';
        triggerEvent(document, 'done-download-' + url);
    });
}

/*
// use the service worker (if available), else ajax, to preload an external
// resource
function preload(url) {
    if (!('serviceWorker' in navigator)) {
        ajax(url);
        return; // do not return any content
    }
    var intervalID = setInterval(function() {
        var sw = navigator.serviceWorker.controller;
        // exit if service worker is not yet ready
        if (sw == null) return;

        if (sw.state == 'activated') return execPreload(intervalID, url);
        addEvent(sw, 'statechange' function () {
            execPreload(intervalID, url);
        });
    }, 200); // try 5 times a second
}

function execPreload(intervalID, url) {
    if (sw.state != 'activated') return;

    clearInterval(intervalID);
    if (navigator.serviceWorker.controller.postMessage({
        type: 'preload',
        url: url
    });
}*/

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

function easyPlural(word, ending) {
    if (word.substr(-ending.length) == ending) return word;
    return word + ending;
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

// - when debounceType = 'start' - callback once on the first event with state
// 'atStart'
// - when debounceType = 'end' - callback after the wait period with state 'atEnd'
// - when debounceType = 'both' - callback for each state: 'atStart',
// 'atMiddle' (triggered on every event between 'start' and 'end') and 'atEnd'
function debounce(callback, wait, debounceType, extraChecks) {
    // put this function within an event handler. it will be called immediately
    // from within the event handler to initialise a debounce event function
    var timeoutID = null;
    return function() {
        // called with the same debounceType every time the event fires

        var later = function() {
            timeoutID = null;
            switch (debounceType) {
                case 'end':
                case 'both':
                    // only run the callback if 'end' or 'both' registered
                    callback('atEnd');
                    break;
            }
        };
        var callbackNow;
        var state = (timeoutID == null) ? 'atStart' : 'atMiddle';
        switch (debounceType) { // the registered debounce type
            case 'start':
                if (state == 'atStart') callbackNow = true;
                break;
            case 'both': // start, middle & end
                callbackNow = true;
                break;
            case 'end':
                // if only registered for the end debounce type then do not
                // callback now but do extend the timeout
                callbackNow = false;
                break;
        }
        var extraData = {
            extendTimeout: true
        };
        if (extraChecks != null) extraData = extraChecks(state);
        if (extraData.extendTimeout) {
            clearTimeout(timeoutID);
            timeoutID = setTimeout(later, wait);
        }
        if (callbackNow) callback(state, extraData);
    };
}

function generateCleanURL(pathPlus) {
    if (pathPlus[0] != '/') pathPlus = '/' + pathPlus;
    return siteGlobals.siteURL + pathPlus;
}

// events for all pages

if (!inArray(siteGlobals.siteURL, window.location.origin)) {
    window.location.href = generateCleanURL(window.location.pathname);
}

initialDeviceType = getDeviceType(); // init global

// nav-menu open/close (mobile only)
addEvent(document.getElementById('btnNavbar'), 'click', function (e) {
    var btn = e.currentTarget;
    if (btn.getAttribute('menu-is-collapsed') == 'true') openMenu();
    else closeMenu();
});

function closeMenu() {
    document.getElementById('btnNavbar').setAttribute('menu-is-collapsed', 'true');
    document.getElementById('navMenu').style.display = 'none';
}

function openMenu() {
    document.getElementById('btnNavbar').setAttribute('menu-is-collapsed', 'false');
    document.getElementById('navMenu').style.display = 'block';
}

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
