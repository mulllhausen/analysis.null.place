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

def process_metadata(data_from_pelican, metadata):
    #pu.db
    process_markup(data_from_pelican, metadata)

def process_content(data_from_pelican):
    #pu.db
    process_markup(data_from_pelican)

def process_markup(data_from_pelican, metadata = None):
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
        'thumbnail_larger_image',
        'thumbnail_larger_width',
        'thumbnail_larger_height',
        '_content'
    ):
        if (metadata is not None) and (prop not in metadata):
            continue

        if (metadata is None) and not hasattr(data_from_pelican, prop):
            continue

        val = getattr(data_from_pelican, prop) if metadata is None else metadata[prop]

        if type(val) not in (str, unicode):
            continue

        processed = jenv.from_string(val).render(data_from_pelican.settings)
        if metadata is None:
            setattr(data_from_pelican, prop, processed)
        else:
            metadata[prop] = processed

    # dates - this is tricky - we want to be able to put something like
    # {{ swapme }} in a date type field, however before substitution this will
    # not be interpreted as a valid date. so instead, we use a dummy property
    # identified by tacking "-datereplacement" on the end. this comes through as
    # a property of type string, which can then be converted to a date
    for replacement_prop in (
        'date-datereplacement',
        'modified-datereplacement'
    ):
        if (metadata is None) and not hasattr(data_from_pelican, replacement_prop):
            continue

        if (metadata is not None) and (replacement_prop not in metadata):
            continue

        prop = replacement_prop.replace("-datereplacement", "")

        val = getattr(data_from_pelican, replacement_prop) if metadata is None \
        else metadata[replacement_prop]

        processed = pelican.utils.get_date(
            jenv.from_string(val).render(data_from_pelican.settings)
        )
        if metadata is None:
            setattr(data_from_pelican, prop, processed)
            delattr(data_from_pelican, replacement_prop)
        else:
            metadata[prop] = processed
            del metadata[replacement_prop]

def register():
    # these signals are called early on (before the static paths have been
    # copied). not all data is available (no content) - only the metadata, but
    # that's ok - just update what we can and move on
    pelican.signals.article_generator_context.connect(process_metadata)
    pelican.signals.page_generator_context.connect(process_metadata)

    # process the content only
    pelican.signals.content_object_init.connect(process_content)
