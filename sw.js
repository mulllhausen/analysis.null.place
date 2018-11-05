var latestCache = '2018-11-06_00:37:56';
self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(latestCache).then(function (cache) {
            return cache.addAll([
                // common assets for all pages
                'https://analysis.null.place/theme/css/thematrix.css?hash=z--49ywYkP5N1CPyjdn1dkXmxd4ve8LqOajLtvvAIGc',
                'https://analysis.null.place/theme/img/icons.svg?hash=2G-EGE64Yri80GmCFDWH7UHNpZrhCdjdRDcsTpmjgVU',
                'https://analysis.null.place/theme/img/shattered-glass-2b.png?hash=xZglIfe9jc3JEEEFSTMZvUIt5VWfKS_5LJH6XBVoWpI',
                'https://analysis.null.place/theme/img/shattered-glass-black.png?hash=DsMJmVokM2LTMF4Z9aPpwkFDqO1ovQPNKh9dNuLaFSg',
                'https://analysis.null.place/theme/img/shattered-glass-matrix-192x192.png?hash=HbWgBIrSuiffAq4jPVvbhxStike2SqfBpejw9IEygJI',
                'https://analysis.null.place/theme/img/shattered-glass-matrix-512x512.png?hash=9R0TcV3MRZa3tlvYFOznnM3R1k0j3sLFOmIIuXz5QVs',
                'https://analysis.null.place/theme/img/favicon.ico?hash=jRJksAEHgEZeRuxnq6s_SglA_USOy3AlXuKoMUeGjUI',
                'https://analysis.null.place/theme/img/apple-touch-icon.png?hash=FAvW32yXmjycEE9rDnCbWjONBdx1mb_Gt3abPjrs5XU',
                'https://analysis.null.place/theme/img/apple-touch-icon-72x72.png?hash=vTsYhJH4DFIzn_ryh1LR6mf155XVVVCACXLvK89Oqik',
                'https://analysis.null.place/theme/img/apple-touch-icon-114x114.png?hash=AxyPrAGvhl48cMU0RQhmSkjlm5FVJd1K9c7WVXlbkSE',
                'https://analysis.null.place/theme/js/base.js?hash=r-q4JY9mE0pD9TG-zTyAyKqBfXD8ks3ViQloaw9B9zI',
                'https://analysis.null.place/theme/js/console-greeter.js?hash=zCriPqrRBv30DdSiS_oOtbB6-vSZ-V-0C9_PFVM4IHc',
                'https://analysis.null.place/theme/js/manifest.json',

                // articles pages
                'https://analysis.null.place/theme/js/comments-section.js?hash=wki7QgoBJ_2OPWmX8GayY4Id_wIWZ550s44vGCKK1uk',

                // home page
                'https://analysis.null.place/',
                'https://analysis.null.place/index.html',

                // archives page
                'https://analysis.null.place/archives/',
                'https://analysis.null.place/archives/index.html',

                // tags pages
                'https://analysis.null.place/tags/',
                'https://analysis.null.place/tags/index.html',
                'https://analysis.null.place/tag/bitcoin/',
                'https://analysis.null.place/tag/bitcoin/index.html',
                'https://analysis.null.place/tag/mining/',
                'https://analysis.null.place/tag/mining/index.html',
                'https://analysis.null.place/tag/proof-of-work/',
                'https://analysis.null.place/tag/proof-of-work/index.html',

                // cryptocurrencies folder
                'https://analysis.null.place/cryptocurrencies/',
                'https://analysis.null.place/cryptocurrencies/index.html',

                // 'how does bitcoin mining work' article page
                'https://analysis.null.place/cryptocurrencies/how-does-bitcoin-mining-work/',
                'https://analysis.null.place/cryptocurrencies/how-does-bitcoin-mining-work/index.html',
                'https://analysis.null.place/js/sjcl.min.js?hash=0JqGiPN8dEK7HmaZtG77GR2Sge8FpJJYb6D1TcTlEQo',
                'https://analysis.null.place/js/btc-mining.js?hash=D15PC7nixy_T1CSLeuDPZJAa2d_c-EG8DLIySC3Sm7I',
                'https://analysis.null.place/img/hashing-flowchart.svg?hash=NX7qzYIvGazeEX9jo6LBtyf-UTfHvFA3kZxGSCZM8B4',
                'https://analysis.null.place/img/bitcoin-blockchain.svg?hash=70Cxdlb00mmP5-7WS0vqNHTEB5Ap8G1XH-ZP-OpW_-4',
                'https://analysis.null.place/css/btc.css?hash=93IOhmfRq0qX0W72ZlJvdTQzTFBQX65ycirSVRrrnIQ',
                'https://analysis.null.place/json/btc_txs_per_block_0-999.json',
                'https://analysis.null.place/json/hex-trial-attempts.json',
                'https://analysis.null.place/json/unittest-bits.json?hash=p7UQo2SFlPohlPTr77BzMrKWCwIejGOFliA5uLTC6h4',

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