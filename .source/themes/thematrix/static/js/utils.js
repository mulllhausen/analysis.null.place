// common functions used on many pages

function unixtime(date_obj) {
    if (date_obj == null) date_obj = new Date();
    return Math.round(date_obj.getTime() / 1000);
}

Element.prototype.isNodeList =
Window.prototype.isNodeList =
function() {return false;}

NodeList.prototype.isNodeList =
HTMLCollection.prototype.isNodeList =
function() {return true;}

function addEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var typesArr = types.split(',');
    var elements = (element.isNodeList() ? element : [element]);
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
