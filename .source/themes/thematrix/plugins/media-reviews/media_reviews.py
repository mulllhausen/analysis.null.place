from pelican import signals
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
    for (media_type, media_data) in pelican_obj.settings["MEDIA_REVIEWS"].\
    iteritems():
        with open(os.path.join(grunt.content_path, media_data['src-list'])) as f:
            all_media_x = json.load(f)["data"]

        grunt.media_type = media_type
        grunt.meta_img_preloads = [] # reset
        grunt.meta_jsons = [] # reset
        grunt.meta_hashbang_URLs = [] # reset
        required_fields = grunt.get_validation_fields()

        # validation
        grunt.check_media_type()

        errors = grunt.validate(all_media_x, required_fields)
        if len(errors) > 0:
            exit("\n".join(errors))

        all_media_x = grunt.add_missing_data(all_media_x)

        # download thumbnails
        any_downloads_done = grunt.download_all(all_media_x)

        if any_downloads_done:
            # resize thumbnails
            grunt.desired_width = 100 # px
            grunt.resize_thumbnails(all_media_x) 

            grunt.delete_original_size_thumbnails(all_media_x)

        # generate json/<media>-list.json and json/<media>-review-xyz.json
        # put reviews in their own file, so as to keep <media>-list.json from
        # being too large
        grunt.update_meta_jsons()
        all_media_x = grunt.save_list_and_individual_review_files(all_media_x)

        # generate json/<media>-init-list.json
        # this is just the first 10 <media>, sorted by max rating, then
        # alphabetically by title. this json is used to populate the page
        # initially
        grunt.save_init_list(all_media_x)

        # generate json/<media>-search-index.json
        # this is just a list of <media> titles and years - used for searching
        grunt.save_search_index(all_media_x)

        pelican_obj.settings["MEDIA_REVIEWS"][media_type] = {
            "img_preloads": ",".join(sorted(grunt.meta_img_preloads)),
            "jsons": ",".join(sorted(grunt.meta_jsons)),
            "hash-bang-URLs": sorted(grunt.meta_hashbang_URLs)
        }

def register():
    signals.initialized.connect(media_reviews)
