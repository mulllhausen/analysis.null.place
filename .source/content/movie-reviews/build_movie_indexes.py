#!/usr/bin/env python2.7

"""
this script reads one file - json/movies-list-all.json - and outputs the
following files:
- json/movies-init-list.json
- json/movies-search-index.json
"""

import os
import json

pwd = os.path.dirname(os.path.realpath(__file__))

with open(pwd + "/../json/movies-list-all.json") as f:
    all_movies = json.load(f)["data"]

# generate json/movies-init-list.json
# this is just the first 10 movies, sorted by max rating, then alphabetically by
# title, with no review text. this json is used to populate the page initially
init_movie_list = sorted(
    [movie for movie in all_movies],
    key = lambda movie: (-movie["rating"], movie["title"][0])
)[:10]
with open(pwd + "/../json/movies-init-list.json", "w") as f:
    json.dump(init_movie_list, f)

# generate json/movies-search-index.json
# this is just a list of movie titles and years - used for searching
movie_titles = ["%s%s" % (movie["title"], movie["year"]) for movie in all_movies]
with open(pwd + "/../json/movies-search-index.json", "w") as f:
    json.dump(movie_titles, f)
