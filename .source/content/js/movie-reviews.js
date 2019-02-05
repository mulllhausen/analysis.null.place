// init globals
movieList = []; // all movies known to this page (may not be in sync with movies-list-all.json)
completeMovieSearch = []; // static index of movie searches
completeMovieSearchIDs = []; // same as completeMovieSearch but with IDs not names and years
completeMovieData = []; // static list of all movie data
numTotalMovies = 0; // total that match the search criteria
numMoviesShowing = 0;
sampleChain = '';
sampleEmptyStar = '';
sampleFullStar = '';
sampleHalfStar = '';

addEvent(window, 'load', function () {
    /* ajax logic:
    - if there is a hash (specific movie) then render it like so:
        - first fetch completeMovieSearchIDs to match hash id to position in completeMovieData
        - then use that to fetch completeMovieData and render movie data
    - else if there is no hash then just render the initial movies like so:
        - fetch initialMovieData only
    - fetch completeMovieSearch, completeMovieSearchIDs and completeMovieData if necessary
    */
    initSVGIconsHTML();
    initSearchBox();
    initMovieRendering();
    initMovieSearchList();
    initCompleteMovieData();
    addEvent(document.getElementById('search'), 'keyup', movieSearchChanged);
    addEvent(document.getElementById('sortBy'), 'change', movieSearchChanged);
    addEvent(document.getElementById('reviewsArea'), 'click', loadFullReview);
    addEvent(document.getElementById('showAllMovies'), 'click', showAllMovies);
});

// rendering

function initSearchBox() {
    if (window.location.hash.length > 0) { // show only the movie with id in #
        searchBoxMode('show-all-button');
    } else { // show initial list
        searchBoxMode('search-fields');
    }
}

function initMovieRendering() {
    if (window.location.hash.length > 0) { // show only the movie with id in #
        var movieID = window.location.hash.replace('#!', '');
        var afterAllMovieDataDownloaded = function () {
            // wait for both lists to be downloaded before proceeding
            if (
                completeMovieSearch.length == 0 ||
                completeMovieData.length == 0
            ) return;
            var movieIndex = movieID2Index(movieID);
            var movieData = completeMovieData[movieIndex];
            loading('off');
            numMoviesShowing = 1, numTotalMovies = completeMovieSearch.length;
            renderMovieCount(true);
            document.getElementById('reviewsArea').innerHTML = getMovieHTML(
                movieData
            );
        };
        // we need the search-index and the movie-data lists before we can
        // complete this operation. get both lists in parallel for speed.
        initCompleteMovieData(afterAllMovieDataDownloaded);
        initMovieSearchList(afterAllMovieDataDownloaded);
    } else { // show initial list
        renderInitialMovieData();
        initMovieSearchList(function () {
            // we already know numMoviesShowing from renderInitialMovieData()
            numTotalMovies = completeMovieSearch.length;
            renderMovieCount(false);
        });
    }
}

function initSVGIconsHTML() {
    sampleChain = document.querySelector('.sample .icon-chain').outerHTML;
    sampleEmptyStar = document.querySelector('.sample .icon-star-o').outerHTML;
    sampleFullStar = document.querySelector('.sample .icon-star').outerHTML;
    sampleHalfStar = document.querySelector('.sample .icon-star-half-empty').outerHTML;
}

function renderInitialMovieData() {
    ajax(
        siteGlobals.moviesInitListJSON,
        function (json) {
        try {
            var initialMovieData = JSON.parse(json);
            var initialMovieDataHTML = '';
            for (var i = 0; i < initialMovieData.length; i++) {
                initialMovieDataHTML += getMovieHTML(initialMovieData[i]);
            }
            loading('off');
            numMoviesShowing = initialMovieData.length;
            // do not run renderMovieCount() yet since we do not know numTotalMovies
            document.getElementById('reviewsArea').innerHTML =
            initialMovieDataHTML;
        }
        catch (err) {
            console.log('error in initInitialMovieData function: ' + err);
        }
    });
}

function showAllMovies() {
    window.location.hash = '';
    searchBoxMode('search-fields');
    var searchInput = document.getElementById('search');
    searchInput.value = ''; // reset
    document.getElementById('sortBy').value = 'highest-rating'; // reset
    triggerEvent(searchInput, 'keyup'); // calls movieSearchChanged()
}

function loading(status) {
    switch (status) {
        case 'on':
            document.getElementById('movieLoaderArea').style.display = 'block';
            break;
        case 'off':
            document.getElementById('movieLoaderArea').style.display = 'none';
            break;
    }
}

