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
import collections

# globals for this module
media_type = "" # init
output_path = "" # init
content_path = "" # init
jinja_environment = None # init
jinja_default_settings = None # init
page_size = 0 # init
allowed_media_types = ("movie", "tv-series", "book")
allowed_thumbnail_states = ("original", "larger", "thumb")
sort_modes = (
    "highest-rating",
    "lowest-rating",
    "newest",
    "oldest",
    "title-a-z",
    "title-z-a"
)
default_sort_mode = "title-a-z"
not_media_types = [] # init
not_media_types_plural = [] # init
media_type_plural = "" # init
media_type_caps = "" # init
verb_present = "" # init
verb_past = "" # init
search_placeholder = "" # init
desired_width_thumbnail = 0 # init (px)
desired_width_larger = 0 # init (px)

def update_globals():
    global page_size, not_media_types, media_type_caps, search_placeholder, \
    not_media_types_plural, media_type_plural, verb_past, verb_present
    # note: call this function after check_media_type()

    page_size = jinja_default_settings["MEDIA_REVIEWS_PAGE_SIZE"]
    not_media_types = [
        t for t in allowed_media_types if (t != media_type)
    ]
    media_type_caps = get_media_type_caps()
    search_placeholder = get_search_placeholder()
    not_media_types_plural = [plural(t) for t in not_media_types]
    media_type_plural = plural(media_type)
    verb_present = "read" if (media_type == "book") else "watch"
    verb_past = "read" if (media_type == "book") else "watched"
    return {
        "file_hashes": {},
        "preloads": {},
        "verb_present": verb_present,
        "verb_past": verb_past,
        "type_plural": media_type_plural,
        "type_": media_type,
        "not_media_types": not_media_types,
        "not_media_types_plural": not_media_types_plural,
        "search_placeholder": search_placeholder
    }

def plural(english_word):
    """
    Given the an english word in singular form, get its plural form.
    Note that this function is grossly simplified and will not work for all
    english words (eg. bacterium -> bacteria, cactus -> cacti). However it is
    intended to work perfectly for the limited set of words it is currently used
    for.
    """
    if (english_word[-1] == "s"):
        return english_word
    return "%ss" % english_word

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

            # convert javascript naming format to python naming format
            # and delete the javascript naming format (single source of truth)
            underscore_name = camelCase_to_underscores(k)
            if underscore_name != k:
                a_media[underscore_name] = a_media[k]
                del a_media[k]
                k = underscore_name # for the remainder of this loop

            if isinstance(t, basestring):
                if ("?" in t) and (a_media[k] is None):
                    continue
                if "datetime" in t:
                    date_format = re.sub(r"datetime\?{0,1}\:[\s]*", "", t)
                    a_media[k + "_date"] = localtz.localize(
                        datetime.datetime.strptime(a_media[k], date_format)
                    )

    return all_media_x

def camelCase_to_underscores(s):
    # convert theThing to the_thing
    # and convert goodreadsID to goodreads_id
    # using a negative lookbehind
    underscored = re.sub(r"(?<![A-Z])([A-Z])", "_\\1", s)

    if underscored[0] == "_":
        underscored = underscored[1:]

    return underscored.lower()

# validation

def get_validation_fields():
    validation_fields = { # fields common to all types
        "title": basestring,
        "year": int,
        "thumbnail": basestring,
        "rating": numbers.Number,
        "spoilers": bool,
        "reviewTitle": basestring,
        "review": basestring,
        "genres": list,
        "reviewCreated": "datetime: %Y-%m-%d", # a custom 'type'
        "reviewUpdated": "datetime?: %Y-%m-%d" # a custom 'type' (nullable)
    }
    if (media_type == "movie"):
        validation_fields.update({
            "IMDBID": basestring,
        })
    elif (media_type == "tv-series"):
        validation_fields.update({
            "season": int,
            "IMDBID": basestring,
        })
    elif (media_type == "book"):
        validation_fields.update({
            "author": basestring,
            "goodreadsID": basestring,
            "isbn": basestring,
        })
    return validation_fields

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

        # title is necessary, but if it is not given then we need a way to
        # report which item is at fault
        title = a_media["title"] if "title" in a_media else "%s%s" % (media_type, i)

        for (k, t) in required_fields.iteritems():
            if k not in a_media:
                errors.append("'%s' does not have element '%s'" % (title, k))
            elif (isinstance(t, basestring) and "datetime" in t):
                if ("?" in t) and (a_media[k] is None): # nullable
                    continue
                try:
                    date_format = re.sub(r"datetime\?{0,1}\:[\s]*", "", t)
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

