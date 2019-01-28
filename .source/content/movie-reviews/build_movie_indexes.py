#!/usr/bin/env python2.7

"""
this script reads one file - json/movies-list-all.json - and outputs the
following files:
- json/movies-init-list.json
- json/movies-search-index.json
"""

import os
import json
import re

pwd = os.path.dirname(os.path.realpath(__file__))

with open("%s/../json/movies-list-all.json" % pwd) as f:
    all_movies = json.load(f)["data"]

# generate json/movies-list.json and json/movie-review-xyz.json
for movie in all_movies:

    # put long reviews in their own file, so as to keep movies-list.json from
    # being too large
    if "review" in movie and len(movie["review"]) > 100:

        # the movie id is the alphanumeric title and year chars without spaces
        movie["id"] = re.sub(
            r"[^a-z0-9]*", "", ("%s%s" % (movie["title"], movie["year"])).lower()
        )
        with open("%s/../json/movie-review-%s.json" % (pwd, movie["id"]), "w") as f:
            json.dump({ "reviewFull": movie["review"] }, f)

        movie["reviewPreview"] = re.search(r".{,100}\b", movie["review"]).group(0)
        del movie["review"]

with open("%s/../json/movies-list.json" % pwd, "w") as f:
    json.dump(all_movies, f)

# generate json/movies-init-list.json
# this is just the first 10 movies, sorted by max rating, then alphabetically by
# title. this json is used to populate the page initially
init_movie_list = sorted(
    [movie for movie in all_movies],
    key = lambda movie: (-movie["rating"], movie["title"][0])
)[:10]
with open("%s/../json/movies-init-list.json" % pwd, "w") as f:
    json.dump(init_movie_list, f)

# generate json/movies-search-index.json
# this is just a list of movie titles and years - used for searching
movie_titles = ["%s%s" % (movie["title"], movie["year"]) for movie in all_movies]
with open("%s/../json/movies-search-index.json" % pwd, "w") as f:
    json.dump(movie_titles, f)
