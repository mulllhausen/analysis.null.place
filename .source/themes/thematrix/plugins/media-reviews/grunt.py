#!/usr/bin/env python2.7

"""
shared functionality to build indexes for all types of review pages and to
download thumbnails

"""
import os
import json
import re
import hashlib
import base64
import numbers
import requests
import copy
from PIL import Image

media_type = "" # init
output_path = "" # init
content_path = "" # init

def plural(x):
    if (x[-1] == "s"):
        return x
    return "%ss" % x

# validation
def get_validation_fields():
    required_fields = { # fields common to all types
        "title": basestring,
        "year": int,
        "thumbnail": basestring,
        "rating": numbers.Number,
        "spoilers": bool,
        "reviewTitle": basestring,
        "review": basestring,
        "genres": list
    }
    if (media_type == "movie"):
        required_fields.update({
            "IMDBID": basestring,
        })
    elif (media_type == "tv-series"):
        required_fields.update({
            "season": int,
            "IMDBID": basestring,
        })
    elif (media_type == "book"):
        required_fields.update({
            "author": basestring,
            "goodreadsID": basestring,
            "isbn": basestring,
        })
    return required_fields

def check_media_type():
    allowed_media_types = ("movie", "tv-series", "book")
    if (media_type not in allowed_media_types):
        raise ValueError(
            "media should be %s, however it is \"%s\""
            % (" or ".join(allowed_media_types), media_type)
        )

def validate(all_media_x, required_fields):
    errors = [] # init
    for (i, a_media) in enumerate(all_media_x):
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
meta_hashbang_URLs = []
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

def save_list_and_individual_review_files(all_media_x):
    global meta_img_preloads, meta_jsons, meta_hashbang_URLs
    original_size = False
    all_media_listfile = [] # init

    # fields for the list json files
    listfile_fields = get_listfile_fields()

    for a_media in all_media_x:
        meta_hashbang_URLs.append(a_media["id"])

        thumbnail_basename = generate_thumbnail_basename(a_media, original_size)
        a_media["thumbnailHash"] = get_file_hash(
            "%s/img/%s" % (content_path, thumbnail_basename)
        )
        meta_img_preloads.append(thumbnail_basename)

        review_file_basename = "%s-review-%s.json" % (media_type, a_media["id"])
        meta_jsons.append(review_file_basename)
        review_file = "%s/json/%s" % (content_path, review_file_basename)

        # save the media list to the content (not output) dir so that QS_LINK
        # can read it and get its hash
        with open(review_file, "w") as f:
            json.dump({ "reviewFull": a_media["review"] }, f)

        a_media["reviewHash"] = get_file_hash(review_file)

        all_media_listfile.append({
            k: v for (k, v) in a_media.iteritems() if (k in listfile_fields)
        })

    # save the media list to the content (not output) dir so that QS_LINK can
    # read it and get its hash
    with open(
        "%s/json/%s-list.json" % (content_path, plural(media_type)), "w"
    ) as f:
        json.dump(all_media_listfile, f, sort_keys = True)

    return all_media_x

def get_listfile_fields():
    required_fields = [
        "rating", "title", "spoilers", "reviewTitle", "reviewHash", "year",
        "thumbnailHash"
    ]
    if (media_type == "movie"):
        required_fields.extend(["IMDBID"])
    elif (media_type == "tv-series"):
        required_fields.extend(["season", "IMDBID"])
    elif (media_type == "book"):
        required_fields.extend(["author", "goodreadsID"])
    return required_fields

# generate json/<media_type>-init-list.json
# this is just the first 10 movies, sorted by max rating, then alphabetically by
# title. this json is used to populate the page initially
def save_init_list(all_media_x):
    required_fields = get_listfile_fields()
    init_list1 = [
        {k:v for (k, v) in a_media.iteritems() if (k in required_fields)}
        for a_media in all_media_x
    ]
    init_list2 = sorted(
        [a_media for a_media in init_list1],
        key = lambda a_media: (-a_media["rating"], a_media["title"])
    )[:10]

    # save the media init list to the content (not output) dir so that QS_LINK
    # can read it and get its hash
    with open(
        "%s/json/%s-init-list.json" % (content_path, plural(media_type)), "w"
    ) as f:
        json.dump(init_list2, f, sort_keys = True)

# generate json/<media_type>-search-index.json
# this is just a list of media titles and years - used for searching
def save_search_index(all_media_x):
    media_titles = [generate_search_item(a_media) for a_media in all_media_x]

    # save the media search index to the content (not output) dir so that
    # QS_LINK can read it and get its hash
    with open(
        "%s/json/%s-search-index.json" % (content_path, plural(media_type)), "w"
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

# downloading thumbnails

def add_missing_data(all_media_x):
    for a_media in all_media_x:
        a_media["id"] = generate_unique_id(a_media)
        small_thumbnail = generate_thumbnail_basename(
            a_media, original_size = False
        )
        try:
            a_media["thumbnailHash"] = get_file_hash(
                "%s/img/%s" % (content_path, small_thumbnail)
            )
        except:
            # img file does not exist. no worries - we will download it later
            pass

    return all_media_x

def download_all(all_media_x):
    any_downloads_done = False
    for a_media in all_media_x:
        small_thumbnail = generate_thumbnail_basename(
            a_media, original_size = False
        )
        if os.path.isfile("%s/img/%s" % (content_path, small_thumbnail)):
            continue # we already have this file

        original_thumbnail = generate_thumbnail_basename(
            a_media, original_size = True
        )
        response = requests.get(a_media["thumbnail"])
        if not response.ok:
            raise IOError(
                "failed to download the thumbnail for %s \"%s\": %s" % (
                    media_type, a_media["title"], a_media["thumbnail"]
                )
            )

        # save the media search index to the content (not output) dir so that
        # QS_LINK can read it and get its hash
        with open("%s/img/%s" % (content_path, original_thumbnail), "wb") as f:
            for data in response.iter_content(1024):
                if not data:
                    break
                f.write(data)

        any_downloads_done = True

    return any_downloads_done

desired_width = 0 # px
def resize_thumbnails(all_media_x):
    if desired_width == 0:
        raise ValueError("the desired image width cannot be 0px")
    
    for a_media in all_media_x:
        original_thumbnail = generate_thumbnail_basename(
            a_media, original_size = True
        )
        img = Image.open("%s/img/%s" % (content_path, original_thumbnail))
        (original_width, original_height) = img.size
        width_percent = desired_width / float(original_width)
        desired_height = int(float(original_height) * float(width_percent))
        img = img.resize((desired_width, desired_height), Image.ANTIALIAS)
        resized_thumbnail = build_indexes_grunt.generate_thumbnail_basename(
            a_media, original_size = False
        )
        img.save("%s/img/%s" % (content_path, resized_thumbnail))

def delete_original_size_thumbnails(all_media_x):
    for a_media in all_media_x:
        original_thumbnail = generate_thumbnail_basename(
            a_media, original_size = True
        )
        try:
            os.remove("%s/img/%s" % (content_path, original_thumbnail))
        except:
            pass
