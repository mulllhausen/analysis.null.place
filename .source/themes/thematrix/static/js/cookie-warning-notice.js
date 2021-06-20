addEvent(window, 'load', function () {
    if (Retrieve('cookie-warning-accepted') == 'ok') return;

    var noticeBarEl = document.querySelector('.cookie-warning-notice');
    addCSSClass(noticeBarEl, 'show');

    var footerEl = document.getElementsByTagName('footer')[0];
    footerEl.style.marginBottom = '140px'; // height of anchor ad and notice bar

    addEvent(
        document.querySelector('.cookie-warning-notice button#ok'),
        'click',
        function () {
            Save('cookie-warning-accepted', 'ok');
            removeCSSClass(noticeBarEl, 'show');
            footerEl.style.marginBottom = '100px'; // height of anchor ad only
        }
    );
});
