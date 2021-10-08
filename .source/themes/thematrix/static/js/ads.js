var skyscraperAdTopMargin = 30; // px (.col-0 margin-top)
var skyscraperAdHeight = 630; // px (including margin)

// todo: move all global variables into their own namespace
function deleteInFeedAds() {
    deleteElements(document.querySelectorAll('.col-1 .adsbygoogle'));
}
function deleteSkyscraperAds() {
    deleteElements(document.querySelectorAll('.col-0 .adsbygoogle'));
}
function hideBottomAnchorAd() {
    document.querySelector('.bottom-anchor-ad').style.display = 'none';
    document.querySelector('footer').style.marginBottom = '0px';
}
var sampleSkyscraperAd = null; // init
function fillSkyscraperAds() {
    // the first skyscraper ad already exists. save a copy before converting it
    if (sampleSkyscraperAd == null) {
        sampleSkyscraperAd = document.querySelector('.col-0 .adsbygoogle').cloneNode();

        // convert it to an ad
        loadAdsenseScript(function () {
            (adsbygoogle = window.adsbygoogle || []).push({});
        });
    }

    // set up a timer to keep adding/removing more skyscraper ads as the page
    // height changes due to dynamic content. keep the timer interval fairly
    // long since it does a lot of slow dom calls
    setInterval(function() {
        while (true) {
            var limitReached = add1MoreSkyscraperAd(sampleSkyscraperAd);
            if (limitReached) break;
        }
    }, 500);
}
function add1MoreSkyscraperAd(adEl) {
    var contentHeight = document.querySelector('.col-1').offsetHeight;

    // always show the first skyscraper ad
    if (!anyVisibleSkyscraperAds()) unhide1SkyscraperAd();

    if ((getSkyscraperAdsTotalHeight() + skyscraperAdHeight) > contentHeight) {
        return true; // limit reached
    }
    // from here on we know there is space for at least 1 more ad

    if (anyHiddenSkyscraperAds()) unhide1SkyscraperAd();
    else {
        document.querySelector('.col-0').appendChild(adEl.cloneNode());
        loadAdsenseScript(function () {
            (adsbygoogle = window.adsbygoogle || []).push({});
        });
    }
    return false; // limit not reached
}
function hideAllSkyscraperAds() {
    if (initialDeviceType != 'pc' && initialDeviceType != 'tablet') return;
    foreach(document.querySelectorAll('.adsbygoogle.skyscraper'), function (i, el) {
        addCSSClass(el, 'important-hidden');
    });
}
function unhide1SkyscraperAd() {
    var el = document.querySelector('.adsbygoogle.skyscraper.important-hidden');
    removeCSSClass(el, 'important-hidden');
}
function anyHiddenSkyscraperAds() {
    return document.querySelectorAll(
        '.adsbygoogle.skyscraper.important-hidden'
    ).length > 0;
}
function anyVisibleSkyscraperAds() {
    return (
        document.querySelectorAll(
            '.adsbygoogle.skyscraper:not(.important-hidden)'
        ).length > 0
    );
}
function getSkyscraperAdsTotalHeight() {
    return document.querySelectorAll(
        '.adsbygoogle.skyscraper:not(.important-hidden)'
    ).length * (skyscraperAdHeight + skyscraperAdTopMargin);
}
function loadInFeedAds() {
    if (initialDeviceType != 'phone') return;
    foreach(
        document.querySelectorAll('.col-1 .adsbygoogle:not(.load)'),
        function (i, el) {
            addCSSClass(el, 'load');
            loadAdsenseScript(function() {
                (adsbygoogle = window.adsbygoogle || []).push({});
            });
        }
    );
}
// using 1 second, i saw cases where the ad showed but was marked as 'unfilled'
// and so was removed. try 5 seconds instead.
var fiveSecondsInMilliseconds = 5000;
function loadBottomAnchorAd() {
    if (initialDeviceType != 'phone') return;
    document.querySelector('.bottom-anchor-ad').style.display = 'block';
    var el = document.querySelector('.bottom-anchor-ad .adsbygoogle:not(.load)');
    addCSSClass(el, 'load');
    loadAdsenseScript(function() {
        (adsbygoogle = window.adsbygoogle || []).push({});

        if (siteGlobals.debugging === true) return; // exit here to show the ad

        var timerID = setInterval(function () {
            switch (getBottomAnchorAdFillStatus()) {
                case 'unfilled': // a final status was assigned
                    hideBottomAnchorAd();
                    // fallthrough
                case 'filled': // a final status was assigned
                    clearInterval(timerID);
                    break;
                default: // status still not assigned - keep waiting
                    break;
            }
        }, fiveSecondsInMilliseconds);
    });
}
function getBottomAnchorAdFillStatus() {
    return document.querySelector('.bottom-anchor-ad ins.adsbygoogle').
    getAttribute('data-ad-status');
}
function archiveInFeedAds() {
    // move the in-feed ads to the archive area. this is useful when ads are
    // situated between dynamic content
    // this function is still allowed even when not on a phone since it will
    // hide the in-feed ads if they are showing due to dynamic resizing

    return; // in-feed ads are now deprecated in favor of a bottom anchor ad

    foreach(
        document.querySelectorAll('.col-1 .in-feed-ad-container'),
        function (i, el) {
            if (el.childNodes.length == 0) return;
            var adEl = el.childNodes[0];
            document.getElementById('adsArchiveArea').appendChild(adEl);
        }
    );
}
function populateInFeedAds() {
    return; // in-feed ads are now deprecated in favor of a bottom anchor ad
    if (initialDeviceType != 'phone') return;

    // get the archived ads in a list. note: use .children and not .childNodes
    // to avoid text nodes due to newlines
    var archivedAds = document.getElementById('adsArchiveArea').children;

    foreach(document.querySelectorAll('.in-feed-ad-container'), function (i, el) {
        if (trim(el.innerHTML) != '') return; // break if this container already has an ad
        if (archivedAds.length > 0) {
            // use an archived ad if possible
            el.appendChild(archivedAds[0])
        } else {
            // there are no archived ads so create a new one from sample
            el.innerHTML = sampleInFeedAdHTML;
            loadAdsenseScript(function () {
                (adsbygoogle = window.adsbygoogle || []).push({});
            });
        }
    });
}
var adsenseScriptState = 'before-loading'; // init
function loadAdsenseScript(callback) {
    switch (adsenseScriptState) {
        case 'before-loading':
            adsenseScriptState = 'loading';
            addEvent(document, 'adsense-loaded', callback);
            var s = document.createElement('script');
            s.async = true;
            addEvent(s, 'load', function() {
                adsenseScriptState = 'loaded';
                triggerEvent(document, 'adsense-loaded');
            });
            s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
            document.body.appendChild(s);
            break;
        case 'loading':
            addEvent(document, 'adsense-loaded', callback);
            break;
        case 'loaded':
            return callback();
    }
}
// todo: only load ads as they come into view
if (siteGlobals.enableAds) addEvent(window, 'load', function () {
    // there is 1 sample in-feed ad in the archive area initially. save it for
    // use later before any <ins> elements are converted to <iframe> elements by
    // google
    //sampleInFeedAdHTML = trim(document.getElementById('adsArchiveArea').innerHTML);

    // delete the sample ad
    document.getElementById('adsArchiveArea').innerHTML = '';

    switch (initialDeviceType) {
        case 'phone':
            deleteSkyscraperAds();
            //loadInFeedAds();
            loadBottomAnchorAd();
            break;
        case 'pc':
        case 'tablet':
            //deleteInFeedAds();
            hideBottomAnchorAd();
            fillSkyscraperAds();
            break;
    }
});
