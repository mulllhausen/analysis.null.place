addEvent(window, 'load', resetDisqusComments);
var disqus_config = function () {
    if (siteGlobals.siteURL != '') {
        var urlPath = siteGlobals.article.url;

        if (siteGlobals.article.parentArticleURL) urlPath =
        siteGlobals.article.parentArticleURL;

        this.page.url = siteGlobals.siteURL + '/' + urlPath;
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

    // check for multiple loaders every 0.5 seconds, and enforce 1 loader
    siteGlobals.events.disqusCommentsLoadingInterval =
    setInterval(cleanDisqusLoaders, 0.5 * 1000);

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
    clearInterval(siteGlobals.events.disqusCommentsLoadingInterval);
    resetDisqusComments(); // erase disqus iframes etc

    document.querySelector('.disqus-comments .platform-offline').style.display =
    'block';

    document.querySelector('.disqus-comments .platform-comments-loader').style.
    display = 'none';

    // remove the disqus script from the page so that the user can try again
    deleteElementById('disqus-script');
    platformOffline();
}
function cleanDisqusLoaders() {
    // this function is a failsafe to ensure that there is only ever 1 disqus
    // loader - either the disqus native loader, or my loader. ordinarily disqus
    // will delete my loader for me, so this will not be necessary. however if
    // the network connection drops in and out then disqus can think that it has
    // already deleted my loaders, when infact i have added them back in. to
    // simulate this:
    // - load the page with the network online and click the disqus icon (this
    // will cache the disqus script. if they allowed a querystring this whole
    // process could be avoided!)
    // - reload the page with the network online (not a hard reload. so the
    // disqus script is still cached in the browser)
    // - go offline and click the disqus icon (wait 15 seconds for my timeout)
    // - go back online and click the disqus icon (at this point you will get 2
    // loaders - mine and the disqus native loader)
    if (enforceOneDisqusLoader()) {
        clearInterval(siteGlobals.events.disqusCommentsLoadingInterval);
    }
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
function enforceOneDisqusLoader() {
    var anyChanges = false; // init
    var hasSiteLoader = false; // init
    var hasDisqusLoader = false; // init
    var siteLoaderEl; // init
    foreach(document.getElementById('disqus_thread').children, function (i, el) {
        if (el.tagName == 'IFRAME') hasDisqusLoader = true;
        if (
            el.tagName == 'DIV' &&
            inArray('platform-comments-loader', el.className)
        ) {
            siteLoaderEl = el;
            hasSiteLoader = true;
        }
        if (hasDisqusLoader && hasSiteLoader) {
            deleteElement(siteLoaderEl);
            return false; // break
        }
    });
    return (hasDisqusLoader && hasSiteLoader);
}
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
    clearInterval(siteGlobals.events.disqusCommentsLoadingInterval);
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
