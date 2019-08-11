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
import datetime
import pytz
import requests
import copy
import PIL
import jinja2
import errno

media_type = "" # init
output_path = "" # init
content_path = "" # init
jinja_environment = None # init
jinja_default_settings = None # init

def plural(x):
    if (x[-1] == "s"):
        return x
    return "%ss" % x

def init_jinja_environment(pelican_obj):
    global jinja_environment, jinja_default_settings

    jinja_environment = jinja2.Environment(
        loader = jinja2.FileSystemLoader(
            os.path.join(pelican_obj.settings["THEME"], "templates")
        ),
        **pelican_obj.settings["JINJA_ENVIRONMENT"]
    )
    jinja_default_settings = copy.deepcopy(pelican_obj.settings)
    jinja_default_settings["ARTICLE_TYPE"] = "media-review"

def convert_types(all_media_x, field_formats, timezone_name):
    # note: only call this function if validate() passes
    localtz = pytz.timezone(timezone_name)
    for a_media in all_media_x:
        for (k, t) in field_formats.iteritems():
            if (isinstance(t, basestring) and "datetime" in t):
                date_format = re.sub(r"datetime\:[\s]*", "", t)
                a_media[k] = localtz.localize(
                    datetime.datetime.strptime(a_media[k], date_format)
                )
    return all_media_x

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
        "genres": list,
        "reviewDate": "datetime: %Y-%m-%d"
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

allowed_media_types = ("movie", "tv-series", "book")
def check_media_type():
    global allowed_media_types
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
            elif (isinstance(t, basestring) and "datetime" in t):
                try:
                    date_format = re.sub(r"datetime\:[\s]*", "", t)
                    datetime.datetime.strptime(a_media[k], date_format)
                except:
                    errors.append(
                        "'%s': element '%s' is not a datetime of type '%s'" %
                        (title, k, date_format)
                    )
            elif not isinstance(a_media[k], t):
                errors.append(
                    "'%s': element '%s' has the wrong type" % (title, k)
                )
            elif isinstance(a_media[k], basestring) and (a_media[k].strip() == ""):
                errors.append(
                    "'%s': element '%s' cannot be an empty string" % (title, k)
                )
            elif isinstance(a_media[k], list) and not len(a_media[k]):
                errors.append(
                    "'%s': element '%s' cannot be an empty list" % (title, k)
                )
            elif (
                (k == "rating")
                and ((a_media[k] < 0) or (a_media[k] > 5))
                and ((a_media[k] * 2) % 1 != 0)
            ):
                errors.append(
                    "'%s': element '%s' must be a half-int in 0 - 5 (inclusive)"
                    % (title, k)
                )
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
all_data = []
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

def save_list_and_individual_review_jsons(all_media_x):
    global meta_img_preloads, meta_jsons, all_data
    original_size = False
    all_media_listfile = [] # init

    # fields for the list json files
    listfile_fields = get_listfile_fields()

    all_media_x = sorted(
        [a_media for a_media in all_media_x],
        key = lambda a_media: (a_media["reviewDate"], a_media["title"])
    )
    for a_media in all_media_x:
        all_data.append(a_media)
        thumbnail_basename = generate_thumbnail_basename(a_media, original_size)
        a_media["thumbnailHash"] = get_file_hash(
            "%s/img/%s" % (content_path, thumbnail_basename)
        )
        meta_img_preloads.append(thumbnail_basename)

        json_review_file_basename = "%s-review-%s.json" % (media_type, a_media["id"])
        meta_jsons.append(json_review_file_basename)
        json_review_file = "%s/json/%s" % (content_path, json_review_file_basename)

        # save the json review to the content (not output) dir so that QS_LINK
        # can read it and get its hash
        with open(json_review_file, "w") as f:
            json.dump({ "reviewFull": a_media["review"] }, f)

        a_media["reviewHash"] = get_file_hash(json_review_file)

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

def save_review_htmls(all_media_x):
    jinja_default_settings["MEDIA_REVIEWS"]["CURRENT_MEDIA_TYPE"] = media_type

    jinja_default_settings["MEDIA_REVIEWS"]["NOT_MEDIA_TYPES"] = [
        plural(t) for t in allowed_media_types if t != media_type
    ]
    jinja_default_settings["MEDIA_REVIEWS"]["CURRENT_MEDIA_TYPE_PLURAL"] = \
    plural(media_type)

    jinja_default_settings["MEDIA_REVIEWS"]["VERB_PRESENT"] = \
    "read" if media_type == "book" else "watch"

    jinja_default_settings["MEDIA_REVIEWS"]["VERB_PAST"] = \
    "read" if media_type == "book" else "watched"

    for a_media in all_media_x:
        a_media["thumbnail_on_disk"] = "/img/%s" % (
            generate_thumbnail_basename(a_media, original_size = False)
        )
        a_media["external_link_url"] = "https://"
        if media_type == "book":
            a_media["external_link_url"] += "www.goodreads.com/book/show/%s" % \
            a_media["goodreadsID"]
        else:
            a_media["external_link_url"] += "www.imdb.com/title/%s" % \
            a_media["IMDBID"]

        jinja_default_settings["MEDIA_REVIEWS"]["CURRENT_MEDIA_DATA"] = a_media
        review_file_dir = "%s/%s-reviews/%s" % (
            output_path, media_type, a_media["id"]
        )
        # create the directory
        try:
            os.makedirs(review_file_dir)
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise

        # prepare the linked data for rendering
        if media_type == "movie":
            LINKED_DATA_type = "Movie"
        elif media_type == "tv-series":
            LINKED_DATA_type = "TVSeries"
        elif media_type == "book":
            LINKED_DATA_type = "Book"

        jinja_default_settings["LINKED_DATA"] = {
            "@context": "http://schema.org",
            "@type": LINKED_DATA_type,
            "name": "%s Review: %s" % (media_type.capitalize(), a_media["title"]),
            "description": a_media["reviewTitle"],
            "date": a_media["reviewDate"].strftime("%Y-%m-%d"),
            "aggregateRating": {
                "@type": "AggregateRating",
                "bestRating": "5",
                "ratingValue": "%s" % a_media["rating"]
            },
            "reviewBody": a_media["review"],
            "genre": a_media["genres"]
        }
        if media_type == "tv-series":
            jinja_default_settings["LINKED_DATA"]["containsSeason"] = {
                "@type": "TVSeason",
                "name": "Season %s" % (a_media["season"])
            }
        elif media_type == "book":
            jinja_default_settings["LINKED_DATA"]["isbn"] = a_media["isbn"]
            jinja_default_settings["LINKED_DATA"]["author"] = a_media["author"]

        jinja_default_settings["output_file"] = "%s-reviews/%s/index.html" % (
            media_type, a_media["id"]
        )

        # create the html file
        review_file = "%s/index.html" % (review_file_dir)
        with open(review_file, "w") as f:
            f.write(
                jinja_environment.get_template("media_review.html").
                render(jinja_default_settings)
            )

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
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise

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
        try:
            img = PIL.Image.open("%s/img/%s" % (content_path, original_thumbnail))
        except OSError as e:
            if e.errno != errno.EEXIST:
                # the original of this image is not present, so it must not need
                # resizing
                continue
        (original_width, original_height) = img.size
        width_percent = desired_width / float(original_width)
        desired_height = int(float(original_height) * float(width_percent))
        img = img.resize((desired_width, desired_height), PIL.Image.ANTIALIAS)
        resized_thumbnail = generate_thumbnail_basename(
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
        except OSError as e:
            if e.errno != errno.EEXIST:
                raise
