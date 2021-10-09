// css selectors cannot ascend, so run a constant loop to apply classes to the
// highest level element (body) to be made available for all css selectors
var cssAscendData = [{
    // the data-ad-status attribute does not exist before its status is set to
    // unfilled
    from: '.bottom-anchor-ad ins.adsbygoogle[data-ad-status="unfilled"],' +
    '.bottom-anchor-ad ins.adsbygoogle:not([data-ad-status])',
    to: 'bottom-anchor-ad-unfilled',
    totalChecks: 10,
    done: false
}];
var timerID = setInterval(function() {
    var doneItemsCount = 0;
    for (var i = 0; i < cssAscendData.length; i++) {
        var item = cssAscendData[i];
        if (item.done) {
            doneItemsCount++;
            continue;
        }
        var fromEl = document.querySelector(item.from);
        if (fromEl == null) removeCSSClass(document.body, item.to);
        else addCSSClass(document.body, item.to);

        if (item.hasOwnProperty('runCount')) item.runCount++;
        else item.runCount = 0;
        if (item.runCount >= item.totalChecks) item.done = true;
    }
    var allDone = (doneItemsCount == cssAscendData.length);
    if (allDone) clearInterval(timerID);
}, 1000); // 1 second