def get_media_type_caps():
    if (media_type == "movie"):
        return "Movie"
    elif (media_type == "tv-series"):
        return "TV-Series"
    elif (media_type == "book"):
        return "Book"

def get_id(a_media):
    # note: keep this function in sync with media-reviews.js getMediaID()
    if (media_type == "movie"):
        # a movie's id is the alphanumeric title and year chars
        id_ = "%s %s" % (a_media["title"], a_media["year"])
    elif (media_type == "tv-series"):
        # a tv series' id is the alphanumeric title, season (zero padded to 2
        # digits) and year
        id_ = "%s s%02d %s" % (
            a_media["title"], a_media["season"], a_media["year"]
        )
    elif (media_type == "book"):
        # a book's id is the alphanumeric author, title and year chars
        id_ = "%s %s %s" % (
            a_media["author"], a_media["title"], a_media["year"]
        )

    # replace all whitespace with a dash
    id_ = re.sub(r"\s+", "-", id_)

    # replace multiple dashes with a single dash
    id_ = re.sub(r"-+", "-", id_)

    # remove any non-alphanumeric characters
    id_ = re.sub(r"[^a-z0-9-]*", "", id_, flags = re.IGNORECASE)

    return id_.lower()

def get_img_data(media_id, state, get_hash = False):
    return_obj = { # init
        "basename": "",
        "url": "",
        "file_path": "",
        "on_filesystem": "",
        "on_rel_path": "",
        "hash": None
    }
    if state not in allowed_thumbnail_states:
        raise ValueError(
            "only the following states are allowed: %s" % (
                ", ".join(allowed_thumbnail_states)
            )
        )

    return_obj["basename"] = "%s-%s.jpg" % (state, media_id)
    return_obj["file_path"] = "%s/%s-reviews/img" % (content_path, media_type)
    return_obj["on_filesystem"] = "%s/%s" % (
        return_obj["file_path"], return_obj["basename"]
    )
    return_obj["on_rel_path"] = "/%s-reviews/img/%s" % (
        media_type, return_obj["basename"]
    )
    return_obj["url"] = "%s/%s-reviews/img/%s" % (
        jinja_default_settings["SITEURL"], media_type, return_obj["basename"]
    )

    if get_hash:
        try:
            return_obj["hash"] = get_file_hash(
                "%s/%s" % (return_obj["file_path"], return_obj["basename"])
            )
            return_obj["url"] += "?hash=%s" % return_obj["hash"]
        except IOError as e:
            if e.errno != errno.ENOENT:
                raise

            # img file does not exist. no worries - we will download it later
            pass

    return return_obj

def get_max_img_height(all_media_x, img_size):
    # note: only run this function after add_missing_data() and download_all()
    # complete, so that the heights of all thumbnails are available

    return max(a_media["%s_height" % img_size] for a_media in all_media_x)

def save_1_review_json(a_media):
    json_review_file = "%s/%s-reviews/json/review-%s.json" % (
        content_path, media_type, a_media["id_"]
    )
    with open(json_review_file, "w") as f:
        json.dump({ "reviewFull": a_media["review"] }, f)

    a_media["review_hash"] = get_file_hash(json_review_file)
    return a_media

