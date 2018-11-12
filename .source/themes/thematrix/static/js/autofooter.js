// make a sticky footer using js, since the css solution is ugly
addEvent(window, 'load, resize', makeStickyFooter);

var timeoutIDResizeFooter;
function makeStickyFooter() {
    var footerEl = document.getElementsByTagName('footer')[0];
    footerEl.style.visibility = 'hidden';

    // note that bottom:0 has no effect with position:relative
    footerEl.style.position = 'relative';

    // debounce the resize
    clearTimeout(timeoutIDResizeFooter);
    timeoutIDResizeFooter = setTimeout(function() {
        var footer_bottom = footerEl.getBoundingClientRect().bottom;
        if (getEntireHeight() <= window.innerHeight) {
            // if the content is bigger than the visible page then keep the
            // footer after the content (position:relative), else set
            // position:fixed. the css already has bottom:0.
            footerEl.style.position = 'fixed';
        }
        footerEl.style.visibility = 'visible';
    }, 500);
}
