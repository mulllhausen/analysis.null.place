#!/usr/bin/env python2.7

"""
this script reads one file - json/tv-series-list-all.json - and outputs the
following files:
- json/tv-series-init-list.json
- json/tv-series-search-index.json
- json/tv-series-list.json

this script also outputs the complete jsons and img_preloads meta tags to stdout.
these can be copied into the tv-series article. they ensure that the service
worker caches all tv-series data.

"""
import build_indexes_grunt
import os
import json
import numbers

build_indexes_grunt.media_type = "tv-series"
pwd = os.path.dirname(os.path.realpath(__file__))

all_tv_series = build_indexes_grunt.load_list_all()

# validation
build_indexes_grunt.check_media_type()
required_fields = {
    "title": basestring,
    "season": int,
    "year": int,
    "thumbnail": basestring,
    "rating": numbers.Number,
    "spoilers": bool,
    "reviewTitle": basestring,
    "review": basestring,
    "IMDBID": basestring,
    "genres": list
}
errors = build_indexes_grunt.validate(all_tv_series, required_fields)
if len(errors) > 0:
    exit("\n".join(errors))

# generate json/tv-series-list.json and json/tv-series-review-xyz.json
# put reviews in their own file, so as to keep tv-series-list.json from being
# too large
build_indexes_grunt.update_meta_jsons()
all_tv_series = build_indexes_grunt.save_list_and_individual_review_files(all_tv_series)

# generate json/tv-series-init-list.json
# this is just the first 10 tv-series, sorted by max rating, then alphabetically
# by title. this json is used to populate the page initially
build_indexes_grunt.save_init_list(all_tv_series)

# generate json/tv-series-search-index.json
# this is just a list of tv-series titles and years - used for searching
build_indexes_grunt.save_search_index(all_tv_series)

build_indexes_grunt.print_metatags()
