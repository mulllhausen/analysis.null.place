// rules:
// - so long as the url specifies a particular review (eg. /movie-reviews/birdbox2018/)
// then that review will be pinned to the top of the search results
// - if a user is viewing a pinned review page and they show interest in another
// media review, then the pinned review's id will be removed from the url
// - actions which count as showing interest in another review include:
//      - clicking on anything in another review (eg. load-button, link icon, etc)
//      - making any changes in the search area
// todo: fix underline search when loading more items
// todo: get working for /<media>-reviews/ first, then for individual media IDs

// globals

searchText = {
    current: '',
    previous: null, // always init to null so we find a diff immediately
    debounceCurrent: '',
    debouncePrevious: '' // for debouncing we do not want an immediate diff
};
sortMode = {
    current: '', // value of the search box dropdown (eg. 'highest-first')
    previous: null, // always init to null so we find a diff immediately
    debounceCurrent: 'highest-rating',
    debouncePrevious: 'highest-rating' // for debouncing - no immediate diff
};

// the current search index as determined by search order. populated with an
// entire json file. eg. search-index-highest-rating.json
searchIndex = [];
searchIndexFileName = ''; // name of the json file downloaded into searchIndex
searchIndexDownloadStatus = 'not started'; // not started, in progress, complete

// the current list of media IDs as determined by search order. populated with
// an entire json file. eg. list-highest-rating.json
fullList = [];
fullListFileName = ''; // name of the json file downloaded into fullList
fullListDownloadStatus = 'not started'; // not started, in progress, complete

// a list of all media IDs to render. shortcut: 'all' when equal to fullList
filteredList = [];

//initialMediaData = []; // static list of initial media data
//completeMediaSearch = []; // static index of media searches
//completeMediaSearchIDs = []; // same as completeMediaSearch but with IDs not names and years
//completeMediaData = []; // static list of all media data
//searchResultIndexes = []; // all media indexes that match the search. in order. used for paging.

numMediaFound = 0; // total count that match the search criteria
numMediaDownloadFail = 0;
nextMediaIndex = 0; // index of panel on the page, from 0 to filteredList.length - 1
pageSize = 10; // load this many media at once in the infinite scroll page

addEvent(window, 'load', function () {
    resetSearchBox();
    triggerSearch();

    var debounceSearchSetup = debounce(
        debounceSearch, 1000, 'both', extraDebounceChecks
    );
    // use 'keyup', not 'change' since 'change' only fires onblur
    addEvent(document.getElementById('search'), 'keyup', debounceSearchSetup);

    // either typing in the search input, or selecting the sort order from the
    // dropdown will do a debounce before searching. this way neither cancels
    // out the other
    addEvent(document.getElementById('sortBy'), 'change', debounceSearchSetup);

    addEvent(document.getElementById('reviewsArea'), 'click', loadFullReview);
/*
    addEvent(document.getElementById('sortBy'), 'change', mediaSortChanged);
    initMediaRendering();
    initMediaSearchList(initSearchResultIndexes);
    initCompleteMediaData(initSearchResultIndexes);
    addEvent(document.getElementById('reviewsArea'), 'click', linkTo1Media);
*/
    // scroll with debounce
    var ticking = false;
    addEvent(window, 'scroll', function (e) {
        if (ticking) return;
        setTimeout(function () {
            infiniteLoader(); // get the loader going asap
            positionMediaCounter();
            ticking = false;
        }, 333); // check 3 times per second
        ticking = true;
    });
});

// url manipulation and navigation

function removeMediaIDFromUrl() {
    if (typeof window.history.replaceState == 'function') {
        var page = siteGlobals.mediaType + '-reviews/';
        window.history.replaceState(null, '', generateCleanURL(page));
    }
    else window.location.hash = '';
}

// rendering

function resetSearchBox() {
    // in case the browser has persisted any values for these inputs
    document.getElementById('search').value = '';
    document.getElementById('sortBy').selectedIndex = 0; // highest rating
}

function clearRenderedMedia() {
    document.getElementById('reviewsArea').innerHTML = '';
    filteredList = [];
    numMediaDownloadFail = 0;
    nextMediaIndex = 0;
}

function showRenderedMedia(showHide) {
    if (showHide) { // show
        document.getElementById('reviewsArea').style.display = 'block';
        // skyscraper ads are added back automatically
        showMediaCount(true);
    } else { // hide
        document.getElementById('reviewsArea').style.display = 'none';
        hideAllSkyscraperAds();
        showMediaCount(false);
    }
}

// render a page (eg. 10 items). wait for all to finish downloading before
// making any visible, and hide any that fail
function renderNextPage(callback) {
    if (callback == null) callback = function () {};
    var numMediaDownloadedThisPage = 0;
    var thisPageSize = pageSize;
    for (var i = 0; i < pageSize; i++, nextMediaIndex++) {
        var minimal1MediaObj = get1MediaIDandHash(nextMediaIndex);
        if (minimal1MediaObj == null) {
            if (i == 0) { // there were no items for this page
                finishedDownloading1Page();
                return callback();
            }
            // note: if we get here it will always be before the first time
            // download1MediaItem()'s callback runs. not because downloading is
            // slow, but because we get here synchronously first.
            thisPageSize = i; // we are already 1 past the last existing item
            break; // gone past the last item
        }

        // create the placeholders for each media item. this keeps correct
        // order regardless of the order in which the media items are
        // downloaded.
        render1MediaItemPlaceholder(nextMediaIndex, minimal1MediaObj);

        (function (minimal1MediaObjLocal, mediaIndex) {
            download1MediaItem(minimal1MediaObjLocal, function (status, mediaData) {
                // note: the order in which media arrive here is unknown due to
                // internet delays
                var x = finishedDownloading1MediaItem(
                    status, mediaData, mediaIndex, numMediaDownloadedThisPage,
                    numMediaDownloadFail, thisPageSize, callback
                );
                status = x.status;
                mediaData = x.mediaData;
                mediaIndex = x.mediaIndex;
                numMediaDownloadedThisPage = x.numMediaDownloadedThisPage;
                numMediaDownloadFail = x.numMediaDownloadFail;
                thisPageSize = x.thisPageSize;
            });
        })(minimal1MediaObj, nextMediaIndex);
    }
}

