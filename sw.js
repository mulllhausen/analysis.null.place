var latestCache = '2021-10-05_16:56:54';
var mandatoryAssets = [
    // common assets for all pages
    'https://analysis.null.place/theme/css/thematrix.css?hash=WvN0C7',
    'https://analysis.null.place/theme/img/icons.svg?hash=eT4uTo',
    'https://analysis.null.place/theme/img/shattered-glass-2b.png?hash=xZglIf',
    'https://analysis.null.place/theme/img/shattered-glass-black.png?hash=DsMJmV',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-192x192.png?hash=HbWgBI',
    'https://analysis.null.place/theme/img/shattered-glass-matrix-512x512.png?hash=9R0TcV',
    'https://analysis.null.place/theme/img/crack1.png?hash=jmQEKN',
    'https://analysis.null.place/theme/img/favicon.ico?hash=jRJksA',
    'https://analysis.null.place/theme/img/apple-touch-icon.png?hash=FAvW32',
    'https://analysis.null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJ',
    'https://analysis.null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrA',
    'https://analysis.null.place/theme/js/base.js?hash=dHe_yM',
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
    'https://analysis.null.place/js/media-reviews.js?hash=x_S7s7',
    'https://analysis.null.place/css/media-reviews.css?hash=U1la7K',
    'https://analysis.null.place/book-reviews/img/thumb-theodore-schick-and-lewis-vaughn-how-to-think-about-weird-things-2011.jpg?hash=TN51ee',
    'https://analysis.null.place/book-reviews/img/thumb-robert-harris-imperium-2006.jpg?hash=I6ji6V',
    'https://analysis.null.place/book-reviews/img/thumb-stanislaw-lem-solaris-1961.jpg?hash=55BY16',
    'https://analysis.null.place/book-reviews/img/thumb-barbara-k-lipska-the-neuroscientist-who-lost-her-mind-2018.jpg?hash=bffWZ6',
    'https://analysis.null.place/book-reviews/json/list-highest-rating-first-10.json?hash=QdTTUP',
    'https://analysis.null.place/book-reviews/json/data-theodore-schick-and-lewis-vaughn-how-to-think-about-weird-things-2011.json?hash=ST1Uaq',
    'https://analysis.null.place/book-reviews/json/data-robert-harris-imperium-2006.json?hash=O1htJJ',
    'https://analysis.null.place/book-reviews/json/data-stanislaw-lem-solaris-1961.json?hash=pNgy9e',
    'https://analysis.null.place/book-reviews/json/data-barbara-k-lipska-the-neuroscientist-who-lost-her-mind-2018.json?hash=mADbyI',

    // assets for the "tv-series reviews" article
    'https://analysis.null.place/tv-series-reviews/',
    'https://analysis.null.place/tv-series-reviews/index.html',
    'https://analysis.null.place/tv-series-reviews/img/thumb-black-mirror-s01-2011.jpg?hash=j2ytQd',
    'https://analysis.null.place/tv-series-reviews/img/thumb-philip-k-dicks-electric-dreams-s01-2017.jpg?hash=JnDmc6',
    'https://analysis.null.place/tv-series-reviews/img/thumb-rick-and-morty-s01-2013.jpg?hash=o7FIrK',
    'https://analysis.null.place/tv-series-reviews/img/thumb-the-end-of-the-fing-world-s01-2017.jpg?hash=ZEFnTO',
    'https://analysis.null.place/tv-series-reviews/img/thumb-the-walking-dead-s01-2010.jpg?hash=74ijUe',
    'https://analysis.null.place/tv-series-reviews/img/thumb-maniac-s01-2018.jpg?hash=1_cJ-U',
    'https://analysis.null.place/tv-series-reviews/img/thumb-black-mirror-s05-2019.jpg?hash=RjWrPH',
    'https://analysis.null.place/tv-series-reviews/img/thumb-dead-pixels-s01-2019.jpg?hash=OSc0E5',
    'https://analysis.null.place/tv-series-reviews/img/thumb-bbc-war-of-the-worlds-s01-2019.jpg?hash=p58cAg',
    'https://analysis.null.place/tv-series-reviews/img/thumb-nightflyers-s01-2018.jpg?hash=A_kJz9',
    'https://analysis.null.place/tv-series-reviews/json/list-highest-rating-first-10.json?hash=_6GXis',
    'https://analysis.null.place/tv-series-reviews/json/data-black-mirror-s01-2011.json?hash=GxvbqZ',
    'https://analysis.null.place/tv-series-reviews/json/data-philip-k-dicks-electric-dreams-s01-2017.json?hash=GJUuoK',
    'https://analysis.null.place/tv-series-reviews/json/data-rick-and-morty-s01-2013.json?hash=cjzGjw',
    'https://analysis.null.place/tv-series-reviews/json/data-the-end-of-the-fing-world-s01-2017.json?hash=iEK1hD',
    'https://analysis.null.place/tv-series-reviews/json/data-the-walking-dead-s01-2010.json?hash=wUE1hU',
    'https://analysis.null.place/tv-series-reviews/json/data-maniac-s01-2018.json?hash=CdJlBr',
    'https://analysis.null.place/tv-series-reviews/json/data-black-mirror-s05-2019.json?hash=gE2M3i',
    'https://analysis.null.place/tv-series-reviews/json/data-dead-pixels-s01-2019.json?hash=5xLbUX',
    'https://analysis.null.place/tv-series-reviews/json/data-bbc-war-of-the-worlds-s01-2019.json?hash=-cdcb-',
    'https://analysis.null.place/tv-series-reviews/json/data-nightflyers-s01-2018.json?hash=hWyg2g',

    // assets for the "movie reviews" article
    'https://analysis.null.place/movie-reviews/',
    'https://analysis.null.place/movie-reviews/index.html',
    'https://analysis.null.place/movie-reviews/img/thumb-bird-box-2018.jpg?hash=dhDclx',
    'https://analysis.null.place/movie-reviews/img/thumb-crocoile-dundee-1-1986.jpg?hash=tAVDf0',
    'https://analysis.null.place/movie-reviews/img/thumb-dark-city-1998.jpg?hash=KwU5zR',
    'https://analysis.null.place/movie-reviews/img/thumb-district-9-2009.jpg?hash=j3UZi4',
    'https://analysis.null.place/movie-reviews/img/thumb-eternal-sunshine-of-the-spotless-mind-2004.jpg?hash=JHOOvN',
    'https://analysis.null.place/movie-reviews/img/thumb-fight-club-1999.jpg?hash=7ipBk9',
    'https://analysis.null.place/movie-reviews/img/thumb-gemini-man-2019.jpg?hash=Oqwdg6',
    'https://analysis.null.place/movie-reviews/img/thumb-inception-2010.jpg?hash=B0_kdy',
    'https://analysis.null.place/movie-reviews/img/thumb-limitless-2011.jpg?hash=y9QKXN',
    'https://analysis.null.place/movie-reviews/img/thumb-lock-stock-and-two-smoking-barrels-1998.jpg?hash=YnLVat',
    'https://analysis.null.place/movie-reviews/json/list-highest-rating-first-10.json?hash=WdrWwD',
    'https://analysis.null.place/movie-reviews/json/data-bird-box-2018.json?hash=edcYnp',
    'https://analysis.null.place/movie-reviews/json/data-crocoile-dundee-1-1986.json?hash=8PUgAO',
    'https://analysis.null.place/movie-reviews/json/data-dark-city-1998.json?hash=r1Me1h',
    'https://analysis.null.place/movie-reviews/json/data-district-9-2009.json?hash=_FSxQl',
    'https://analysis.null.place/movie-reviews/json/data-eternal-sunshine-of-the-spotless-mind-2004.json?hash=5dbRR9',
    'https://analysis.null.place/movie-reviews/json/data-fight-club-1999.json?hash=Apv1mG',
    'https://analysis.null.place/movie-reviews/json/data-gemini-man-2019.json?hash=XvnC7t',
    'https://analysis.null.place/movie-reviews/json/data-inception-2010.json?hash=i5eiTe',
    'https://analysis.null.place/movie-reviews/json/data-limitless-2011.json?hash=KOsauH',
    'https://analysis.null.place/movie-reviews/json/data-lock-stock-and-two-smoking-barrels-1998.json?hash=drER11',

    // assets for the "how do the bitcoin mining algorithms work?" article
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/index.html',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/js/sjcl.min.js?hash=0JqGiP',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/js/btc-mining.js?hash=dc9ccS',
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
    event.respondWith(
        caches.match(request).then(function (swResponse) {
            if (swResponse) return swResponse;
            var urlObj = new URL(request.url);
            console.log('sw fetching, because not cached: ' + urlObj.toString());
            return fetch(request);
        })
    );
});