def save_1_data_json(a_media):
    json_data_file = "%s/%s-reviews/json/data-%s.json" % (
        content_path, media_type, a_media["id_"]
    )
    # convert python naming format to javascript naming format
    json_data_content = {
        "rating": a_media["rating"],
        "title": a_media["title"],
        "spoilers": a_media["spoilers"],
        "reviewUpdated": a_media["review_updated"],
        "reviewHash": a_media["review_hash"],
        "year": a_media["year"],
        "reviewCreated": a_media["review_created"],
        "thumbnailHeight": a_media["thumb_height"],
        "reviewTitle": a_media["review_title"],
        "thumbnailHash": a_media["thumbnail_hash"]
    }
    if (media_type == "movie"):
        json_data_content["IMDBID"] = a_media["imdbid"]
    elif (media_type == "tv-series"):
        json_data_content["season"] = a_media["season"]
        json_data_content["IMDBID"] = a_media["imdbid"]
    elif (media_type == "book"):
        json_data_content["author"] = a_media["author"]
        json_data_content["goodreadsID"] = a_media["goodreads_id"]

    with open(json_data_file, "w") as f:
        json.dump(json_data_content, f)

    a_media["datafile_hash"] = get_file_hash(json_data_file)
    return a_media

def sort_media(sort_mode, all_media_x):
    return sorted(all_media_x, **get_sort_params(sort_mode))

def save_default_sort_indexes(all_media_x):
    # note: this function should only be called when all_media_x is already
    # sorted by highest-first
    for (i, a_media) in enumerate(all_media_x):
        a_media["default_index"] = i

    return all_media_x

def get_sort_params(sort_mode):
    if (sort_mode == "highest-rating"):
        key = lambda x: (-x["rating"], x["title"])
        reverse = False
    elif (sort_mode == "lowest-rating"):
        key = lambda x: (x["rating"], x["title"])
        reverse = False
    elif (sort_mode == "newest"):
        key = lambda x: x["last_modified"]
        reverse = True
    elif (sort_mode == "oldest"):
        key = lambda x: x["last_modified"]
        reverse = False
    elif (sort_mode == "title-a-z"):
        key = lambda x: (x["title"], x["season"] if "season" in x else None)
        reverse = False
    elif (sort_mode == "title-z-a"):
        key = lambda x: (x["title"], x["season"] if "season" in x else None)
        reverse = True

    return {
        "key": key,
        "reverse": reverse
    }

def save_full_list_json(
    sort_mode, all_media_x, first_page_only = False, return_preloads = False
):
    preload_ids = [] # init

    file_basename = "list-%s%s.json" % (
        sort_mode, "-first-%s" % page_size if first_page_only else ""
    )
    file_path = "%s-reviews/json/%s" % (media_type, file_basename)
    full_list_file = "%s/%s" % (content_path, file_path)

    the_list = all_media_x[:page_size] if first_page_only else all_media_x

    # todo: switch to generator once the list becomes too big
    # stackoverflow.com/questions/21663800
    list_of_tuples = [
        [a_media["id_"], a_media["datafile_hash"]] for a_media in the_list
    ]
    if return_preloads:
        preload_ids = [a_media["id_"] for a_media in the_list]

    # pretty json
    json_string = json.dumps(list_of_tuples, separators = (",", ":")). \
    replace("[[", "[\n["). \
    replace("],", "],\n"). \
    replace("]]","]\n]")

    with open(full_list_file, "w") as f:
        f.write(json_string)

    full_list_file_hash = get_file_hash(full_list_file)

    return {
        "list_file_hash": full_list_file_hash,
        "ids": preload_ids,
        "size": len(the_list) if first_page_only else len(all_media_x)
    }

def get_img_url(a_media, img_size):
    if (img_size == "thumb"):
        img_size = "thumb-"

    return "%s/%s-reviews/img/%s%s.jpg?hash=%s" % (
        jinja_default_settings["SITEURL"],
        media_type,
        img_size,
        a_media["id_"],
        a_media["thumbnail_hash"]
    )

