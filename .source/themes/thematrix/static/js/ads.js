// todo: move all global variables into their own namespace
function deleteInFeedAds() {
    deleteElements(document.querySelectorAll('.col-1 .adsbygoogle'));
}
function deleteSkyscraperAds() {
    deleteElements(document.querySelectorAll('.col-0 .adsbygoogle'));
}
var sampleSkyscraperAd = null; // init
function fillSkyscraperAds() {
    var topMargin = 30; // px (.col-0 margin-top)
    var adHeight = 630; // px (including margin)
    var spaceStatus = {
        heightSoFar: topMargin + adHeight,
        limitReached: false
    };
    // the first skyscraper ad already exists. save a copy before converting it
    if (sampleSkyscraperAd == null) {
        sampleSkyscraperAd = document.querySelector('.col-0 .adsbygoogle').cloneNode();

        // convert it to an ad
        loadAdsenseScript(function () {
            (spaceStatus.adsbygoogle = window.adsbygoogle || []).push({})
        });
    }

    // set up a timer to keep adding/removing more skyscraper ads as the page
    // height changes due to dynamic content
    setInterval(function() {
        while (true) {
            spaceStatus = add1MoreSkyscraperAd(
                sampleSkyscraperAd, topMargin, adHeight, spaceStatus
            );
            if (spaceStatus.limitReached) break;
        }
    }, 500);
}
function add1MoreSkyscraperAd(adEl, topMargin, adHeight, spaceStatus) {
    var contentHeight = document.querySelector('.col-1').offsetHeight;
    if (!anyVisibleSkyscraperAds()) { // all hidden
        // always show the first skyscraper ad
        unhide1SkyscraperAd();
        spaceStatus.heightSoFar = topMargin + adHeight;
    }
    if ((spaceStatus.heightSoFar + adHeight) > contentHeight) {
        spaceStatus.limitReached = true;
        return spaceStatus;
    }
    if (document.querySelectorAll('.adsbygoogle.skyscraper.important-hidden').length > 0) {
        unhide1SkyscraperAd();
    } else {
        document.querySelector('.col-0').appendChild(adEl.cloneNode());
        loadAdsenseScript(function () {
            (spaceStatus.adsbygoogle = window.adsbygoogle || []).push({})
        });
    }
    spaceStatus.heightSoFar += adHeight;
    spaceStatus.limitReached = false;
    return spaceStatus;
}
function hideAllSkyscraperAds() {
    foreach(document.querySelectorAll('.adsbygoogle.skyscraper'), function (i, el) {
        addCSSClass(el, 'important-hidden');
    });
}
function unhide1SkyscraperAd() {
    var el = document.querySelector('.adsbygoogle.skyscraper.important-hidden');
    removeCSSClass(el, 'important-hidden');
}
function anyVisibleSkyscraperAds() {
    return (
        document.querySelectorAll(
            '.adsbygoogle.skyscraper:not(.important-hidden)'
        ).length > 0
    );
}
function loadInFeedAds() {
    if (getDeviceType() != 'phone') return;
    foreach(
        document.querySelectorAll('.col-1 .adsbygoogle:not(.load)'),
        function (i, el) {
            addCSSClass(el, 'load');
            loadAdsenseScript(function() {
                (adsbygoogle = window.adsbygoogle || []).push({})
            });
        }
    );
}
function archiveInFeedAds() {
    // move the in-feed ads to the archive area. this is useful when ads are
    // situated between dynamic content
    // this function is still allowed even when not on a phone since it will
    // hide the in-feed ads if they are showing due to dynamic resizing
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
    if (getDeviceType() != 'phone') return;

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
                (adsbygoogle = window.adsbygoogle || []).push({})
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
    sampleInFeedAdHTML = trim(document.getElementById('adsArchiveArea').innerHTML);

    // delete the sample ad
    document.getElementById('adsArchiveArea').innerHTML = '';

    switch (getDeviceType()) {
        case 'phone':
            deleteSkyscraperAds();
            loadInFeedAds();
            break;
        case 'pc':
        case 'tablet':
            deleteInFeedAds();
            fillSkyscraperAds();
            break;
    }
});
