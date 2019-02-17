var latestCache = '2019-02-18_08:55:08';
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(latestCache).then(function (cache) {
            return cache.addAll([
                // common assets for all pages
                'https://analysis.null.place/theme/css/thematrix.css?hash=0miiAX',
                'https://analysis.null.place/theme/img/icons.svg?hash=z5B6Me',
                'https://analysis.null.place/theme/img/shattered-glass-2b.png?hash=xZglIf',
                'https://analysis.null.place/theme/img/shattered-glass-black.png?hash=DsMJmV',
                'https://analysis.null.place/theme/img/shattered-glass-matrix-192x192.png?hash=HbWgBI',
                'https://analysis.null.place/theme/img/shattered-glass-matrix-512x512.png?hash=9R0TcV',
                'https://analysis.null.place/theme/img/favicon.ico?hash=jRJksA',
                'https://analysis.null.place/theme/img/apple-touch-icon.png?hash=FAvW32',
                'https://analysis.null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJ',
                'https://analysis.null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrA',
                'https://analysis.null.place/theme/js/base.js?hash=60H47e',
                'https://analysis.null.place/theme/js/console-greeter.js?hash=j6dUQ7',
                'https://analysis.null.place/theme/js/manifest.json',

                // common assets for all article pages
                'https://analysis.null.place/theme/js/comments-section.js?hash=wki7Qg',

                // home page
                'https://analysis.null.place/',
                'https://analysis.null.place/index.html',

                // archives page
                'https://analysis.null.place/archives/',
                'https://analysis.null.place/archives/index.html',

                // tags pages
                'https://analysis.null.place/tags/',
                'https://analysis.null.place/tags/index.html',
                'https://analysis.null.place/tag/reviews/',
                'https://analysis.null.place/tag/reviews/index.html',
                'https://analysis.null.place/tag/movie/',
                'https://analysis.null.place/tag/movie/index.html',
                'https://analysis.null.place/tag/mining/',
                'https://analysis.null.place/tag/mining/index.html',
                'https://analysis.null.place/tag/bitcoin/',
                'https://analysis.null.place/tag/bitcoin/index.html',
                'https://analysis.null.place/tag/proof-of-work/',
                'https://analysis.null.place/tag/proof-of-work/index.html',

                // categories
                'https://analysis.null.place/cryptocurrencies/',
                'https://analysis.null.place/cryptocurrencies/index.html',
                'https://analysis.null.place/reviews/',
                'https://analysis.null.place/reviews/index.html',

                // each article and its assets
                'https://analysis.null.place/movie-reviews/',
                'https://analysis.null.place/movie-reviews/index.html',
                'https://analysis.null.place/js/movie-reviews.js?hash=ZrahOg',
                'https://analysis.null.place/css/movie-reviews.css?hash=G-3hnG',
                'https://analysis.null.place/img/movie-thumbnail-district92009.jpg?hash=T9jPbU',
                'https://analysis.null.place/img/movie-thumbnail-minorityreport2002.jpg?hash=C5jov_',
                'https://analysis.null.place/img/movie-thumbnail-darkcity1998.jpg?hash=vxRlsK',
                'https://analysis.null.place/img/movie-thumbnail-thematrix1999.jpg?hash=hXJbau',
                'https://analysis.null.place/img/movie-thumbnail-fightclub1999.jpg?hash=rSuY7Z',
                'https://analysis.null.place/img/movie-thumbnail-eternalsunshineofthespotlessmind2004.jpg?hash=r_Rio6',
                'https://analysis.null.place/img/movie-thumbnail-rebelwithoutacause1955.jpg?hash=HWtCTe',
                'https://analysis.null.place/img/movie-thumbnail-themartian2015.jpg?hash=iOPLtv',
                'https://analysis.null.place/img/movie-thumbnail-thedressmaker2015.jpg?hash=Hvx5F7',
                'https://analysis.null.place/img/movie-thumbnail-requiemforadream2000.jpg?hash=e1Hz8n',
                'https://analysis.null.place/img/movie-thumbnail-themask1994.jpg?hash=RmXuFv',
                'https://analysis.null.place/img/movie-thumbnail-thebeach2000.jpg?hash=JVa7e0',
                'https://analysis.null.place/img/movie-thumbnail-thematinghabitsoftheearthboundhuman1999.jpg?hash=vhYiPh',
                'https://analysis.null.place/img/movie-thumbnail-themazerunner2014.jpg?hash=B0QEDa',
                'https://analysis.null.place/img/movie-thumbnail-thebutterflyeffect2004.jpg?hash=jK4V-g',
                'https://analysis.null.place/img/movie-thumbnail-transcendence2014.jpg?hash=x86vDW',
                'https://analysis.null.place/img/movie-thumbnail-aclockworkorange1971.jpg?hash=qJpciK',
                'https://analysis.null.place/img/movie-thumbnail-montypythonandtheholygrail1975.jpg?hash=KaH_EM',
                'https://analysis.null.place/img/movie-thumbnail-bladerunner1982.jpg?hash=mOp4YY',
                'https://analysis.null.place/img/movie-thumbnail-freddygotfingered2001.jpg?hash=3Duj2x',
                'https://analysis.null.place/img/movie-thumbnail-lockstockandtwosmokingbarrels1998.jpg?hash=qULdq8',
                'https://analysis.null.place/img/movie-thumbnail-inglouriousbasterds2009.jpg?hash=UgqI7P',
                'https://analysis.null.place/img/movie-thumbnail-upgrade2018.jpg?hash=HoZlKD',
                'https://analysis.null.place/json/movies-init-list.json?hash=0rDhKW',
                'https://analysis.null.place/json/movies-list.json?hash=q8v1PL',
                'https://analysis.null.place/json/movies-search-index.json?hash=PnxZ1w',
                'https://analysis.null.place/json/movie-review-district92009.json?hash=nHVYBt',
                'https://analysis.null.place/json/movie-review-minorityreport2002.json?hash=S3GRds',
                'https://analysis.null.place/json/movie-review-darkcity1998.json?hash=poY45m',
                'https://analysis.null.place/json/movie-review-thematrix1999.json?hash=poY45m',
                'https://analysis.null.place/json/movie-review-fightclub1999.json?hash=poY45m',
                'https://analysis.null.place/json/movie-review-eternalsunshineofthespotlessmind2004.json?hash=poY45m',
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
            ]);
        })
    );
});

self.addEventListener('activate', function (event) {
    // delete all caches except latestCache
    caches.keys().then(function (names) {
        for (let name of names) {
            if (name == latestCache) continue;
            caches.delete(name);
        }
    });
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return (response || fetch(event.request));
        })
    );
});