// init globals
initialMovieData = []; // 10 movies populated on the page initially
movieList = []; // all movies known to this page (may not be in sync with movies-list-all.json)
completeMovieSearch = []; // static index of movie searches
completeMovieData = []; // static list of all movie data
sampleEmptyStar = '';
sampleFullStar = '';
sampleHalfStar = '';

addEvent(window, 'load', function () {
    initSampleStarHTML();
    initInitialMovieData();
    initMovieSearchList();
    initCompleteMovieData();
    addEvent(document.getElementById('search'), 'keyup', movieSearchChanged);
    addEvent(document.getElementById('sortBy'), 'change', movieSearchChanged);
    addEvent(document.getElementById('reviewsArea'), 'click', loadFullReview);
});

// rendering

function initSampleStarHTML() {
    sampleEmptyStar = document.getElementsByClassName('icon-star-o')[0].outerHTML;
    sampleFullStar = document.getElementsByClassName('icon-star')[0].outerHTML;
    sampleHalfStar = document.getElementsByClassName('icon-star-half-empty')[0].outerHTML;
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
    return '<div class="movie">' +
        '<div class="thumbnail-and-stars">' +
            '<a href="https://www.imdb.com/title/' + movieData.IMDBID + '/">' +
                '<img src="' + movieData.thumbnail + '">' +
            '</a>' +
            '<div class="stars">' +
                getMovieStarsHTML(movieData.rating) +
            '</div>' +
        '</div>' +
        '<div class="review">' +
            '<h3>' + movieData.title + ' (' + movieData.year + ')</h3>' +
            '<h4 class="review-title">' + movieData.reviewTitle + '</h4>' +
            '<div class="review-text">' +
                '<button class="load-review" id="' + movieID + '">' +
                    'load review (' + (movieData.spoilers? '' : 'no') + ' spoilers)' +
                '</button>' +
            '</div>' +
        '</div>' +
    '</div>';
}

function loadFullReview(e) {
    if (!inArray('load-review', e.target.className)) return;
    ajax(
        '/json/movie-review-' + e.target.id + '.json',
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
    movieSearchResults = sortMovies(movieSearchResults);
    var moviesHTML = '';
    foreach(movieSearchResults, function (_, movieData) {
        var movieDataCopy = jsonCopyObject(movieData);
        movieDataCopy.title = highlightSearch(searchTerms, movieDataCopy.title);
        moviesHTML += getMovieHTML(movieDataCopy);
    });
    document.getElementById('reviewsArea').innerHTML = moviesHTML;
}

function extractSearchTerms(searchText) {
    return searchText.split(/[^a-z0-9]/gi).map(function(v) {
        return v.toLowerCase();
    }).filter(function(item, i, list) {
        if (item == '') return false;
        return list.indexOf(item) === i;
    });
}

function highlightSearch(searchTerms, movieTitle) {
    foreach(searchTerms, function(_, searchTerm) {
        var regexPattern = new RegExp('(' + searchTerm + ')', 'gi');
        movieTitle = movieTitle.replace(regexPattern, '<u>$1</u>');
    });
    return movieTitle;
}

function searchMovieTitles(searchTerms) {
    var searchResultIndexes = []; // a list of movie list ids
    foreach(searchTerms, function (_, searchWord) {
        foreach(completeMovieSearch, function (i, movieWords) {
            if (inArray(searchWord, movieWords) && !inArray(i, searchResultIndexes)) {
                searchResultIndexes.push(i);
            }
        });
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
    movieList.sort(function(a, b) {
        var diff = 0;       
        switch (sortBy) {
            case 'highest-rating':
            case 'lowest-rating':
                if (a.rating < b.rating) diff = -1;
                else if (a.rating > b.rating) diff = 1;
                if (sortBy == 'lowest-rating') diff *= -1;
                break;
            case 'title-ascending':
            case 'title-descending':
                var titleA = a.title.toLowerCase();
                var titleB = b.title.toLowerCase();
                if (titleA < titleB) diff = -1;
                else if (titleA > titleB) diff = 1;
                if (sortBy == 'title-descending') diff *= -1;
                break;
        }
    });
    return movieList;
}
