import pelican
import grunt
import os
import json
import numbers
import re
#import pudb

def media_reviews(pelican_obj):
    #pu.db
    grunt.output_path = pelican_obj.settings["OUTPUT_PATH"]
    grunt.content_path = pelican_obj.settings["PATH"]
    grunt.init_jinja_environment(pelican_obj)

    for (media_type, media_data) in pelican_obj.settings["MEDIA_REVIEWS"].\
    iteritems():
        with open(os.path.join(grunt.content_path, media_data["src-list"])) as f:
            all_media_x = json.load(f)["data"]

        grunt.media_type = media_type
        grunt.meta_img_preloads = [] # reset
        grunt.meta_jsons = [] # reset
        required_fields = grunt.get_validation_fields()

        # validation
        grunt.check_media_type()

        errors = grunt.validate(all_media_x, required_fields)
        if len(errors) > 0:
            exit("\n".join(errors))

        all_media_x = grunt.convert_types(
            all_media_x, required_fields, pelican_obj.settings["TIMEZONE"]
        )
        all_media_x = grunt.add_missing_data(all_media_x)

        # download thumbnails
        any_downloads_done = grunt.download_all(all_media_x)

        if any_downloads_done:
            # resize thumbnails
            grunt.desired_width_thumbnail = 100 # px
            grunt.desired_width_larger = 200 # px
            all_media_x = grunt.resize_thumbnails(all_media_x)

            grunt.delete_original_size_thumbnails(all_media_x)

        # generate json/<media>-list.json and json/<media>-review-xyz.json
        # put reviews in their own file, so as to keep <media>-list.json from
        # being too large
        grunt.update_meta_jsons()
        all_media_x = grunt.save_list_and_individual_review_jsons(all_media_x)

        # generate json/<media>-init-list.json
        # this is just the first 10 <media>, sorted by max rating, then
        # alphabetically by title. this json is used to populate the page
        # initially
        grunt.save_init_list(all_media_x)

        # generate json/<media>-search-index.json
        # this is just a list of <media> titles and years - used for searching
        grunt.save_search_index(all_media_x)

        # save data for use in all templates later
        pelican_obj.settings["MEDIA_REVIEWS"][media_type].update({
            "img_preloads": ",".join(sorted(grunt.meta_img_preloads)),
            "jsons": ",".join(sorted(grunt.meta_jsons)),
            "all_data": sorted(
                [a_media for a_media in all_media_x],
                key = lambda a_media: (a_media["id"])
            ),
            "latest_review": max(all_media_x, key = lambda x: x["reviewDate"])\
            ["reviewDate"].strftime("%Y-%m-%d %H:%M:%S %z")
        })

        # create all html review pages using the media_review.html template
        grunt.save_review_htmls(all_media_x)

        # create the iframe html pages that redirect back
        grunt.save_iframe_htmls()

def register():
    # before QS_LINK, so that QS_LINK can find all files this plugin generates
    pelican.signals.initialized.connect(media_reviews)