function finishedDownloading1MediaItem(
    status, mediaData, mediaIndex, numMediaDownloadedThisPage,
    numMediaDownloadFail, thisPageSize, callback
) {
    if (status == 'complete') {
        fillRender1MediaItem(mediaIndex, mediaData);
        numMediaDownloadedThisPage++;
    } else {
        numMediaDownloadFail++;
        thisPageSize--;
        removePlaceholder(mediaIndex);
    }
    if (numMediaDownloadedThisPage == thisPageSize) {
        finishedDownloading1Page(mediaIndex);
        callback();
    }
    return {
        status: status,
        mediaData: mediaData,
        mediaIndex: mediaIndex,
        numMediaDownloadedThisPage: numMediaDownloadedThisPage,
        numMediaDownloadFail: numMediaDownloadFail,
        thisPageSize: thisPageSize
    };
}

function finishedDownloading1Page(mediaIndex) {
    showRenderedMedia(true); // if previously hidden (eg. during search debounce)
    unhideRenderedMedia();
    renderMediaCount();
    showMediaCount(true);
}

function render1MediaItemPlaceholder(mediaIndex) {
    document.getElementById('reviewsArea').innerHTML += '<div ' +
        ' class="media ' + siteGlobals.mediaType + ' hidden"' +
        ' id="filter-index-' + mediaIndex + '"' +
    '></div>';
}

function removePlaceholder(mediaIndex) {
    deleteElement(document.getElementById('filter-index-' + mediaIndex));
}

function unhideRenderedMedia() {
    var hiddenMediaDivs =
    document.querySelectorAll('#reviewsArea .media.hidden');

    foreach(hiddenMediaDivs, function (i, el) {
        el.style.display = 'block';
    });
}

function fillRender1MediaItem(mediaIndex, mediaData) {
    document.getElementById('filter-index-' + mediaIndex).innerHTML =
    get1MediaHTML(mediaData);
}

function loadFullReview(e) {
    if (
        e.target.tagName.toLowerCase() != 'button'
        || typeof e.target.className != 'string'
        || !inArray('load-review', e.target.className)
    ) return;

    setButtonLoading(true, e.target);

    var mediaEl = e.target.up(2);
    var mediaIndex = parseInt(mediaEl.id.replace('filter-index-', ''));
    var minimal1MediaObj = get1MediaIDandHash(mediaIndex);
    linkToSelf(mediaEl, minimal1MediaObj.id_);
    download1MediaReview(minimal1MediaObj, function (status, fullReviewText) {
        var newContent;
        // get the external link button from the dom, since we no longer have
        // access to the mediaData to build it from scratch
        var externalLinkButtonHTML =
        mediaEl.querySelector('button.external-site').outerHTML;

        var oldContent = mediaEl.querySelector('.review-text').innerHTML;
        switch (status) {
            case 'complete':
                newContent = formatReview(fullReviewText) +
                externalLinkButtonHTML;
                break;
            default:
            case 'fail':
                newContent = getLoadReviewButtonHTML() +
                externalLinkButtonHTML +
                '<span class="review-download-error">' +
                    'failed to download review' +
                '</span>';
                break;
        }
        mediaEl.querySelector('.review-text').innerHTML = newContent;
        setButtonLoading(false, e.target);
    });
}

/*function initMediaRendering() {
    var initialMediaDataHTML = '';
    var mediaID = getMediaIDFromURL(); // does not alter url
    var page = siteGlobals.mediaType + '-reviews/';
    if (mediaID != null) {
        // show the media with id first, then the initial list after

        // change /#!mediaID to /mediaID in the url
        if (
            (typeof window.history.replaceState == 'function')
            && (window.location.hash.length > 0)
        ) window.history.replaceState(null, '', generateCleanURL(page + mediaID + '/'));

        var lookedInInitialMediaData = false; // init
        var lookedInCompleteMediaSearch = false; // init
        var afterMediaDataDownloaded = function () {
            // exit if already finished
            if ((initialMediaDataHTML != '') && (numTotalMedia != 0)) return;

            var idInInitialList = false; // init
            // check if mediaID is in initialMediaData
            if ((initialMediaData.length != 0) && !lookedInInitialMediaData) {
                lookedInInitialMediaData = true;
                var pinned = true;
                for (var i = 0; i < initialMediaData.length; i++) {
                    if (mediaID != getMediaID(initialMediaData[i])) continue;
                    initialMediaDataHTML = generateMediaHTML(
                        initialMediaData[i], pinned
                    );
                    idInInitialList = true;
                    break;
                }
                if (initialMediaDataHTML == '') {
                    // mediaID not found in initial data. exit now and wait to
                    // get it from the complete list
                    return;
                }
                initialMediaDataHTML += generateInitialMediaHTML(
                    mediaID, idInInitialList
                );
                numMediaShowing = initialMediaData.length; // global
                loading('off');
                removeGlassCase('searchBox', true);
                archiveInFeedAds();
                document.getElementById('reviewsArea').innerHTML = initialMediaDataHTML;
                populateInFeedAds();
            }

            // remove the mediaID from the path if the mediaID is not found in
            // the complete list. do this without waiting for the complete media
            // data, which could take ages.
            if (completeMediaSearch.length != 0) {
                var mediaIndex = mediaID2Index(mediaID);
                if (!lookedInCompleteMediaSearch) {
                    lookedInCompleteMediaSearch = true;
                    numTotalMedia = completeMediaSearch.length; // global

                    if (mediaIndex === null) { // media not found
                        if (typeof window.history.replaceState == 'function') {
                            window.history.replaceState(
                                null, '', generateCleanURL(page)
                            );
                            initMediaRendering();
                        }
                        else location.href = generateCleanURL(page);
                        return;
                    }
                }
            }

            // the mediaID was not found in the initial list, so get it from the
            // complete list. however we still need the initial list to render
            // the first page of reviews
            if (
                (initialMediaDataHTML == '')
                && (initialMediaData.length != 0)
                && (completeMediaSearch.length != 0)
                && (completeMediaData.length != 0)
            ) {
                var mediaData = completeMediaData[mediaIndex];
                var pinned = true;
                initialMediaDataHTML = generateMediaHTML(mediaData, pinned);
                var idInInitialList = false;
                initialMediaDataHTML += generateInitialMediaHTML(
                    mediaID, idInInitialList
                );
                loading('off');
                removeGlassCase('searchBox', true);
                archiveInFeedAds();
                document.getElementById('reviewsArea').innerHTML = initialMediaDataHTML;
                numMediaShowing = initialMediaData.length; // global
                populateInFeedAds();
            }
            if ((numTotalMedia != 0) && (numMediaShowing != 0)) renderMediaCount();
        };
        // the media search list tells us where the media id is located. if we
        // can get it from the initial-media-data then do so because this is
        // quicker than waiting for the complete-media-data list. however it may
        // not be available in the initial media data, so the complete list may
        // be needed. get all data in parallel for speed.
        initInitialMediaData(afterMediaDataDownloaded);
        initMediaSearchList(afterMediaDataDownloaded);
        initCompleteMediaData(afterMediaDataDownloaded);
    } else { // show initial list
        var afterInitialMediaDataDownloaded = function () {
            if (initialMediaData.length != 0 && initialMediaDataHTML == '') {
                // render the initial media data and ads on the page
                initialMediaDataHTML = generateInitialMediaHTML();
                loading('off');
                removeGlassCase('searchBox', true);
                archiveInFeedAds();
                document.getElementById('reviewsArea').innerHTML = initialMediaDataHTML;
                populateInFeedAds();
            }

            // wait for both lists to be downloaded before proceeding
            if (
                completeMediaSearch.length == 0 ||
                initialMediaData.length == 0
            ) return;
            numMediaShowing = initialMediaData.length; // global
            numTotalMedia = completeMediaSearch.length; // global
            currentlySearching = false;
            renderMediaCount();
        };
        initMediaSearchList(afterInitialMediaDataDownloaded);
        initInitialMediaData(afterInitialMediaDataDownloaded);
        // note: at this point, searchResultIndexes may not be populated, so
        // scrolling to the bottom may not yet load any more media
    }
}

var gettingInitialMediaData = false; // init (unlocked)
function initInitialMediaData(callback) {
    if (initialMediaData.length > 0) return callback(); // exit function here

    // run multiple different callbacks when the data finally arrives
    addEvent(document, 'got-initial-media-data', callback);

    if (gettingInitialMediaData) return; // 1 attempt at a time
    gettingInitialMediaData = true; // lock
    ajax(
        siteGlobals.mediaInitListJSON,
        function (json) {
        try {
            initialMediaData = JSON.parse(json);
            triggerEvent(document, 'got-initial-media-data');
        }
        catch (err) {
            console.log('error in initInitialMediaData function: ' + err);
            gettingInitialMediaData = false; // unlock again
        }
    });
}*/

