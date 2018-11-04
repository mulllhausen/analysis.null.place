function fillSkyscraperAds() {
    var topMargin = 30; // px (.col-0 margin-top)
    var adHeight = 630; // px (including margin)
    var contentHeight = document.querySelector('.col-1').offsetHeight;
    var adParent = document.querySelector('.col-0');
    var heightSoFar = topMargin + adHeight;
    while (true) {
        var adEl = document.querySelector('.col-0 .adsbygoogle').cloneNode();
        heightSoFar += adHeight; // look-ahead
        if (heightSoFar > contentHeight) break;
        adParent.appendChild(adEl);
    }
}
fillSkyscraperAds();
(adsbygoogle = window.adsbygoogle || []).push({
    google_ad_client: siteGlobals.googleAdClient,
    enable_page_level_ads: true
});
