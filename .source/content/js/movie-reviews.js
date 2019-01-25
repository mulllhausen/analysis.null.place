// init globals
initialMovieData = []; // 10 movies populated on the page initially
movieList = []; // all movies known to this page (may not be in sync with movies-list-all.json)
completeMovieSearch = []; // index of movie searches
completeMovieData = [];
movieSearchResults = [];
sampleEmptyStar = '';
sampleFullStar = '';
sampleHalfStar = '';

addEvent(window, 'load', function () {
    initSampleStar();
    initInitialMovieData();
    initMovieSearchList();
    addEvent(document.getElementById('search'), 'keyup', movieSearchChanged);
    addEvent(document.getElementById('sortBy'), 'click', sortMovies);
});

// rendering

function initSampleStar() {
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
    return '<div class="movie">' +
        '<div class="thumbnail-and-stars">' +
            '<img src="' + movieData.thumbnail + '">' +
            '<div class="stars">' +
                getMovieStarsHTML(movieData.rating) +
            '</div>' +
        '</div>' +
        '<div class="review">' +
            '<h3>' + movieData.title + ' (' + movieData.year + ')</h3>' +
            '<span>' + movieData.review + '</span>' +
        '</div>' +
    '</div>';
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
    var searchText = trim(document.getElementById('search').value);
    var searchResultIndexes = searchMovieTitles(searchText);
    var finalizeSearch = function() {
        movieSearchChangedFinalize(searchResultIndexes);
    };
    if (completeMovieData.length == 0) initCompleteMovieData(finalizeSearch);
    else finalizeSearch();
}

function movieSearchChangedFinalize(searchResultIndexes) {
    // use the list of indexes to get the list of complete movies for rendering
    foreach(movieSearchResultIndexes, function (_, movieI) {
        movieSearchResults.push(completeMovieData[movieI]);
    });
    movieSearchResults = sortMovies(movieSearchResults);
    var moviesHTML = '';
    foreach(movieSearchResults, function (_, movieData) {
        moviesHTML += getMovieHTML(movieData);
    });
    document.getElementById('reviewsArea').innerHTML = moviesHTML;
}

function searchMovieTitles(searchText) {
    var searchResultIndexes = []; // a list of movie list ids
    // todo: extract search terms from search text
    var searchTerms = [searchText];
    foreach(searchTerms, function (_, searchWord) {
        foreach(completeMovieSearch, function (i, movieWords) {
            if (inArray(searchWord, movieWords) && !inArray(i, searchResultIndexes)) {
                searchResultIndexes.push(i);
            }
        });
    });
    return searchResultIndexes;
}

function initCompleteMovieData(callback) {
    ajax(
        '/json/movies-list-all.json',
        function (json) {
        try {
            completeMovieData = JSON.parse(json).data;
            if (typeof callback == 'function') callback();
        }
        catch (err) {
            console.log('error in initCompleteMovieData function: ' + err);
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
