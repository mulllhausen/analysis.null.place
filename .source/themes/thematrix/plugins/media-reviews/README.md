# Media Reviews Plugin

This plugin builds the media review pages. You must define the json sources and
their types in the global variable MEDIA_REVIEWS in pelicanconf.py to use it.
For example:

    MEDIA_REVIEWS = {
        'book': 'json/books-list-all.json',
        'movie': 'json/movies-list-all.json',
        'tv-series': 'json/tv-series-list-all.json'
    }

Note that all paths are under the PATH, and all known media types are:
- book
- movie
- tv-series
