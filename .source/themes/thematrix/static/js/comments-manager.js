var doneLoading = [];
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
        } else { // hide all other comments platforms
            commentsArea.style.display = 'none';
            button.classList.remove('selected');
        }

        // hide offline warnings from all platforms
        var offlineWarning = document.querySelector(
            '.' + platformJ.toLowerCase() + '-offline'
        );
        offlineWarning.style.display = 'none';
    });
    if (inArray(platformI, doneLoading)) return;
    window['load' + platformI + 'Platform']();
    doneLoading.push(platformI);
}
