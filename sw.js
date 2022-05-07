var latestCache = '2022-05-07_13:19:31';
var mandatoryAssets = [
    // common assets for all pages
    'https://analysis.null.place/theme/css/thematrix.css?hash=qqRYuX',
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
    'https://analysis.null.place/theme/js/base.js?hash=klUmu1',
    'https://analysis.null.place/theme/js/console-greeter.js?hash=j6dUQ7',
    'https://analysis.null.place/theme/js/manifest.json',

    // common assets for all article pages
    'https://analysis.null.place/theme/js/comments-section.js?hash=bEAA0S',

    // home page
    'https://analysis.null.place/',
    'https://analysis.null.place/index.html',

    // archives page
    'https://analysis.null.place/archives/',
    'https://analysis.null.place/archives/index.html',


    // assets for the "book reviews" article
    'https://analysis.null.place/book-reviews/',
    'https://analysis.null.place/book-reviews/index.html',
    'https://analysis.null.place/js/media-reviews.js?hash=6QKVck',
    'https://analysis.null.place/css/media-reviews.css?hash=YvYLd9',
    'https://analysis.null.place/book-reviews/img/thumb-bill-bryson-a-short-history-of-nearly-everything-2003.jpg?hash=oqVKkX',
    'https://analysis.null.place/book-reviews/img/thumb-jon-ronson-adventures-with-extremists-2001.jpg?hash=PCqmla',
    'https://analysis.null.place/book-reviews/img/thumb-robert-harris-an-officer-and-a-spy-2013.jpg?hash=d6ercN',
    'https://analysis.null.place/book-reviews/img/thumb-ayn-rand-atlas-shrugged-1957.jpg?hash=gEQcZY',
    'https://analysis.null.place/book-reviews/img/thumb-roald-dahl-boy-tales-of-childhood-1984.jpg?hash=Uy9bZJ',
    'https://analysis.null.place/book-reviews/img/thumb-aldous-huxley-brave-new-world-1958.jpg?hash=6VXpxW',
    'https://analysis.null.place/book-reviews/img/thumb-arthur-clarke-childhoods-end-1953.jpg?hash=ACktcb',
    'https://analysis.null.place/book-reviews/img/thumb-robert-harris-conclave-2016.jpg?hash=TFni0G',
    'https://analysis.null.place/book-reviews/img/thumb-philip-dick-do-androids-dream-of-electric-sheep-1968.jpg?hash=CQZISA',
    'https://analysis.null.place/book-reviews/img/thumb-frank-herbert-dune-1965.jpg?hash=o_imJJ',
    'https://analysis.null.place/book-reviews/json/list-highest-rating-first-10.json?hash=XZPmJs',
    'https://analysis.null.place/book-reviews/json/data-bill-bryson-a-short-history-of-nearly-everything-2003.json?hash=ZsyYGe',
    'https://analysis.null.place/book-reviews/json/data-jon-ronson-adventures-with-extremists-2001.json?hash=UCbAU9',
    'https://analysis.null.place/book-reviews/json/data-robert-harris-an-officer-and-a-spy-2013.json?hash=I3t4-O',
    'https://analysis.null.place/book-reviews/json/data-ayn-rand-atlas-shrugged-1957.json?hash=mZnPZK',
    'https://analysis.null.place/book-reviews/json/data-roald-dahl-boy-tales-of-childhood-1984.json?hash=9NdFtO',
    'https://analysis.null.place/book-reviews/json/data-aldous-huxley-brave-new-world-1958.json?hash=EY0V18',
    'https://analysis.null.place/book-reviews/json/data-arthur-clarke-childhoods-end-1953.json?hash=A2CfKs',
    'https://analysis.null.place/book-reviews/json/data-robert-harris-conclave-2016.json?hash=Zun-r2',
    'https://analysis.null.place/book-reviews/json/data-philip-dick-do-androids-dream-of-electric-sheep-1968.json?hash=SmmzkM',
    'https://analysis.null.place/book-reviews/json/data-frank-herbert-dune-1965.json?hash=ml_84r',

    // assets for the "tv-series reviews" article
    'https://analysis.null.place/tv-series-reviews/',
    'https://analysis.null.place/tv-series-reviews/index.html',
    'https://analysis.null.place/tv-series-reviews/img/thumb-black-mirror-s01-2011.jpg?hash=qhDgZn',
    'https://analysis.null.place/tv-series-reviews/img/thumb-philip-k-dicks-electric-dreams-s01-2017.jpg?hash=bTQ2nG',
    'https://analysis.null.place/tv-series-reviews/img/thumb-rick-and-morty-s01-2013.jpg?hash=4jBd00',
    'https://analysis.null.place/tv-series-reviews/img/thumb-the-end-of-the-fing-world-s01-2017.jpg?hash=xlZsag',
    'https://analysis.null.place/tv-series-reviews/img/thumb-the-walking-dead-s01-2010.jpg?hash=wUHIwk',
    'https://analysis.null.place/tv-series-reviews/img/thumb-maniac-s01-2018.jpg?hash=ikYtYy',
    'https://analysis.null.place/tv-series-reviews/img/thumb-black-mirror-s05-2019.jpg?hash=1jjH9T',
    'https://analysis.null.place/tv-series-reviews/img/thumb-dead-pixels-s01-2019.jpg?hash=4UMzmp',
    'https://analysis.null.place/tv-series-reviews/img/thumb-bbc-war-of-the-worlds-s01-2019.jpg?hash=yRyGkb',
    'https://analysis.null.place/tv-series-reviews/img/thumb-nightflyers-s01-2018.jpg?hash=UdhUUC',
    'https://analysis.null.place/tv-series-reviews/json/list-highest-rating-first-10.json?hash=JN2oMS',
    'https://analysis.null.place/tv-series-reviews/json/data-black-mirror-s01-2011.json?hash=AdKvuc',
    'https://analysis.null.place/tv-series-reviews/json/data-philip-k-dicks-electric-dreams-s01-2017.json?hash=PwEpQV',
    'https://analysis.null.place/tv-series-reviews/json/data-rick-and-morty-s01-2013.json?hash=8eYDuc',
    'https://analysis.null.place/tv-series-reviews/json/data-the-end-of-the-fing-world-s01-2017.json?hash=1dhx71',
    'https://analysis.null.place/tv-series-reviews/json/data-the-walking-dead-s01-2010.json?hash=2yDHUN',
    'https://analysis.null.place/tv-series-reviews/json/data-maniac-s01-2018.json?hash=puYDJS',
    'https://analysis.null.place/tv-series-reviews/json/data-black-mirror-s05-2019.json?hash=1fzas6',
    'https://analysis.null.place/tv-series-reviews/json/data-dead-pixels-s01-2019.json?hash=js9lsH',
    'https://analysis.null.place/tv-series-reviews/json/data-bbc-war-of-the-worlds-s01-2019.json?hash=u0WF1J',
    'https://analysis.null.place/tv-series-reviews/json/data-nightflyers-s01-2018.json?hash=jJgW9W',

    // assets for the "movie reviews" article
    'https://analysis.null.place/movie-reviews/',
    'https://analysis.null.place/movie-reviews/index.html',
    'https://analysis.null.place/movie-reviews/img/thumb-bird-box-2018.jpg?hash=xKadO3',
    'https://analysis.null.place/movie-reviews/img/thumb-crocoile-dundee-1-1986.jpg?hash=l6D5xp',
    'https://analysis.null.place/movie-reviews/img/thumb-dark-city-1998.jpg?hash=8ubwjJ',
    'https://analysis.null.place/movie-reviews/img/thumb-district-9-2009.jpg?hash=2GzeSA',
    'https://analysis.null.place/movie-reviews/img/thumb-eternal-sunshine-of-the-spotless-mind-2004.jpg?hash=ufFQ5J',
    'https://analysis.null.place/movie-reviews/img/thumb-fight-club-1999.jpg?hash=si8Pxm',
    'https://analysis.null.place/movie-reviews/img/thumb-gemini-man-2019.jpg?hash=iiZdm0',
    'https://analysis.null.place/movie-reviews/img/thumb-inception-2010.jpg?hash=HTZ7_S',
    'https://analysis.null.place/movie-reviews/img/thumb-limitless-2011.jpg?hash=mFtwcd',
    'https://analysis.null.place/movie-reviews/img/thumb-lock-stock-and-two-smoking-barrels-1998.jpg?hash=_67jTj',
    'https://analysis.null.place/movie-reviews/json/list-highest-rating-first-10.json?hash=JNEP3J',
    'https://analysis.null.place/movie-reviews/json/data-bird-box-2018.json?hash=ooYc0U',
    'https://analysis.null.place/movie-reviews/json/data-crocoile-dundee-1-1986.json?hash=uUj0xd',
    'https://analysis.null.place/movie-reviews/json/data-dark-city-1998.json?hash=8D4DN8',
    'https://analysis.null.place/movie-reviews/json/data-district-9-2009.json?hash=2-O0L_',
    'https://analysis.null.place/movie-reviews/json/data-eternal-sunshine-of-the-spotless-mind-2004.json?hash=-gnRXO',
    'https://analysis.null.place/movie-reviews/json/data-fight-club-1999.json?hash=gfBi76',
    'https://analysis.null.place/movie-reviews/json/data-gemini-man-2019.json?hash=dOMCht',
    'https://analysis.null.place/movie-reviews/json/data-inception-2010.json?hash=LdaYtW',
    'https://analysis.null.place/movie-reviews/json/data-limitless-2011.json?hash=C_Sd6E',
    'https://analysis.null.place/movie-reviews/json/data-lock-stock-and-two-smoking-barrels-1998.json?hash=eH0xbX',

    // assets for the "how do the bitcoin mining algorithms work?" article
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/index.html',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/js/sjcl.min.js?hash=0JqGiP',
    'https://analysis.null.place/how-do-the-bitcoin-mining-algorithms-work/js/btc-mining.js?hash=Qs7G9_',
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
var mediaReviewPages = ['book-reviews','movie-reviews','tv-series-reviews'];
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