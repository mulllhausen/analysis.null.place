if (Retrieve('cookie-warning-accepted') != 'ok') {
    document.querySelector('.cookie-warning-notice').style.display = 'block';
    addEvent(
        document.querySelector('.cookie-warning-notice button#ok'),
        'click',
        function () {
            Save('cookie-warning-accepted', 'ok');
            document.querySelector('.cookie-warning-notice').style.display = 'none';
        }
    );
}
