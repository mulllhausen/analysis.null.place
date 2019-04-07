var latestCache = '2019-04-08_00:45:50';
var mandatoryAssets = [
    // common assets for all pages
    'https://analysis.null.place/theme/css/thematrix.css?hash=4uNcYG',
    'https://analysis.null.place/theme/img/icons.svg?hash=DlWPXe',
    'https://analysis.null.place/theme/img/shattered-glass-2b.png?hash=xZglIf',
    'https://analysis.null.place/theme/img/shattered-glass-black.png?hash=DsMJmV',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-192x192.png?hash=HbWgBI',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-512x512.png?hash=9R0TcV',
    'https://analysis.null.place/theme/img/favicon.ico?hash=jRJksA',
    'https://analysis.null.place/theme/img/apple-touch-icon.png?hash=FAvW32',
    'https://analysis.null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJ',
    'https://analysis.null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrA',
    'https://analysis.null.place/theme/js/base.js?hash=CVbSdv',
    'https://analysis.null.place/theme/js/console-greeter.js?hash=j6dUQ7',
    'https://analysis.null.place/theme/js/manifest.json',

    // common assets for all article pages
    'https://analysis.null.place/theme/js/comments-section.js?hash=eby9QW',

    // home page
    'https://analysis.null.place/',
    'https://analysis.null.place/index.html',

    // archives page
    'https://analysis.null.place/archives/',
    'https://analysis.null.place/archives/index.html',

    // tags pages
    'https://analysis.null.place/tags/',
    'https://analysis.null.place/tags/index.html',
    'https://analysis.null.place/tag/mining/',
    'https://analysis.null.place/tag/mining/index.html',
    'https://analysis.null.place/tag/movie/',
    'https://analysis.null.place/tag/movie/index.html',
    'https://analysis.null.place/tag/bitcoin/',
    'https://analysis.null.place/tag/bitcoin/index.html',
    'https://analysis.null.place/tag/reviews/',
    'https://analysis.null.place/tag/reviews/index.html',
    'https://analysis.null.place/tag/book/',
    'https://analysis.null.place/tag/book/index.html',
    'https://analysis.null.place/tag/tv-series/',
    'https://analysis.null.place/tag/tv-series/index.html',
    'https://analysis.null.place/tag/proof-of-work/',
    'https://analysis.null.place/tag/proof-of-work/index.html',

    // categories
    'https://analysis.null.place/cryptocurrencies/',
    'https://analysis.null.place/cryptocurrencies/index.html',
    'https://analysis.null.place/reviews/',
    'https://analysis.null.place/reviews/index.html',

    // assets for the "book reviews" article
    'https://analysis.null.place/book-reviews/',
    'https://analysis.null.place/book-reviews/index.html',
    'https://analysis.null.place/js/media-reviews.js?hash=06keok',
    'https://analysis.null.place/css/media-reviews.css?hash=2579An',
    'https://analysis.null.place/img/book-thumbnail-stanislawlemsolaris1961.jpg?hash=55BY16',
    'https://analysis.null.place/img/book-thumbnail-barbaraklipskatheneuroscientistwholosthermind2018.jpg?hash=bffWZ6',
    'https://analysis.null.place/img/book-thumbnail-theodoreschickandlewisvaughnhowtothinkaboutweirdthings2011.jpg?hash=TN51ee',
    'https://analysis.null.place/img/book-thumbnail-robertharrisimperium2006.jpg?hash=I6ji6V',
    'https://analysis.null.place/json/books-init-list.json?hash=d5FoN_',
    'https://analysis.null.place/json/books-list.json?hash=Ly32ZJ',
    'https://analysis.null.place/json/books-search-index.json?hash=qEoiSs',
    'https://analysis.null.place/json/book-review-stanislawlemsolaris1961.json?hash=ZVzmrD',
    'https://analysis.null.place/json/book-review-barbaraklipskatheneuroscientistwholosthermind2018.json?hash=poY45m',
    'https://analysis.null.place/json/book-review-theodoreschickandlewisvaughnhowtothinkaboutweirdthings2011.json?hash=poY45m',
    'https://analysis.null.place/json/book-review-robertharrisimperium2006.json?hash=tPAeC6',

    // assets for the "tv-series reviews" article
    'https://analysis.null.place/tv-series-reviews/',
    'https://analysis.null.place/tv-series-reviews/index.html',
    'https://analysis.null.place/img/tv-series-thumbnail-thewalkingdead12010.jpg?hash=KBZUww',
    'https://analysis.null.place/img/tv-series-thumbnail-blackmirror12011.jpg?hash=EDPW69',
    'https://analysis.null.place/img/tv-series-thumbnail-nightflyers12018.jpg?hash=mSCzFO',
    'https://analysis.null.place/img/tv-series-thumbnail-maniac12018.jpg?hash=0nxg5W',
    'https://analysis.null.place/json/tv-series-init-list.json?hash=sf9AHo',
    'https://analysis.null.place/json/tv-series-list.json?hash=f8Jers',
    'https://analysis.null.place/json/tv-series-search-index.json?hash=Re-LiQ',
    'https://analysis.null.place/json/tv-series-review-thewalkingdead12010.json?hash=poY45m',
    'https://analysis.null.place/json/tv-series-review-blackmirror12011.json?hash=poY45m',
    'https://analysis.null.place/json/tv-series-review-nightflyers12018.json?hash=iSpT3g',
    'https://analysis.null.place/json/tv-series-review-maniac12018.json?hash=SjiWtk',

    // assets for the "movie reviews" article
    'https://analysis.null.place/movie-reviews/',
    'https://analysis.null.place/movie-reviews/index.html',
    'https://analysis.null.place/img/movie-thumbnail-district92009.jpg?hash=_Xpeu3',
    'https://analysis.null.place/img/movie-thumbnail-minorityreport2002.jpg?hash=3YUvAQ',
    'https://analysis.null.place/img/movie-thumbnail-darkcity1998.jpg?hash=AYP1o9',
    'https://analysis.null.place/img/movie-thumbnail-thematrix1999.jpg?hash=hHD_Ow',
    'https://analysis.null.place/img/movie-thumbnail-fightclub1999.jpg?hash=oHJ5p0',
    'https://analysis.null.place/img/movie-thumbnail-eternalsunshineofthespotlessmind2004.jpg?hash=gBO6Y0',
    'https://analysis.null.place/img/movie-thumbnail-rebelwithoutacause1955.jpg?hash=vaTsOr',
    'https://analysis.null.place/img/movie-thumbnail-themartian2015.jpg?hash=UCWwpU',
    'https://analysis.null.place/img/movie-thumbnail-thedressmaker2015.jpg?hash=d0w1GW',
    'https://analysis.null.place/img/movie-thumbnail-requiemforadream2000.jpg?hash=1h_Xxh',
    'https://analysis.null.place/img/movie-thumbnail-themask1994.jpg?hash=gzVDQL',
    'https://analysis.null.place/img/movie-thumbnail-thebeach2000.jpg?hash=2dMoah',
    'https://analysis.null.place/img/movie-thumbnail-thematinghabitsoftheearthboundhuman1999.jpg?hash=3gtsA6',
    'https://analysis.null.place/img/movie-thumbnail-themazerunner2014.jpg?hash=tkhRNA',
    'https://analysis.null.place/img/movie-thumbnail-thebutterflyeffect2004.jpg?hash=Vol4L0',
    'https://analysis.null.place/img/movie-thumbnail-transcendence2014.jpg?hash=3u0uQ2',
    'https://analysis.null.place/img/movie-thumbnail-aclockworkorange1971.jpg?hash=7gLUvy',
    'https://analysis.null.place/img/movie-thumbnail-montypythonandtheholygrail1975.jpg?hash=6decj9',
    'https://analysis.null.place/img/movie-thumbnail-bladerunner1982.jpg?hash=59OSyh',
    'https://analysis.null.place/img/movie-thumbnail-freddygotfingered2001.jpg?hash=eyUXJK',
    'https://analysis.null.place/img/movie-thumbnail-lockstockandtwosmokingbarrels1998.jpg?hash=wOqiGi',
    'https://analysis.null.place/img/movie-thumbnail-inglouriousbasterds2009.jpg?hash=J3Xhne',
    'https://analysis.null.place/img/movie-thumbnail-upgrade2018.jpg?hash=eMhxGM',
    'https://analysis.null.place/img/movie-thumbnail-10000bc2008.jpg?hash=bRSCLx',
    'https://analysis.null.place/img/movie-thumbnail-missionimpossible6fallout2018.jpg?hash=XmSSDw',
    'https://analysis.null.place/img/movie-thumbnail-statusupdate2018.jpg?hash=GSldYe',
    'https://analysis.null.place/img/movie-thumbnail-thefounder2016.jpg?hash=N5t6OG',
    'https://analysis.null.place/img/movie-thumbnail-greenbook2019.jpg?hash=DmMVJv',
    'https://analysis.null.place/img/movie-thumbnail-mollysgame2017.jpg?hash=eskUG_',
    'https://analysis.null.place/img/movie-thumbnail-loro2018.jpg?hash=1yE1FU',
    'https://analysis.null.place/img/movie-thumbnail-birdbox2018.jpg?hash=DHP9G3',
    'https://analysis.null.place/img/movie-thumbnail-adrift2018.jpg?hash=3tna7v',
    'https://analysis.null.place/json/movies-init-list.json?hash=CFZ1A9',
    'https://analysis.null.place/json/movies-list.json?hash=J7Zrsc',
    'https://analysis.null.place/json/movies-search-index.json?hash=kCH3ZL',
    'https://analysis.null.place/json/movie-review-district92009.json?hash=nHVYBt',
    'https://analysis.null.place/json/movie-review-minorityreport2002.json?hash=S3GRds',
    'https://analysis.null.place/json/movie-review-darkcity1998.json?hash=XK-6MN',
    'https://analysis.null.place/json/movie-review-thematrix1999.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-fightclub1999.json?hash=dmhcrB',
    'https://analysis.null.place/json/movie-review-eternalsunshineofthespotlessmind2004.json?hash=oc2Pao',
    'https://analysis.null.place/json/movie-review-rebelwithoutacause1955.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-themartian2015.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thedressmaker2015.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-requiemforadream2000.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-themask1994.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thebeach2000.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thematinghabitsoftheearthboundhuman1999.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-themazerunner2014.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thebutterflyeffect2004.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-transcendence2014.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-aclockworkorange1971.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-montypythonandtheholygrail1975.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-bladerunner1982.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-freddygotfingered2001.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-lockstockandtwosmokingbarrels1998.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-inglouriousbasterds2009.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-upgrade2018.json?hash=atWiE-',
    'https://analysis.null.place/json/movie-review-10000bc2008.json?hash=4ANHFg',
    'https://analysis.null.place/json/movie-review-missionimpossible6fallout2018.json?hash=X_VOTj',
    'https://analysis.null.place/json/movie-review-statusupdate2018.json?hash=086QgC',
    'https://analysis.null.place/json/movie-review-thefounder2016.json?hash=jscM4w',
    'https://analysis.null.place/json/movie-review-greenbook2019.json?hash=385v2y',
    'https://analysis.null.place/json/movie-review-mollysgame2017.json?hash=5CmqSw',
    'https://analysis.null.place/json/movie-review-loro2018.json?hash=JxIsbO',
    'https://analysis.null.place/json/movie-review-birdbox2018.json?hash=ViCgKm',
    'https://analysis.null.place/json/movie-review-adrift2018.json?hash=qRem2E',

    // assets for the "how do the bitcoin mining algorithms work?" article
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/index.html',
    'https://analysis.null.place/js/sjcl.min.js?hash=0JqGiP',
    'https://analysis.null.place/js/btc-mining.js?hash=D15PC7',
    'https://analysis.null.place/css/btc.css?hash=93IOhm',
    'https://analysis.null.place/img/hashing-flowchart.svg?hash=NX7qzY',
    'https://analysis.null.place/img/bitcoin-blockchain.svg?hash=70Cxdl',
    'https://analysis.null.place/json/btc_txs_per_block_0-999.json?hash=i24DRR',
    'https://analysis.null.place/json/hex-trial-attempts.json?hash=sjiIF4',
    'https://analysis.null.place/json/unittest-bits.json?hash=m8SQwF',

    // cookie warning notice
    'https://analysis.null.place/cookie-notice/',
    'https://analysis.null.place/cookie-notice/index.html'
];
self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(latestCache).then(function (cache) {
            return cache.addAll(mandatoryAssets);
        })
    );
});

self.addEventListener('activate', function (event) {
    // delete all caches except latestCache (saves disk space)
    caches.keys().then(function (names) {
        for (let name of names) {
            if (name == latestCache) continue;
            caches.delete(name);
        }
    });
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (swResponse) {
            return (swResponse || fetch(event.request));
        })
    );
});