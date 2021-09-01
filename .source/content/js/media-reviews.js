// rules:
// - so long as the url specifies a particular review (eg. /movie-reviews/birdbox2018/)
// then that review will be pinned to the top of the search results
// - if a user is viewing a pinned review page and they show interest in another
// media review, then the pinned review's id will be removed from the url
// - actions which count as showing interest in another review include:
//      - clicking on anything in another review (eg. load-button, link icon, etc)
//      - making any changes in the search area
// todo - offline warning and disable search when offline

do a search - after() is being called twice

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
// initialize to the full list count. always an int
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

    // note: if media lists are already downloaded then this just passes through
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
    } else { // hide
        document.getElementById('reviewsArea').style.display = 'none';
        hideAllSkyscraperAds();
    }
}

function getPinnedMediaIndex() {
    var pinnedMediaEl = document.querySelector('#reviewsArea .media.pinned');
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
    if (nextMediaIndex == 0) latestMediaEl = null; // no search results
    else latestMediaEl = document.
    querySelector('#reviewsArea .media#filter-index-' + (nextMediaIndex - 1));
}

function populateMediaPlaceholders(populatedAllPlaceholdersCallback) {
    var placeholderEls = document.
    querySelectorAll('#reviewsArea .media.placeholder');

    // set up an event for when all placeholders have been populated
    addEvent(placeholderEls, '1-media-populated', function () {
        if (!areAllPlaceholdersPopulated()) return;
        if (populatedAllPlaceholdersCallback != null) {
            populatedAllPlaceholdersCallback();
        }
    });

    for (var i = 0; i < placeholderEls.length; i++) {
        var mediaEl = placeholderEls[i];
        populate1MediaPlaceholder(mediaEl);
    }
    if (
        (placeholderEls.length == 0) &&
        (populatedAllPlaceholdersCallback != null)
    ) populatedAllPlaceholdersCallback();
}

function populate1MediaPlaceholder(mediaEl) {
    var mediaIndex = parseInt(mediaEl.id.replace('filter-index-', ''));
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
    var thumbnailEl = mediaEl.querySelector('.thumbnail');
    thumbnailEl.height = mediaData.thumbnailHeight;
    thumbnailEl.src = siteGlobals.siteURL + '/' + siteGlobals.mediaType +
    '-reviews/img/' + getThumbnailBasename(mediaData.id_, 'thumb') +
    '.jpg?hash=' + mediaData.thumbnailHash;
    thumbnailEl.alt = 'thumbnail for ' + mediaData.title;
    /*unfortunately, this doesn't work. img-load events do not fire when more
    than one page of images is loaded immediately.
    var img = new Image();
    addEvent(img, 'load', function() { thumbnailLoaded(thumbnailEl); });
    img.src = siteGlobals.siteURL + '/' + siteGlobals.mediaType +
    '-reviews/img/' + getThumbnailBasename(mediaData.id_, 'thumb') +
    '.jpg?hash=' + mediaData.thumbnailHash;
    thumbnailEl.src = img.src;
    thumbnailEl.setAttribute(
        'data',
        siteGlobals.siteURL + '/' + siteGlobals.mediaType +
        '-reviews/img/' + getThumbnailBasename(mediaData.id_, 'thumb') +
        '.jpg?hash=' + mediaData.thumbnailHash
    );*/

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
    // unimplemented
    addCSSClass(mediaEl, 'failed-download');
    removeCSSClass(mediaEl, 'placeholder');
}

/*function thumbnailLoaded(el) {
// https://stackoverflow.com/questions/5820209/image-onload-event-not-working-in-chrome/5821388
    //e.currentTarget.style.removeProperty('height');
    el.style.removeProperty('height');
    removeCSSClass(el.up(2), 'pulsate');
}*/

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
    if (numMediaFound == 0) { // search returned no results
        document.getElementById('noMediaCount').style.display = 'inline';
        document.getElementById('xOfYMediaCount').style.display = 'none';
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
    renderedTitle = htmlUnderline(searchTermsList, renderedTitle);
    return renderedTitle;
}

function htmlUnderline(needleList, haystack) {
    for (var i = 0; i < needleList.length; i++) {
        var needle = needleList[i];
        var regexPattern = new RegExp('(' + needle + ')', 'i');
        haystack = haystack.replace(regexPattern, '<u>$1</u>');
    }
    return haystack;
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
    var useFirstPageList_ = false; // already passed the first page
    renderNextPage(numMediaFound, useFirstPageList_, afterRendering1Page);
    infiniteLoaderRunning = false; // allow multiple placeholder pages at once
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
            numMediaFound,
            useFirstPageList_,
            afterRendering1Page // callback
        );
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
            // if there are no changes then do not show the search spinner
            if (!extraData.anySearchChanges) return;

            showRenderedMedia(false);
            showMediaCount(false);
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
                showMediaCount(true);
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
