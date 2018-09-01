var latestCache = '2018-09-01_19:50:54';
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(latestCache).then(function (cache) {
            return cache.addAll([
                // common assets for all pages
                'https://null.place/theme/img/icons.svg?hash=2G-EGE64Yri80GmCFDWH7UHNpZrhCdjdRDcsTpmjgVU',
                'https://null.place/theme/img/shattered-glass-2b.png?hash=xZglIfe9jc3JEEEFSTMZvUIt5VWfKS_5LJH6XBVoWpI',
                'https://null.place/theme/img/shattered-glass-black.png?hash=DsMJmVokM2LTMF4Z9aPpwkFDqO1ovQPNKh9dNuLaFSg',
                'https://null.place/theme/css/thematrix.css?hash=G-yHo81_8kBrP6EWNQiLzOMaSd9thvxRYfxrwwX2hNU',
                'https://null.place/theme/img/favicon.ico?hash=jRJksAEHgEZeRuxnq6s_SglA_USOy3AlXuKoMUeGjUI',
                'https://null.place/theme/img/favicon.ico?hash=jRJksAEHgEZeRuxnq6s_SglA_USOy3AlXuKoMUeGjUI',
                'https://null.place/theme/img/apple-touch-icon.png?hash=FAvW32yXmjycEE9rDnCbWjONBdx1mb_Gt3abPjrs5XU',
                'https://null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJH4DFIzn_ryh1LR6mf155XVVVCACXLvK89Oqik',
                'https://null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrAGvhl48cMU0RQhmSkjlm5FVJd1K9c7WVXlbkSE',
                'https://null.place/theme/js/base.js?hash=H4oFeRTvdXXfK0nJxA06c09VZqxMnudAX3Huy2baYEc',
                'https://null.place/theme/js/console-greeter.js?hash=zCriPqrRBv30DdSiS_oOtbB6-vSZ-V-0C9_PFVM4IHc',
                'https://null.place/theme/js/manifest.json',

                // articles pages
                'https://null.place/theme/js/comments-section.js?hash=JEUEfP8-C8dRSbx6TDSfTLwAPDXpe2Ly9DumjX3fLKY',

                // home page
                'https://null.place/',
                'https://null.place/index.html',

                // archives page
                'https://null.place/archives/',
                'https://null.place/archives/index',

                // tags pages
                'https://null.place/tags/',
                'https://null.place/tags/index.html',
                'https://null.place/tag/bitcoin/',
                'https://null.place/tag/bitcoin/index.html',
                'https://null.place/tag/mining/',
                'https://null.place/tag/mining/index.html',
                'https://null.place/tag/proof-of-work/',
                'https://null.place/tag/proof-of-work/index.html',

                // cryptocurrencies folder
                'https://null.place/cryptocurrencies/',
                'https://null.place/cryptocurrencies/index.html',

                // 'how does bitcoin mining work' article page
                'https://null.place/cryptocurrencies/how-does-bitcoin-mining-work/',
                'https://null.place/cryptocurrencies/how-does-bitcoin-mining-work/index.html',
                'https://null.place/js/sjcl.min.js?hash=0JqGiPN8dEK7HmaZtG77GR2Sge8FpJJYb6D1TcTlEQo',
                'https://null.place/js/btc-mining.js?hash=D15PC7nixy_T1CSLeuDPZJAa2d_c-EG8DLIySC3Sm7I',
                'https://null.place/img/hashing-flowchart.svg?hash=NX7qzYIvGazeEX9jo6LBtyf-UTfHvFA3kZxGSCZM8B4',
                'https://null.place/img/bitcoin-blockchain.svg?hash=70Cxdlb00mmP5-7WS0vqNHTEB5Ap8G1XH-ZP-OpW_-4',
                'https://null.place/css/btc.css?hash=93IOhmfRq0qX0W72ZlJvdTQzTFBQX65ycirSVRrrnIQ',
                'https://null.place/json/btc_txs_per_block_0-999.json',
                'https://null.place/json/hex-trial-attempts.json',
                'https://null.place/json/unittest-bits.json?hash=p7UQo2SFlPohlPTr77BzMrKWCwIejGOFliA5uLTC6h4'
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