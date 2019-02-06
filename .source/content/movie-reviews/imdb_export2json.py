#!/usr/bin/env python2.7

"""
convert the imdb 'your ratings' > export file from csv to json

"""
import os
import csv
from datetime import datetime
import re
import requests
import time

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

def getThumbURL(movieTitle, imdbID):
    time.sleep(1) # do not spam imdb with requests
    r = requests.get("https://imdb.com/title/%s/" % imdbID)
    # output to file for debugging
    #with open("/tmp/x", "w") as f:
    #    f.write(r.content)
    #exit()
    try:
        m1 = re.search("<div class=\"poster\">(.*?)</div>", r.content, re.DOTALL)
        chunk = m1.group(1)
        m2 = re.search("src=\"(.*?)\"", chunk, re.DOTALL)
        thumbURL = m2.group(1)

        # now change the image to choose one with the correct dimensions
        # change this: @._V1_UX182_CR0,0,182,268_AL_.jpg
        # to this:     @._V1_UY209_CR1,0,140,209_AL_.jpg
        thumbURL = thumbURL.replace(
            "@._V1_UX182_CR0,0,182,268_AL_.jpg", "@._V1_UY209_CR1,0,140,209_AL_.jpg"
        )
        return thumbURL
    except:
        print "failed to get thumbnail for \"%s\"" % movieTitle
        return ""

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
            continue

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

ratings_intermediate = []
for movie in ratings:
    del movie["rating-date"]
    thumbnailURL = getThumbURL(movie["title"], movie["IMDBID"])
    ratings_intermediate.append("""
        {
            "title": "%s",
            "year": %s,
            "rating": %s,
            "spoilers": false,
            "thumbnail": "%s",
            "reviewTitle": "",
            "review": "%s",
            "IMDBID": "%s",
            "genres": ["%s"]
        }""" % (
            movie["title"],
            movie["year"],
            movie["rating"],
            thumbnailURL,
            movie["review"],
            movie["IMDBID"],
            "\", \"".join(movie["genres"])
        )
    )

outfile = "%s/ratings.json" % pwd
print "output saved to file %s" % outfile

with open(outfile, "w") as f:
    f.write("[%s\n]" % ",".join(ratings_intermediate)) 
