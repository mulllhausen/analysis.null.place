// init globals
initialMovieList = []; // 10 movies populated on the page initially
movieList = []; // all movies known to this page (may not be in sync with movies-list-all.json)

addEvent(window, 'load', function () {
    initMovieList();
    addEvent(document.getElementById('search'), 'change', searchMovieTitles);
    addEvent(document.getElementById('sortBy'), 'click', sortMovies);
});

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
        '<img src="' + movieData.thumbnail + '">' +
        '<div class="review">' +
            '<h3>' + movieData.title + ' (' + movieData.year + ')</h3>' +
            '<span>' + movieData.review + '</span>' +
        '</div>' +
    '</div>';
}

function searchMovieTitles() {
}

function sortMovies() {
}