def get_json_data_url(a_media):
    return "%s/%s-reviews/json/data-%s.json?hash=%s" % (
        jinja_default_settings["SITEURL"],
        media_type,
        a_media["id_"],
        a_media["datafile_hash"]
    )

def get_preload_data(preload_data, full_list_data):
    del preload_data["list_file_hash"]
    preload_data["first_page_size"] = preload_data["size"]
    preload_data["total_size"] = full_list_data["size"]
    del preload_data["size"]
    return preload_data

def save_search_index_json(sort_mode, all_media_x):
    basename = "search-index-%s.json" % sort_mode
    search_index_file = "%s/%s-reviews/json/%s" % (
        content_path, media_type, basename
    )
    # todo: switch to generator once the list becomes too big
    # stackoverflow.com/questions/21663800
    search_index = [get_search_item(a_media) for a_media in all_media_x]

    with open(search_index_file, "w") as f:
        json.dump(search_index, f, indent = 1)

    return get_file_hash(search_index_file)

def get_search_item(a_media):
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

def save_1_media_html(a_media, media_data, total_media_count):
    a_media["type_"] = media_type
    a_media["type_caps"] = media_type_caps
    a_media["search_placeholder"] = search_placeholder
    a_media["not_media_types"] = not_media_types
    a_media["not_media_types_plural"] = not_media_types_plural
    a_media["type_plural"] = media_type_plural
    a_media["verb_present"] = verb_present
    a_media["verb_past"] = verb_past
    a_media["linked_data"] = get_linked_data(a_media)
    a_media["external_link_url"] = "https://"
    if media_type == "book":
        a_media["external_link_url"] += "www.goodreads.com/book/show/%s" % \
        a_media["goodreads_id"]
    else:
        a_media["external_link_url"] += "www.imdb.com/title/%s" % \
        a_media["imdbid"]
    a_media["html_review"] = format_review(a_media["review"])

    preload_ids = copy.deepcopy(media_data["preloads"]["ids"])
    all_media_data = copy.deepcopy(media_data)

    all_media_data["total_media_count"] = total_media_count

    # add the current id to preloads and bump off the last to maintain the page
    # size
    if (a_media["id_"] not in preload_ids):
        preload_ids = [a_media["id_"]] + preload_ids[:page_size]

    # get img files from ids in a list
    all_media_data["preloads"]["img"] = [
        get_img_data(id_, "thumb")["on_rel_path"] for id_ in preload_ids
    ]

    # get json files from ids in a list and add the initial page of review items
    all_media_data["preloads"]["json"] = [
        "/%s-reviews/json/list-highest-rating-first-%s.json" % \
        (media_type, page_size)
    ] + [
        "/%s-reviews/json/data-%s.json" % (media_type, id_) for id_ in
        preload_ids
    ]

    # save the review files under the pages dir so that they get built by
    # pelican
    review_file_dir = "%s/pages/%s-reviews/%s" % (
        content_path, media_type, a_media["id_"]
    )
    # create the directory
    try:
        os.makedirs(review_file_dir)
    except OSError as e:
        if e.errno != errno.EEXIST:
            raise

    jinja_default_settings["media"] = a_media
    jinja_default_settings["all_media_data"] = all_media_data

    html_file = "%s/index.html" % review_file_dir
    with open(html_file, "w") as f:
        f.write(
            jinja_environment.get_template("a_media_review.html").
            render(jinja_default_settings)
        )
    del jinja_default_settings["media"]
    del jinja_default_settings["all_media_data"]

def format_review(review_text):
    review_text = review_text.replace(
        "##siteGlobals.siteURL##",
        jinja_default_settings["SITEURL"]
    )

    if "<p>" in review_text:
        return review_text

    return "<p>%s</p>" % review_text.replace("\n", "</p><p>")

def get_search_placeholder():
    if media_type == "movie":
        return "movie title or year"
    elif media_type == "tv-series":
        return "tv-series title, season or year"
    elif media_type == "book":
        return "book title, author or year"

