import pelican
import os
import re
import datetime
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

    # now convert jinja values in article metadata settings variables

    # strings:
    for prop in (
        'title',
        'slug',
        'category',
        'tags',
        'stylesheets',
        'scripts',
        'img_preloads',
        'summary',
        'console_explain_scripts',
        'jsons',
        '_content'
    ):
        if not hasattr(data_from_pelican, prop):
            continue

        val = getattr(data_from_pelican, prop)

        if type(val) not in (str, unicode):
            continue

        setattr(
            data_from_pelican,
            prop,
            jenv.from_string(val).render(data_from_pelican.settings)
        )

    # dates - this is tricky - we want to be able to put something like
    # {{ swapme }} in a date type field, however before substitution this will
    # not be interpreted as a valid date. so instead, we use a dummy property
    # identified by tacking "-datereplacement" on the end. this comes through as
    # a property of type string, which can then be converted to a date
    for replacement_prop in (
        'date-datereplacement',
        'modified-datereplacement'
    ):
        if not hasattr(data_from_pelican, replacement_prop):
            continue

        prop = replacement_prop.replace("-datereplacement", "")
        val = getattr(data_from_pelican, replacement_prop)
        setattr(
            data_from_pelican,
            prop,
            pelican.utils.get_date(
                jenv.from_string(val).render(data_from_pelican.settings)
            )
        )

def register():
    # process the content only
    pelican.signals.content_object_init.connect(process_content)
