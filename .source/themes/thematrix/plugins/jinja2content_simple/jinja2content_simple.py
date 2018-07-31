from pelican import signals
import os
import re
from jinja2 import Environment, FileSystemLoader
#import pudb

#
# begin custom filters
#

def cleanstr(text):
    """ replace any non-alphanumeric chars in text with _ """
    return re.sub('[^a-zA-Z0-9]+', '_', text).strip('_')

#
# end custom filters
#

def process_content(data_from_pelican):
    if not data_from_pelican._content:
        return
    #pu.db
    theme_dir = os.path.join(data_from_pelican.settings['THEME'], 'templates')
    jinja_environment = data_from_pelican.settings['JINJA_ENVIRONMENT']
    jenv = Environment(
        loader = FileSystemLoader(theme_dir),
        **jinja_environment
    )
    jenv.filters['cleanstr'] = cleanstr

    # convert jinja values in article metadata settings variables
    for prop in ('console_explain_scripts', '_content'):

        if not hasattr(data_from_pelican, prop):
            continue

        val = getattr(data_from_pelican, prop)
        setattr(
            data_from_pelican,
            prop,
            jenv.from_string(val).render(data_from_pelican.settings)
        )

def register():
    # process the content only
    signals.content_object_init.connect(process_content)
