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

searchText = '';
sortMode = ''; // value of the search box dropdown (eg. 'highest-first')
previousSearchText = null; // always init to null
previousSortMode = null; // always init to null

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

// in feed ads have been replaced with a bottom-anchor ad
// todo - remove entirely
//inFeedAdContainer = '<div class="in-feed-ad-container"></div>';
inFeedAdContainer = '';

addEvent(window, 'load', function () {
    resetSearchBox();
    triggerSearch();
    addEvent(document.getElementById('sortBy'), 'change', triggerSearch);
    addEvent(
        document.getElementById('search'),
        'keyup',
        debounce(debounceMediaSearch, 1000, 'both')
    );
/*
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
*/
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

function resetSearchBox() {
    // in case the browser has persisted any values for these inputs
    document.getElementById('search').value = '';
    document.getElementById('sortBy').selectedIndex = 0; // highest rating
}

function clearRenderedMedia() {
    document.getElementById('reviewsArea').innerHTML = '';
    filteredList = [];
    numMediaShowing = 0;
}

// render a page (eg. 10 items). wait for all to finish downloading before
// making any visible, and hide any that fail
function renderNextPage(callback) {
    var numMediaDownloaded = 0;
    var thisPageSize = pageSize;

    for (var itemI = 0; itemI < pageSize; itemI++) {
        var minimal1MediaObj = get1MediaIDandHash(itemI + numMediaShowing);
        if (minimal1MediaObj == null) break; // gone past the last item

        // create the placeholders for each media item. this keeps correct order
        // regardless of the order in which the media items are downloaded.
        render1MediaItemPlaceholder(minimal1MediaObj);

        download1MediaItem(minimal1MediaObj, function(status, mediaData) {
            if (status == 'complete') {
                fillRender1MediaItem(mediaData);
                numMediaDownloaded++;
            } else {
                thisPageSize--;
                removePlaceholder(minimal1MediaObj);
            }
            if (numMediaDownloaded == thisPageSize) {
                unhideRenderedMedia();
                numMediaShowing += numMediaDownloaded;
                renderMediaCount();
                callback();
            }
        });
    }
}

function render1MediaItemPlaceholder(minimal1MediaObj) {
    document.getElementById('reviewsArea').innerHTML += '<div ' +
        ' class="media ' + siteGlobals.mediaType + ' hidden"' +
        ' id="' + minimal1MediaObj.id_ + '"' +
    '></div>';
}

function removePlaceholder(minimal1MediaObj) {
    deleteElement(document.getElementById(minimal1MediaObj.id_));
}

function unhideRenderedMedia() {
    var hiddenMediaDivs =
    document.querySelectorAll('#reviewsArea .media.hidden');

    foreach(hiddenMediaDivs, function (i, el) {
        el.style.display = 'block';
    });
}

function fillRender1MediaItem(mediaData) {
    document.getElementById(mediaData.id_).innerHTML = get1MediaHTML(mediaData);
}

function removeMediaIDFromUrl() {
    if (typeof window.history.replaceState == 'function') {
        var page = siteGlobals.mediaType + '-reviews/';
        window.history.replaceState(null, '', generateCleanURL(page));
    }
    else window.location.hash = '';
}

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

function linkToSelf(mediaEl) {
    currentlySearching = false;
    foreach(document.querySelectorAll('.media.pinned'), function(_, otherMediaEl) {
        removeCSSClass(otherMediaEl, 'pinned');
    });
    addCSSClass(mediaEl, 'pinned');
    if (typeof window.history.replaceState == 'function') {
        var url = siteGlobals.mediaType + '-reviews/' + mediaEl.id_ + '/';
        window.history.replaceState(null, '', generateCleanURL(url));
    }
    else window.location.hash = '#!' + mediaEl.id_;
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

function get1MediaHTML(mediaData) {
    var renderedTitle = getRenderedTitle(mediaData);
    var spoilerAlert = getSpoilerAlert(mediaData);
    var loadReviewButton = getLoadReviewButton(mediaData);
    var review = '';
    if (mediaData.hasOwnProperty('review')) review = formatReview(mediaData.review);
    else review = loadReviewButton;
    var imgSrc = siteGlobals.siteURL + '/' + siteGlobals.mediaType +
    '-reviews/img/' + generateThumbnailBasename(mediaData.id_, 'thumb') +
    '.jpg?hash=' + mediaData.thumbnailHash;
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
        '<img src="' + imgSrc + '" class="thumbnail" ' +
        'alt="' + mediaData.title + ' ' + siteGlobals.mediaType +
        ' thumbnail">' +
        '<div class="stars">' +
            getMediaStarsHTML(mediaData.rating) +
        '</div>' +
    '</div>' +
    '<h3 class="media-title">' + renderedTitle + '</h3>' +
    '<h4 class="review-title">' + mediaData.reviewTitle + '</h4>' +
    '<div class="review-text">' +
        spoilerAlert +
        '<br>' +
        review +
        getExternalLinkButton(mediaData)
    '</div>';
}

function getSpoilerAlert(mediaData) {
    var style = '';
    if (mediaData.spoilers) style = ' style="color:red;"';
    return '<span class="review-explanation"' + style + '>' +
        '(this review ' +
        (mediaData.spoilers ? 'contains' : 'has no') +
        ' spoilers)' +
    '</span>';
}

function getLoadReviewButton(mediaData) {
    return '<button class="load-review" id="load-' + mediaData.id_ + '">' +
        'load review' +
    '</button>';
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

function getExternalLinkButton(mediaData) {
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

function renderMediaCount() {
    if (filteredList.length == 0) {
        document.getElementById('xOfYMediaCount').style.display = 'none';
        document.getElementById('noMediaCount').style.display = 'inline';
    } else {
        document.getElementById('noMediaCount').style.display = 'none';
        document.getElementById('xOfYMediaCount').style.display = 'inline';
        document.getElementById('numMediaShowing').innerHTML = numMediaShowing;
        document.getElementById('totalMediaFound').innerHTML = numMediaFound;
        document.getElementById('searchTypeDescription').innerHTML = (
            currentlySearching ?
            'search results' :
            'total ' + easyPlural(siteGlobals.mediaType, 's')
        );
    }
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

function generateThumbnailBasename(mediaID, state) {
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

function highlightSearch(searchTerms, mediaRenderedTitle) {
    foreach(searchTerms, function(_, searchTerm) {
        var regexPattern = new RegExp('(' + searchTerm + ')', 'i');
        mediaRenderedTitle = mediaRenderedTitle.replace(regexPattern, '<u>$1</u>');
    });
    return mediaRenderedTitle;
}

function get1MediaIDandHash(mediaItemIndex) {
    var basic1MediaData = null; // init
    if (filteredList == 'all') basic1MediaData = fullList[mediaItemIndex];
    else basic1MediaData = fullList[filteredList[mediaItemIndex]];
    if (basic1MediaData == null) return null; // gone past the end
    return {
        id_: basic1MediaData[0],
        jsonDataFileHash: basic1MediaData[1]
    };
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

function mediaID2Index(id) {
    if (id === null) return null;
    var mediaIndex = completeMediaSearchIDs.indexOf(id);
    if (mediaIndex < 0) return null;
    return mediaIndex;
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
    loading('on');
    renderNextPage(function() {
        loading('off');
    });
}

function defunct__renderMoreMedia() {
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

// equivalent of clicking the search button
// note: this will only show the first page of <media>s
function triggerSearch() {
    getSearchValues();
    if (!anySearchChanges()) {
        loading('off');
        removeGlassCase('searchBox', true);
        return;
    }
    clearRenderedMedia();
    loading('on');
    var first10Only = useFirst10();
    downloadMediaLists(first10Only, function() {
        updateFilteredListUsingSearch();
        renderNextPage(function() { // will be the first page, due to globals
            loading('off');
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

function getSearchValues() {
    searchText = trim(document.getElementById('search').value).toLowerCase();
    sortMode = document.getElementById('sortBy').value; // eg. highest-rating
    currentlySearching = (searchText != '');
}

function anySearchChanges() {
    return (
        (previousSearchText !== searchText) ||
        (previousSortMode !== sortMode)
    );
}

// note: when downloading only the first 10, do not also download the search
// index. this is because the first 10 will only be downloaded when there is no
// search text and the sort order is at the default value.
function downloadMediaLists(useFirst10_, callback) {
    var fullListIsDownloaded = isFullListDownloaded(useFirst10_);
    var searchIndexIsDownloaded = (useFirst10_ || isSearchIndexDownloaded());

    if (fullListIsDownloaded && searchIndexIsDownloaded) return callback();

    if (!fullListIsDownloaded) {
        fullListFileName = getFileJSONName('list', sortMode, useFirst10_);
        fullListDownloadStatus = 'not started'; // unlock again
        downloadFullListJSON(function() {
            // only using first 10? then we don't need the search list
            if (useFirst10_) return callback();

            // otherwise wait for both lists to download before running callback
            if (searchIndexDownloadStatus != 'complete') return;
            return callback();
        });
    }
    if (!searchIndexIsDownloaded) {
        searchIndexFileName =
        getFileJSONName('search-index', sortMode, useFirst10_);

        searchIndexDownloadStatus = 'not started'; // unlock again
        downloadSearchIndexJSON(function() {
            // wait for both lists to download before running callback
            if (fullListDownloadStatus != 'complete') return;
            return callback();
        });
    }
}

function useFirst10() {
    if (sortMode != 'highest-rating') return false;
    if (numMediaShowing != 0) return false;
    return true;
}

function isFullListDownloaded(useFirst10_) {
    var requiredFullListFileName =
    getFileJSONName('list', sortMode, useFirst10_);

    return (
        (fullListFileName == requiredFullListFileName) &&
        (fullListDownloadStatus == 'complete')
    );
}

function isSearchIndexDownloaded() {
    var requiredSearchIndexFileName = getFileJSONName('search-index', sortMode);
    return (
        (searchIndexFileName == requiredSearchIndexFileName) &&
        (searchIndexDownloadStatus == 'complete')
    );
}

function getFileJSONName(listType, sortMode, useFirst10_) {
    useFirst10_ = (useFirst10_ == true);
    var basename = listType + '-' + sortMode + (useFirst10_ ? '-first-10' : '');
    var hash = siteGlobals.mediaFileHashes[basename];
    return basename + '.json?hash=' + hash;
}

function updateFilteredListUsingSearch() {
    var searchTermsList = getSearchTermsList(searchText);

    // indexes (eg. [0,7]) from searchIndex
    filteredList = searchMediaTitles(searchTermsList);
}

function getSearchTermsList(searchText) {
    if (searchText == '') return []; // quick
    searchText = searchText.toLowerCase(); // all searching is lowercase
    return searchText.split(/[^a-z0-9]/g).filter(function(item, i, list) {
        if (item == '') return false; // no empty items allowed in result
        return (list.indexOf(item) === i); // keep result unique
    });
}

function searchMediaTitles(searchTermsList) {
    if (searchTermsList.length == 0) {
        numMediaFound = siteGlobals.totalMediaCount;
        return 'all'; // nothing to filter
    }

    var searchIndexes = [];

    // use a regex to see if the search terms are in the search item
    // stackoverflow.com/a/54417192, regex101.com/r/yVXwk0/1
    // ^(?=.*DEF)(?=.*ABC)
    var regexString = '^(?=.*' + searchTermsList.join(')(?=.*') + ')';
    var regexPattern = new RegExp(regexString, 'i');

    for (var i = 0; i < searchIndex.length; i++) {
        if (!searchIndex[i].test(regexPattern)) continue;
        searchIndexes.push(i);
    }
    numMediaFound = searchIndexes;

    // all items contained all search terms
    if (searchIndexes.length == searchIndex.length) searchIndexes = 'all';

    return searchIndexes;
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
*/

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
            removeMediaIDFromUrl();
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

            //mediaSearchChanged();
            triggerSearch();
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

// ajax

function downloadFullListJSON(callback) {
    if (fullListDownloadStatus == 'complete') {
        return callback(); // exit function here
    }

    if (fullListDownloadStatus == 'in progress') return; // 1 attempt at a time
    fullListDownloadStatus = 'in progress'; // lock
    fullList = []; // reset

    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/' +
    fullListFileName;

    ajax(fileWithPath, function (json) {
        try {
            fullList = JSON.parse(json);
            fullListDownloadStatus = 'complete';
            callback();
        }
        catch (err) {
            console.log('error in downloadFullListJSON(): ' + err);
            fullListDownloadStatus = 'not started'; // unlock again
        }
    });
}

function downloadSearchIndexJSON(callback) {
    if (searchIndexDownloadStatus == 'complete') {
        return callback(); // exit function here
    }

    if (searchIndexDownloadStatus == 'in progress') return; // 1 attempt at a time
    searchIndexDownloadStatus = 'in progress'; // lock
    searchIndex = []; // reset

    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/' +
    searchIndexFileName;

    ajax(fileWithPath, function (json) {
        try {
            searchIndex = JSON.parse(json);
            searchIndexDownloadStatus = 'complete';
            callback();
        }
        catch (err) {
            console.log('error in downloadSearchIndexJSON(): ' + err);
            searchIndexDownloadStatus = 'not started'; // unlock again
        }
    });
}

function download1MediaItem(minimalMediaItemObj, callback) {
    var fileWithPath = '/' + siteGlobals.mediaType + '-reviews/json/data-' +
    minimalMediaItemObj.id_ + '.json?hash=' + minimalMediaItemObj.jsonDataFileHash;

    ajax(fileWithPath, function(json) {
        try {
            var mediaData = JSON.parse(json);
            mediaData.id_ = getMediaID(mediaData);
            callback('complete', mediaData);
        }
        catch (err) {
            console.log('error in download1MediaItem(): ' + err);
            callback('fail');
        }
    });
}

function loadFullReview(e) {
    if (
        e.target.tagName.toLowerCase() != 'button'
        || typeof e.target.className != 'string'
        || !inArray('load-review', e.target.className)
    ) return;

    linkToSelf(e.target.up(2));
    var mediaID = e.target.id_.replace('load-', '');
    var mediaIndex = mediaID2Index(mediaID);
    var mediaData = completeMediaData[mediaIndex];
    if (mediaData.hasOwnProperty('review')) {
        e.target.parentNode.innerHTML = formatReview(mediaData.review) +
        getExternalLinkButton(mediaData);
        return;
    }
    ajax(
        '/' + siteGlobals.mediaType + '-reviews/json/review-' + mediaID +
        '.json?hash=' + mediaData.reviewHash,

        function (json) {
        try {
            var fullReviewText = JSON.parse(json).reviewFull;
            e.target.parentNode.innerHTML = formatReview(fullReviewText) +
            getExternalLinkButton(mediaData);
            mediaData.review = fullReviewText;
        }
        catch (err) {
            console.log('error in loadFullReview function: ' + err);
        }
    });
}
