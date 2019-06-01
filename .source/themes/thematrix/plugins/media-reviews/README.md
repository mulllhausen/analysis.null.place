# Media Reviews Plugin

This plugin builds the media review pages. You must define the json sources and
their media types in the global variable MEDIA_REVIEWS in pelicanconf.py to use
it. For example:

    MEDIA_REVIEWS = {
        'book': {
            'src-list': 'json/books-list-all.json',
            'img_preloads': None, # gets populated by the plugin
            'jsons': None, # gets populated by the plugin
            'hash-bang-URLs': None # gets populated by the plugin
        },
        'movie': {
            'src-list': 'json/movies-list-all.json'
            'img_preloads': None, # gets populated by the plugin
            'jsons': None, # gets populated by the plugin
            'hash-bang-URLs': None # gets populated by the plugin
        },
        'tv-series': {
            'src-list': 'json/tv-series-list-all.json'
            'img_preloads': None, # gets populated by the plugin
            'jsons': None, # gets populated by the plugin
            'hash-bang-URLs': None # gets populated by the plugin
        }
    }

Note that all paths are under the PATH, and currently supported media types are:
- book
- movie
- tv-series
