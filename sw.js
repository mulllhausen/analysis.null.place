var latestCache = '2021-06-28_01:45:49';
var mandatoryAssets = [
    // common assets for all pages
    'https://analysis.null.place/theme/css/thematrix.css?hash=EzGJ5H',
    'https://analysis.null.place/theme/img/icons.svg?hash=Xttiu9',
    'https://analysis.null.place/theme/img/shattered-glass-2b.png?hash=xZglIf',
    'https://analysis.null.place/theme/img/shattered-glass-black.png?hash=DsMJmV',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-192x192.png?hash=HbWgBI',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-512x512.png?hash=9R0TcV',
    'https://analysis.null.place/theme/img/crack1.png?hash=jmQEKN',
    'https://analysis.null.place/theme/img/favicon.ico?hash=jRJksA',
    'https://analysis.null.place/theme/img/apple-touch-icon.png?hash=FAvW32',
    'https://analysis.null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJ',
    'https://analysis.null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrA',
    'https://analysis.null.place/theme/js/base.js?hash=lBYwu5',
    'https://analysis.null.place/theme/js/console-greeter.js?hash=j6dUQ7',
    'https://analysis.null.place/theme/js/manifest.json',

    // common assets for all article pages
    'https://analysis.null.place/theme/js/comments-section.js?hash=H74GHt',

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
    'https://analysis.null.place/js/media-reviews.js?hash=U4Ipfe',
    'https://analysis.null.place/css/media-reviews.css?hash=7_CO89',
    'https://analysis.null.place/book-reviews/img/thumb-barbaraklipskatheneuroscientistwholosthermind2018.jpg?hash=bffWZ6',
    'https://analysis.null.place/book-reviews/img/thumb-robertharrisimperium2006.jpg?hash=I6ji6V',
    'https://analysis.null.place/book-reviews/img/thumb-stanislawlemsolaris1961.jpg?hash=55BY16',
    'https://analysis.null.place/book-reviews/img/thumb-theodoreschickandlewisvaughnhowtothinkaboutweirdthings2011.jpg?hash=TN51ee',
    'https://analysis.null.place/book-reviews/json/init-list.json?hash=CXtjQH',
    'https://analysis.null.place/book-reviews/json/list.json?hash=bj9D-3',
    'https://analysis.null.place/book-reviews/json/review-barbaraklipskatheneuroscientistwholosthermind2018.json?hash=kk6_x-',
    'https://analysis.null.place/book-reviews/json/review-robertharrisimperium2006.json?hash=SKdAqQ',
    'https://analysis.null.place/book-reviews/json/review-stanislawlemsolaris1961.json?hash=R-Q9pX',
    'https://analysis.null.place/book-reviews/json/review-theodoreschickandlewisvaughnhowtothinkaboutweirdthings2011.json?hash=S1ZGdc',
    'https://analysis.null.place/book-reviews/json/search-index.json?hash=PEQ6Y3',

    // assets for the "tv-series reviews" article
    'https://analysis.null.place/tv-series-reviews/',
    'https://analysis.null.place/tv-series-reviews/index.html',
    'https://analysis.null.place/tv-series-reviews/img/thumb-bbcwaroftheworlds12019.jpg?hash=p58cAg',
    'https://analysis.null.place/tv-series-reviews/img/thumb-blackmirror12011.jpg?hash=EDPW69',
    'https://analysis.null.place/tv-series-reviews/img/thumb-blackmirror52019.jpg?hash=Jsu8GJ',
    'https://analysis.null.place/tv-series-reviews/img/thumb-deadpixels12019.jpg?hash=hlvMUx',
    'https://analysis.null.place/tv-series-reviews/img/thumb-maniac12018.jpg?hash=0nxg5W',
    'https://analysis.null.place/tv-series-reviews/img/thumb-nightflyers12018.jpg?hash=mSCzFO',
    'https://analysis.null.place/tv-series-reviews/img/thumb-philipkdickselectricdreams12017.jpg?hash=JnDmc6',
    'https://analysis.null.place/tv-series-reviews/img/thumb-rickandmorty12013.jpg?hash=o7FIrK',
    'https://analysis.null.place/tv-series-reviews/img/thumb-theendofthefingworld12017.jpg?hash=ZEFnTO',
    'https://analysis.null.place/tv-series-reviews/img/thumb-theendofthefingworld22019.jpg?hash=rsq51R',
    'https://analysis.null.place/tv-series-reviews/img/thumb-thewalkingdead12010.jpg?hash=KBZUww',
    'https://analysis.null.place/tv-series-reviews/json/init-list.json?hash=3ccS5C',
    'https://analysis.null.place/tv-series-reviews/json/list.json?hash=IJNPnh',
    'https://analysis.null.place/tv-series-reviews/json/review-bbcwaroftheworlds12019.json?hash=kg5Gd4',
    'https://analysis.null.place/tv-series-reviews/json/review-blackmirror12011.json?hash=poY45m',
    'https://analysis.null.place/tv-series-reviews/json/review-blackmirror52019.json?hash=RNRZhV',
    'https://analysis.null.place/tv-series-reviews/json/review-deadpixels12019.json?hash=l-lzV-',
    'https://analysis.null.place/tv-series-reviews/json/review-maniac12018.json?hash=SjiWtk',
    'https://analysis.null.place/tv-series-reviews/json/review-nightflyers12018.json?hash=iSpT3g',
    'https://analysis.null.place/tv-series-reviews/json/review-philipkdickselectricdreams12017.json?hash=v0Dl8m',
    'https://analysis.null.place/tv-series-reviews/json/review-rickandmorty12013.json?hash=nn1WAw',
    'https://analysis.null.place/tv-series-reviews/json/review-theendofthefingworld12017.json?hash=EWNbB7',
    'https://analysis.null.place/tv-series-reviews/json/review-theendofthefingworld22019.json?hash=7iOJh3',
    'https://analysis.null.place/tv-series-reviews/json/review-thewalkingdead12010.json?hash=poY45m',
    'https://analysis.null.place/tv-series-reviews/json/search-index.json?hash=RsSj7M',

    // assets for the "movie reviews" article
    'https://analysis.null.place/movie-reviews/',
    'https://analysis.null.place/movie-reviews/index.html',
    'https://analysis.null.place/movie-reviews/img/thumb-10000bc2008.jpg?hash=gB-GJa',
    'https://analysis.null.place/movie-reviews/img/thumb-aclockworkorange1971.jpg?hash=9W-iCc',
    'https://analysis.null.place/movie-reviews/img/thumb-adrift2018.jpg?hash=2U0oV3',
    'https://analysis.null.place/movie-reviews/img/thumb-annabellecomeshome2019.jpg?hash=O4dANe',
    'https://analysis.null.place/movie-reviews/img/thumb-birdbox2018.jpg?hash=dhDclx',
    'https://analysis.null.place/movie-reviews/img/thumb-bladerunner1982.jpg?hash=EFay0z',
    'https://analysis.null.place/movie-reviews/img/thumb-crocoiledundee11986.jpg?hash=tAVDf0',
    'https://analysis.null.place/movie-reviews/img/thumb-darkcity1998.jpg?hash=KwU5zR',
    'https://analysis.null.place/movie-reviews/img/thumb-district92009.jpg?hash=j3UZi4',
    'https://analysis.null.place/movie-reviews/img/thumb-eternalsunshineofthespotlessmind2004.jpg?hash=JHOOvN',
    'https://analysis.null.place/movie-reviews/img/thumb-fightclub1999.jpg?hash=7ipBk9',
    'https://analysis.null.place/movie-reviews/img/thumb-freddygotfingered2001.jpg?hash=fdMrI6',
    'https://analysis.null.place/movie-reviews/img/thumb-geminiman2019.jpg?hash=Oqwdg6',
    'https://analysis.null.place/movie-reviews/img/thumb-gifted2017.jpg?hash=Y8MRSd',
    'https://analysis.null.place/movie-reviews/img/thumb-greenbook2019.jpg?hash=F_qF0N',
    'https://analysis.null.place/movie-reviews/img/thumb-hellolovegoodbye2019.jpg?hash=04Vy6e',
    'https://analysis.null.place/movie-reviews/img/thumb-inception2010.jpg?hash=B0_kdy',
    'https://analysis.null.place/movie-reviews/img/thumb-inglouriousbasterds2009.jpg?hash=GD6oJ_',
    'https://analysis.null.place/movie-reviews/img/thumb-limitless2011.jpg?hash=y9QKXN',
    'https://analysis.null.place/movie-reviews/img/thumb-lockstockandtwosmokingbarrels1998.jpg?hash=YnLVat',
    'https://analysis.null.place/movie-reviews/img/thumb-loro2018.jpg?hash=M_eDeh',
    'https://analysis.null.place/movie-reviews/img/thumb-minorityreport2002.jpg?hash=Rzm_No',
    'https://analysis.null.place/movie-reviews/img/thumb-missionimpossible6fallout2018.jpg?hash=H_ziRM',
    'https://analysis.null.place/movie-reviews/img/thumb-mollysgame2017.jpg?hash=nGoWJ_',
    'https://analysis.null.place/movie-reviews/img/thumb-montypythonandtheholygrail1975.jpg?hash=dLolO-',
    'https://analysis.null.place/movie-reviews/img/thumb-rebelwithoutacause1955.jpg?hash=ICFTC8',
    'https://analysis.null.place/movie-reviews/img/thumb-requiemforadream2000.jpg?hash=hU1ML4',
    'https://analysis.null.place/movie-reviews/img/thumb-riskybusiness1983.jpg?hash=hpF7xL',
    'https://analysis.null.place/movie-reviews/img/thumb-shoplifters2018.jpg?hash=wjnsRr',
    'https://analysis.null.place/movie-reviews/img/thumb-statusupdate2018.jpg?hash=V6s2MM',
    'https://analysis.null.place/movie-reviews/img/thumb-taken12008.jpg?hash=Fh7wJO',
    'https://analysis.null.place/movie-reviews/img/thumb-thebeach2000.jpg?hash=m8zRDU',
    'https://analysis.null.place/movie-reviews/img/thumb-thebutterflyeffect2004.jpg?hash=CEBmsB',
    'https://analysis.null.place/movie-reviews/img/thumb-thecurseoflallorona2019.jpg?hash=tkdu55',
    'https://analysis.null.place/movie-reviews/img/thumb-thedressmaker2015.jpg?hash=s6WMee',
    'https://analysis.null.place/movie-reviews/img/thumb-thefounder2016.jpg?hash=2Lyji3',
    'https://analysis.null.place/movie-reviews/img/thumb-themanfromnowhere2010.jpg?hash=eV54nB',
    'https://analysis.null.place/movie-reviews/img/thumb-themartian2015.jpg?hash=hZtYnF',
    'https://analysis.null.place/movie-reviews/img/thumb-themask1994.jpg?hash=LmVz-3',
    'https://analysis.null.place/movie-reviews/img/thumb-thematinghabitsoftheearthboundhuman1999.jpg?hash=feI1my',
    'https://analysis.null.place/movie-reviews/img/thumb-thematrix11999.jpg?hash=pT6vFF',
    'https://analysis.null.place/movie-reviews/img/thumb-themazerunner2014.jpg?hash=n040c2',
    'https://analysis.null.place/movie-reviews/img/thumb-thepianist2002.jpg?hash=YjLFUh',
    'https://analysis.null.place/movie-reviews/img/thumb-transcendence2014.jpg?hash=aF2iIv',
    'https://analysis.null.place/movie-reviews/img/thumb-upgrade2018.jpg?hash=L15BXr',
    'https://analysis.null.place/movie-reviews/img/thumb-whatwedidonourholiday2014.jpg?hash=9RiAUQ',
    'https://analysis.null.place/movie-reviews/json/init-list.json?hash=g2cITA',
    'https://analysis.null.place/movie-reviews/json/list.json?hash=EFCRI-',
    'https://analysis.null.place/movie-reviews/json/review-10000bc2008.json?hash=4ANHFg',
    'https://analysis.null.place/movie-reviews/json/review-aclockworkorange1971.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-adrift2018.json?hash=qRem2E',
    'https://analysis.null.place/movie-reviews/json/review-annabellecomeshome2019.json?hash=DALP_r',
    'https://analysis.null.place/movie-reviews/json/review-birdbox2018.json?hash=Pe2gZp',
    'https://analysis.null.place/movie-reviews/json/review-bladerunner1982.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-crocoiledundee11986.json?hash=kIWa71',
    'https://analysis.null.place/movie-reviews/json/review-darkcity1998.json?hash=XK-6MN',
    'https://analysis.null.place/movie-reviews/json/review-district92009.json?hash=TFRbYk',
    'https://analysis.null.place/movie-reviews/json/review-eternalsunshineofthespotlessmind2004.json?hash=oc2Pao',
    'https://analysis.null.place/movie-reviews/json/review-fightclub1999.json?hash=R_kZ01',
    'https://analysis.null.place/movie-reviews/json/review-freddygotfingered2001.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-geminiman2019.json?hash=L9LGAx',
    'https://analysis.null.place/movie-reviews/json/review-gifted2017.json?hash=yoNQLJ',
    'https://analysis.null.place/movie-reviews/json/review-greenbook2019.json?hash=385v2y',
    'https://analysis.null.place/movie-reviews/json/review-hellolovegoodbye2019.json?hash=FfU6sw',
    'https://analysis.null.place/movie-reviews/json/review-inception2010.json?hash=F1J-2C',
    'https://analysis.null.place/movie-reviews/json/review-inglouriousbasterds2009.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-limitless2011.json?hash=jPLrQH',
    'https://analysis.null.place/movie-reviews/json/review-lockstockandtwosmokingbarrels1998.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-loro2018.json?hash=JxIsbO',
    'https://analysis.null.place/movie-reviews/json/review-minorityreport2002.json?hash=S3GRds',
    'https://analysis.null.place/movie-reviews/json/review-missionimpossible6fallout2018.json?hash=X_VOTj',
    'https://analysis.null.place/movie-reviews/json/review-mollysgame2017.json?hash=5CmqSw',
    'https://analysis.null.place/movie-reviews/json/review-montypythonandtheholygrail1975.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-rebelwithoutacause1955.json?hash=rrh9tF',
    'https://analysis.null.place/movie-reviews/json/review-requiemforadream2000.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-riskybusiness1983.json?hash=ovVd1N',
    'https://analysis.null.place/movie-reviews/json/review-shoplifters2018.json?hash=ehpuIo',
    'https://analysis.null.place/movie-reviews/json/review-statusupdate2018.json?hash=086QgC',
    'https://analysis.null.place/movie-reviews/json/review-taken12008.json?hash=EK7Ggf',
    'https://analysis.null.place/movie-reviews/json/review-thebeach2000.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-thebutterflyeffect2004.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-thecurseoflallorona2019.json?hash=9Jw8se',
    'https://analysis.null.place/movie-reviews/json/review-thedressmaker2015.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-thefounder2016.json?hash=jscM4w',
    'https://analysis.null.place/movie-reviews/json/review-themanfromnowhere2010.json?hash=9h-ZO4',
    'https://analysis.null.place/movie-reviews/json/review-themartian2015.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-themask1994.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-thematinghabitsoftheearthboundhuman1999.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-thematrix11999.json?hash=60g6wj',
    'https://analysis.null.place/movie-reviews/json/review-themazerunner2014.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-thepianist2002.json?hash=nNdEBS',
    'https://analysis.null.place/movie-reviews/json/review-transcendence2014.json?hash=poY45m',
    'https://analysis.null.place/movie-reviews/json/review-upgrade2018.json?hash=atWiE-',
    'https://analysis.null.place/movie-reviews/json/review-whatwedidonourholiday2014.json?hash=O08RIC',
    'https://analysis.null.place/movie-reviews/json/search-index.json?hash=mS6-AB',

    // assets for the "how do the bitcoin mining algorithms work?" article
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/index.html',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/js/sjcl.min.js?hash=0JqGiP',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/js/btc-mining.js?hash=XeAwHw',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/css/btc.css?hash=93IOhm',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/img/hashing-flowchart.svg?hash=NX7qzY',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/img/bitcoin-blockchain.svg?hash=70Cxdl',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/json/btc-txs-per-block-0-999.json?hash=i24DRR',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/json/hex-trial-attempts.json?hash=sjiIF4',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/json/unittest-bits.json?hash=m8SQwF',

    // media reviews images
    'https://analysis.null.place/img/imdb-logo-button.png?hash=wXTebQ',
    'https://analysis.null.place/img/goodreads-logo-button.png?hash=C30vpz',

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
    var request = event.request; // init
    var urlObj = new URL(request.url);
    var pathParts = urlObj.pathname.split('/');
    if (
        (pathParts.length > 2)
        && (pathParts[2] != '')
        && (pathParts[2] != 'redirect.html')
        && (mediaReviewPages.indexOf(pathParts[1]) != -1)
    ) {
        // a media review sub-page is being requested. redirect to the parent
        urlObj.pathname = '/' + pathParts[1] + '/';
        pathParts.shift(); // remove empty item
        pathParts.shift(); // remove parent
        if (pathParts[pathParts.length - 1] == '') pathParts.pop(); // remove empty item
        urlObj.hash = '#!' + pathParts.join('/');
        request = new Request(urlObj.toString());
    }
    event.respondWith(
        caches.match(request).then(function (swResponse) {
            if (swResponse) return swResponse;
            console.log('sw fetching, because not cached: ' + urlObj.toString());
            return fetch(request);
        })
    );
});