// rules:
// - so long as the url specifies a particular review (eg. /movie-reviews/birdbox2018/)
// then that review will be pinned to the top of the search results
// - if a user is viewing a pinned review page and they show interest in another
// media review, then the pinned review's id will be removed from the url
// - actions which count as showing interest in another review include:
//      - clicking on anything in another review (eg. load-button, link icon, etc)
//      - making any changes in the search area

// init globals
initialMediaData = []; // static list of initial media data
completeMediaSearch = []; // static index of media searches
completeMediaSearchIDs = []; // same as completeMediaSearch but with IDs not names and years
completeMediaData = []; // static list of all media data
searchResultIndexes = []; // all media indexes that match the search. in order. used for paging.
numTotalMedia = 0; // total count that match the search criteria
numMediaShowing = 0;
pageSize = 10; // load this many media at once in the infinite scroll page
currentlySearching = false;
reviewsPerAd = 3; // this many reviews before each in-feed ad
inFeedAdContainer = '<div class="in-feed-ad-container"></div>';

addEvent(window, 'load', function () {
    initMediaRendering();
    initMediaSearchList(initSearchResultIndexes);
    initCompleteMediaData(initSearchResultIndexes);
    addEvent(
        document.getElementById('search'),
        'keyup',
        debounce(debounceMediaSearch, 2000, 'both')
    );
    addEvent(document.getElementById('sortBy'), 'change', mediaSortChanged);
    addEvent(document.getElementById('reviewsArea'), 'click', loadFullReview);
    addEvent(document.getElementById('reviewsArea'), 'click', linkTo1Media);

    // scroll with debounce
    var lastKnownScrollPosition = 0;
    var ticking = false;
    addEvent(window, 'scroll', function(e) {
        lastKnownScrollPosition = window.scrollY;
        if (ticking) return;
        setTimeout(function() {
            positionMediaCounter();
            infiniteLoader();
            ticking = false;
        }, 200); // check 5 times per second
        ticking = true;
    });
});

// rendering

