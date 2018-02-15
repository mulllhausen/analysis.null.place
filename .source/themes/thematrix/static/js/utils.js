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

NodeList.prototype.isNodeList =
HTMLCollection.prototype.isNodeList =
function() {return true;}

function addEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var typesArr = types.split(',');
    var elements = (element.hasOwnProperty('isNodeList') ? element : [element]);
    for (var el_i = 0; el_i < elements.length; el_i++) {
        var el = elements[el_i];
        for (var type_i = 0; type_i < typesArr.length; type_i++) {
            var type = typesArr[type_i].replace(/ /g, '');
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

function in_array(needle, haystack) {
    // note: does not work with with NaN or ie < 9
    return (haystack.indexOf(needle) > -1);
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
        btn.setAttribute('wrapped', 'false');
    } else {
        codeblock.style.whiteSpace = 'pre-wrap';
        btn.querySelector('i.fa-level-down').style.display = 'none';
        btn.querySelector('i.fa-arrows-h').style.display = 'inline-block';
        btn.setAttribute('wrapped', 'true');
    }
});
