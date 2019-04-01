#!/usr/bin/env python2.7

"""
shared functionality to build indexes for all types of review pages

"""
import os
import json
import re
import hashlib
import base64
import numbers

media_type = "" # init
pwd = os.path.dirname(os.path.realpath(__file__))

def plural(x):
    if (x[-1] == "s"):
        return x
    return "%ss" % x

def load_list_all():
    with open("%s/../json/%s-list-all.json" % (pwd, plural(media_type))) as f:
        return json.load(f)["data"]

# validation
def check_media_type():
    allowed_media_types = ("movie", "tv-series", "book")
    if (media_type not in allowed_media_types):
        raise ValueError(
            "media should be %s, however it is \"%s\""
            % (" or ".allowed_media_types, media_type)
        )

def validate(all_data, required_fields):
    errors = [] # init
    for (i, a_media) in enumerate(all_data):
        title = a_media["title"] if "title" in a_media else "%s%s" % (media_type, i)
        for (k, t) in required_fields.iteritems():
            if k not in a_media:
                errors.append("'%s' does not have element '%s'" % (title, k))
            elif not isinstance(a_media[k], t):
                errors.append("'%s': element '%s' has the wrong type" % (title, k))
            elif isinstance(a_media[k], basestring) and (a_media[k].strip() == ""):
                errors.append("'%s': element '%s' cannot be an empty string" % (title, k))
            elif isinstance(a_media[k], list) and not len(a_media[k]):
                errors.append("'%s': element '%s' cannot be an empty list" % (title, k))
            elif (
                (k == "rating")
                and ((a_media[k] < 0) or (a_media[k] > 5))
                and ((a_media[k] * 2) % 1 != 0)
            ):
                errors.append("'%s': element '%s' must be a half-int in 0 - 5 (inclusive)" % (title, k))
            elif (
                (k == "thumbnail")
                and (a_media[k][:4] != "http")
            ):
                errors.append("'%s': element '%s' must be a url" % (title, k))

    return errors

buffer_size = 5 * 1024 * 1024 # read files in chunks of 5MB each
def get_file_hash(filename):
    """get the file hash in a memory-efficient manner"""
    sha256 = hashlib.sha256()
    with open(filename, "rb") as f:
        while True:
            data = f.read(buffer_size)
            if not data:
                break
            sha256.update(data)

    return base64.urlsafe_b64encode(sha256.digest()).replace("=", "")[:6]

# generate json/<media_type>-list.json and json/<media_type>-review-xyz.json
# put reviews in their own file, so as to keep <media_type>-list.json from being
# too large
meta_img_preloads = []
meta_jsons = []
def update_meta_jsons():
    global meta_jsons
    meta_jsons = [
        "%s-%s.json" % (plural(media_type), x) for x in
        ["init-list", "list", "search-index"]
    ]

def generate_unique_id(a_media):
    if (media_type == "movie"):
        # a movie's id is the alphanumeric title and year chars without
        # spaces
        return re.sub(
            r"[^a-z0-9]*", "", (
                "%s%s" % (a_media["title"], a_media["year"])
            ).lower()
        )
    elif (media_type == "tv-series"):
        # a tv series' id is the alphanumeric title, year and season without
        # spaces
        return re.sub(
            r"[^a-z0-9]*", "", (
                "%s%s%s" % (
                    a_media["title"], a_media["season"], a_media["year"]
                )
            ).lower()
        )
    elif (media_type == "book"):
        # a book's id is the alphanumeric author, title and year chars
        # without spaces
        return re.sub(
            r"[^a-z0-9]*", "", (
                "%s%s%s" % (a_media["author"], a_media["title"], a_media["year"])
            ).lower()
        )

def generate_thumbnail_basename(a_media, original_size):
    return "%s-thumbnail-%s%s.jpg" % (
        media_type, a_media["id"], "-originalsize" if original_size else ""
    )

def save_list_and_individual_review_files(all_data):
    global meta_img_preloads, meta_jsons
    original_size = False
    for a_media in all_data:
        a_media["id"] = generate_unique_id(a_media)

        thumbnail_basename = generate_thumbnail_basename(a_media, original_size)
        a_media["thumbnailHash"] = get_file_hash(
            "%s/../img/%s" % (pwd, thumbnail_basename)
        )
        meta_img_preloads.append(thumbnail_basename)

        review_file_basename = "%s-review-%s.json" % (media_type, a_media["id"])
        meta_jsons.append(review_file_basename)
        review_file = "%s/../json/%s" % (pwd, review_file_basename)
        with open(review_file, "w") as f:
            json.dump({ "reviewFull": a_media["review"] }, f)

        a_media["reviewHash"] = get_file_hash(review_file)

        del a_media["id"]
        del a_media["review"]
        del a_media["thumbnail"]
        del a_media["genres"]
        if (media_type == "book"):
            del a_media["isbn"]

    with open("%s/../json/%s-list.json" % (pwd, plural(media_type)), "w") as f:
        json.dump(all_data, f)

    return all_data

# generate json/<media_type>-init-list.json
# this is just the first 10 movies, sorted by max rating, then alphabetically by
# title. this json is used to populate the page initially
def save_init_list(all_data):
    init_list = sorted(
        [a_media for a_media in all_data],
        key = lambda a_media: (-a_media["rating"], a_media["title"])
    )[:10]
    with open(
        "%s/../json/%s-init-list.json" % (pwd, plural(media_type)), "w"
    ) as f:
        json.dump(init_list, f)

# generate json/<media_type>-search-index.json
# this is just a list of media titles and years - used for searching
def save_search_index(all_data):
    media_titles = [generate_search_item(a_media) for a_media in all_data]
    with open(
        "%s/../json/%s-search-index.json" % (pwd, plural(media_type)), "w"
    ) as f:
        json.dump(media_titles, f)

def generate_search_item(a_media):
    search_item = "%s%s %s%s" % (
        "%s " % a_media["author"] if (media_type == "book") else "",
        a_media["title"],
        "%s " % a_media["season"] if (media_type == "tv-series") else "",
        a_media["year"]
    )
    # remove symbols - we do not want to search on these
    search_item = re.sub(r"[^A-Za-z0-9 ]*", "", search_item).lower()

    # remove double spaces, for efficiency
    return re.sub(r" +", " ", search_item)

def print_metatags():
    print """place these meta tags in your %s reviews article:

<meta name="img_preloads" content="%s"/>

<meta name="jsons" content="%s"/>
""" % (media_type, ",".join(meta_img_preloads), ",".join(meta_jsons))