def get_linked_data(a_media):
    """
    data that is placed in <script type="application/ld+json"></script>
    spec: https://schema.org/docs/full.html
    """
    if media_type == "movie":
        item_reviewed_type = "Movie"
    elif media_type == "tv-series":
        item_reviewed_type = "TVSeries"
    elif media_type == "book":
        item_reviewed_type = "Book"

    linked_data = {
        "@context": "http://schema.org",
        "@type": "Review",
        "url": "%s/%s-reviews/%s/" % (
            jinja_default_settings["SITEURL"], media_type, a_media["id_"]
        ),
        "inLanguage": "English",
        "itemReviewed": {
            "@type": item_reviewed_type,
            "name": a_media["title"],
            "genre": a_media["genres"]
        },
        "image": get_img_data(a_media["id_"], "larger", get_hash = True)["url"],
        "description": a_media["review_title"],
        "datePublished": a_media["review_created"],
        "reviewRating": {
            "@type": "Rating",
            "bestRating": 5,
            "ratingValue": a_media["rating"]
        },
        "reviewBody": re.sub("<[^<]+?>", "", a_media["review"])
    }
    if a_media["review_updated"] is not None:
        linked_data["dateModified"] = a_media["review_updated"]

    if media_type == "tv-series":
        linked_data["itemReviewed"]["containsSeason"] = {
            "@type": "TVSeason",
            "name": "Season %s" % a_media["season"]
        }
    elif media_type == "book":
        linked_data["itemReviewed"]["isbn"] = a_media["isbn"]
        linked_data["itemReviewed"]["author"] = a_media["author"]

    return linked_data

def prepare_landing_page_data(all_media_x, media_data):
    media_data["latest_review"] = \
    max(all_media_x, key = lambda x: x["last_modified"])["last_modified"]

    media_data["preloads"]["img"] = [
        get_img_data(id_, "thumb")["on_rel_path"] for id_ in
        media_data["preloads"]["ids"]
    ]
    media_data["preloads"]["json"] = [
        "/%s-reviews/json/list-highest-rating-first-%s.json" % \
        (media_type, page_size)
    ] + [
        "/%s-reviews/json/data-%s.json" % (media_type, id_) for id_ in
        media_data["preloads"]["ids"]
    ]
    media_data["total_media_count"] = len(all_media_x)
    media_data["not_media_types"] = not_media_types
    media_data["not_media_types_plural"] = not_media_types_plural
    return media_data

def prepare_rss_feed_data(all_media_x):
    feed_and_sitemap_data = []
    # only allow these fields in result
    fields = [
        "review_created", "review_created_date", "title", "season", "id_",
        "review_title"
    ]
    for a_media in all_media_x:
        a_filtered_media = {
            field: a_media[field] for field in fields if field in a_media
        }

        a_filtered_media["last_modified_date"] = \
        a_media["review_created_date"] if a_media["review_updated"] is None \
        else a_media["review_updated_date"]

        feed_and_sitemap_data.append(a_filtered_media)

    return feed_and_sitemap_data

def add_missing_data(all_media_x):
    for a_media in all_media_x:

        a_media["id_"] = get_id(a_media)

        a_media["last_modified"] = a_media["review_created"] if \
        a_media["review_updated"] is None else a_media["review_updated"]

        img_thumb_data = get_img_data(a_media["id_"], "thumb", get_hash = True)
        if img_thumb_data["hash"] is not None:
            a_media["thumbnail_hash"] = img_thumb_data["hash"]

        for img_size in ("thumb", "larger"):
            if (
                ("%s_width" % img_size) in a_media
                and ("%s_height" % img_size) in a_media
            ):
                # we already have the dimensions for this image size
                continue

            if img_size == "thumb":
                img_with_path = img_thumb_data["on_filesystem"]
            else:
                img_with_path = \
                get_img_data(a_media["id_"], img_size)["on_filesystem"]
            try:
                img = PIL.Image.open(img_with_path)
                (
                    a_media["%s_width" % img_size],
                    a_media["%s_height" % img_size]
                ) = img.size
            except IOError as e:
                if e.errno != errno.ENOENT:
                    raise

                # img file does not exist. no worries - we will download it later
                pass

    return all_media_x

