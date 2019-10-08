var latestCache = '2019-10-09_00:58:40';
var mandatoryAssets = [
    // common assets for all pages
    'https://analysis.null.place/theme/css/thematrix.css?hash=dMw1uC',
    'https://analysis.null.place/theme/img/icons.svg?hash=DlWPXe',
    'https://analysis.null.place/theme/img/shattered-glass-2b.png?hash=xZglIf',
    'https://analysis.null.place/theme/img/shattered-glass-black.png?hash=DsMJmV',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-192x192.png?hash=HbWgBI',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-512x512.png?hash=9R0TcV',
    'https://analysis.null.place/theme/img/favicon.ico?hash=jRJksA',
    'https://analysis.null.place/theme/img/apple-touch-icon.png?hash=FAvW32',
    'https://analysis.null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJ',
    'https://analysis.null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrA',
    'https://analysis.null.place/theme/js/base.js?hash=ULV7VY',
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
    'https://analysis.null.place/js/media-reviews.js?hash=CMmOd4',
    'https://analysis.null.place/css/media-reviews.css?hash=kRCNcw',
    'https://analysis.null.place/img/book-thumb-barbaraklipskatheneuroscientistwholosthermind2018.jpg?hash=bffWZ6',
    'https://analysis.null.place/img/book-thumb-robertharrisimperium2006.jpg?hash=I6ji6V',
    'https://analysis.null.place/img/book-thumb-stanislawlemsolaris1961.jpg?hash=55BY16',
    'https://analysis.null.place/img/book-thumb-theodoreschickandlewisvaughnhowtothinkaboutweirdthings2011.jpg?hash=TN51ee',
    'https://analysis.null.place/json/book-review-barbaraklipskatheneuroscientistwholosthermind2018.json?hash=kk6_x-',
    'https://analysis.null.place/json/book-review-robertharrisimperium2006.json?hash=SKdAqQ',
    'https://analysis.null.place/json/book-review-stanislawlemsolaris1961.json?hash=R-Q9pX',
    'https://analysis.null.place/json/book-review-theodoreschickandlewisvaughnhowtothinkaboutweirdthings2011.json?hash=eWODmr',
    'https://analysis.null.place/json/books-init-list.json?hash=mVUw3w',
    'https://analysis.null.place/json/books-list.json?hash=xHAv5y',
    'https://analysis.null.place/json/books-search-index.json?hash=PEQ6Y3',

    // assets for the "tv-series reviews" article
    'https://analysis.null.place/tv-series-reviews/',
    'https://analysis.null.place/tv-series-reviews/index.html',
    'https://analysis.null.place/img/tv-series-thumb-blackmirror12011.jpg?hash=EDPW69',
    'https://analysis.null.place/img/tv-series-thumb-blackmirror52019.jpg?hash=Jsu8GJ',
    'https://analysis.null.place/img/tv-series-thumb-deadpixels12019.jpg?hash=hlvMUx',
    'https://analysis.null.place/img/tv-series-thumb-maniac12018.jpg?hash=0nxg5W',
    'https://analysis.null.place/img/tv-series-thumb-nightflyers12018.jpg?hash=mSCzFO',
    'https://analysis.null.place/img/tv-series-thumb-thewalkingdead12010.jpg?hash=KBZUww',
    'https://analysis.null.place/json/tv-series-init-list.json?hash=_1CQNf',
    'https://analysis.null.place/json/tv-series-list.json?hash=i9hLfD',
    'https://analysis.null.place/json/tv-series-review-blackmirror12011.json?hash=poY45m',
    'https://analysis.null.place/json/tv-series-review-blackmirror52019.json?hash=RNRZhV',
    'https://analysis.null.place/json/tv-series-review-deadpixels12019.json?hash=l-lzV-',
    'https://analysis.null.place/json/tv-series-review-maniac12018.json?hash=SjiWtk',
    'https://analysis.null.place/json/tv-series-review-nightflyers12018.json?hash=iSpT3g',
    'https://analysis.null.place/json/tv-series-review-thewalkingdead12010.json?hash=poY45m',
    'https://analysis.null.place/json/tv-series-search-index.json?hash=sVmtnF',

    // assets for the "movie reviews" article
    'https://analysis.null.place/movie-reviews/',
    'https://analysis.null.place/movie-reviews/index.html',
    'https://analysis.null.place/img/movie-thumb-10000bc2008.jpg?hash=gB-GJa',
    'https://analysis.null.place/img/movie-thumb-aclockworkorange1971.jpg?hash=9W-iCc',
    'https://analysis.null.place/img/movie-thumb-adrift2018.jpg?hash=2U0oV3',
    'https://analysis.null.place/img/movie-thumb-birdbox2018.jpg?hash=dhDclx',
    'https://analysis.null.place/img/movie-thumb-bladerunner1982.jpg?hash=EFay0z',
    'https://analysis.null.place/img/movie-thumb-darkcity1998.jpg?hash=KwU5zR',
    'https://analysis.null.place/img/movie-thumb-district92009.jpg?hash=j3UZi4',
    'https://analysis.null.place/img/movie-thumb-eternalsunshineofthespotlessmind2004.jpg?hash=JHOOvN',
    'https://analysis.null.place/img/movie-thumb-fightclub1999.jpg?hash=7ipBk9',
    'https://analysis.null.place/img/movie-thumb-freddygotfingered2001.jpg?hash=fdMrI6',
    'https://analysis.null.place/img/movie-thumb-greenbook2019.jpg?hash=F_qF0N',
    'https://analysis.null.place/img/movie-thumb-hellolovegoodbye2019.jpg?hash=04Vy6e',
    'https://analysis.null.place/img/movie-thumb-inglouriousbasterds2009.jpg?hash=GD6oJ_',
    'https://analysis.null.place/img/movie-thumb-limitless2011.jpg?hash=y9QKXN',
    'https://analysis.null.place/img/movie-thumb-lockstockandtwosmokingbarrels1998.jpg?hash=YnLVat',
    'https://analysis.null.place/img/movie-thumb-loro2018.jpg?hash=M_eDeh',
    'https://analysis.null.place/img/movie-thumb-minorityreport2002.jpg?hash=Rzm_No',
    'https://analysis.null.place/img/movie-thumb-missionimpossible6fallout2018.jpg?hash=H_ziRM',
    'https://analysis.null.place/img/movie-thumb-mollysgame2017.jpg?hash=nGoWJ_',
    'https://analysis.null.place/img/movie-thumb-montypythonandtheholygrail1975.jpg?hash=dLolO-',
    'https://analysis.null.place/img/movie-thumb-rebelwithoutacause1955.jpg?hash=ICFTC8',
    'https://analysis.null.place/img/movie-thumb-requiemforadream2000.jpg?hash=hU1ML4',
    'https://analysis.null.place/img/movie-thumb-shoplifters2018.jpg?hash=wjnsRr',
    'https://analysis.null.place/img/movie-thumb-statusupdate2018.jpg?hash=V6s2MM',
    'https://analysis.null.place/img/movie-thumb-taken12008.jpg?hash=Fh7wJO',
    'https://analysis.null.place/img/movie-thumb-thebeach2000.jpg?hash=m8zRDU',
    'https://analysis.null.place/img/movie-thumb-thebutterflyeffect2004.jpg?hash=CEBmsB',
    'https://analysis.null.place/img/movie-thumb-thecurseoflallorona2019.jpg?hash=tkdu55',
    'https://analysis.null.place/img/movie-thumb-thedressmaker2015.jpg?hash=s6WMee',
    'https://analysis.null.place/img/movie-thumb-thefounder2016.jpg?hash=2Lyji3',
    'https://analysis.null.place/img/movie-thumb-themanfromnowhere2010.jpg?hash=eV54nB',
    'https://analysis.null.place/img/movie-thumb-themartian2015.jpg?hash=hZtYnF',
    'https://analysis.null.place/img/movie-thumb-themask1994.jpg?hash=LmVz-3',
    'https://analysis.null.place/img/movie-thumb-thematinghabitsoftheearthboundhuman1999.jpg?hash=feI1my',
    'https://analysis.null.place/img/movie-thumb-thematrix11999.jpg?hash=pT6vFF',
    'https://analysis.null.place/img/movie-thumb-themazerunner2014.jpg?hash=n040c2',
    'https://analysis.null.place/img/movie-thumb-thepianist2002.jpg?hash=YjLFUh',
    'https://analysis.null.place/img/movie-thumb-transcendence2014.jpg?hash=aF2iIv',
    'https://analysis.null.place/img/movie-thumb-upgrade2018.jpg?hash=L15BXr',
    'https://analysis.null.place/img/movie-thumb-whatwedidonourholiday2014.jpg?hash=9RiAUQ',
    'https://analysis.null.place/json/movie-review-10000bc2008.json?hash=4ANHFg',
    'https://analysis.null.place/json/movie-review-aclockworkorange1971.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-adrift2018.json?hash=qRem2E',
    'https://analysis.null.place/json/movie-review-birdbox2018.json?hash=ViCgKm',
    'https://analysis.null.place/json/movie-review-bladerunner1982.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-darkcity1998.json?hash=XK-6MN',
    'https://analysis.null.place/json/movie-review-district92009.json?hash=TFRbYk',
    'https://analysis.null.place/json/movie-review-eternalsunshineofthespotlessmind2004.json?hash=oc2Pao',
    'https://analysis.null.place/json/movie-review-fightclub1999.json?hash=dmhcrB',
    'https://analysis.null.place/json/movie-review-freddygotfingered2001.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-greenbook2019.json?hash=385v2y',
    'https://analysis.null.place/json/movie-review-hellolovegoodbye2019.json?hash=FfU6sw',
    'https://analysis.null.place/json/movie-review-inglouriousbasterds2009.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-limitless2011.json?hash=jPLrQH',
    'https://analysis.null.place/json/movie-review-lockstockandtwosmokingbarrels1998.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-loro2018.json?hash=JxIsbO',
    'https://analysis.null.place/json/movie-review-minorityreport2002.json?hash=S3GRds',
    'https://analysis.null.place/json/movie-review-missionimpossible6fallout2018.json?hash=X_VOTj',
    'https://analysis.null.place/json/movie-review-mollysgame2017.json?hash=5CmqSw',
    'https://analysis.null.place/json/movie-review-montypythonandtheholygrail1975.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-rebelwithoutacause1955.json?hash=6VS6tx',
    'https://analysis.null.place/json/movie-review-requiemforadream2000.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-shoplifters2018.json?hash=ehpuIo',
    'https://analysis.null.place/json/movie-review-statusupdate2018.json?hash=086QgC',
    'https://analysis.null.place/json/movie-review-taken12008.json?hash=EK7Ggf',
    'https://analysis.null.place/json/movie-review-thebeach2000.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thebutterflyeffect2004.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thecurseoflallorona2019.json?hash=9Jw8se',
    'https://analysis.null.place/json/movie-review-thedressmaker2015.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thefounder2016.json?hash=jscM4w',
    'https://analysis.null.place/json/movie-review-themanfromnowhere2010.json?hash=9h-ZO4',
    'https://analysis.null.place/json/movie-review-themartian2015.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-themask1994.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thematinghabitsoftheearthboundhuman1999.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thematrix11999.json?hash=60g6wj',
    'https://analysis.null.place/json/movie-review-themazerunner2014.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-thepianist2002.json?hash=nNdEBS',
    'https://analysis.null.place/json/movie-review-transcendence2014.json?hash=poY45m',
    'https://analysis.null.place/json/movie-review-upgrade2018.json?hash=atWiE-',
    'https://analysis.null.place/json/movie-review-whatwedidonourholiday2014.json?hash=O08RIC',
    'https://analysis.null.place/json/movies-init-list.json?hash=7cqpjE',
    'https://analysis.null.place/json/movies-list.json?hash=RE-YZE',
    'https://analysis.null.place/json/movies-search-index.json?hash=wdtOzY',

    // assets for the "how do the bitcoin mining algorithms work?" article
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/index.html',
    'https://analysis.null.place/js/sjcl.min.js?hash=0JqGiP',
    'https://analysis.null.place/js/btc-mining.js?hash=Lu0w2L',
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
var mediaReviewPages = ['movie-reviews','book-reviews','tv-series-reviews'];
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
    var urlObj = new URL(event.request.url);
    var pathParts = urlObj.pathname.split('/');
    if (
        (pathParts.length > 2) &&
        (pathParts[2] != '') &&
        (mediaReviewPages.indexOf(pathParts[1]) != -1)
    ) {
        // a media review sub-page is being requested. redirect to the parent
        urlObj.pathname = '/' + pathParts[1] + '/';
        pathParts.shift(); // remove empty item
        pathParts.shift(); // remove parent
        if (pathParts[pathParts.length - 1] == '') pathParts.pop(); // remove empty item
        urlObj.hash = '#!' + pathParts.join('/');
        event.request.url = urlObj.toString();
    }
    event.respondWith(
        caches.match(event.request).then(function (swResponse) {
            return (swResponse || fetch(event.request));
        })
    );
});