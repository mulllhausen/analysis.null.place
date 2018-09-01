if ('serviceWorker' in navigator) {
    // wait until window load (late) to keep the service worker http requests
    // from slowing down more critical requests to get the page up and running
    addEvent(window, 'load', function () {
        navigator.serviceWorker.register('/sw.js');/*.then(function () {
            console.log("Service Worker Registered");
        });*/
    });
}
