// init globals
initialMovieList = []; // 10 movies populated on the page initially
movieList = []; // all movies known to this page (may not be in sync with movies-list-all.json)
sampleEmptyStar = '';
sampleFullStar = '';
sampleHalfStar = '';

addEvent(window, 'load', function () {
    initSampleStar();
    initMovieList();
    addEvent(document.getElementById('search'), 'change', searchMovieTitles);
    addEvent(document.getElementById('sortBy'), 'click', sortMovies);
});

function initSampleStar() {
    sampleEmptyStar = document.getElementsByClassName('icon-star-o')[0].outerHTML;
    sampleFullStar = document.getElementsByClassName('icon-star')[0].outerHTML;
    sampleHalfStar = document.getElementsByClassName('icon-star-half-empty')[0].outerHTML;
}

function initMovieList() {
    ajax(
        '/json/movies-init-list.json',
        function (json) {
        try {
            initialMovieList = JSON.parse(json);
            var initialMovieListHTML = '';
            for (var i = 0; i < initialMovieList.length; i++) {
                initialMovieListHTML += getMovieHTML(initialMovieList[i]);
            }
            document.getElementById('reviewsArea').innerHTML =
            initialMovieListHTML;
        }
        catch (err) {
            console.log('error in initialMovieList function: ' + err);
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

function searchMovieTitles() {
}

function sortMovies() {
}
