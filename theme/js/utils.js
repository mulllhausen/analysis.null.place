// common functions used on many pages

function unixtime(date_obj) {
    if (date_obj == null) date_obj = new Date();
    return Math.round(date_obj.getTime() / 1000);
}

function addEvent(object, types, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    var typesArr = types.split(',');
    for (var i = 0; i < typesArr.length; i++) {
        var type = typesArr[i].replace(/ /g, '');
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
        } else if (object.attachEvent) {
            object.attachEvent('on' + type, callback);
        } else {
            object['on' + type] = callback;
        }
    }
}

// navbar open/close (mobile only)
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