function getMovieHTML(movieData) {
    var movieID = (movieData.title + movieData.year).toLowerCase().
    replace(/[^a-z0-9]*/g, '');

    var titleAndYear = (
        movieData.hasOwnProperty('titleAndYear') ?
        movieData.titleAndYear : movieData.title + ' (' + movieData.year + ')'
    );
    var loadReviewButton = '<button class="load-review" id="load-' + movieID + '">' +
        'load review (' + (movieData.spoilers? '' : 'no') + ' spoilers)' +
    '</button>';
    var review = movieData.hasOwnProperty('review') ?
    movieData.review : loadReviewButton;

    return '<div class="movie" id="!' + movieID + '">' +
        '<a href="' + siteGlobals.siteURL + '/movie-reviews/#!' + movieID + '">' +
            sampleChain +
        '</a>' +
        '<div class="thumbnail-and-stars">' +
            '<a href="https://www.imdb.com/title/' + movieData.IMDBID + '/">' +
                '<img src="' + movieData.thumbnail + '" alt="movie graphic">' +
            '</a>' +
            '<div class="stars">' +
                getMovieStarsHTML(movieData.rating) +
            '</div>' +
        '</div>' +
        '<div class="review">' +
            '<h3>' + titleAndYear + '</h3>' +
            '<h4 class="review-title">' + movieData.reviewTitle + '</h4>' +
            '<div class="review-text">' + review + '</div>' +
        '</div>' +
    '</div>';
}

function loadFullReview(e) {
    // if the review has already been loaded then exit
    if (!inArray('load-review', e.target.className)) return;

    var movieID = e.target.id.replace('load-', '');
    var movieIndex = movieID2Index(movieID);
    if (completeMovieData[movieIndex].hasOwnProperty('review')) {
        e.target.parentNode.innerHTML = completeMovieData[movieIndex].review;
        return;
    }
    ajax(
        '/json/movie-review-' + movieID + '.json?h=' +
        completeMovieData[movieIndex].reviewHash,

        function (json) {
        try {
            var fullReviewText = JSON.parse(json).reviewFull;
            e.target.parentNode.innerHTML = fullReviewText;
            completeMovieData[movieIndex].review = fullReviewText;
        }
        catch (err) {
            console.log('error in loadFullReview function: ' + err);
        }
    });
}

function getMovieStarsHTML(movieDataRating) {
    var starRating = '';
    for (var i = 1; i <= 5; i++) {
        if (i <= movieDataRating) starRating += sampleFullStar;
        else {
            if ((i - 1) < movieDataRating) starRating += sampleHalfStar;
            else starRating += sampleEmptyStar;
        }
    }
    return starRating;
}

function highlightSearch(searchTerms, movieTitleAndYear) {
    foreach(searchTerms, function(_, searchTerm) {
        var regexPattern = new RegExp('(' + searchTerm + ')', 'i');
        movieTitleAndYear = movieTitleAndYear.replace(regexPattern, '<u>$1</u>');
    });
    return movieTitleAndYear;
}

function searchBoxMode(mode) {
    var searchBox = document.getElementById('searchBox');
    var showAllMoviesButton = document.getElementById('showAllMovies');
    var searchBoxParent = searchBox.parentNode;
    switch (mode) {
        case 'show-all-button':
            searchBox.style.display = 'none';
            showAllMoviesButton.style.display = 'inline-block';
            searchBoxParent.style.textAlign = 'center';
            break;
        case 'search-fields':
            showAllMoviesButton.style.display = 'none';
            searchBox.style.display = 'block';
            searchBoxParent.style.textAlign = 'start';
            break;
    }
}

function renderMovieCount(searching) {
    if (numTotalMovies == 0) {
        document.getElementById('xOfYMoviesCount').style.display = 'none';
        document.getElementById('noMoviesCount').style.display = 'inline';
    } else {
        document.getElementById('noMoviesCount').style.display = 'none';
        document.getElementById('xOfYMoviesCount').style.display = 'inline';
        document.getElementById('numMoviesShowing').innerHTML = numMoviesShowing;
        document.getElementById('totalMoviesFound').innerHTML = numTotalMovies;
        document.getElementById('searchTypeDescription').innerHTML = (
            searching ? 'search results' : 'total movies'
        );
    }
}

// searching

