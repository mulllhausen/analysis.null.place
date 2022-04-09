# -*- coding: utf-8 -*-

from pelican import signals
from subprocess import call
import logging
import os
import json
#import pudb

logger = logging.getLogger(__name__)

# Display command output on DEBUG and TRACE
SHOW_OUTPUT = logger.getEffectiveLevel() <= logging.DEBUG

"""
Minify CSS and JS files in output path
with Yuicompressor from Yahoo
Required : pip install yuicompressor
"""

def minify(pelican):
    """
    Minify CSS and JS with YUI Compressor
    :param pelican: The Pelican instance
    """
    skip = pelican.settings['YUICOMPRESSOR_SKIP']
    output_path = pelican.settings['OUTPUT_PATH']
    for dirpath, _, filenames in os.walk(output_path):
        #pu.db
        # skip dirs under dot-paths (eg .git or .source)
        if '/.' in dirpath:
            continue

        for name in filenames:
            filepath = os.path.join(dirpath, name)
            filepath_from_output = filepath.replace(output_path, '')

            # skip this file?
            if filepath_from_output in skip:
                continue

            # yuicompressor only works for .css and .js files
            # we only compress the files in the output dir
            if os.path.splitext(name)[1] in ('.css', '.js'):
                logger.info('minify %s', filepath)
                verbose = '-v' if SHOW_OUTPUT else ''
                call(
                    "yui-compressor {} --charset utf-8 {} -o {}".format(
                        verbose, filepath, filepath
                    ), shell = True
                )

            # yuicompressor doesn't like .json files (even when renamed to .js)
            # so clean them up seperately
            if '.json' in os.path.splitext(name)[1]:
                logger.info('minify %s', filepath)
                with open(filepath, 'r+') as f:
                    json_data = json.load(f)
                    f.seek(0)
                    f.write(json.dumps(
                        json_data,
                        separators = (',', ':'),
                        sort_keys = True
                    ))
                    f.truncate()

def register():
    signals.finalized.connect(minify)
