#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'peter miller'
SITENAME = u'analysis'
SITEURL = ''
BLOG_DESCRIPTION = 'blog by ' + AUTHOR

PATH = 'content'

TIMEZONE = 'Australia/Adelaide'

DEFAULT_LANG = u'en'
# fs = filesystem
DEFAULT_DATE = 'fs'
DEFAULT_DATE_FORMAT = '%Y-%m-%d'

THEME = "./themes/thematrix"

# feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
FEED_ALL_RSS = None

# currently no author page
AUTHOR_URL = ''
AUTHOR_SAVE_AS = ''

DIRECT_TEMPLATES = [
    'index', 'tags', 'categories', 'archives', 'sitemap', 'robots', 'CNAME'
]
INDEX_SAVE_AS = 'index.html'
TAGS_SAVE_AS = 'tags/index.html'
CATEGORIES_SAVE_AS = 'categories/index.html'
ARCHIVES_SAVE_AS = 'archives/index.html'
SITEMAP_SAVE_AS = 'sitemap.xml'
ROBOTS_SAVE_AS = 'robots.txt'
CNAME_SAVE_AS = 'CNAME'

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

GITHUB_URL = 'https://github.com/mulllhausen/mulllhausen.github.io'

STATIC_PATHS = ['img', 'js', 'css', 'json']

LOAD_CONTENT_CACHE = False
