// init globals
initialMovieData = []; // 10 movies populated on the page initially
movieList = []; // all movies known to this page (may not be in sync with movies-list-all.json)
completeMovieSearch = []; // static index of movie searches
completeMovieData = []; // static list of all movie data
sampleChain = '';
sampleEmptyStar = '';
sampleFullStar = '';
sampleHalfStar = '';

addEvent(window, 'load', function () {
    initSVGIconsHTML();
    initInitialMovieData();
    initMovieSearchList();
    initCompleteMovieData();
    addEvent(document.getElementById('search'), 'keyup', movieSearchChanged);
    addEvent(document.getElementById('sortBy'), 'change', movieSearchChanged);
    addEvent(document.getElementById('reviewsArea'), 'click', loadFullReview);
});

// rendering

function initSVGIconsHTML() {
    sampleChain = document.querySelector('.sample .icon-chain').outerHTML;
    sampleEmptyStar = document.querySelector('.sample .icon-star-o').outerHTML;
    sampleFullStar = document.querySelector('.sample .icon-star').outerHTML;
    sampleHalfStar = document.querySelector('.sample .icon-star-half-empty').outerHTML;
}

function initInitialMovieData() {
    ajax(
        '/json/movies-init-list.json',
        function (json) {
        try {
            initialMovieData = JSON.parse(json);
            var initialMovieDataHTML = '';
            for (var i = 0; i < initialMovieData.length; i++) {
                initialMovieDataHTML += getMovieHTML(initialMovieData[i]);
            }
            document.getElementById('reviewsArea').innerHTML =
            initialMovieDataHTML;
        }
        catch (err) {
            console.log('error in initInitialMovieData function: ' + err);
        }
    });
}

function getMovieHTML(movieData) {
    var movieID = (movieData.title + movieData.year).toLowerCase().replace(/[^a-z0-9]*/g, '');
    var titleAndYear = (
        movieData.hasOwnProperty('titleAndYear') ?
        movieData.titleAndYear : movieData.title + ' (' + movieData.year + ')'
    );
    return '<div class="movie" id="' + movieID + '">' +
        '<a href="#' + movieID + '">' + sampleChain + '</a>' +
        '<div class="thumbnail-and-stars">' +
            '<a href="https://www.imdb.com/title/' + movieData.IMDBID + '/">' +
                '<img src="' + movieData.thumbnail + '">' +
            '</a>' +
            '<div class="stars">' +
                getMovieStarsHTML(movieData.rating) +
            '</div>' +
        '</div>' +
        '<div class="review">' +
            '<h3>' + titleAndYear + '</h3>' +
            '<h4 class="review-title">' + movieData.reviewTitle + '</h4>' +
            '<div class="review-text">' +
                '<button class="load-review" id="load-' + movieID + '">' +
                    'load review (' + (movieData.spoilers? '' : 'no') + ' spoilers)' +
                '</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function loadFullReview(e) {
    if (!inArray('load-review', e.target.className)) return;
    var movieID = e.target.id.replace('load-', '');
    ajax(
        '/json/movie-review-' + movieID + '.json',
        function (json) {
        try {
            var fullReviewText = JSON.parse(json).reviewFull;
            e.target.parentNode.innerHTML = fullReviewText;
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

// searching

function initMovieSearchList() {
    ajax(
        '/json/movies-search-index.json',
        function (json) {
        try {
            completeMovieSearch = JSON.parse(json);
        }
        catch (err) {
            console.log('error in initMovieSearchList function: ' + err);
        }
    });
}

function movieSearchChanged() {
    var searchText = trim(document.getElementById('search').value).toLowerCase();
    var searchTerms = extractSearchTerms(searchText);
    var searchResultIndexes = searchMovieTitles(searchTerms);
    var finalizeSearch = function() {
        movieSearchChangedFinalize(searchTerms, searchResultIndexes);
    };
    if (completeMovieData.length == 0) initCompleteMovieData(finalizeSearch);
    else finalizeSearch();
}

function movieSearchChangedFinalize(searchTerms, searchResultIndexes) {
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
    document.getElementById('reviewsArea').innerHTML = moviesHTML;
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

function highlightSearch(searchTerms, movieTitleAndYear) {
    foreach(searchTerms, function(_, searchTerm) {
        var regexPattern = new RegExp('(' + searchTerm + ')', 'i');
        movieTitleAndYear = movieTitleAndYear.replace(regexPattern, '<u>$1</u>');
    });
    return movieTitleAndYear;
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
    var searchResultIndexes = []; // a list of movie list ids
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
    if (gettingCompleteMovieData) { // 1 attempt at a time
        if (typeof callback == 'function') callback();
        return;
    }
    gettingCompleteMovieData = true; // lock
    ajax(
        '/json/movies-list-all.json',
        function (json) {
        try {
            completeMovieData = JSON.parse(json).data;
            if (typeof callback == 'function') callback();
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
