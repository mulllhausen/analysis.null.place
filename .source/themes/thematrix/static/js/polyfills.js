// string repeat polyfill
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/repeat#Polyfill
if (!String.prototype.repeat) String.prototype.repeat = function(count) {
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
if ('ab'.substr(-1) != 'b') String.prototype.substr = function(substr) {
    return function(start, length) {
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

if (!String.prototype.trim) String.prototype.trim = function() {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
};

// modified from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest
if (!Element.prototype.matches) Element.prototype.matches =
Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;

if (!Element.prototype.closest) Element.prototype.closest = function(query) {
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

// fix for stupid ie. thanks to
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc
if (!Math.trunc) {
    Math.trunc = function(v) {
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

window.requestAnimationFrame = function() {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function(f) {
            window.setTimeout(f, 1e3/60);
        }
}();

window.cancelAnimationFrame = function() {
    return window.cancelAnimationFrame ||
        window.webkitCancelAnimationFrame ||
        window.mozCancelAnimationFrame ||
        window.msCancelAnimationFrame ||
        window.oCancelAnimationFrame ||
        function(id) {
            window.clearTimeout(id);
        }
}();
