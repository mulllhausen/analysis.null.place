#!/usr/bin/env python2.7

import build_indexes_grunt
import download_thumbnails_grunt

build_indexes_grunt.media_type = "movie"

all_movies = build_indexes_grunt.load_list_all()

# validation
build_indexes_grunt.check_media_type()
required_fields = {
    "title": basestring,
    "year": int,
    "thumbnail": basestring
}

errors = build_indexes_grunt.validate(all_movies, required_fields)
if len(errors) > 0:
    exit("\n".join(errors))

all_movies = download_thumbnails_grunt.add_unique_ids(all_movies)

download_thumbnails_grunt.download_all(all_movies)

download_thumbnails_grunt.desired_width = 100 # px
download_thumbnails_grunt.resize_thumbnails(all_movies)
