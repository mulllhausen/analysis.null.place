function deleteInFeedAds() {
    deleteElements(document.querySelectorAll('.col-1 .adsbygoogle'));
}
function deleteSkyscraperAds() {
    deleteElements(document.querySelectorAll('.col-0 .adsbygoogle'));
}
function fillSkyscraperAds() {
    var topMargin = 30; // px (.col-0 margin-top)
    var adHeight = 630; // px (including margin)
    var contentHeight = document.querySelector('.col-1').offsetHeight;
    var adParent = document.querySelector('.col-0');
    var heightSoFar = topMargin + adHeight;

    // the first skyscraper ad already exists
    (adsbygoogle = window.adsbygoogle || []).push({});

    while (true) {
        var adEl = document.querySelector('.col-0 .adsbygoogle').cloneNode();
        heightSoFar += adHeight; // look-ahead
        if (heightSoFar > contentHeight) break;
        adParent.appendChild(adEl);
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
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