var gettingMovieSearchList = false; // init (unlocked)
function initMovieSearchList(callback) {
    if (completeMovieSearch.length > 0) return callback(); // exit function here

    addEvent(document, 'got-movie-search-list', callback);

    if (gettingMovieSearchList) return; // 1 attempt at a time
    gettingMovieSearchList = true; // lock
    ajax(
        siteGlobals.moviesSearchIndexJSON,
        function (json) {
        try {
            completeMovieSearch = JSON.parse(json);
            completeMovieSearchIDs = new Array(completeMovieSearch.length);
            for (var i = 0; i < completeMovieSearch.length; i++) {
                completeMovieSearchIDs[i] = completeMovieSearch[i].
                replace(/[^a-z0-9]*/g, '');
            }
            triggerEvent(document, 'got-movie-search-list');
        }
        catch (err) {
            console.log('error in initMovieSearchList function: ' + err);
            gettingMovieSearchList = false; // unlock again
        }
    });
}

function movieID2Index(id) {
    return completeMovieSearchIDs.indexOf(id)
}

function movieSearchChanged() {
    document.getElementById('reviewsArea').innerHTML = '';
    loading('on');
    var searchText = trim(document.getElementById('search').value).toLowerCase();
    var searchTerms = extractSearchTerms(searchText);
    var finalizeSearch = function () {
        // wait for both lists to be downloaded before proceeding
        if (
            completeMovieSearch.length == 0 ||
            completeMovieData.length == 0
        ) return;
        var searchResultIndexes = searchMovieTitles(searchTerms);
        if (searchText == '') {
            numMoviesShowing = completeMovieSearch.length; // todo - do not show all
            numTotalMovies = completeMovieSearch.length;
            renderMovieCount(false);
        } else {
            numMoviesShowing = searchResultIndexes.length; // todo - do not show all
            numTotalMovies = searchResultIndexes.length;
            renderMovieCount(true);
        }
        var movieSearchResults = [];
        // use the list of indexes to get the list of complete movies for rendering
        foreach(searchResultIndexes, function (_, movieI) {
            movieSearchResults.push(completeMovieData[movieI]);
        });
        movieSearchResults = sortMovies(movieSearchResults); // todo: move up above?
        var moviesHTML = '';
        foreach(movieSearchResults, function (_, movieData) {
            movieData.titleAndYear = highlightSearch(
                searchTerms, movieData.title + ' (' + movieData.year + ')'
            );
            moviesHTML += getMovieHTML(movieData);
        });
        loading('off');
        document.getElementById('reviewsArea').innerHTML = moviesHTML;
    };
    // we need the search-index and the movie-data lists before we can complete
    // this operation. get both lists in parallel for speed.
    initMovieSearchList(finalizeSearch);
    initCompleteMovieData(finalizeSearch);
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

function searchMovieTitles(searchTerms) {
    if (searchTerms.length == 0) {
        // add all movies
        searchResultIndexes = new Array(completeMovieSearch.length);
        for (var i = 0; i < completeMovieSearch.length; i++) {
            searchResultIndexes[i] = i;
        }
        return searchResultIndexes;
    }
    var searchResultIndexes = []; // a list of movie ids
    foreach(completeMovieSearch, function (i, movieWords) {
        var searchFail = false;
        foreach(searchTerms, function (_, searchWord) {
            // all search terms are mandatory
            if (!inArray(searchWord, movieWords)) {
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

var gettingCompleteMovieData = false; // init (unlocked)
function initCompleteMovieData(callback) {
    if (completeMovieData.length > 0) return callback(); // exit function here

    addEvent(document, 'got-complete-movie-data', callback);

    if (gettingCompleteMovieData) return; // 1 attempt at a time
    gettingCompleteMovieData = true; // lock
    ajax(
        siteGlobals.moviesListJSON,
        function (json) {
        try {
            completeMovieData = JSON.parse(json);
            triggerEvent(document, 'got-complete-movie-data');
        }
        catch (err) {
            console.log('error in initCompleteMovieData function: ' + err);
            gettingCompleteMovieData = false; // unlock again
        }
    });
}

function sortMovies(movieList) {
    if (movieList.length == 0) return [];
    var sortBy = document.getElementById('sortBy').value;
    switch (sortBy) {
        case 'newest-reviews':
            return movieList.reverse();
        case 'oldest-reviews':
            return movieList;
    }
    movieList.sort(function(a, b) {
        var diff = 0;
        var titleA = a.title.toLowerCase();
        var titleB = b.title.toLowerCase();
        switch (sortBy) {
            case 'highest-rating':
            case 'lowest-rating':
                if (a.rating == b.rating) {
                    // sort alphabetically for same rating movies
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
    return movieList;
}
