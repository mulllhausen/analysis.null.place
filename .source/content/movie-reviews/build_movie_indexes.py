#!/usr/bin/env python2.7

"""
this script reads one file - json/movies-list-all.json - and outputs the
following files:
- json/movies-init-list.json
- json/movies-search-index.json
- json/movies-list.json

this script also outputs the complete jsons and img_preloads meta tags to stdout.
these can be copied into the movies article. they ensure that the service worker
caches all movie data.

"""
import build_indexes_grunt
import os
import json
import numbers

build_indexes_grunt.media_type = "movie"
pwd = os.path.dirname(os.path.realpath(__file__))

all_movies = build_indexes_grunt.load_list_all()

# validation
build_indexes_grunt.check_media_type()
required_fields = {
    "title": basestring,
    "year": int,
    "rating": numbers.Number,
    "spoilers": bool,
    "reviewTitle": basestring,
    "review": basestring,
    "IMDBID": basestring,
    "genres": list
}
errors = build_indexes_grunt.validate(all_movies, required_fields)
if len(errors) > 0:
    exit("\n".join(errors))

# generate json/movies-list.json and json/movie-review-xyz.json
# put reviews in their own file, so as to keep movies-list.json from being too
# large
build_indexes_grunt.update_meta_jsons()
all_movies = build_indexes_grunt.save_list_and_individual_review_files(all_movies)

# generate json/movies-init-list.json
# this is just the first 10 movies, sorted by max rating, then alphabetically by
# title. this json is used to populate the page initially
build_indexes_grunt.save_init_list(all_movies)

# generate json/movies-search-index.json
# this is just a list of movie titles and years - used for searching
build_indexes_grunt.save_search_index(all_movies)

build_indexes_grunt.print_metatags()
