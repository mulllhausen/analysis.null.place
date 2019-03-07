var newServiceWorker; // gets populated by the service worker if available
if ('serviceWorker' in navigator) {
    // wait until window load (late) to keep the service worker http requests
    // from slowing down more critical requests to get the page up and running
    addEvent(window, 'load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (reg) {
            // thanks to deanhume.com/displaying-a-new-version-available-progressive-web-app/
            addEvent(reg, 'updatefound', function () {
                // a new service worker is currently installing
                newServiceWorker = reg.installing;

                addEvent(newServiceWorker, 'statechange', function () {
                    switch (newServiceWorker.state) {
                        case 'activated': //stackoverflow.com/questions/40100922/activate-updated-service-worker-on-refresh
                            if (navigator.serviceWorker.controller == null) break;
                            showNewVersionNotice();
                            break;
                    }
                });
            });
        });

        addEvent(document.getElementById('reloadNewVersion'), 'click', function () {
            window.location.reload();
        });
    });
}

function showNewVersionNotice() {
    document.querySelector('.new-version-info-notice').style.display = 'block';
}
