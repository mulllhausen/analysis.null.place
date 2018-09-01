var disqus_config = function () {
    if (siteGlobals.siteURL != '') {
        this.page.url = siteGlobals.siteURL + '/' + siteGlobals.article.url;
    }
    this.page.identifier = siteGlobals.article.title;
    this.page.sortOrder = 'newest';
    this.callbacks.onReady = [disqusReady];
    this.callbacks.onNewComment = [disqusCommentUpdated];
};
function loadDisqusPlatform() {
    // this function is called when the disqus button is first clicked
    document.getElementById('disqusCommentsLoader').style.display = 'block';
    document.querySelector('.disqus-comments').style.marginBottom = '50px';

    // warn user when disqus is inaccessible after 15 seconds
    siteGlobals.events.disqusCommentsLoadingTimer =
    setTimeout(disqusOffline, 15 * 1000);

    (function () {
        var d = document, s = d.createElement('script');
        s.src = 'https://' + siteGlobals.disqusSiteName + '.disqus.com/embed.js';
        s.id = 'disqus-script';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    })();
}
function disqusOffline() {
    document.getElementById('disqusOffline').style.display = 'block';
    // remove the facebook script from the page so that the user can try again
    deleteElementById('disqus-script');
    document.getElementById('disqusCommentsLoader').style.display = 'none';
    platformOffline();
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
    document.querySelector('.disqus-comments').style.marginBottom = '0px';
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
