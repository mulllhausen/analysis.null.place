var backgroundImageSize = { height: 148, width: 160 }; // px
var numBackgroundImages = 100;
var backgroundImage = siteGlobals.siteURL + '/theme/img/crack1.png';
var verticalGap = 100; // px

//init background images css
(function () {
    if (initialDeviceType == 'phone') return '';
    var leftColumnWidth = document.querySelector('.col-0').offsetWidth;
    var leftColumnPosFromLeft = leftColumnWidth - (backgroundImageSize.width / 2);
    var rightColumnPosFromLeft = getCoordinates(
        document.querySelector('.col-2')
    ).left - (backgroundImageSize.width / 2);
    var rightColumnWidth = document.querySelector('.col-2').offsetWidth -
    (backgroundImageSize.width / 2);
    var logo = document.querySelector('.logo-container');
    var logoBottom = getCoordinates(logo).top + logo.offsetHeight;
    var backgroundPositions = ''; // left top
    var backgroundImages = ''; // init
    var backgroundRepeat = ''; // init
    var comma = ''; // init
    for (var i = 0; i < numBackgroundImages; i++) {
        var leftPos = 0; // init
        var vertPos = (backgroundImageSize.height + verticalGap) * i;
        if (isEven(i)) {
            // vary the background image in the right column randomly if below
            // the logo
            var rand = (vertPos > logoBottom) ? rightColumnWidth * Math.random() : 0;
            leftPos = rightColumnPosFromLeft + rightColumnWidth - rand;
        } else {
            // move background image by 0.15 * its width either size of center
            var rand = backgroundImageSize.width * 0.3 * (Math.random() - 0.5);
            leftPos = leftColumnPosFromLeft - rand;
        }
        backgroundPositions += comma + leftPos + 'px ' + vertPos + 'px';
        backgroundImages += comma + 'url("' + backgroundImage + '")';
        backgroundRepeat += comma + 'no-repeat';
        comma = ',';
    }
    document.body.style.backgroundImage = backgroundImages;
    document.body.style.backgroundRepeat = backgroundRepeat;
    document.body.style.backgroundPosition = backgroundPositions;
})();
