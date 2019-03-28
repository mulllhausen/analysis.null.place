#!/usr/bin/env python2.7

"""
download and resize thumbnails for the specified media

"""

import os
import json
import requests
import build_indexes_grunt
from PIL import Image

def add_unique_ids(all_data):
    for a_media in all_data:
        a_media["id"] = build_indexes_grunt.generate_unique_id(a_media)

    return all_data

def download_all(all_data):
    original_size = True
    for a_media in all_data:
        response = requests.get(a_media["thumbnail"])
        if not response.ok:
            raise IOError(
                "failed to download the thumbnail for %s \"%s\": %s" % (
                    build_indexes_grunt.media_type, a_media["title"],
                    a_media["thumbnail"]
                )
            )
        thumbnail_basename = build_indexes_grunt.generate_thumbnail_basename(
            a_media, original_size
        )
        # overwrites the file if it already exists
        with open(
            "%s/../img/%s" % (build_indexes_grunt.pwd, thumbnail_basename), "wb"
        ) as f:
            for data in response.iter_content(1024):
                if not data:
                    break
                f.write(data)

desired_width = 0 # px
def resize_thumbnails(all_data):
    if desired_width == 0:
        raise ValueError("the desired image width cannot be 0px")
    
    for a_media in all_data:
        original_thumbnail = build_indexes_grunt.generate_thumbnail_basename(
            a_media, original_size = True
        )
        img = Image.open(
            "%s/../img/%s" % (build_indexes_grunt.pwd, original_thumbnail)
        )
        (original_width, original_height) = img.size
        width_percent = desired_width / float(original_width)
        desired_height = int(float(original_height) * float(width_percent))
        img = img.resize((desired_width, desired_height), Image.ANTIALIAS)
        resized_thumbnail = build_indexes_grunt.generate_thumbnail_basename(
            a_media, original_size = False
        )
        img.save(
            "%s/../img/%s" % (build_indexes_grunt.pwd, resized_thumbnail)
        )
