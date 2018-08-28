if ('serviceWorker' in navigator) {
    // wait until window load (late) to keep the service worker from interfering
    // with more critical requests
    addEvent(window, 'load', function () {
        navigator.serviceWorker.register('/sw.js').then(function () {
            console.log("Service Worker Registered");
        });
    });
}
