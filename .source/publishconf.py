#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

# This file is only used if you use `make publish` or
# explicitly specify it as your config file.

import os
import sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = 'http://analysis.null.place'
RELATIVE_URLS = False

FEED_ALL_ATOM = 'feeds/all.atom.xml'
FEED_ALL_RSS = 'feeds/all.rss.xml'

DELETE_OUTPUT_DIRECTORY = False

#DISQUS_SITENAME = ""
GOOGLE_ANALYTICS_TRACKING_ID = 'UA-110200325-1'
FACEBOOK_ANALYTICS_ID = '2040066019560327'
