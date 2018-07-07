#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# this file is only used if you use `make publish` or explicitly specify it as
# your config file

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITE_HOSTNAME = 'null.place'
SITEURL = 'http://' + SITE_HOSTNAME
RELATIVE_URLS = False

FEED_ALL_ATOM = 'feeds/all.atom.xml'
FEED_ALL_RSS = 'feeds/all.rss.xml'

DELETE_OUTPUT_DIRECTORY = False

GOOGLE_ANALYTICS_TRACKING_ID = 'UA-110200325-1'
FACEBOOK_ANALYTICS_ID = '2040066019560327'

GOOGLE_AD_CLIENT = 'ca-pub-0118741364962624'

DISQUS_SITENAME = 'analysis-null-place'
