#!/usr/bin/env python2.7

"""
this script reads one file - json/books-list-all.json - and outputs the
following files:
- json/books-init-list.json
- json/books-search-index.json
- json/books-list.json

this script also outputs the complete jsons and img_preloads meta tags to stdout.
these can be copied into the books article. they ensure that the service worker
caches all book data.

"""
import build_indexes_grunt
import os
import json
import numbers

build_indexes_grunt.media_type = "book"

all_books = build_indexes_grunt.load_list_all()

# validation
build_indexes_grunt.check_media_type()
required_fields = {
    "title": basestring,
    "author": basestring,
    "year": int,
    "thumbnail": basestring,
    "rating": numbers.Number,
    "spoilers": bool,
    "reviewTitle": basestring,
    "review": basestring,
    "goodreadsID": basestring,
    "isbn": basestring,
    "genres": list
}
errors = build_indexes_grunt.validate(all_books, required_fields)
if len(errors) > 0:
    exit("\n".join(errors))

# generate json/books-list.json and json/book-review-xyz.json
# put reviews in their own file, so as to keep books-list.json from being too
# large
build_indexes_grunt.update_meta_jsons()
all_books = build_indexes_grunt.save_list_and_individual_review_files(all_books)

# generate json/books-init-list.json
# this is just the first 10 books, sorted by max rating, then alphabetically by
# title. this json is used to populate the page initially
build_indexes_grunt.save_init_list(all_books)

# generate json/books-search-index.json
# this is just a list of book titles and years - used for searching
build_indexes_grunt.save_search_index(all_books)

build_indexes_grunt.print_metatags()
