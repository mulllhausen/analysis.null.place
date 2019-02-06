#!/usr/bin/env python2.7

"""
convert the imdb 'your ratings' > export file from csv to json

"""
import os
import csv
import json
from datetime import datetime

pwd = os.path.dirname(os.path.realpath(__file__))

# validation
required_fields = [
    "Const",
    "Your Rating",
    "Date Rated",
    "Title",
    "URL",
    "Title Type",
    "IMDb Rating",
    "Runtime (mins)",
    "Year",
    "Genres",
    "Num Votes",
    "Release Date",
    "Directors"
]

ratings = []

def parseRating(ratingStr):
    rating = float(ratingStr) / 2 # convert rating/10 to rating/5
    if rating % 1 == 0:
        rating = int(rating)
    return rating

with open("%s/ratings.csv" % pwd, "r") as f:
    reader = csv.reader(f)
    for (r, row) in enumerate(reader):

        # validate the first row
        if r == 0:
            for (c, column) in enumerate(row):
                if required_fields[c] != column:
                    raise ValueError(
                        "expected \"%s\" in column %s. found \"%s\" instead." %
                        (required_fields[c], c, column)
                    )
            continue

        if row[5] != "movie":
            print "skip row %s (\"%s\") since is not a movie, it is \"%s\"" % \
            (r, row[3], row[5])

        ratings.append({
            "rating-date": datetime.strptime(row[2], "%Y-%m-%d"),
            "title": row[3].decode("latin-1").encode("ascii", "ignore"),
            "year": int(row[8]),
            "rating": parseRating(row[1]),
            "spoilers": False,
            "thumbnail": "",
            "reviewTitle": "",
            "review": "",
            "IMDBID": row[0],
            "genres": row[9].split(", ")
        })

ratings = sorted(
    [movie for movie in ratings],
    key = lambda movie: movie["rating-date"]
)

for movie in ratings:
    del movie["rating-date"]

# print json.dumps(ratings, indent = 4, sort_keys = False, ensure_ascii = True)

outfile = "%s/ratings.json" % pwd
print "output saved to file %s" % outfile

with open(outfile, "w") as f:
    json.dump(ratings, f, indent = 4, sort_keys = False, ensure_ascii = True)