# downloading thumbnails

def download_all(all_media_x):
    any_downloads_done = False
    for a_media in all_media_x:
        img_larger = get_img_data(a_media["id_"], "larger")["on_filesystem"]
        img_thumbnail = get_img_data(a_media["id_"], "thumb")["on_filesystem"]
        if (os.path.isfile(img_larger) and os.path.isfile(img_thumbnail)):
            continue # we already have both sizes of this image on disk

        response = requests.get(a_media["thumbnail"])
        if not response.ok:
            raise IOError(
                "failed to download the thumbnail for %s \"%s\": %s" % (
                    media_type, a_media["title"], a_media["thumbnail"]
                )
            )

        # save the thumbnail to the content (not output) dir so that QS_LINK can
        # read it and get its hash
        img_original = get_img_data(a_media["id_"], "original")["on_filesystem"]
        with open(img_original, "wb") as f:
            for data in response.iter_content(1024):
                if not data:
                    break
                f.write(data)

        any_downloads_done = True

    return any_downloads_done

def resize_thumbnails(all_media_x):
    if desired_width_thumbnail == 0:
        raise ValueError("the desired thumbnail width cannot be 0px")

    if desired_width_larger == 0:
        raise ValueError("the desired larger image width cannot be 0px")

    for a_media in all_media_x:
        try:
            img_original = PIL.Image.open(
                get_img_data(a_media["id_"], "original")["on_filesystem"]
            )
        except IOError as e:
            if e.errno == errno.ENOENT:
                # the original of this image is not present, so it must not need
                # resizing
                continue

        (original_width, original_height) = img_original.size
        print_img_size_warning_message(
            original_width, original_height, a_media["title"]
        )
        for img_size_name in ("thumb", "larger"):
            # resize down to create a thumbnail or larger image
            if img_size_name == "thumb":
                desired_width = desired_width_thumbnail
            elif img_size_name == "larger":
                desired_width = desired_width_larger
            else:
                raise ValueError("unknown img_size")

            a_media = calculate_new_img_sizes(
                original_width, original_height, desired_width, a_media,
                img_size_name
            )
            save_resized_image(img_original, a_media, img_size_name)

            # save the thumbnail hash to use in download lists later
            if img_size_name == "thumb":
                a_media["thumbnail_hash"] = \
                get_img_data(a_media["id_"], "thumb", get_hash = True)["hash"]

    return all_media_x

def calculate_new_img_sizes(
    original_width, original_height, desired_width, a_media, img_size_name
):
    width_percent = desired_width / float(original_width)
    desired_height = int(float(original_height) * float(width_percent))
    a_media["%s_width" % img_size_name] = desired_width
    a_media["%s_height" % img_size_name] = desired_height
    return a_media

def save_resized_image(img, a_media, img_size_name):
    new_img = img.resize(
        (
            a_media["%s_width" % img_size_name],
            a_media["%s_height" % img_size_name]
        ),
        PIL.Image.ANTIALIAS
    )
    new_img.save(get_img_data(a_media["id_"], img_size_name)["on_filesystem"])

def print_img_size_warning_message(original_width, original_height, title):
    if original_width >= desired_width_larger: # ok
        return

    print (
        "WARNING: the original size image for %s \"%s\" has width %s"
        " - i.e. it is smaller than %spx" % (
            media_type, title, original_width, desired_width_larger
        )
    )

def delete_original_size_thumbnails(all_media_x):
    for a_media in all_media_x:
        try:
            os.remove(get_img_data(a_media["id_"], "original")["on_filesystem"])
        except OSError as e:
            if e.errno != errno.ENOENT:
                raise
