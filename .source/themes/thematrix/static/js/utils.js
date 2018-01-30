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

function addEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var typesArr = types.split(',');
    for (var i = 0; i < typesArr.length; i++) {
        var type = typesArr[i].replace(/ /g, '');
        if (element.addEventListener) {
            element.addEventListener(type, callback, false);
        } else if (element.attachEvent) {
            element.attachEvent('on' + type, callback);
        } else {
            element['on' + type] = callback;
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