function linkTo1Media(e) {
    // a link within a media item was clicked. figure out which one, and action
    // it
    stopBubble(e);
    e.preventDefault();
    var el = e.target;

    // the link looks like <a class="link-external" href="http...">blah</a>
    if (
        (el.tagName.toLowerCase() == 'a') &&
        inArray('link-external', el.className)
    ) {
        if (siteGlobals.browser.isIE) location.href = el.href;
        else window.open(el.href, '_blank');
        return false; // prevent bubble up
    }

    // the link looks like <a class="link-external"><button><img></button></a>
    // and the <a> element was clicked
    if (
        (el.tagName.toLowerCase() == 'a') &&
        inArray('link-external', el.className)
    ) {
        if (siteGlobals.browser.isIE) location.href = el.href;
        else window.open(el.href, '_blank');
        return false; // prevent bubble up
    }

    // the link looks like <a class="link-external"><button><img></button></a>
    // and the <button> element was clicked
    if (
        (el.tagName.toLowerCase() == 'button') &&
        (el.parentNode.tagName.toLowerCase() == 'a') &&
        inArray('link-external', el.parentNode.className)
    ) {
        if (siteGlobals.browser.isIE) location.href = el.parentNode.href;
        else window.open(el.parentNode.href, '_blank');
        return false; // prevent bubble up
    }

    // the link looks like <a class="link-external"><button><img></button></a>
    // and the <img> element was clicked
    if (
        (el.tagName.toLowerCase() == 'img') &&
        (el.parentNode.tagName.toLowerCase() == 'button') &&
        (el.up(2).tagName.toLowerCase() == 'a') &&
        inArray('link-external', el.up(2).className)
    ) {
        if (siteGlobals.browser.isIE) location.href = el.up(2).href;
        else window.open(el.up(2).href, '_blank');
        return false; // prevent bubble up
    }

    // the link looks like <a class="link-to-other-media"><i>blah</i></a> and
    // the <i> element was clicked
    if (
        (el.tagName.toLowerCase() == 'i') &&
        (el.parentNode.tagName.toLowerCase() == 'a') &&
        inArray('link-to-other-media', el.parentNode.className)
    ) return goToOtherMedia(el.parentNode.href);

    // the link looks like <a class="link-to-other-media"><i>blah</i></a> and
    // the <a> element was clicked
    if (
        (el.tagName.toLowerCase() == 'a') &&
        inArray('link-to-other-media', el.className)
    ) return goToOtherMedia(el.href);

    // the link looks like <a class="link-to-self"><svg class="icon-chain">
    // <use xlink:href="...#icon-chain"></use></svg></a> and the <a> element was
    // clicked
    if (
        (el.tagName.toLowerCase() == 'a') &&
        inArray('link-to-self', el.className)
    ) return linkToSelf(el.parentNode);

    // the link looks like <a class="link-to-self"><svg class="icon-chain">
    // <use xlink:href="...#icon-chain"></use></svg></a> and the <svg> element
    // was clicked
    if (
        (el.tagName.toLowerCase() == 'svg') &&
        inArray('icon-chain', el.outerHTML)
    ) return linkToSelf(el.up(2));

    // the link looks like <a class="link-to-self"><svg class="icon-chain">
    // <use xlink:href="...#icon-chain"></use></svg></a> and the <use> element
    // was clicked
    if (
        (el.tagName.toLowerCase() == 'use') &&
        inArray('icon-chain', el.outerHTML)
    ) return linkToSelf(el.up(3));
}

function goToOtherMedia(url) {
    if (typeof window.history.replaceState == 'function') {
        window.history.replaceState(null, '', generateCleanURL(url));
        scrollToElement(document.getElementById('searchBox'));
        initMediaRendering(); // show the media in the url pinned to the top
    }
    else location.href = generateCleanURL(url);
    return false; // prevent bubble up
}

