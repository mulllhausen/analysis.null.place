#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'peter miller'
SITENAME = u'x.null.place'
SITEURL = ''

PATH = 'content'

TIMEZONE = 'Australia/Adelaide'

DEFAULT_LANG = u'en'
# fs = filesystem
DEFAULT_DATE = 'fs'
DEFAULT_DATE_FORMAT = '%Y-%m-%d'

THEME = "./themes/thematrix"

DIRECT_TEMPLATES = ['index', 'tags', 'categories', 'archives']

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
FEED_ALL_RSS = None

# currently no author page
AUTHOR_URL = ''
AUTHOR_SAVE_AS = ''

ARTICLE_URL = '{category}/{slug}/'
ARTICLE_SAVE_AS = '{category}/{slug}/index.html'
#PAGE_URL = 'pages/{slug}/'
#PAGE_SAVE_AS = 'pages/{slug}/index.html'
CATEGORY_URL = '{slug}/'
CATEGORY_SAVE_AS = '{slug}/index.html'
TAG_URL = 'tag/{slug}/'
TAG_SAVE_AS = 'tag/{slug}/index.html'

DEFAULT_PAGINATION = False
DISPLAY_PAGES_ON_MENU = False
DELETE_OUTPUT_DIRECTORY = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

GITHUB_URL = 'https://github.com/mulllhausen'