function initMediaRendering() {
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
        location.href = el.href;
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

function linkToSelf(mediaEl) {
    currentlySearching = false;
    foreach(document.querySelectorAll('.media.pinned'), function(_, otherMediaEl) {
        removeCSSClass(otherMediaEl, 'pinned');
    });
    addCSSClass(mediaEl, 'pinned');
    if (typeof window.history.replaceState == 'function') {
        var url = siteGlobals.mediaType + '-reviews/' + mediaEl.id + '/';
        window.history.replaceState(null, '', generateCleanURL(url));
    }
    else window.location.hash = '#!' + mediaEl.id;
    return false; // prevent bubble up
}

var loadingStatus = 'on';
function loading(status) {
    switch (status) {
        case 'on':
            document.getElementById('mediaLoaderArea').style.display = 'block';
            loadingStatus = 'on';
            break;
        case 'off':
            document.getElementById('mediaLoaderArea').style.display = 'none';
            loadingStatus = 'off';
            break;
    }
}

function generateInitialMediaHTML(mediaID, idInInitialList) {
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
}
function generateMediaHTML(mediaData, pinned) {
    var mediaID = getMediaID(mediaData);
    pinned = pinned ? ' pinned' : '';
    var renderedTitle = getRenderedTitle(mediaData);
    var style = '';
    if (mediaData.spoilers) style = ' style="color:red;"';
    var loadReviewButton = '<button class="load-review" id="load-' + mediaID + '">' +
        'load review' +
    '</button><br>' +
    '<span class="review-explanation"' + style + '>' +
        '(this review ' + (mediaData.spoilers ? 'contains' : 'has no') + ' spoilers)' +
    '</span>';
    var review = '';
    if (mediaData.hasOwnProperty('review')) review = formatReview(mediaData.review);
    else review = loadReviewButton;
    var imgSrc = siteGlobals.siteURL + '/img/' + generateThumbnailBasename(
        siteGlobals.mediaType, mediaID, 'thumb'
    ) + '.jpg?hash=' + mediaData.thumbnailHash;
    var titleLink = 'https://';
    switch (siteGlobals.mediaType) {
        case 'book':
            titleLink += 'www.goodreads.com/book/show/' + mediaData.goodreadsID;
            break;
        case 'movie':
        case 'tv-series':
            titleLink += 'www.imdb.com/title/' + mediaData.IMDBID;
            break;
    }
    var href = generateCleanURL(siteGlobals.mediaType + '-reviews/' + mediaID + '/');
    return '<div class="media' + pinned + '" id="' + mediaID + '">' +
        '<a' +
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
            '<img src="' + imgSrc + '" alt="' + mediaData.title + ' ' +
            siteGlobals.mediaType + ' thumbnail">' +
            '<div class="stars">' +
                generateMediaStarsHTML(mediaData.rating) +
            '</div>' +
        '</div>' +
        '<a href="' + titleLink + '">' +
            '<h3 class="media-title">' + renderedTitle + '</h3>' +
        '</a>' +
        '<h4 class="review-title">' + mediaData.reviewTitle + '</h4>' +
        '<div class="review-text">' + review + '</div>' +
    '</div>';
}

function generateThumbnailBasename(mediaType, mediaID, state) {
    // keep this function in sync with generate_thumbnail_basename in
    // themes/thematrix/plugins/media-reviews/grunt.py
    switch (state) {
        case 'original':
        case 'larger':
        case 'thumb':
            return mediaType + '-' + state + '-' + mediaID;
        default:
            throw 'bad state';
    }
}

function loadFullReview(e) {
    if (
        e.target.tagName.toLowerCase() != 'button'
        || typeof e.target.className != 'string'
        || !inArray('load-review', e.target.className)
    ) return;

    var mediaID = e.target.id.replace('load-', '');
    foreach(document.querySelectorAll('.media.pinned'), function(_, otherMediaEl) {
        if (otherMediaEl.id == mediaID) return; // do not unpin self
        removeCSSClass(otherMediaEl, 'pinned');
    });
    if (typeof window.history.replaceState == 'function') {
        var url = siteGlobals.mediaType + '-reviews/';
        window.history.replaceState(null, '', generateCleanURL(url));
    }
    else window.location.hash = '';

    var mediaIndex = mediaID2Index(mediaID);
    if (completeMediaData[mediaIndex].hasOwnProperty('review')) {
        e.target.parentNode.innerHTML = formatReview(
            completeMediaData[mediaIndex].review
        );
        return;
    }
    ajax(
        '/json/' + siteGlobals.mediaType + '-review-' + mediaID + '.json?hash=' +
        completeMediaData[mediaIndex].reviewHash,

        function (json) {
        try {
            var fullReviewText = JSON.parse(json).reviewFull;
            e.target.parentNode.innerHTML = formatReview(fullReviewText);
            completeMediaData[mediaIndex].review = fullReviewText;
        }
        catch (err) {
            console.log('error in loadFullReview function: ' + err);
        }
    });
}

function formatReview(review) {
    review = review.replace(/##siteGlobals.siteURL##/g, siteGlobals.siteURL);

    // if the review uses paragraph tags then do not modify it
    if (inArray('<p>', review)) return review;

    return '<p>' + review.replace(/\n/g, '</p><p>') + '</p>';
}

function generateMediaStarsHTML(mediaDataRating) {
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

function highlightSearch(searchTerms, mediaRenderedTitle) {
    foreach(searchTerms, function(_, searchTerm) {
        var regexPattern = new RegExp('(' + searchTerm + ')', 'i');
        mediaRenderedTitle = mediaRenderedTitle.replace(regexPattern, '<u>$1</u>');
    });
    return mediaRenderedTitle;
}

function renderMediaCount() {
    if (numTotalMedia == 0) {
        document.getElementById('xOfYMediaCount').style.display = 'none';
        document.getElementById('noMediaCount').style.display = 'inline';
    } else {
        document.getElementById('noMediaCount').style.display = 'none';
        document.getElementById('xOfYMediaCount').style.display = 'inline';
        document.getElementById('numMediaShowing').innerHTML = numMediaShowing;
        document.getElementById('totalMediaFound').innerHTML = numTotalMedia;
        document.getElementById('searchTypeDescription').innerHTML = (
            currentlySearching ?
            'search results' :
            'total ' + easyPlural(siteGlobals.mediaType, 's')
        );
    }
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

// if the url is for 1 media item then return that item's id, else null
function getMediaIDFromURL() {
    if (window.location.hash.length > 0) {
        if (window.location.hash.substr(0, 2) == '#!') {
            return window.location.hash.replace('#!', ''); // does not update hash
        }
        // malformed media id - eg. /#birdbox (should be /#!birdbox)
        return null;
    }
    var pathPieces = window.location.pathname.split('/');
    if (pathPieces.length != 4) return null; // '/x-reviews/' or '/x/index.html'
    return pathPieces[2]; // '/book-reviews/abc/'
}

// infinite scroll functionality

function positionMediaCounter() {
    var countAreaEl = document.getElementsByClassName('media-count-area')[0];
    positionMediaCountPanel(
        isScrolledTo(countAreaEl, 'above') ? 'fixed' : 'inline'
    );
}

function infiniteLoader() {
    if (loadingStatus == 'on') return;

    var footerEl = document.getElementsByTagName('footer')[0];
    if (!isScrolledTo(footerEl, 'view', 'partially')) return;
    renderMoreMedia();
}

function renderMoreMedia() {
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
}

// searching

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
                replace(/[^a-z0-9]*/g, '');
            }
            triggerEvent(document, 'got-media-search-list');
        }
        catch (err) {
            console.log('error in initMediaSearchList function: ' + err);
            gettingMediaSearchList = false; // unlock again
        }
    });
}

