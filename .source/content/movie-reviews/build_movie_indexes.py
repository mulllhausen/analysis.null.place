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
import hashlib
import numbers

pwd = os.path.dirname(os.path.realpath(__file__))

with open("%s/../json/movies-list-all.json" % pwd) as f:
    all_movies = json.load(f)["data"]

# validation
required_fields = {
    "title": basestring,
    "year": int,
    "rating": numbers.Number,
    "spoilers": bool,
    "thumbnail": basestring,
    "reviewTitle": basestring,
    "review": basestring,
    "IMDBID": basestring,
    "genres": list
}
errors = [] # init
for (i, movie) in enumerate(all_movies):
    title = movie["title"] if "title" in movie else "movie%s" % i
    for (k, t) in required_fields.iteritems():
        if k not in movie:
            errors.append("'%s' does not have element '%s'" % (title, k))
        elif not isinstance(movie[k], t):
            errors.append("'%s': element '%s' has the wrong type" % (title, k))
        elif isinstance(movie[k], basestring) and (movie[k].strip() == ""):
            errors.append("'%s': element '%s' cannot be an empty string" % (title, k))
        elif (
            (k == "rating")
            and ((movie[k] < 0) or (movie[k] > 5))
            and ((movie[k] * 2) % 1 != 0)
        ):
            errors.append("'%s': element '%s' must be a half-int in 0 - 5 (inclusive)" % (title, k))
        elif isinstance(movie[k], list) and not len(movie[k]):
            errors.append("'%s': element '%s' cannot be an empty list" % (title, k))

if len(errors) > 0:
    exit("\n".join(errors))

# generate json/movies-list.json and json/movie-review-xyz.json
# put reviews in their own file, so as to keep movies-list.json from being too
# large
for movie in all_movies:
    # the movie id is the alphanumeric title and year chars without spaces
    movie["id"] = re.sub(
        r"[^a-z0-9]*", "", ("%s%s" % (movie["title"], movie["year"])).lower()
    )
    movie["reviewHash"] = hashlib.sha256(movie["review"].encode()).hexdigest()[:6]
    with open("%s/../json/movie-review-%s.json" % (pwd, movie["id"]), "w") as f:
        json.dump({ "reviewFull": movie["review"] }, f)

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
movie_titles = [
    "%s %s" % (movie["title"].lower(), movie["year"]) for movie in all_movies
]
with open("%s/../json/movies-search-index.json" % pwd, "w") as f:
    json.dump(movie_titles, f)
