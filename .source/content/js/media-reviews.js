// rules:
// - so long as the url specifies a particular review (eg. /movie-reviews/birdbox2018/)
// then that review will be pinned to the top of the search results
// - if a user is viewing a pinned review page and they show interest in another
// media review, then the pinned review's id will be removed from the url
// - actions which count as showing interest in another review include:
//      - clicking on anything in another review (eg. load-button, link icon, etc)
//      - making any changes in the search area
// todo - offline warning

// globals

searchText = {
    current: '',
    previous: '', // no immediate diff
    debounceCurrent: '',
    debouncePrevious: '' // for debouncing we do not want an immediate diff
};
sortMode = {
    current: 'highest-rating',
    previous: 'highest-rating', // no immediate diff
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
mediaList = [];
mediaListFileName = ''; // name of the json file downloaded into mediaList
mediaListDownloadStatus = 'not started'; // not started, in progress, complete

// a list of all media IDs to render. shortcut: 'all' when equal to mediaList
// i.e. for default search
filteredList = 'all';

// total count that matches the search criteria. no search at the start so
// initialize to the full list count
numMediaFound = siteGlobals.totalMediaCount;

//numMediaDownloadFail = 0;
nextMediaIndex = 0; // index of div on the page, from 0 to filteredList.length - 1

addEvent(window, 'load', function () {
    resetSearchBox();
    renderNextPage(
        siteGlobals.totalMediaCount,
        true, // useFirstPageList_
        afterRendering1Page // callback
    );
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

function removeMediaIDFromUrl() {
    if (typeof window.history.replaceState == 'function') {
        var page = siteGlobals.mediaType + '-reviews/';
        window.history.replaceState(null, '', generateCleanURL(page));
    }
    else window.location.hash = '';
}

// rendering

// rendering a search page (see triggerSearch()):
// 1. first get the total number of results
//     - when the search is default, this is just the total media count
//     - when the search is not default, this requires the search list
// 2. render (a page of) placeholders < page size & search list size
// 3. populate the placeholders
// 4. only allow searching once all placeholders have been populated

function resetSearchBox() {
    // in case the browser has persisted any values for these inputs
    document.getElementById('search').value = '';
    document.getElementById('sortBy').selectedIndex = 0; // highest rating
}

function renderNextPage(totalMediaCount, useFirstPageList_, callback) {
    var pinnedMediaIndex = getPinnedMediaIndex();
    renderNextPagePlaceholders(totalMediaCount, pinnedMediaIndex);
    downloadMediaLists(useFirstPageList_, function () {
        populateMediaPlaceholders(callback);
    });
}

function clearRenderedMedia() {
    document.getElementById('reviewsArea').innerHTML = '';
    filteredList = [];
    //numMediaDownloadFail = 0;
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

function getPinnedMediaIndex() {
    var pinnedMediaEl = document.querySelector('.reviewsArea .media.pinned');
    if (pinnedMediaEl == null) return null;
    return parseInt(pinnedMediaEl.id.replace('filter-index-', ''));
}

var latestMediaEl = null;
function renderNextPagePlaceholders(totalMediaCount, skipIndex) {
    var placeholdersHTML = ''; // init
    var onFirstPage = (nextMediaIndex == 0);
    var skipOne = (skipIndex != null);
    for (
        var numPlaceholdersRendered = ((onFirstPage & skipOne) ? 1 : 0);
        numPlaceholdersRendered < siteGlobals.pageSize;
        numPlaceholdersRendered++
    ) {
        // note: nextMediaIndex is a global
        if (nextMediaIndex == skipIndex) nextMediaIndex++;
        if (nextMediaIndex >= totalMediaCount) break;

        // create the placeholders for each media item. this keeps correct
        // order regardless of the order in which the media items are
        // downloaded.
        placeholdersHTML += get1MediaItemPlaceholderHTML(nextMediaIndex);

        nextMediaIndex++;
    }
    // render all at once - fewer dom operations
    document.getElementById('reviewsArea').innerHTML += placeholdersHTML;

    // update the last existing media element for use in the infinite loader
    latestMediaEl = document.
    querySelector('#reviewsArea .media#filter-index-' + (nextMediaIndex - 1));
}

function populateMediaPlaceholders(populatedAllPlaceholdersCallback) {
    var placeholderEls = document.
    querySelectorAll('#reviewsArea .media.placeholder');

    // setup an event for when all placeholders have been populated
    addEvent(placeholderEls, '1-media-populated', function () {
        if (!areAllPlaceholdersPopulated()) return;
        populatedAllPlaceholdersCallback();
    });

    for (var mediaIndex = 0; mediaIndex < placeholderEls.length; mediaIndex++) {
        var mediaEl = placeholderEls[mediaIndex];
        populate1MediaPlaceholder(mediaEl, mediaIndex);
    }
}

function populate1MediaPlaceholder(mediaEl, mediaIndex) {
    var useFirstPageList_ = (mediaIndex < siteGlobals.pageSize);
    var minimal1MediaObj = get1MediaIDandHash(mediaIndex);
    download1MediaItem(minimal1MediaObj, function (status, mediaData) {
        switch (status) {
            case 'complete':
                fillRender1MediaItem(mediaEl, mediaIndex, mediaData);
                break;
            case 'fail':
                markFailedMediaItem(mediaEl);
                break;
        }
        triggerEvent(mediaEl, '1-media-populated');
    });
}

function areAllPlaceholdersPopulated() {
    // the .placeholder class is removed once a media item is populated
    var numPlaceholdersUnpopulated = document.
    querySelectorAll('#reviewsArea .media.placeholder').length;

    return (numPlaceholdersUnpopulated == 0);
}

function afterRendering1Page() {
    var persistThenIgnore = true;
    removeGlassCase('searchBox', persistThenIgnore);
    renderMediaCount();
    showMediaCount(true);
    searchSpinner('off');
}

/*
// render a page (eg. 10 items). wait for all to finish downloading before
// making any visible, and hide any that fail
function defunct__renderNextPage(callback) {
    if (callback == null) callback = function () {};
    var numMediaDownloadedThisPage = 0;
    var numMediaToDownloadThisPage = siteGlobals.pageSize;
    var pinnedMediaID = getMediaIDFromURL();
    //var i = 0;
    var onFirstPage = (nextMediaIndex == 0);
    /*if ((pinnedMediaID != null) && onFirstPage) {
        i = 1;
        numMediaDownloadedThisPage = 1;
    }* /
    var placeholdersHTML = '';
    for (var i = 0; i < siteGlobals.pageSize; i++, nextMediaIndex++) {
        var minimal1MediaObj = get1MediaIDandHash(nextMediaIndex);
        if (minimal1MediaObj == null) { // gone past the last item
            if (i == 0) { // there were no items for this page
                finishedDownloading1Page();
                return callback();
            }
            // note: if we get here it will always be before the first time
            // download1MediaItem()'s callback runs. not because downloading is
            // slow (it is), but because we get here synchronously first.
            numMediaToDownloadThisPage = i; // we're 1 past the last existing item
            break;
        }
        else if (minimal1MediaObj.id_ == pinnedMediaID) {
            if (onFirstPage) numMediaToDownloadThisPage--;
            else i--; // pinned, but beyond the first page
            continue;
        }

        // create the placeholders for each media item. this keeps correct
        // order regardless of the order in which the media items are
        // downloaded.
        placeholdersHTML +=
        get1MediaItemPlaceholderHTML(nextMediaIndex, minimal1MediaObj);

        (function (minimal1MediaObjLocal, mediaIndex) {
            download1MediaItem(minimal1MediaObjLocal, function (status, mediaData) {
                // note: the order in which media arrive here is unknown due to
                // internet delays
                var x = finishedDownloading1MediaItem(
                    status, mediaData, mediaIndex, numMediaDownloadedThisPage,
                    numMediaDownloadFail, numMediaToDownloadThisPage, callback
                );
                status = x.status;
                mediaData = x.mediaData;
                mediaIndex = x.mediaIndex;
                numMediaDownloadedThisPage = x.numMediaDownloadedThisPage;
                numMediaDownloadFail = x.numMediaDownloadFail;
                numMediaToDownloadThisPage = x.numMediaToDownloadThisPage;
            });
        })(minimal1MediaObj, nextMediaIndex);
    }
    // render all at once - fewer dom operations
    document.getElementById('reviewsArea').innerHTML += placeholdersHTML;
}

function finishedDownloading1MediaItem(
    status, mediaData, mediaIndex, numMediaDownloadedThisPage,
    numMediaDownloadFail, numMediaToDownloadThisPage, callback
) {
    if (status == 'complete') {
        fillRender1MediaItem(mediaIndex, mediaData);
        numMediaDownloadedThisPage++;
    } else {
        numMediaDownloadFail++;
        numMediaToDownloadThisPage--;
        removePlaceholder(mediaIndex);
    }
    if (numMediaDownloadedThisPage == numMediaToDownloadThisPage) {
        finishedDownloading1Page(mediaIndex);
        callback();
    }
    return {
        status: status,
        mediaData: mediaData,
        mediaIndex: mediaIndex,
        numMediaDownloadedThisPage: numMediaDownloadedThisPage,
        numMediaDownloadFail: numMediaDownloadFail,
        numMediaToDownloadThisPage: numMediaToDownloadThisPage
    };
}

function finishedDownloading1Page(mediaIndex) {
    showRenderedMedia(true); // if previously hidden (eg. during search debounce)
    unhideRenderedMedia();
    renderMediaCount();
    showMediaCount(true);
}
*/

var mediaPlaceholderInnerHTML = null; // init
function get1MediaItemPlaceholderHTML(mediaIndex) {
    if (mediaPlaceholderInnerHTML == null) mediaPlaceholderInnerHTML = document.
    querySelector('.media-placeholder-warehouse .media.placeholder').innerHTML;

    return '<div ' +
        ' class="media ' + siteGlobals.mediaType + ' placeholder pulsate"' +
        ' id="filter-index-' + mediaIndex + '"' +
        ' style="min-height:' + (siteGlobals.maxThumbHeight + 41) + 'px;"' +
    '>' + mediaPlaceholderInnerHTML + '</div>';
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

function fillRender1MediaItem(mediaEl, mediaIndex, mediaData) {
    mediaEl.querySelector('a.link-to-self.chain-link').href = generateCleanURL(
        siteGlobals.mediaType + '-reviews/' + mediaData.id_ + '/'
    );
    var thumbnail = mediaEl.querySelector('.thumbnail');
    addEvent(thumbnail, 'load', thumbnailLoaded);
    thumbnail.setAttribute(
        'data',
        siteGlobals.siteURL + '/' + siteGlobals.mediaType +
        '-reviews/img/' + getThumbnailBasename(mediaData.id_, 'thumb') +
        '.jpg?hash=' + mediaData.thumbnailHash
    );

    mediaEl.querySelector('.stars').innerHTML = getMediaStarsHTML(mediaData.rating);

    mediaEl.querySelector('.media-title').innerHTML = getRenderedTitle(mediaData);
    mediaEl.querySelector('.review-title').innerHTML = mediaData.reviewTitle;
    if (mediaData.spoilers) {
        mediaEl.querySelector('.spoiler-alert.has-spoilers').style.display = 'inline';
        mediaEl.querySelector('.spoiler-alert.no-spoilers').style.display = 'none';
    } else {
        mediaEl.querySelector('.spoiler-alert.has-spoilers').style.display = 'none';
        mediaEl.querySelector('.spoiler-alert.no-spoilers').style.display = 'inline';
    }
    removeCSSClass(mediaEl, 'placeholder');
    removeCSSClass(mediaEl, 'pulsate');
}

function markFailedMediaItem(mediaEl) {
    addCSSClass(mediaEl, 'failed-download');
    removeCSSClass(mediaEl, 'placeholder');
}

function thumbnailLoaded(e) {
    e.currentTarget.style.removeProperty('height');
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

/*
loadingStatus = {
    display: 'on',
    faux: 'on'
};
var loadingSpinnerEl = document.getElementById('mediaLoaderArea');
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
            loadingSpinnerEl.style.display = 'block';
            break;
        case 'off':
            loadingSpinnerEl.style.display = 'none';
            break;
    }
}
*/

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
            externalSiteLogo += 'goodreads';
            break;
        case 'movie':
        case 'tv-series':
            externalLink += 'www.imdb.com/title/' + mediaData.IMDBID;
            externalSiteLogo += 'imdb';
            break;
    }
    externalSiteLogo += '-logo-button.png';
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
        basic1MediaData = mediaList[mediaItemIndex];
    } else if (mediaItemIndex < filteredList.length) {
        // if filteredList[mediaItemIndex] is not in mediaList then
        // basic1MediaData will be undefined
        basic1MediaData = mediaList[filteredList[mediaItemIndex]];
    }
    if (basic1MediaData == null) return null; // gone off the end of mediaList
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

// infinite scroll functionality

function positionMediaCounter() {
    var countAreaEl = document.getElementsByClassName('media-count-area')[0];
    positionMediaCountPanel(
        isScrolledTo(countAreaEl, 'above') ? 'fixed' : 'inline'
    );
}

var infiniteLoaderRunning = false;
function infiniteLoader() {
    //if (loadingStatus.faux == 'on') return;
    if (infiniteLoaderRunning) return;
    infiniteLoaderRunning = true; // asap

    if (areAllMediaItemsRendered()) {
        infiniteLoaderRunning = false;
        return;
    }
    if (!isScrolledTo(latestMediaEl, 'view', 'partially')) {
        infiniteLoaderRunning = false;
        return;
    }
    var useFirstPageList_ = false; // first get the media list
    downloadMediaLists(useFirstPageList_, function () {
        renderNextPage();
    });
    infiniteLoaderRunning = false;
}

function areAllMediaItemsRendered() {
    // todo use arePlaceholdersPopulated areAllPlaceholdersPopulated()
    return (nextMediaIndex == numMediaFound);
}

function getNumMediaShowing() {
    return document.querySelectorAll('#reviewsArea .media:not(.placeholder)').
    length;
}

// searching

/*function useFirstPageList() {
    // make sure to call getSearchValues() first
    if (sortMode.current != 'highest-rating') return false;
    if (searchText.current != '') return false;
    if (getNumMediaShowing() != 0) return false;
    return true;
}*/

// equivalent of clicking the search button
// note: this will only show the first page of <media>s. infiniteLoader()
// handles later pages.
function triggerSearch(windowJustLoaded) {
    // 1. first get the total number of results
    //     - when the search is default, this is just the total media count
    //     - when the search is not default, this requires the search list
    // 2. render (a page of) placeholders < page size & search list size
    // 3. populate the placeholders
    // 4. only allow searching once all placeholders have been populated

    getSearchValues();

    // backup the search asap to prevent re-triggering due to left/right arrow
    // navigation within the search box
    saveCurrentSearch();

    clearRenderedMedia();
    showRenderedMedia(true); // if previously hidden (eg. during search debounce)

    var useFirstPageList_ = false;
    downloadMediaLists(useFirstPageList_, function () {
        updateFilteredListUsingSearch();
        renderNextPage(
            filteredList.length,
            useFirstPageList_,
            afterRendering1Page // callback
        );
    });
}
/*function defunct__triggerSearch(pageJustLoaded) {
    //archiveInFeedAds();
    getSearchValues();
    /*if (!anySearchChanges()) {
        loading('off', true); // faux loading off, display loading still on
        removeGlassCase('searchBox', true);
        return;
    }* /
    // backup the search early on to prevent accidental re-triggering due to
    // left/right arrow navigation within the search box
    saveCurrentSearch();

    if (!pageJustLoaded) clearRenderedMedia();
    //loading('on'); // faux & display
    var useFirstPageList_ = useFirstPageList();
    downloadMediaLists(useFirstPageList_, function () {
        updateFilteredListUsingSearch();
        renderNextPage(function () { // will be the first page, due to globals
            var hideFromDisplay = areAllMediaItemsRendered();
            var faux = !hideFromDisplay;
            //loading('off', faux);
            removeGlassCase('searchBox', true);

            // if we previously only downloaded the list for the first page of
            // media items then get the media list (in the background) now
            if (useFirstPageList_) {
                useFirstPageList_ = false;
                downloadMediaLists(useFirstPageList_);
            }
        });
    });
}*/

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

var searchSpinnerEl = document.getElementById('mediaSearchLoaderArea');
function searchSpinner(status) {
    switch (status) {
        case 'on':
            searchSpinnerEl.style.display = 'block';
            break;
        case 'off':
            searchSpinnerEl.style.display = 'none';
            break;
    }
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
            searchSpinner('on');
            break;
        case 'atMiddle':
            break;
        case 'atEnd':
            getSearchValues();
            if (!anySearchChanges()) {
                searchSpinner('off');
                // note: we are comparing the changes from the previous search
                // to now - not the changes from the previous debounce to now.
                // it is possible there were changes during the debounce stage
                // but they were erased
                showRenderedMedia(true);
                return;
            }
            removeMediaIDFromUrl();
            getSearchValues('debounce'); // init for next debounce
            saveCurrentSearch('debounce'); // init for next debounce
            triggerSearch();
            break;
    }
}

// downloads

// note: when downloading only the first 10, do not also download the search
// index. this is because the first 10 will only be downloaded when there is no
// search text and the sort order is at the default value.
function downloadMediaLists(useFirstPageList_, callback) {
    if (callback == null) callback = function () {};
    var mediaListIsDownloaded = isMediaListDownloaded(useFirstPageList_);
    var searchIndexIsDownloaded = (useFirstPageList_ || isSearchIndexDownloaded());

    if (mediaListIsDownloaded && searchIndexIsDownloaded) return callback();

    if (!mediaListIsDownloaded) {
        mediaListFileName = getFileJSONName(
            'list', sortMode.current, useFirstPageList_
        );
        mediaListDownloadStatus = 'not started'; // unlock again
        downloadMediaListJSON(function () {
            // only using first 10? then we don't need the search list
            if (useFirstPageList_) return callback();

            // otherwise wait for both lists to download before running callback
            if (searchIndexDownloadStatus != 'complete') return;
            return callback();
        });
    }
    if (!searchIndexIsDownloaded) {
        searchIndexFileName =
        getFileJSONName('search-index', sortMode.current, useFirstPageList_);

        searchIndexDownloadStatus = 'not started'; // unlock again
        downloadSearchIndexJSON(function () {
            // wait for both lists to download before running callback
            if (mediaListDownloadStatus != 'complete') return;
            return callback();
        });
    }
}

function isMediaListDownloaded(useFirstPageList_) {
    var requiredMediaListFileName =
    getFileJSONName('list', sortMode.current, useFirstPageList_);

    return (
        (mediaListFileName == requiredMediaListFileName) &&
        (mediaListDownloadStatus == 'complete')
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

function downloadMediaListJSON(callback) {
    if (callback == null) callback = function () {};
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/' +
    mediaListFileName;

    downloadOnce(fileWithPath, function (downloadObj) {
        try {
            if (downloadObj.data == null) throw "no data";
            if (downloadObj.runCount == 1) {
                mediaList = JSON.parse(downloadObj.data);
            }
            mediaListDownloadStatus = 'complete'; // global
            return callback();
        }
        catch (err) {
            console.error('error in downloadMediaListJSON(): ' + err);
            mediaListDownloadStatus = 'fail'; // global
            callback();
        }
    });
}

function downloadSearchIndexJSON(callback) {
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
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/data-' +
    minimalMediaItemObj.id_ + '.json?hash=' + minimalMediaItemObj.jsonDataFileHash;

    ajax(fileWithPath, function (json) {
        try {
            if (json == null) throw "no data";
            var mediaData = JSON.parse(json);
            mediaData.id_ = getMediaID(mediaData);
            if (callback != null) callback('complete', mediaData);
        }
        catch (err) {
            console.error(
                'error in download1MediaItem() for ' + fileWithPath + ': ' + err
            );
            if (callback != null) callback('fail');
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

function getFileJSONName(listType, sortMode_, useFirstPageList_) {
    useFirstPageList_ = (useFirstPageList_ == true);

    var basename = listType + '-' + sortMode_ +
    (useFirstPageList_ ? '-first-' + siteGlobals.pageSize : '');

    var hash = siteGlobals.mediaFileHashes[basename];
    return basename + '.json?hash=' + hash;
}
