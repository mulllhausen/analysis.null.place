addEvent(window, 'load', function () {
    if (Retrieve('cookie-warning-accepted') == 'ok') return;

    var noticeBarEl = document.querySelector('.cookie-warning-notice');
    addCSSClass(noticeBarEl, 'show');

    addEvent(
        document.querySelector('.cookie-warning-notice button#ok'),
        'click',
        function () {
            Save('cookie-warning-accepted', 'ok');
            removeCSSClass(noticeBarEl, 'show');
        }
    );
});
