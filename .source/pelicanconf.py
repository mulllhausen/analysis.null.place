#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'Peter Miller'
SITENAME = u'analysis'
BLOG_DESCRIPTION = 'Blog by ' + AUTHOR

PATH = 'content'

TIMEZONE = 'Australia/Adelaide'

DEFAULT_LANG = u'en'
# fs = filesystem
DEFAULT_DATE = 'fs'
DEFAULT_DATE_FORMAT = '%Y-%m-%d'

THEME = './themes/thematrix'

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

GITHUB_URL = 'https://github.com/mulllhausen/mulllhausen.github.io'

STATIC_PATHS = ['img', 'js', 'css', 'json']

LOAD_CONTENT_CACHE = False
PLUGIN_PATHS = [THEME + '/plugins']
PLUGINS = ['jinja2content_simple', 'querystring-cache']

# debug settings:

# add 127.0.0.1 null.place to /etc/hosts for this (it is necessary if you want
# to debug the fb comments section on localhost)
#SITE_HOSTNAME = 'null.place'
#SITEURL = 'http://' + SITE_HOSTNAME + ':8000'

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

# uncomment to view disqus on localhost
#DISQUS_SITENAME = 'analysis-null-place'

# uncomment to view facebook comments on localhost
#FACEBOOK_APP_ID = '2040066019560327'
#SHOW_FACEBOOK_COMMENTS = True
