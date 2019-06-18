// greet developers in the console window
(function(siteGlobalsCopy) { // separate scope
    var styles = 'color: #7db904;';//background: #000000; ';
    var padRight = '';//' '.repeat(200);
    var header = 'Welcome to the source code for the ';
    var fullConsoleSupport = (siteGlobalsCopy.browser.chrome || siteGlobalsCopy.browser.safari);

    // all browsers except IE support colors in the console
    var styleConsoleSupport = !siteGlobalsCopy.browser.ie;
    var console1024CharLimit = siteGlobalsCopy.browser.ie;

    if (fullConsoleSupport) {
        var group = function(text, styleOverride) {
            var localStyles = (styleOverride != null) ? styleOverride : styles;
            console.group('%c' + text + padRight, localStyles);
        };
        var groupEnd = console.groupEnd;
        var log = function(text, styleOverride) {
            var localStyles = (styleOverride != null) ? styleOverride : styles;
            console.log('%c' + text + padRight, localStyles);
        };
        header += siteGlobalsCopy.sitename;
    } else {
        // no support for font size - use ascii art instead
        // minimal support for grouping - use ascii art instead
        var indentLevel = -3; // hack to prevent first indent (looks better)
        var logText = ''; // init
        var group = function(text) {
            log(text);
            indentLevel += 3;
        };
        var groupEnd = function() {
            indentLevel -= 3;
            log(''); // empty line after groups
        };
        var log = function(text) {
            var indent = (indentLevel >= 0) ? ' '.repeat(indentLevel) : '';
            logText += indent + text + '\n';
        };
        header += siteGlobalsCopy.sitenameASCIIArt;
    }
    function logEnd() {
        if (fullConsoleSupport) return; // everything has already been done
        if (styleConsoleSupport) {
            console.log('%c' + logText, styles);
            return;
        }
        if (console1024CharLimit) {
            var logArray = logText.split('\n');
            var printChunk = [];
            var chunkLength = 0;
            foreach(logArray, function (i, line) {
                chunkLength += line.length + 1; // +1 for '\n'.length
                if (chunkLength > 1024) {
                    console.log(printChunk.join('\n'));
                    printChunk = [];
                    chunkLength = line.length + 1;
                }
                printChunk.push(line); // append
            });
            return;
        }
        console.log(logText);
    }
    group(header + ' blog', styles + 'font-size: x-large;');
    log('');
    log('This website is hosted on github. You can view the Pelican files which generate the static website files at ' + siteGlobalsCopy.githubURL + '/tree/master/.source');
    log('');
    group('The global Javascript file is ' + siteGlobalsCopy.siteURL + '/theme/js/base.js, which is built by merging and minifying the following files:');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/polyfills.js - polyfills to get this site working on older browsers');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/utils.js - common functions used on many pages');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/matrix-animation.js - code to animate the matrix logo');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/autofooter.js - code to position the footer');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/cookie-warning-notice.js - code to show/hide the cookie warning banner at the bottom of the page');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/ads.js - code to lazy-load the pc or mobile adverts');
    log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/register-service-worker.js');
    groupEnd();
    log('The service worker Javascript file is ' + siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/templates/sw.html');
    log(''); // empty line
    if (siteGlobalsCopy.hasOwnProperty('article')) {
        if (siteGlobalsCopy.commentsPlatforms.length > 0) {
            group('All articles have a comments section, which is handled by ' + siteGlobalsCopy.siteURL + '/theme/js/comments-section.js. This file is built by merging and minifying the following files:');
            log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/comments-manager.js');
            if (inArray('FB', siteGlobalsCopy.commentsPlatforms)) log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/facebook-comments.js');
            if (inArray('Disqus', siteGlobalsCopy.commentsPlatforms)) log(siteGlobalsCopy.githubURL + '/tree/master/.source/themes/thematrix/static/js/disqus-comments.js');
            groupEnd();
        }
        if (siteGlobalsCopy.article.hasOwnProperty('consoleExplainScripts')) {
            group('The Javascript files specifically for the \'' + siteGlobalsCopy.article.title + '\' article are:');
                var consoleExplanations = siteGlobalsCopy.article.consoleExplainScripts.split('|');
                foreach(consoleExplanations, function (i, consoleExp) {
                    log(siteGlobalsCopy.githubURL + '/tree/master/.source/content/' + consoleExp);
                });
            groupEnd();
        } else {
            log('There are no Javascript files specifically for the \'' + siteGlobalsCopy.article.title + '\' article.');
        }
    } else {
        log('Please navigate to an article to view the Javascript files specific to that article (if any).');
    }
    groupEnd();
    logEnd();
})(siteGlobals);