function linkToSelf(mediaEl, mediaID) {
    currentlySearching = false;
    foreach(document.querySelectorAll('.media.pinned'), function (_, otherMediaEl) {
        removeCSSClass(otherMediaEl, 'pinned');
    });
    addCSSClass(mediaEl, 'pinned');
    if (typeof window.history.replaceState == 'function') {
        var url = siteGlobals.mediaType + '-reviews/' + mediaID + '/';
        window.history.replaceState(null, '', generateCleanURL(url));
    }
    else window.location.hash = '#!' + mediaID;
    return false; // prevent bubble up
}

// todo: always keep the loader on until the very end
loadingStatus = {
    display: 'on',
    faux: 'on'
};
var loaderEl = document.getElementById('mediaLoaderArea');
function loading(status, faux) {
    // "faux loading" is just a state machine that keeps track of whether or not
    // content is loading - it does not affect the display.
    faux = (faux == true); // explicit

    if (faux) return loadingStatus.faux = status;

    // display ...
    loadingStatus.faux = status;
    loadingStatus.display = status;
    switch (status) {
        case 'on':
            loaderEl.style.display = 'block';
            break;
        case 'off':
            loaderEl.style.display = 'none';
            break;
    }
}

/*function generateInitialMediaHTML(mediaID, idInInitialList) {
    var adOffset = 0;
    var firstPageSize = initialMediaData.length;
    if (mediaID != null) {
        adOffset++; // start after the first media review item

        // first item was prepopulated - page size is 1 smaller
        if (!idInInitialList) firstPageSize--;
    }
    var initialMediaDataHTML = '';
    var foundMediaIDI = false; // speed up checks
    for (var i = 0; i < firstPageSize; i++) {
        var skipI = false;
        if (
            (mediaID != null)
            && !foundMediaIDI
            && (getMediaID(initialMediaData[i]) == mediaID)
        ) {
            foundMediaIDI = true;
            skipI = true;
        }
        if (!skipI) initialMediaDataHTML += generateMediaHTML(initialMediaData[i]);
        if (((adOffset + 1) % reviewsPerAd) == 0) {
            // put an in-feed ad after every reviewsPerAd media items
            initialMediaDataHTML += inFeedAdContainer;
        }
        if (!skipI) adOffset++;
    }
    return initialMediaDataHTML;
}*/

function get1MediaHTML(mediaData) {
    var href = generateCleanURL(
        siteGlobals.mediaType + '-reviews/' + mediaData.id_ + '/'
    );
    return '<a' +
        ' class="link-to-self chain-link"' +
        ' href="' + href + '"' +
        ' title="right click and copy link for the URL of this ' +
        siteGlobals.mediaType + ' review"' +
    '>' +
        '<svg class="icon icon-chain">' +
            '<use xlink:href="' + siteGlobals.iconsSVGURL + '#icon-chain">' +
            '</use>' +
        '</svg>' +
    '</a>' +
    '<div class="thumbnail-and-stars">' +
        getThumbnailImgHTML(mediaData) +
        '<div class="stars">' +
            getMediaStarsHTML(mediaData.rating) +
        '</div>' +
    '</div>' +
    '<h3 class="media-title">' + getRenderedTitle(mediaData) + '</h3>' +
    '<h4 class="review-title">' + mediaData.reviewTitle + '</h4>' +
    getSpoilerAlertHTML(mediaData) +
    '<br>' +
    '<div class="review-text">' +
        getLoadReviewButtonHTML() +
        getExternalLinkButtonHTML(mediaData)
    '</div>';
}

function getThumbnailImgHTML(mediaData) {
    var imgSrc = siteGlobals.siteURL + '/' + siteGlobals.mediaType +
    '-reviews/img/' + getThumbnailBasename(mediaData.id_, 'thumb') +
    '.jpg?hash=' + mediaData.thumbnailHash;

    var altText = getNBSP(25) + ' thumbnail failed to load';

    return '<img ' +
        'src="' + imgSrc + '" ' +
        'class="thumbnail" ' +
        'alt="' + altText + '" ' +
        'height="' + mediaData.thumbnailHeight + '"' + // fixed width set in css
    '>';
    // todo: fallback for older browsers that don't support img height
}

function getNBSP(num) {
    var str = '';
    for (var i = 0; i < num; i++) {
        str += '&nbsp;';
    }
    return str;
}

function getSpoilerAlertHTML(mediaData) {
    var style = '';
    if (mediaData.spoilers) style = ' style="color:red;"';
    return '<span class="spoiler-alert"' + style + '>' +
        '(this review ' +
        (mediaData.spoilers ? 'contains' : 'has no') +
        ' spoilers)' +
    '</span>';
}

function getLoadReviewButtonHTML() {
    return '<button class="load-review">load review</button>';
}

function getMediaStarsHTML(mediaDataRating) {
    var starRating = '';
    for (var i = 1; i <= 5; i++) {
        if (i <= mediaDataRating) starRating +=
        '<svg class="icon some-star icon-star">' +
            '<use xlink:href="' + siteGlobals.iconsSVGURL + '#icon-star"></use>' +
        '</svg>';
        else {
            if ((i - 1) < mediaDataRating) starRating +=
            '<svg class="icon some-star icon-star-half-empty">' +
                '<use xlink:href="' + siteGlobals.iconsSVGURL + '#icon-star-half-empty"></use>' +
            '</svg>';
            else starRating += '<svg class="icon some-star icon-star-o">' +
                '<use xlink:href="' + siteGlobals.iconsSVGURL + '#icon-star-o"></use>' +
            '</svg>';
        }
    }
    return starRating;
}

