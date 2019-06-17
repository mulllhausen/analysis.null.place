function deleteInFeedAds() {
    deleteElements(document.querySelectorAll('.col-1 .adsbygoogle'));
}
function deleteSkyscraperAds() {
    deleteElements(document.querySelectorAll('.col-0 .adsbygoogle'));
}
var sampleSkyscraperAd = null; // init
var numSkyscraperAds = 1; // init
var numHiddenSkyscraperAds = 0; // init
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
        (spaceStatus.adsbygoogle = window.adsbygoogle || []).push({});
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
    }, 1000);
}
function add1MoreSkyscraperAd(adEl, topMargin, adHeight, spaceStatus) {
    var contentHeight = document.querySelector('.col-1').offsetHeight;
    if (numHiddenSkyscraperAds == numSkyscraperAds) { // all hidden
        // always show the first skyscraper ad
        unhide1SkyscraperAd();
        spaceStatus.heightSoFar = topMargin + adHeight;
    }
    if ((spaceStatus.heightSoFar + adHeight) > contentHeight) {
        spaceStatus.limitReached = true;
        return spaceStatus;
    }
    if (numHiddenSkyscraperAds > 0) {
        unhide1SkyscraperAd();
    } else {
        document.querySelector('.col-0').appendChild(adEl.cloneNode());
        (spaceStatus.adsbygoogle = window.adsbygoogle || []).push({});
        numSkyscraperAds++;
    }
    spaceStatus.heightSoFar += adHeight;
    spaceStatus.limitReached = false;
    return spaceStatus;
}
function hideAllSkyscraperAds() {
    foreach(document.querySelectorAll('.adsbygoogle.skyscraper'), function (i, el) {
        addCSSClass(el, 'important-hidden');
        numHiddenSkyscraperAds++;
    });
}
function unhide1SkyscraperAd() {
    var el = document.querySelector('.adsbygoogle.skyscraper.important-hidden');
    removeCSSClass(el, 'important-hidden');
    numHiddenSkyscraperAds--;
}
function anyVisibleSkyscraperAds() {
    var anyVisible = false;
    foreach(document.querySelectorAll('.adsbygoogle.skyscraper'), function (i, el) {
        if (el.style.display == 'none') return;
        anyVisible = true;
        return false;
    });
    return anyVisible;
}
function loadInFeedAds() {
    var numInFeedAds = document.querySelectorAll('.col-1 .adsbygoogle').length;
    for (var i = 0; i < numInFeedAds; i++) {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
}
function loadAdsenseScript() {
    var s = document.createElement('script');
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
    document.body.appendChild(s);
}
// todo: only load ads as they come into view
if (siteGlobals.enableAds) addEvent(window, 'load', function () {
    loadAdsenseScript();
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
