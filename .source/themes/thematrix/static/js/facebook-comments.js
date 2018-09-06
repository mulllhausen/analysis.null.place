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
    document.getElementById('fbCommentsLoader').style.display = 'block';

    // warn user when fb is inaccessible after 15 seconds
    siteGlobals.events.fbCommentsLoadingTimer = setTimeout(fbOffline, 15 * 1000);

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = 'https://connect.facebook.net/en_US/sdk.js?nocache=' + unixtime();
        fjs.parentNode.insertBefore(js, fjs);
    } (document, 'script', 'facebook-jssdk'));
}
function fbOffline() {
    document.getElementById('fbOffline').style.display = 'block';
    // remove the facebook script from the page so that the user can try again
    deleteElementById('facebook-jssdk');
    document.getElementById('fbCommentsLoader').style.display = 'none';
    platformOffline();
}
function fbRendered(data) {
    siteGlobals.loadedCommentsPlatforms.push('FB'); // as per siteGlobals.commentsPlatforms
    clearTimeout(siteGlobals.events.fbCommentsLoadingTimer);
    document.getElementById('fbOffline').style.display = 'none';
    document.getElementById('fbCommentsLoader').style.display = 'none';
    commentsLoaded();
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
