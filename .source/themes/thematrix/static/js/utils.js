// common functions used on many pages

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

NodeList.prototype.isNodeList = HTMLCollection.prototype.isNodeList = function() {
    return true;
};

function isNodeList(elements) {
    try {
        return (elements.isNodeList() === true);
    } catch (err) {
        return false;
    }
}

function addEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var typesArr = types.split(',');
    var elements = (isNodeList(element) ? element : [element]);
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        for (var typeI = 0; typeI < typesArr.length; typeI++) {
            var type = typesArr[typeI].replace(/ /g, '');
            if (el.addEventListener) {
                el.addEventListener(type, callback, false);
            } else if (el.attachEvent) {
                el.attachEvent('on' + type, callback);
            } else {
                el['on' + type] = callback;
            }
        }
    }
}

function triggerEvent(element, type) {
    if ('createEvent' in document) {
        var evt = document.createEvent('HTMLEvents');
        evt.initEvent(type, false, true);
        element.dispatchEvent(evt);
    }
    else element.fireEvent('on' + type);
}

function popup(heading, detail) {
    document.getElementById('fullpagePopupHeading').innerText = heading;
    document.getElementById('fullpagePopupDetail').innerText = detail;
    document.getElementById('fullpagePopupNotification').style.display = 'table';
    setTimeout(hidePopup, 3000);
}

function hidePopup() {
    document.getElementById('fullpagePopupNotification').style.display = 'none';
}

function addLi2Ul(ulID, liID, errorText) {
    var ul = document.getElementById(ulID);
    var li = document.createElement('li');
    li.id = liID;
    li.appendChild(document.createTextNode(errorText));
    ul.appendChild(li);
}

function deleteElementById(elID) {
    var el = document.getElementById(elID);
    if (el == null) return;
    el.parentNode.removeChild(el);
}

function isHex(val) {
    var regex = /^[0-9a-f]+$/gi;
    return regex.test(val);
}

function stringIsInt(x)  {
    return (x == parseInt(x, 10));
}

function setButtons(enable) {
    for (var i = 1; i < arguments.length; i++) {
        document.getElementById('btn' + arguments[i]).disabled = !enable;
    }
}

// find needle in haystack - works for strings as well as arrays
function inArray(needle, haystack) {
    // note: does not work with with NaN or ie < 9
    return (haystack.indexOf(needle) > -1);
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

function mergeObjects(/*eg {a:1}, {b:2}, {c:3}*/) {
    var retObj = {};
    foreach(arguments, function(i, obj) {
        foreach(obj, function(k, v) {
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
    addEvent(xhttp, 'readystatechange', function() {
        if (this.readyState != XMLHttpRequest.DONE) return;
        if (this.status != 200) return;
        callback(this.responseText);
    });
    xhttp.open('GET', url);
    xhttp.send();
}

Element.prototype.up = function(num) {
    var el = this;
    for (var i = 0; i < num; i++) el = el.parentNode;
    return el;
}

// align text at <span class="aligner"/>. currently only 1 aligner is supported
// per line
var uniqueTextAligner = '|%|'; // something never used in the codeblock
function alignText(codeblock) {
    var lines = codeblock.innerHTML.split('\n');
    if (lines.length == 1) return;

    // put the aligners in
    foreach(codeblock.querySelectorAll('.aligner'), function(i, el) {
        el.innerText = uniqueTextAligner;
    });
    lines = codeblock.innerHTML.split('\n');

    // find the biggest index position from any line
    var biggestIndentPos = 0; // init
    var linesWithoutAlignment = []; // init
    var linesNoHTML = {}; // init (avoid unnecessary dom operations)
    foreach (lines, function(lineI, line) {
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
    foreach (lines, function(lineI, line) {
        if (inArray(lineI, linesWithoutAlignment)) return; // continue
        var linePartsForCalc = linesNoHTML[lineI].split(uniqueTextAligner);
        // remove the unique aligner and align the text
        codeblock.querySelectorAll('.aligner')[alignerNum].innerText =
        ' '.repeat(biggestIndentPos - linePartsForCalc[0].length);
        alignerNum++;
    });
}

function unalignText(codeblock) {
    foreach(codeblock.querySelectorAll('.aligner'), function(i, el) {
        el.innerText = '';
    });
}

function plural(wordEnding, plural) {
    switch (wordEnding) {
        case 's':
            if (plural) return 's';
            else return '';
    }
}
// events for all pages

// nav-menu open/close (mobile only)
addEvent(document.getElementById('btnNavbar'), 'click', function(e) {
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
addEvent(document.getElementsByTagName('button'), 'click', function(e) {
    e.currentTarget.blur();
});

// button to toggle between word-wrap and no-wrap on a codeblock
addEvent(document.querySelectorAll('.codeblock-container button.wrap-nowrap'), 'click', function(e) {
    var btn = e.currentTarget;
    var codeblock = btn.parentNode.parentNode.querySelector('.codeblock');
    if (btn.getAttribute('wrapped') == 'true') {
        codeblock.style.whiteSpace = 'pre';
        btn.querySelector('i.fa-level-down').style.display = 'inline-block';
        btn.querySelector('i.fa-arrows-h').style.display = 'none';
        alignText(codeblock);
        btn.setAttribute('wrapped', 'false');
    } else {
        codeblock.style.whiteSpace = 'pre-wrap';
        btn.querySelector('i.fa-level-down').style.display = 'none';
        btn.querySelector('i.fa-arrows-h').style.display = 'inline-block';
        unalignText(codeblock);
        btn.setAttribute('wrapped', 'true');
    }
});
