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

function popup(heading, detail) {
    document.getElementById('fullpagePopupHeading').innerText = heading;
    document.getElementById('fullpagePopupDetail').innerText = detail;
    document.getElementById('fullpagePopupNotification').style.display = 'table';
    setTimeout(hidePopup, 3000);
}

function hidePopup() {
    document.getElementById('fullpagePopupNotification').style.display = 'none';
}

// thanks to https://davidwalsh.name/javascript-debounce-function
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}