function formatReview(review) {
    review = review.replace(/##siteGlobals.siteURL##/g, siteGlobals.siteURL);

    // if the review uses paragraph tags then do not modify it
    if (inArray('<p>', review)) return review;

    return '<p>' + review.replace(/\n/g, '</p><p>') + '</p>';
}

function getExternalLinkButtonHTML(mediaData) {
    var externalLink = 'https://';
    var externalSiteLogo = siteGlobals.siteURL + '/img/';
    switch (siteGlobals.mediaType) {
        case 'book':
            externalLink += 'www.goodreads.com/book/show/' + mediaData.goodreadsID;
            externalSiteLogo += 'goodreads-logo-button.png';
            break;
        case 'movie':
        case 'tv-series':
            externalLink += 'www.imdb.com/title/' + mediaData.IMDBID;
            externalSiteLogo += 'imdb-logo-button.png';
            break;
    }
    return '<a class="link-external" href="' + externalLink + '">' +
        '<button class="external-site">' +
            '<img src="' + externalSiteLogo + '">' +
        '</button>' +
    '</a>';
}

var currentMediaCountPanelPosition = 'inline'; // init
function positionMediaCountPanel(mode) {
    if (mode == currentMediaCountPanelPosition) return; // already done!
    switch (mode) { // first, validate the mode
        case 'fixed':
        case 'inline':
            break; // ok
        default:
            return;
    }
    var el = document.getElementById('mediaCountPanel');
    switch (mode) {
        case 'fixed': // move the panel from inline to fixed
            el.style.width = el.offsetWidth + 'px';
            el.style.top = 0;
            el.style.position = 'fixed';
            break;
        case 'inline': // mode the panel from fixed to inline
            el.style.position = 'static';
            el.style.width = '100%';
            break;
    }
    currentMediaCountPanelPosition = mode; // update global
}

function showMediaCount(status) {
    // use 'visibility' here to hide the number of search results, but not
    // collapse the element
    var visibility = status ? 'visible' : 'hidden';
    document.querySelector('.media-count-area').style.visibility = visibility;
}

function renderMediaCount() {
    if (filteredList.length == 0) {
        document.getElementById('xOfYMediaCount').style.display = 'none';
        document.getElementById('noMediaCount').style.display = 'inline';
    } else {
        document.getElementById('noMediaCount').style.display = 'none';
        document.getElementById('xOfYMediaCount').style.display = 'inline';
        document.getElementById('numMediaShowing').innerHTML = getNumMediaShowing();
        document.getElementById('totalMediaFound').innerHTML = numMediaFound;
        document.getElementById('searchTypeDescription').innerHTML = (
            (searchText.current != '') ?
            'search results' :
            'total ' + easyPlural(siteGlobals.mediaType, 's')
        );
    }
}

function getRenderedTitle(mediaData) {
    var renderedTitle = mediaData.title;
    switch (siteGlobals.mediaType) {
        case 'book':
            renderedTitle = '<i>' + renderedTitle + '</i> by ' + mediaData.author;
            break;
        case 'tv-series':
            renderedTitle += ' Season ' + mediaData.season;
            break;
    }
    renderedTitle += ' (' + mediaData.year + ')';
    var searchTermsList = getSearchTermsList(searchText.current);
    renderedTitle = underlineSearch(searchTermsList, renderedTitle);
    return renderedTitle;
}

// media-data manipulation functions

// if the url is for 1 media item then return that item's id, else null
function getMediaIDFromURL() {
    // split a path like /<media>-reviews/birdbox/ or
    // /<media>-reviews/id/index.html into
    // ['', '<media>-reviews', 'id', ''] or
    // ['', '<media>-reviews', 'id', 'index.html']
    var pathPieces = window.location.pathname.split('/');
    if (pathPieces.length != 4) return null; // '/x-reviews/' or '/x/index.html'
    return pathPieces[2];
}

function getThumbnailBasename(mediaID, state) {
    // keep this function in sync with generate_thumbnail_basename in
    // themes/thematrix/plugins/media-reviews/grunt.py
    switch (state) {
        case 'original':
        case 'larger':
        case 'thumb':
            return state + '-' + mediaID;
        default:
            throw 'bad state';
    }
}

function underlineSearch(searchTerms, mediaRenderedTitle) {
    for (var i = 0; i < searchTerms.length; i++) {
        var searchTerm = searchTerms[i];
        var regexPattern = new RegExp('(' + searchTerm + ')', 'i');
        mediaRenderedTitle = mediaRenderedTitle.replace(regexPattern, '<u>$1</u>');
    }
    return mediaRenderedTitle;
}

function get1MediaIDandHash(mediaItemIndex) {
    var basic1MediaData = null; // init
    if (filteredList == 'all') {
        basic1MediaData = fullList[mediaItemIndex];
    } else if (mediaItemIndex < filteredList.length) {
        // if filteredList[mediaItemIndex] is not in fullList then
        // basic1MediaData will be undefined
        basic1MediaData = fullList[filteredList[mediaItemIndex]];
    }
    if (basic1MediaData == null) return null; // gone off the end of fullList
    return {
        id_: basic1MediaData[0],
        jsonDataFileHash: basic1MediaData[1]
    };
}

function getMediaID(mediaData) {
    var id = '';
    switch (siteGlobals.mediaType) {
        case 'book':
            id = mediaData.author + ' ' + mediaData.title + ' ' + mediaData.year;
            break;
        case 'tv-series':
            id = mediaData.title + ' s' + leftPad(mediaData.season, 2, '0') +
            ' ' + mediaData.year;
            break;
        case 'movie':
            id = mediaData.title + ' ' + mediaData.year;
            break;
    }
    return id.
    replace(/\s+/g,'-'). // replace all whitespace with a dash
    replace(/[^a-z0-9-]*/gi, ''). // remove any non-alphanumeric characters
    toLowerCase();
}

/*function mediaID2Index(id) {
    if (id === null) return null;
    var mediaIndex = completeMediaSearchIDs.indexOf(id);
    if (mediaIndex < 0) return null;
    return mediaIndex;
}*/

// infinite scroll functionality

function positionMediaCounter() {
    var countAreaEl = document.getElementsByClassName('media-count-area')[0];
    positionMediaCountPanel(
        isScrolledTo(countAreaEl, 'above') ? 'fixed' : 'inline'
    );
}

footerEl = document.getElementsByTagName('footer')[0];
function infiniteLoader() {
    if (loadingStatus.faux == 'on') return;
    if (areAllMediaItemsRendered()) return;

    if (!isScrolledTo(footerEl, 'view', 'partially')) return;
    loading('on', true); // faux
    var useFirst10_ = false; // first get the full list
    downloadMediaLists(useFirst10_, function () {
        renderNextPage(function () {
            var hideFromDisplay = areAllMediaItemsRendered();
            var faux = !hideFromDisplay;
            loading('off', faux);
        });
    });
}

function areAllMediaItemsRendered() {
    return (nextMediaIndex == numMediaFound);
}

function getNumMediaShowing() {
    return (nextMediaIndex - numMediaDownloadFail);
}

/*function defunct__renderMoreMedia() {
    if (numMediaShowing >= searchResultIndexes.length) return; // no more media to show
    loading('on');

    // add a container where all the new media will be placed. it is quicker
    // for the browser to add them all at once like this since it takes fewer
    // dom manipilations.
    var moreMediaEl = document.createElement('div');
    moreMediaEl.className = 'moreMediaReviews';

    var pointer = numMediaShowing; // init
    var moreMediaHTML = ''; // init

    // get the next pageSize media to show
    for (var i = 0; i < pageSize; i++) {
        if (pointer >= searchResultIndexes.length) break; // we have run out of media to show
        var mediaIndex = searchResultIndexes[pointer];
        var mediaData = completeMediaData[mediaIndex];
        moreMediaHTML += generateMediaHTML(mediaData);
        if (((pointer + 1) % reviewsPerAd) == 0) {
            moreMediaHTML += inFeedAdContainer;
        }
        pointer++;
    }
    moreMediaEl.innerHTML = moreMediaHTML;
    numMediaShowing += i; // global
    setTimeout(function () {
        document.getElementById('reviewsArea').appendChild(moreMediaEl);
        populateInFeedAds();
        renderMediaCount();
        loading('off');
    }, 1000);
}*/

// searching

// equivalent of clicking the search button
// note: this will only show the first page of <media>s
function triggerSearch() {
    getSearchValues();
    if (!anySearchChanges()) {
        loading('off', true); // faux
        removeGlassCase('searchBox', true);
        return;
    }
    // backup the search early on to prevent accidental re-triggering due to
    // left/right arrow navigation within the search box
    saveCurrentSearch();

    clearRenderedMedia();
    loading('on'); // faux & display
    var first10Only = useFirst10();
    downloadMediaLists(first10Only, function () {
        updateFilteredListUsingSearch();
        renderNextPage(function () { // will be the first page, due to globals
            var hideFromDisplay = areAllMediaItemsRendered();
            var faux = !hideFromDisplay;
            loading('off', faux);
            removeGlassCase('searchBox', true);

            // if we previously only downloaded the first 10 media items then
            // get the full list (in the background) now
            if (first10Only) {
                first10Only = false;
                downloadMediaLists(first10Only);
            }
        });
    });
}

function getSearchValues(prefix) {
    var current = (prefix == null) ? 'current' : prefix + 'Current';
    searchText[current] = trim(document.getElementById('search').value).toLowerCase();
    sortMode[current] = document.getElementById('sortBy').value; // eg. highest-rating
}

function anySearchChanges(prefix) {
    var previous = (prefix == null) ? 'previous' : prefix + 'Previous';
    var current = (prefix == null) ? 'current' : prefix + 'Current';
    return (
        (searchText[previous] !== searchText[current]) ||
        (sortMode[previous] !== sortMode[current])
    );
}

// backup the current search so we can see if there were any changes next time
function saveCurrentSearch(prefix) {
    var previous = (prefix == null) ? 'previous' : prefix + 'Previous';
    var current = (prefix == null) ? 'current' : prefix + 'Current';
    searchText[previous] = searchText[current];
    sortMode[previous] = sortMode[current];
}

// note: when downloading only the first 10, do not also download the search
// index. this is because the first 10 will only be downloaded when there is no
// search text and the sort order is at the default value.
function downloadMediaLists(useFirst10_, callback) {
    if (callback == null) callback = function () {};
    var fullListIsDownloaded = isFullListDownloaded(useFirst10_);
    var searchIndexIsDownloaded = (useFirst10_ || isSearchIndexDownloaded());

    if (fullListIsDownloaded && searchIndexIsDownloaded) return callback();

    if (!fullListIsDownloaded) {
        fullListFileName = getFileJSONName('list', sortMode.current, useFirst10_);
        fullListDownloadStatus = 'not started'; // unlock again
        downloadFullListJSON(function () {
            // only using first 10? then we don't need the search list
            if (useFirst10_) return callback();

            // otherwise wait for both lists to download before running callback
            if (searchIndexDownloadStatus != 'complete') return;
            return callback();
        });
    }
    if (!searchIndexIsDownloaded) {
        searchIndexFileName =
        getFileJSONName('search-index', sortMode.current, useFirst10_);

        searchIndexDownloadStatus = 'not started'; // unlock again
        downloadSearchIndexJSON(function () {
            // wait for both lists to download before running callback
            if (fullListDownloadStatus != 'complete') return;
            return callback();
        });
    }
}

function useFirst10() {
    if (sortMode.current != 'highest-rating') return false;
    if (searchText.current != '') return false;
    if (getNumMediaShowing() != 0) return false;
    return true;
}

function isFullListDownloaded(useFirst10_) {
    var requiredFullListFileName =
    getFileJSONName('list', sortMode.current, useFirst10_);

    return (
        (fullListFileName == requiredFullListFileName) &&
        (fullListDownloadStatus == 'complete')
    );
}

function isSearchIndexDownloaded() {
    var requiredSearchIndexFileName =
    getFileJSONName('search-index', sortMode.current);

    return (
        (searchIndexFileName == requiredSearchIndexFileName) &&
        (searchIndexDownloadStatus == 'complete')
    );
}

function getFileJSONName(listType, sortMode_, useFirst10_) {
    useFirst10_ = (useFirst10_ == true);
    var basename = listType + '-' + sortMode_ + (useFirst10_ ? '-first-10' : '');
    var hash = siteGlobals.mediaFileHashes[basename];
    return basename + '.json?hash=' + hash;
}

function updateFilteredListUsingSearch() {
    var searchTermsList = getSearchTermsList(searchText.current);

    // indexes (eg. [0,7]) from searchIndex
    filteredList = searchMediaTitles(searchTermsList);
}

function getSearchTermsList(searchText) {
    if (searchText == '') return []; // quick
    searchText = searchText.toLowerCase(); // all searching is lowercase
    return searchText.split(/[^a-z0-9]/g).filter(function (item, i, list) {
        if (item == '') return false; // no empty items allowed in result
        return (list.indexOf(item) === i); // keep result unique
    });
}

function searchMediaTitles(searchTermsList) {
    if (searchTermsList.length == 0) {
        numMediaFound = siteGlobals.totalMediaCount;
        return 'all'; // nothing to filter
    }
    var foundResultIndexes = [];

    // use a regex to see if the search terms are in the search item
    // stackoverflow.com/a/54417192, regex101.com/r/yVXwk0/1
    // ^(?=.*DEF)(?=.*ABC)
    var regexString = '^(?=.*' + searchTermsList.join(')(?=.*') + ')';
    var regexPattern = new RegExp(regexString, 'i');

    for (var i = 0; i < searchIndex.length; i++) {
        if (!regexPattern.test(searchIndex[i])) continue;
        foundResultIndexes.push(i);
    }
    numMediaFound = foundResultIndexes.length;

    // all items contained all search terms
    if (foundResultIndexes.length == searchIndex.length) foundResultIndexes = 'all';

    return foundResultIndexes;
}

function defunct__searchMediaTitles(prependMediaIndex, searchTerms) {
    searchResultIndexes = [];
    if (searchTerms.length == 0) {
        // add all media
        for (var i = 0; searchResultIndexes.length < completeMediaSearch.length; i++) {
            if ((prependMediaIndex !== null) && (i == 0)) {
                searchResultIndexes.push(prependMediaIndex);
            }
            if (prependMediaIndex === i) continue;
            searchResultIndexes.push(i);
        }
        return searchResultIndexes;
    }
    if (prependMediaIndex !== null) searchResultIndexes.push(prependMediaIndex);
    foreach(completeMediaSearch, function (i, mediaWords) {
        if (prependMediaIndex === i) return; // continue
        var searchFail = false;
        foreach(searchTerms, function (_, searchWord) {
            // all search terms are mandatory
            if (!inArray(searchWord, mediaWords)) {
                searchFail = true;
                return false; // break from inner loop
            }
        });
        if (!searchFail && !inArray(i, searchResultIndexes)) {
            searchResultIndexes.push(i);
        }
    });
    return searchResultIndexes;
}

/*
var gettingMediaSearchList = false; // init (unlocked)
function initMediaSearchList(callback) {
    if (completeMediaSearch.length > 0) return callback(); // exit function here

    // run multiple different callbacks when the data finally arrives
    addEvent(document, 'got-media-search-list', callback);

    if (gettingMediaSearchList) return; // 1 attempt at a time
    gettingMediaSearchList = true; // lock
    ajax(
        siteGlobals.mediaSearchIndexJSON,
        function (json) {
        try {
            completeMediaSearch = JSON.parse(json);
            completeMediaSearchIDs = new Array(completeMediaSearch.length);
            for (var i = 0; i < completeMediaSearch.length; i++) {
                completeMediaSearchIDs[i] = completeMediaSearch[i].
                replace(/[^a-z0-9]* /g, '');
            }
            triggerEvent(document, 'got-media-search-list');
        }
        catch (err) {
            console.log('error in initMediaSearchList function: ' + err);
            gettingMediaSearchList = false; // unlock again
        }
    });
}

function initSearchResultIndexes() {
    // wait for both lists to be downloaded before proceeding
    if (
        completeMediaSearch.length == 0 ||
        completeMediaData.length == 0
    ) return;
    var prependMediaIndex = mediaID2Index(getMediaIDFromURL());
    generateSortedData(prependMediaIndex, ''); // init the searchResultIndexes list
}

// update searchResultIndexes (global) and return mediaSearchResults
function generateSortedData(prependMediaIndex, searchTerms) {
    searchResultIndexes = searchMediaTitles(prependMediaIndex, searchTerms);

    // get some of the media data into a tmp list. necessary for sorting.
    var mediaSearchResults = [];
    for (var i = 0; i < searchResultIndexes.length; i++) {
        var mediaIndex = searchResultIndexes[i];
        var mediaData = jsonCopyObject(completeMediaData[mediaIndex]);
        mediaData.index = mediaIndex;
        mediaSearchResults.push(mediaData);
    }

    // sort it
    var preserveFirst = (prependMediaIndex !== null);
    mediaSearchResults = sortMedia(preserveFirst, mediaSearchResults);

    // sort the global search results
    for (var i = 0; i < searchResultIndexes.length; i++) {
        searchResultIndexes[i] = mediaSearchResults[i].index;
    }
    return mediaSearchResults;
}

function mediaSortChanged() {
    debounceSearch('atStart');
    debounceSearch('atEnd');
}*/

function extraDebounceChecks(state) {
    // we are either 'atStart' or 'atMiddle'
    var extraData = {};
    var searchPrefix = 'debounce';
    getSearchValues(searchPrefix);
    extraData.anySearchChanges = anySearchChanges(searchPrefix);
    saveCurrentSearch(searchPrefix);
    extraData.extendTimeout = extraData.anySearchChanges;
    return extraData;
}

function debounceSearch(state, extraData) {
    // downloading the first page of search items takes a short while, so only
    // do this after the user has stopped typing
    switch (state) {
        case 'atStart':
            // if there are no changes then do not show the loading spinner
            if (!extraData.anySearchChanges) return;

            showRenderedMedia(false);
            scrollToElement(document.getElementById('searchBox'));
            loading('on', true); // faux
            break;
        case 'atMiddle':
            break;
        case 'atEnd':
            getSearchValues();
            if (!anySearchChanges()) {
                // note: we are comparing the changes from the previous search
                // to now - not the changes from the previous debounce to now.
                // it is possible there were changes during the debounce stage
                // but they were erased
                showRenderedMedia(true);
                loading('off', true); // faux
                return;
            }
            removeMediaIDFromUrl();
            getSearchValues('debounce'); // init for next debounce
            saveCurrentSearch('debounce'); // init for next debounce
            triggerSearch();
            break;
    }
}

/*function mediaSearchChanged() {
    archiveInFeedAds();
    document.getElementById('reviewsArea').innerHTML = '';
    var searchText = trim(document.getElementById('search').value).toLowerCase();
    var searchTerms = extractSearchTerms(searchText);
    var finalizeSearch = function () {
        // wait for both lists to be downloaded before proceeding
        if (
            completeMediaSearch.length == 0 ||
            completeMediaData.length == 0
        ) return;

        var prependMediaIndex = null;
        var mediaSearchResults = generateSortedData(prependMediaIndex, searchTerms);

        if (searchText == '') {
            numMediaShowing = completeMediaSearch.length; // global
            if (numMediaShowing > pageSize) numMediaShowing = pageSize; // max
            numTotalMedia = completeMediaSearch.length; // global
            currentlySearching = false;
            renderMediaCount();
        } else {
            numMediaShowing = searchResultIndexes.length; // global
            if (numMediaShowing > pageSize) numMediaShowing = pageSize; // max
            numTotalMedia = searchResultIndexes.length; // global
            currentlySearching = true;
            renderMediaCount();
        }

        // render the first page of the search results
        var mediaHTML = '';
        for (var i = 0; i < numMediaShowing; i++) {
            var mediaData = mediaSearchResults[i];
            mediaData.renderedTitle = highlightSearch(
                searchTerms, getRenderedTitle(mediaData)
            );
            mediaHTML += generateMediaHTML(mediaData);
            if (((i + 1) % reviewsPerAd) == 0) {
                mediaHTML += inFeedAdContainer;
            }

            // if there are less search results than reviewsPerAd then stick an
            // ad on the end anyway
            if ((numMediaShowing < reviewsPerAd) && (i + 1) == numMediaShowing) {
                mediaHTML += inFeedAdContainer;
            }
        }
        document.getElementById('reviewsArea').innerHTML = mediaHTML;
        populateInFeedAds();
    };
    // we need the search-index and the media-data lists before we can complete
    // this operation. get both lists in parallel for speed.
    initMediaSearchList(finalizeSearch);
    initCompleteMediaData(finalizeSearch);
}


var gettingCompleteMediaData = false; // init (unlocked)
function initCompleteMediaData(callback) {
    if (completeMediaData.length > 0) return callback(); // exit function here

    // run multiple different callbacks when the data finally arrives
    addEvent(document, 'got-complete-media-data', callback);

    if (gettingCompleteMediaData) return; // 1 attempt at a time
    gettingCompleteMediaData = true; // lock
    ajax(
        siteGlobals.mediaListJSON,
        function (json) {
        try {
            // get the list of all media in order of last-reviewed
            completeMediaData = JSON.parse(json);
            triggerEvent(document, 'got-complete-media-data');
        }
        catch (err) {
            console.log('error in initCompleteMediaData function: ' + err);
            gettingCompleteMediaData = false; // unlock again
        }
    });
}

function sortMedia(preserveFirst, mediaList) {
    if (mediaList.length == 0) return [];
    var sortBy = document.getElementById('sortBy').value;
    if (preserveFirst) var first = mediaList.shift(); // update mediaList
    switch (sortBy) {
        case 'newest-reviews':
            mediaList.reverse();
            if (preserveFirst) mediaList.unshift(first); // update mediaList
            return mediaList;
        case 'oldest-reviews':
            if (preserveFirst) mediaList.unshift(first); // update mediaList
            return mediaList;
    }
    mediaList.sort(function (a, b) {
        var diff = 0;
        var titleA = a.title.toLowerCase();
        var titleB = b.title.toLowerCase();
        switch (sortBy) {
            case 'highest-rating':
            case 'lowest-rating':
                if (a.rating == b.rating) {
                    // sort alphabetically for same rating media
                    if (titleA > titleB) diff = 1;
                    else if (titleA < titleB) diff = -1;
                } else {
                    if (a.rating > b.rating) diff = 1;
                    else if (a.rating < b.rating) diff = -1;
                    if (sortBy == 'highest-rating') diff *= -1;
                }
                break;
            case 'title-ascending':
            case 'title-descending':
                if (titleA > titleB) diff = 1;
                else if (titleA < titleB) diff = -1;
                if (sortBy == 'title-descending') diff *= -1;
                break;
        }
        return diff;
    });
    if (preserveFirst) mediaList.unshift(first); // update mediaList
    return mediaList;
}*/

// ajax

function downloadFullListJSON(callback) {
    if (callback == null) callback = function () {};
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/' +
    fullListFileName;

    downloadOnce(fileWithPath, function (downloadObj) {
        try {
            if (downloadObj.data == null) throw "no data";
            if (downloadObj.runCount == 1) {
                fullList = JSON.parse(downloadObj.data);
            }
            fullListDownloadStatus = 'complete'; // global
            return callback();
        }
        catch (err) {
            console.error('error in downloadFullListJSON(): ' + err);
            fullListDownloadStatus = 'fail'; // global
            callback();
        }
    });
}

function downloadSearchIndexJSON(callback) {
    if (callback == null) callback = function () {};
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/' +
    searchIndexFileName;

    downloadOnce(fileWithPath, function (downloadObj) {
        try {
            if (downloadObj.data == null) throw "no data";
            if (downloadObj.runCount == 1) {
                searchIndex = JSON.parse(downloadObj.data);
            }
            searchIndexDownloadStatus = 'complete'; // global
            return callback();
        }
        catch (err) {
            console.error('error in downloadSearchIndexJSON(): ' + err);
            searchIndexDownloadStatus = 'fail'; // global
            callback();
        }
    });
}

function download1MediaItem(minimalMediaItemObj, callback) {
    if (callback == null) callback = function () {};
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/data-' +
    minimalMediaItemObj.id_ + '.json?hash=' + minimalMediaItemObj.jsonDataFileHash;

    ajax(fileWithPath, function (json) {
        try {
            if (json == null) throw "no data";
            var mediaData = JSON.parse(json);
            mediaData.id_ = getMediaID(mediaData);
            callback('complete', mediaData);
        }
        catch (err) {
            console.error(
                'error in download1MediaItem() for ' + fileWithPath +
                ': ' + err
            );
            callback('fail');
        }
    });
}

function download1MediaReview(minimalMediaItemObj, callback) {
    if (callback == null) callback = function () {};
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/review-' +
    minimalMediaItemObj.id_ + '.json?hash=' + minimalMediaItemObj.jsonDataFileHash;

    ajax(fileWithPath, function (json) {
        try {
            if (json == null) throw "no data";
            var mediaReviewText = JSON.parse(json).reviewFull;
            callback('complete', mediaReviewText);
        }
        catch (err) {
            console.error(
                'error in download1MediaReview() for ' + fileWithPath +
                ': ' + err
            );
            callback('fail');
        }
    });
}
