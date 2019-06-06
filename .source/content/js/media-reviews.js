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

addEvent(window, 'load', function () {
    initSearchBox();
    initMediaRendering();
    initMediaSearchList(initSearchResultIndexes);
    initCompleteMediaData(initSearchResultIndexes);
    addEvent(document.getElementById('search'), 'keyup', mediaSearchChanged);
    addEvent(document.getElementById('sortBy'), 'change', mediaSearchChanged);
    addEvent(document.getElementById('reviewsArea'), 'click', loadFullReview);
    addEvent(document.getElementById('showAllMedia'), 'click', showAllMedia);
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

function initSearchBox() {
    if (window.location.hash.length > 0) { // show only the media with id in #
        searchBoxMode('show-all-button');
    } else { // show initial list
        searchBoxMode('search-fields');
    }
}

function initMediaRendering() {
    if (window.location.hash.length > 0) { // show only the media with id in #
        var mediaID = window.location.hash.replace('#!', '');
        var afterAllMediaDataDownloaded = function () {
            // wait for both lists to be downloaded before proceeding
            if (
                completeMediaSearch.length == 0 ||
                completeMediaData.length == 0
            ) return;
            var mediaIndex = mediaID2Index(mediaID);

            if (mediaIndex < 0) {
                location.href = location.protocol + '//' +
                location.hostname + (location.port ? ':' + location.port : '') +
                location.pathname;
                return;
            }

            searchResultIndexes = [mediaIndex]; // asap
            var mediaData = completeMediaData[mediaIndex];
            loading('off');
            numMediaShowing = 1, numTotalMedia = completeMediaSearch.length;
            currentlySearching = false;
            renderMediaCount();
            document.getElementById('reviewsArea').innerHTML = getMediaHTML(
                mediaData
            );
        };
        // we need the search-index and the media-data lists before we can
        // complete this operation. get both lists in parallel for speed.
        initCompleteMediaData(afterAllMediaDataDownloaded);
        initMediaSearchList(afterAllMediaDataDownloaded);
    } else { // show initial list
        var afterInitialMediaDataDownloaded = function () {
            // wait for both lists to be downloaded before proceeding
            if (
                completeMediaSearch.length == 0 ||
                initialMediaData.length == 0
            ) return;
            // no need to populate numMediaShowing since that was already
            // populated in renderInitialMediaData()
            numTotalMedia = completeMediaSearch.length;
            currentlySearching = false;
            renderMediaCount();
        };
        initMediaSearchList(afterInitialMediaDataDownloaded);
        renderInitialMediaData(afterInitialMediaDataDownloaded);
        // note: at this point, searchResultIndexes is not populated, so
        // scrolling to the bottom will not yet load any more media
    }
}

var gettingInitialMediaData = false; // init (unlocked)
function renderInitialMediaData(callback) {
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
            var initialMediaDataHTML = '';
            for (var i = 0; i < initialMediaData.length; i++) {
                initialMediaDataHTML += getMediaHTML(initialMediaData[i]);
            }
            loading('off');
            numMediaShowing = initialMediaData.length; // global
            // do not run renderMediaCount() here since we may not know numTotalMedia
            document.getElementById('reviewsArea').innerHTML = initialMediaDataHTML;
            triggerEvent(document, 'got-initial-media-data');
        }
        catch (err) {
            console.log('error in renderInitialMediaData function: ' + err);
            gettingInitialMediaData = false; // unlock again
        }
    });
}

