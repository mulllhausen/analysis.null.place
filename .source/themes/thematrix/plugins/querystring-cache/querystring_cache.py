from pelican import signals
import os
import hashlib
import base64
#import pudb

def create_static_links(pelican_obj):
    """
    get a dict of file urls with hashes in the querystring and add this to the
    pelican settings so that it is available within templates and articles
    """
    #pu.db
    hashes = {}
    # add all files from the theme's static dir to the dict
    for static_path in pelican_obj.settings['THEME_STATIC_PATHS']:
        full_static_path = os.path.join(pelican_obj.theme, static_path)
        for path, subdirs, files in os.walk(full_static_path):
            for filename in files:
                basename = os.path.join(path, filename)
                file_rel_url = '/theme' + basename.replace(full_static_path, '')

                url = pelican_obj.settings['SITEURL'] + file_rel_url + \
                '?hash=' + get_file_hash(basename)

                hashes[file_rel_url] = url

    # add all files from the content static dirs to the dict
    for static_path in pelican_obj.settings['STATIC_PATHS']:
        full_static_path = os.path.join(pelican_obj.path, static_path)
        for path, subdirs, files in os.walk(full_static_path):
            for filename in files:
                basename = os.path.join(path, filename)
                file_rel_url = basename.replace(pelican_obj.path, '')

                url = pelican_obj.settings['SITEURL'] + file_rel_url + \
                '?hash=' + get_file_hash(basename)

                hashes[file_rel_url] = url

    pelican_obj.settings['QS_LINK'] = hashes # make available for other plugins

buffer_size = 5 * 1024 * 1024 # read files in chunks of 5MB each
def get_file_hash(basename):
    """get the file hash in a memory-efficient manner"""
    sha256 = hashlib.sha256()
    with open(basename, 'rb') as f:
        while True:
            data = f.read(buffer_size)
            if not data:
                break
            sha256.update(data)

    return base64.urlsafe_b64encode(sha256.digest()).replace('=', '')

def register():
    signals.initialized.connect(create_static_links)
