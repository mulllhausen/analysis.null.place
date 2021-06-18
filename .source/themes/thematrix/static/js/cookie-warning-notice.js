addEvent(window, 'load', function () {
    if (Retrieve('cookie-warning-accepted') == 'ok') return;
    var noticeBar = document.querySelector('.cookie-warning-notice');
    addCSSClass(noticeBar, 'show');
    addEvent(
        document.querySelector('.cookie-warning-notice button#ok'),
        'click',
        function () {
            Save('cookie-warning-accepted', 'ok');
            removeCSSClass(noticeBar, 'show');
        }
    );
});
