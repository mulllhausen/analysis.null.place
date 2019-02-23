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
                '.comment-with.' + platformI.toLowerCase() + ' span'
            ),
            'click',
            function (e) { renderComments(platformI); }
        );
        addEvent(document.getElementById('exitComments'), 'click', exitComments);
    });
});

var spacerTopPos = 0; // global
var commentsTopPos = 0; // global
var timeoutIDResizeBottomSpacer; // global
function repositionCommentsContainer(platformI) {
    spacerTopPos = getCoordinates(document.querySelector('article .bottom-spacer')).top;
    document.querySelector('article .bottom-spacer').style.height = '0px';
    var commentsContainer = document.querySelector('.comments');
    commentsContainer.style.display = 'block';
    var topPos = window.pageYOffset + 60;
    commentsContainer.style.top = topPos + 'px';
    commentsTopPos = topPos; // save for use in resizeBottomSpacerHeight() later
    timeoutIDResizeBottomSpacer = setInterval(function () {
        resizeBottomSpacerHeight(platformI);
    }, 200);
}

function renderComments(platformI) {
    // allow repositioning any time
    repositionCommentsContainer(platformI);
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

function exitComments() {
    // do not enable the exit button until the comments have loaded
    if (siteGlobals.events.loadingCommentsPlatform != null) return;
    clearInterval(timeoutIDResizeBottomSpacer);
    document.querySelector('.comments').style.display = 'none';
    foreach(document.querySelectorAll('.comment-with'), function(i, el) {
        el.classList.remove('disallow-selection');
        el.classList.remove('selected');
    });
    document.querySelector('article .bottom-spacer').style.height = '0px';
}

// make any comments that are hidden below the end of the article visible
function resizeBottomSpacerHeight(platformI) {
    var commentsDivEl = document.querySelector('.comments');
    var commentsBottom = commentsTopPos + commentsDivEl.offsetHeight;
    var footerTop = getCoordinates(document.querySelector('footer')).top;
    var extraPadding = 30; // px. the bottom box-shadow of .comments
    var error = footerTop - extraPadding - commentsBottom;
    if (inArray(platformI, siteGlobals.loadedCommentsPlatforms)) {
        // the platform has already been loaded, so this is the last time we
        // need to run this function for now
        clearInterval(timeoutIDResizeBottomSpacer);
    }
    if (Math.abs(error) <= 0) return;
    var spacerEl = document.querySelector('article .bottom-spacer');
    if (spacerTopPos > commentsBottom) spacerEl.style.height = '0px';
    else spacerEl.style.height = (spacerEl.offsetHeight - error) + 'px';
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
