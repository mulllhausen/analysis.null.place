import pelican
import os
import re
import datetime
import jinja2
#import pudb

#
# begin custom functions
#

class Context:
    def __init__(self, data_from_pelican):
        self.data_from_pelican = data_from_pelican

    def base_include(self, path_and_file, raw = False):
        """ insert the content of a file from anywhere (relative to .source) """
        #pu.db
        base_dir = os.path.abspath(
            os.path.join(os.path.dirname(__file__), '../../../..')
        )
        path_and_file_from_base = os.path.join(base_dir, path_and_file)
        file_content = '' # init
        with open(path_and_file_from_base, "rb") as f:
            file_content = f.read()

        if raw:
            return file_content
        else:
            data_from_pelican = self.data_from_pelican
            jinja_environment = data_from_pelican.settings['JINJA_ENVIRONMENT']
            theme_dir = os.path.join(
                data_from_pelican.settings['THEME'],
                'templates'
            )
            jenv = jinja2.Environment(
                loader = jinja2.FileSystemLoader(theme_dir),
                **jinja_environment
            )
            return jenv.from_string(file_content).render(data_from_pelican.settings)

#
# end custom functions
#

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
    jenv = jinja2.Environment(
        loader = jinja2.FileSystemLoader(theme_dir),
        **jinja_environment
    )
    jenv.filters['cleanstr'] = cleanstr

    context = Context(data_from_pelican)
    jenv.globals['base_include'] = context.base_include

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
