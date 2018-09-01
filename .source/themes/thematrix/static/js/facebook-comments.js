window.fbAsyncInit = function () {
    FB.init({
        appId: siteGlobals.facebookAppID,
        //autoLogAppEvents: true,
        cookie: true,
        xfbml: true,
        version: 'v3.0'
    });
    FB.AppEvents.logPageView();
    FB.Event.subscribe('xfbml.render', fbRendered);
    FB.Event.subscribe('comment.create', fbUpdateCommentCount);
    FB.Event.subscribe('comment.remove', fbUpdateCommentCount);
};
function loadFBPlatform() {
    // this function is called when the fb button is first clicked
    document.querySelector('.fb-comments-loader').style.display = 'block';

    // warn user when fb is inaccessible after 30 seconds
    siteGlobals.fbCommentsLoadingTimer = setTimeout(fbOffline, 15 * 1000);

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    } (document, 'script', 'facebook-jssdk'));
}
function fbOffline() {
    document.querySelector('.fb-offline').style.display = 'block';
    document.querySelector('.fb-comments-loader').style.display = 'none';
}
function fbRendered(data) {
    clearTimeout(siteGlobals.fbCommentsLoadingTimer);
    document.querySelector('.fb-offline').style.display = 'none';
    document.querySelector('.fb-comments-loader').style.display = 'none';
}
function fbUpdateCommentCount() {
    ajax(
        'https://graph.facebook.com/v2.1/' +
        encodeURIComponent(siteGlobals.siteURL + '/' + siteGlobals.article.url) +
        '?fields=share&method=get&pretty=0&sdk=joey&suppress_http_code=1',
        function (json) {
            try {
                document.querySelector('.fb-comment-count').innerHTML = JSON.
                parse(json).share.comment_count;
            } catch (err) {}
        }
    );
}
fbUpdateCommentCount(); // init