function getMediaID(mediaData) {
    var id = '';
    switch (siteGlobals.mediaType) {
        case 'book':
            id = mediaData.author + mediaData.title + mediaData.year;
            break;
        case 'tv-series':
            id = mediaData.title + mediaData.season + mediaData.year;
            break;
        case 'movie':
            id = mediaData.title + mediaData.year;
            break;
    }
    return id.replace(/[^a-z0-9]*/gi, '').toLowerCase();
}

function getRenderedTitle(mediaData) {
    if (mediaData.hasOwnProperty('renderedTitle')) return mediaData.renderedTitle;
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
    return renderedTitle;
}

function mediaID2Index(id) {
    if (id === null) return null;
    var mediaIndex = completeMediaSearchIDs.indexOf(id);
    if (mediaIndex < 0) return null;
    return mediaIndex;
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
    debounceMediaSearch('atStart');
    debounceMediaSearch('atEnd');
}

function debounceMediaSearch(state) {
    // archiving the in-feed ads takes ages for browsers, so only do this and
    // update the search-results after the user has stopped typing
    switch (state) {
        case 'atStart':
            scrollToElement(document.getElementById('searchBox'));
            if (typeof window.history.replaceState == 'function') {
                var page = siteGlobals.mediaType + '-reviews/';
                window.history.replaceState(null, '', generateCleanURL(page));
            }
            else window.location.hash = '';
            hideAllSkyscraperAds();
            document.getElementById('reviewsArea').style.display = 'none';

            // hide the number of search results, but do not collapse the element
            document.querySelector('.media-count-area').style.visibility = 'hidden';

            loading('on');
            break;
        case 'atEnd':
            document.getElementById('reviewsArea').style.display = 'block';

            // show the number of search results
            document.querySelector('.media-count-area').style.visibility = 'visible';

            mediaSearchChanged();
            loading('off');
            break;
    }
}

function mediaSearchChanged() {
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

function extractSearchTerms(searchText) {
    if (searchText == '') return []; // quick
    return searchText.split(/[^a-z0-9]/gi).map(function(v) {
        return v.toLowerCase();
    }).filter(function(item, i, list) {
        if (item == '') return false; // no empty items in result
        return list.indexOf(item) === i; // keep result unique
    });
}

function searchMediaTitles(prependMediaIndex, searchTerms) {
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
    mediaList.sort(function(a, b) {
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
}
