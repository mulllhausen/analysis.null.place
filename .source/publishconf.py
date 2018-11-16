#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# this file is only used if you use `make publish` or explicitly specify it as
# your config file

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITE_HOSTNAME = 'analysis.null.place'
SITEURL = 'https://' + SITE_HOSTNAME
RELATIVE_URLS = False

DELETE_OUTPUT_DIRECTORY = False

TEST_ADSENSE = False

# don't delete pre-merge files - use .gitignore instead
DELETE_PRE_MERGE_FILES = False

GOOGLE_ANALYTICS_TRACKING_ID = 'UA-110200325-1'

# facebook comments on article pages only
FACEBOOK_APP_ID = '2040066019560327'

# disqus comments on article pages only
DISQUS_SITENAME = 'analysis-null-place'

# add the plugins only used when publishing
PLUGINS += ['yuicompressor']

if (('FACEBOOK_APP_ID' in vars()) or ('DISQUS_SITENAME' in vars())):
    COMMENTS_SCRIPTS = ['js/comments-manager.js'] # init
    if 'FACEBOOK_APP_ID' in vars():
        COMMENTS_SCRIPTS.append('js/facebook-comments.js')
    if 'DISQUS_SITENAME' in vars():
        COMMENTS_SCRIPTS.append('js/disqus-comments.js')
    STATIC_FILE_MERGES['js/comments-section.js'] = COMMENTS_SCRIPTS
