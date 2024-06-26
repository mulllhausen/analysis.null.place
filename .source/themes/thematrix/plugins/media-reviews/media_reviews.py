import sys
import os
sys.path.append(os.path.dirname(__file__))
import pelican
import grunt
import json
from jinja2 import Environment, FileSystemLoader
#import pudb

def media_reviews(pelican_obj):
    """
    See README.md for the high-level functionality of this plugin. All files
    described in README.md are created by this function.

    The low level functionality of this function is, for each media type
    specified in pelican.py:
        1. Validate that each item has the required fields and that they are in
        the correct format (these are user-created so they may have forgotten a
        field or put the wrong data in it).
        2. Convert data (eg. a date from string to datetime object).
        3. Add missing data (id, thumbnail names and hashes if available).
        4. Download any missing thumbnails and resize.

        At this point we have enough data to begin writing files.

        5. Save the review-<id>.json files.
        6. Save the data-<id>.json files.
        7. Save the list-highest-rating.json, list-newest.json, etc files.
        8. Save the search-index-highest-rating.json, search-index-newest.json,
        etc files.
        9. Save the <id>/index.html pages
        10. Prepare the data for article <media>-reviews/index.html pages.
        11. Prepare the data for feeds and sitemap.
    """
    # todo:
    # in future, once src-lists grow beyond, say 10,000 review items find a more
    # memory efficient way of processing this data - maybe sharding, maybe
    # generators.
    # that will be a fun task, but there is no need to design it for a long
    # while yet.
    # also fix for incremental static rendering at that time

    #pu.db

    # initialise the dict where all media data will be stored
    pelican_obj.settings["MEDIA_REVIEWS"] = {}

    grunt.debug = pelican_obj.settings["DEBUG1"]
    grunt.output_path = pelican_obj.settings["OUTPUT_PATH"]
    grunt.content_path = pelican_obj.settings["PATH"]
    grunt.init_jinja_environment(pelican_obj)
    grunt.desired_width_thumbnail = 100 # px
    grunt.desired_width_larger = 200 # px

    # loop through each media type (eg. movies, books, etc). these come from
    # pelican.py, and are initially sparcely populated.
    for media_type in pelican_obj.settings["MEDIA_REVIEW_TYPES"]:
        src_list = "%s-reviews/json/list-all.json" % media_type
        with open(os.path.join(grunt.content_path, src_list)) as f:
            # note: all_media_x (meaning all media of type x - eg all books) is
            # just use a simple list of dicts (not classes), for speed.
            all_media_x = json.load(f)["data"]

        grunt.media_type = media_type
        validation_fields = grunt.get_validation_fields()
        grunt.check_media_type()

        # reset the dict that stores all data for this media type
        media_data = grunt.update_globals()

        # 1. Validate that each item has the required fields and that they are
        # in the correct format (these are user-created so they may have
        # forgotten a field or put the wrong data in it).
        errors = grunt.validate(all_media_x, validation_fields)
        if len(errors) > 0:
            exit("\n".join(errors))

        # 2. Convert data (eg. a date from string to datetime object).
        all_media_x = grunt.convert_types(
            all_media_x, validation_fields, pelican_obj.settings["TIMEZONE"]
        )

        # 3. Add missing data (id, thumbnail names and hashes if available).
        all_media_x = grunt.add_missing_data(all_media_x)

        # 4. Download any missing thumbnails and resize.
        any_downloads_done = grunt.download_all(all_media_x)

        if any_downloads_done:
            # resize thumbnails
            all_media_x = grunt.resize_thumbnails(all_media_x)
            grunt.delete_original_size_thumbnails(all_media_x)

        media_data["max_thumb_height"] = \
        grunt.get_max_img_height(all_media_x, "thumb")

        # At this point we have enough data to begin writing files.

        for (i, a_media) in enumerate(all_media_x):
            # 5. Save the review-<id>.json files.
            a_media = grunt.save_1_review_json(a_media)

            # 6. Save the data-<id>.json files.
            a_media = grunt.save_1_data_json(a_media)

            all_media_x[i] = a_media

        for sort_mode in grunt.sort_modes:
            all_media_x = grunt.sort_media(sort_mode, all_media_x)

            # 7. Save the list-highest-rating.json, list-newest.json, etc files.
            full_list_data = grunt.save_full_list_json(sort_mode, all_media_x)
            media_data["file_hashes"]["list-%s" % sort_mode] = \
            full_list_data["list_file_hash"]

            if sort_mode == grunt.default_sort_mode:
                # returns data jsons and the chopped list
                chopped_list_data = grunt.save_full_list_json(
                    sort_mode,
                    all_media_x,
                    first_page_only = True,
                    return_preloads = True
                )
                media_data["file_hashes"][
                    "list-%s-first-%s" % (sort_mode, grunt.page_size)
                ] = chopped_list_data["list_file_hash"]

                media_data["preloads"] = grunt.get_preload_data(
                    chopped_list_data, full_list_data
                )
                all_media_x = grunt.save_default_sort_indexes(all_media_x)

            # 8. Save the search-index-highest-rating.json,
            # search-index-newest.json, etc files.
            file_hash = grunt.save_search_index_json(sort_mode, all_media_x)
            media_data["file_hashes"]["search-index-%s" % sort_mode] = file_hash

        media_data = grunt.get_review_extreme_dates(all_media_x, media_data)

        for a_media in all_media_x:
            # 9. Save the <id>/index.html pages
            grunt.save_1_media_html(a_media, media_data, len(all_media_x))

        # 10. Prepare the data for article <media>-reviews/index.html pages.
        pelican_obj.settings["MEDIA_REVIEWS"][media_type] = \
        grunt.prepare_landing_page_data(all_media_x, media_data)

        # 11. Prepare the data for feeds and sitemap.
        pelican_obj.settings["MEDIA_REVIEWS"][media_type]["feed_and_sitemap_data"] = \
        grunt.prepare_rss_feed_data(all_media_x)

def register():
    # note that initialized is the very first signal. we want this to run before
    # QS_LINK, so that QS_LINK can find all files this plugin creates
    pelican.signals.initialized.connect(media_reviews)