function linkTo1Media(e) {
    var el = e.target;
    if (
        (
            (el.tagName.toLowerCase() == 'i') &&
            (el.parentNode.tagName.toLowerCase() == 'a') &&
            inArray('link-to-other-media', el.parentNode.className)
        ) || (
            (el.tagName.toLowerCase() == 'a') &&
            inArray('link-to-other-media', el.className)
        )
    ) {
        // the link looks like <a><i>blah</i></a>
        location.href = el.parentNode.href;
        initSearchBox();
        initMediaRendering(); // show only the media in the hash
        return;
    }
    if ((el.tagName.toLowerCase() == 'a') && inArray('link-to-self', el.className)) {
        // the link looks like <a class="link-to-self">blah</a>
        var mediaEl = el.parentNode;
    } else if (
        (el.tagName.toLowerCase() == 'svg') &&
        inArray('icon-chain', el.outerHTML)
    ) {
        // the link looks like <svg class="icon-chain">blah</svg>
        var mediaEl = el.parentNode.parentNode;
    } else if (
        (el.tagName.toLowerCase() == 'use') &&
        inArray('icon-chain', el.outerHTML)
    ) {
        // the link looks like <use xlink:href="...#icon-chain">blah</use>
        var mediaEl = el.parentNode.parentNode.parentNode;
    } else return;
    currentlySearching = false;
    numMediaShowing = 1;
    renderMediaCount();
    document.getElementById('reviewsArea').innerHTML = mediaEl.outerHTML;
    searchBoxMode('show-all-button');
    document.getElementById('search').value = ''; // reset
}

