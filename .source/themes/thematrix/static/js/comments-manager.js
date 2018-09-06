siteGlobals.loadedCommentsPlatforms = [];
addEvent(window, 'load', function () {
    foreach(siteGlobals.commentsPlatforms, function (i, platformI) {
        addEvent( // 'button' event
            document.querySelector('.comment-with.' + platformI.toLowerCase()),
            'click',
            function (e) { renderComments(platformI); }
        );
        addEvent( // 'button-count' event
            document.querySelector(
                '.comment-with.' + platformI.toLowerCase() + '+span'
            ),
            'click',
            function (e) { renderComments(platformI); }
        );
    });
});

function renderComments(platformI) {
    document.querySelector('.choose-comments-platform').style.marginBottom = '30px';
    if (siteGlobals.events.loadingCommentsPlatform != null) return;
    siteGlobals.events.loadingCommentsPlatform = platformI;
    foreach(siteGlobals.commentsPlatforms, function (j, platformJ) {
        var button = document.querySelector(
            '.comment-with.' + platformJ.toLowerCase()
        );
        var commentsArea = document.querySelector(
            '.' + platformJ.toLowerCase() + '-comments'
        );
        if (platformI == platformJ) { // show this comments platform
            commentsArea.style.display = 'block';
            button.classList.add('selected');
        } else { // hide all other comments platforms and disallow selection
            commentsArea.style.display = 'none';
            button.classList.remove('selected');
            button.classList.add('disallow-selection');
        }
    });

    // hide offline warnings from all platforms
    foreach(document.querySelectorAll('.platform-offline'), function (i, el) {
        el.style.display = 'none';
    });

    // if the platform has already been successfully loaded then there is no
    // need to fetch it again
    if (inArray(platformI, siteGlobals.loadedCommentsPlatforms)) {
        return commentsLoaded();
    }
    window['load' + platformI + 'Platform']();
}

// comments were successfully loaded (any platform)
function commentsLoaded() {
    foreach(document.querySelectorAll('.comment-with'), function(i, el) {
        el.classList.remove('disallow-selection');
    });
    siteGlobals.events.loadingCommentsPlatform = null;
}

// a platform was found to be offline
function platformOffline() {
    foreach(document.querySelectorAll('.comment-with'), function(i, el) {
        el.classList.remove('disallow-selection');
    });
    siteGlobals.events.loadingCommentsPlatform = null;
}
