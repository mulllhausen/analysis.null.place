# Media Reviews Plugin

This plugin builds the media review pages. You must define the json sources and
their media types in the global variable MEDIA_REVIEWS in pelicanconf.py to use
it. For example:

    MEDIA_REVIEWS = {
        'book': {
            'src-list': 'book-reviews/json/list-all.json',
            'img_preloads': None, # gets populated by the plugin
            'jsons': None, # gets populated by the plugin
            'hash-bang-URLs': None # gets populated by the plugin
        },
        'movie': {
            'src-list': 'movie-reviews/json/list-all.json'
            'img_preloads': None, # gets populated by the plugin
            'jsons': None, # gets populated by the plugin
            'hash-bang-URLs': None # gets populated by the plugin
        },
        'tv-series': {
            'src-list': 'tv-series-reviews/json/list-all.json'
            'img_preloads': None, # gets populated by the plugin
            'jsons': None, # gets populated by the plugin
            'hash-bang-URLs': None # gets populated by the plugin
        }
    }

Note that all paths are under the PATH, and currently supported media types are:
- book
- movie
- tv-series
