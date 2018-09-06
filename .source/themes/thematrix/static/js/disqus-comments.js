addEvent(window, 'load', resetDisqusComments);
var disqus_config = function () {
    if (siteGlobals.siteURL != '') {
        this.page.url = siteGlobals.siteURL + '/' + siteGlobals.article.url;
    }
    this.page.identifier = siteGlobals.article.title;
    this.page.sortOrder = 'newest';
    this.callbacks.onReady = [disqusReady];
    this.callbacks.onNewComment = [disqusCommentUpdated];
    /* events currently unused by disqus
    this.callbacks.afterRender = [disqusAfterRender];
    this.callbacks.beforeComment = [disqusBeforeComment];
    this.callbacks.onIdentify = [disqusIdentify];
    this.callbacks.onInit = [disqusInitialised];
    this.callbacks.onPaginate = [disqusPaginate];
    this.callbacks.preData = [disqusPreData];
    this.callbacks.preInit = [disqusPreInit];
    this.callbacks.preReset = [disqusPreReset];
    */
};
function resetDisqusComments() {
    document.getElementById('disqus_thread').innerHTML = document.
    getElementById('disqusCommentsSilo').innerHTML;
}
function loadDisqusPlatform() {
    // this function is called when the disqus button is clicked. if disqus
    // loads correctly then this function can never be called again. but if
    // disqus fails to load (eg because the browser is offline) then this
    // function may be called again.

    // no need to hide offline comments here since this is already handled in
    // the click event in comments-manager.js

    document.querySelector('.disqus-comments .platform-comments-loader').style.
    display = 'block';

    document.querySelector('.disqus-comments').style.marginBottom = '50px';

    // warn user when disqus is inaccessible after 15 seconds
    siteGlobals.events.disqusCommentsLoadingTimer =
    setTimeout(disqusOffline, 15 * 1000);

    (function () {
        var d = document, s = d.createElement('script');
        // note: disqus does not load correctly if there is a no-cache variable
        // in the querystring, so do not use one
        s.src = 'https://' + siteGlobals.disqusSiteName + '.disqus.com/embed.js';
        s.id = 'disqus-script';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
}
function disqusOffline() {
    resetDisqusComments(); // erase disqus iframes etc

    document.querySelector('.disqus-comments .platform-offline').style.display =
    'block';

    document.querySelector('.disqus-comments .platform-comments-loader').style.
    display = 'none';

    // remove the disqus script from the page so that the user can try again
    deleteElementById('disqus-script');
    platformOffline();
}
/* events currently unused by disqus
function disqusAfterRender() { debugger; }
function disqusBeforeComment() { debugger; }
function disqusIdentify() { debugger; }
function disqusInitialised() { debugger; }
function disqusPaginate() { debugger; }
function disqusPreData() { debugger; }
function disqusPreInit() { debugger; }
function disqusPreReset() { debugger; }
*/
function disqusCommentUpdated(data) {
    // update the comment count. beware the 10 minute delay
    // (stackoverflow.com/q/38586878)
    // could use a local var to keep track of comment count here to avoid the
    // 10 minute delay? but there is no event when a comment gets deleted, so it
    // would not be 100% accurate.
    DISQUSWIDGETS.getCount({ reset: true });
}
function disqusReady(data) {
    siteGlobals.loadedCommentsPlatforms.push('Disqus'); // as per siteGlobals.commentsPlatforms
    clearTimeout(siteGlobals.events.disqusCommentsLoadingTimer);
    document.querySelector('.disqus-comments').style.marginBottom = '0px';
    try {
        // things can get out of sync if the user's connection drops out often.
        // so clean away any loaders that should not be there.
        document.querySelector('.disqus-comments .platform-offline').style.
        display = 'none';

        document.querySelector('.disqus-comments .platform-comments-loader').
        style.display = 'none';

    } catch (e) {}
    commentsLoaded();
}
function disqusUpdateCommentCount() {
    ajax(
        'https://cors-anywhere.herokuapp.com/https://' + siteGlobals.disqusSiteName +
        '.disqus.com/count-data.js?1=' + encodeURIComponent(siteGlobals.article.title) +
        '&nocache=' + unixtime(),
        function (response) {
            try {
                var matches = response.match(/DISQUSWIDGETS.displayCount\((.*)\)/i);
                var json = matches[1]; // capture group
                document.querySelector('.disqus-comment-count').innerHTML = JSON.
                parse(json).counts[0].comments;
            } catch (err) {}
        }
    );
}
disqusUpdateCommentCount(); // init