function showAllMedia() {
    window.location.hash = '';
    searchBoxMode('search-fields');
    var searchInput = document.getElementById('search');
    searchInput.value = ''; // reset
    document.getElementById('sortBy').value = 'highest-rating'; // reset
    triggerEvent(searchInput, 'keyup'); // calls mediaSearchChanged()
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

function getMediaHTML(mediaData) {
    var mediaID = getMediaID(mediaData);
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
    var imgSrc = siteGlobals.siteURL + '/img/' + siteGlobals.mediaType +
    '-thumbnail-' + mediaID + '.jpg?hash=' + mediaData['thumbnailHash'];
    var imgLink = 'https://';
    switch (siteGlobals.mediaType) {
        case 'book':
            imgLink += 'www.goodreads.com/book/show/' + mediaData.goodreadsID;
            break;
        case 'movie':
        case 'tv-series':
            imgLink += 'www.imdb.com/title/' + mediaData.IMDBID;
            break;
    }
    return '<div class="media" id="!' + mediaID + '">' +
        '<a' +
            ' class="link-to-self chain-link"' +
            ' href="' + siteGlobals.siteURL + '/' + siteGlobals.mediaType +
            '-reviews/#!' + mediaID + '"' +
            ' title="right click and copy link for the URL of this ' +
            siteGlobals.mediaType + ' review"' +
        '>' +
            '<svg class="icon icon-chain">' +
                '<use xlink:href="' + siteGlobals.iconsSVGURL + '#icon-chain"></use>' +
            '</svg>' +
        '</a>' +
        '<div class="thumbnail-and-stars">' +
            '<a href="' + imgLink + '">' +
                '<img src="' + imgSrc + '" alt="' + siteGlobals.mediaType +
                ' thumbnail">' +
            '</a>' +
            '<div class="stars">' +
                getMediaStarsHTML(mediaData.rating) +
            '</div>' +
        '</div>' +
        '<h3 class="media-title">' + renderedTitle + '</h3>' +
        '<h4 class="review-title">' + mediaData.reviewTitle + '</h4>' +
        '<div class="review-text">' + review + '</div>' +
    '</div>';
}

function loadFullReview(e) {
    if (typeof e.target.className != 'string') return; // ignore svg classes

    // if the review has already been loaded then exit
    if (!inArray('load-review', e.target.className)) return;

    var mediaID = e.target.id.replace('load-', '');
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

function highlightSearch(searchTerms, mediaRenderedTitle) {
    foreach(searchTerms, function(_, searchTerm) {
        var regexPattern = new RegExp('(' + searchTerm + ')', 'i');
        mediaRenderedTitle = mediaRenderedTitle.replace(regexPattern, '<u>$1</u>');
    });
    return mediaRenderedTitle;
}

function searchBoxMode(mode) {
    var searchBox = document.getElementById('searchBox');
    var showAllMediaButton = document.getElementById('showAllMedia');
    var searchBoxParent = searchBox.parentNode;
    switch (mode) {
        case 'show-all-button':
            searchBox.style.display = 'none';
            showAllMediaButton.style.display = 'inline-block';
            searchBoxParent.style.textAlign = 'center';
            break;
        case 'search-fields':
            showAllMediaButton.style.display = 'none';
            searchBox.style.display = 'block';
            searchBoxParent.style.textAlign = 'start';
            break;
    }
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

// infinite scroll functionality

function positionMediaCounter() {
    var countAreaEl = document.getElementsByClassName('media-count-area')[0];
    positionMediaCountPanel(
        isScrolledTo(countAreaEl, 'above') ? 'fixed' : 'inline'
    );
}

function infiniteLoader() {
    if (loadingStatus == 'on') return;

    // when 1 media is loaded via the url hash, do not load more below
    if (window.location.hash.length > 0) return;

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
        moreMediaHTML += getMediaHTML(mediaData);
        pointer++;
    }
    moreMediaEl.innerHTML = moreMediaHTML;
    numMediaShowing += i; // global
    setTimeout(function () {
        document.getElementById('reviewsArea').appendChild(moreMediaEl);
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
    return completeMediaSearchIDs.indexOf(id);
}

function initSearchResultIndexes() {
    // wait for both lists to be downloaded before proceeding
    if (
        completeMediaSearch.length == 0 ||
        completeMediaData.length == 0
    ) return;
    generateSortedData(''); // init the searchResultIndexes list
}

// update searchResultIndexes (global) and return mediaSearchResults
function generateSortedData(searchTerms) {
    searchResultIndexes = searchMediaTitles(searchTerms);

    // get some of the media data into a tmp list. necessary for sorting.
    var mediaSearchResults = [];
    for (var i = 0; i < searchResultIndexes.length; i++) {
        var mediaIndex = searchResultIndexes[i];
        var mediaData = jsonCopyObject(completeMediaData[mediaIndex]);
        mediaData.index = mediaIndex;
        mediaSearchResults.push(mediaData);
    }

    // sort it
    mediaSearchResults = sortMedia(mediaSearchResults);

    // sort the global search results
    for (var i = 0; i < searchResultIndexes.length; i++) {
        searchResultIndexes[i] = mediaSearchResults[i].index;
    }
    return mediaSearchResults;
}

function mediaSearchChanged() {
    document.getElementById('reviewsArea').innerHTML = '';
    loading('on');
    var searchText = trim(document.getElementById('search').value).toLowerCase();
    var searchTerms = extractSearchTerms(searchText);
    var finalizeSearch = function () {
        // wait for both lists to be downloaded before proceeding
        if (
            completeMediaSearch.length == 0 ||
            completeMediaData.length == 0
        ) return;

        var mediaSearchResults = generateSortedData(searchTerms);

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
            mediaHTML += getMediaHTML(mediaData);
        }
        loading('off');
        document.getElementById('reviewsArea').innerHTML = mediaHTML;
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
        if (item == '') return false;
        return list.indexOf(item) === i;
    });
}

function searchMediaTitles(searchTerms) {
    if (searchTerms.length == 0) {
        // add all media
        searchResultIndexes = new Array(completeMediaSearch.length);
        for (var i = 0; i < completeMediaSearch.length; i++) {
            searchResultIndexes[i] = i;
        }
        return searchResultIndexes;
    }
    var searchResultIndexes = []; // a list of media ids
    foreach(completeMediaSearch, function (i, mediaWords) {
        var searchFail = false;
        foreach(searchTerms, function (_, searchWord) {
            // all search terms are mandatory
            if (!inArray(searchWord, mediaWords)) {
                searchFail = true;
                return false; // break
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

function sortMedia(mediaList) {
    if (mediaList.length == 0) return [];
    var sortBy = document.getElementById('sortBy').value;
    switch (sortBy) {
        case 'newest-reviews':
            return mediaList.reverse();
        case 'oldest-reviews':
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
    return mediaList;
}
