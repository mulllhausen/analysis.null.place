"""
take a json shortcode like [file{"var1": "val1","var2": "val2", etc}] and format
according to the markup in <file>.html.

for example, with a json shortcode of: [heading{"h": 1, "text": "abcdef"}]
and file heading.html: <h{{ h }} id="#heading_{{ text }}">{{ text }}</h{{ h }}>
outputs: <h1 id="heading_abcdef">abcdef</h1>
"""

if __name__ != '__main__':
    from pelican import signals

import re
import json
import jinja2
import os

def process_content(data_from_pelican):
    if not data_from_pelican._content:
        return

    data_from_pelican._content = process_shortcodes(data_from_pelican._content)

def process_shortcodes(html):
    shortcode_templates = {} # init
    pattern = re.compile(r'(?P<shortcode>\[(?P<filename>.*)(?P<json>{.*})\])')
    path = os.path.dirname(os.path.realpath(__file__)) + '/'
    for m in re.finditer(pattern, html):
        filename = m.group('filename')

        # only read each template file once
        if not filename in shortcode_templates:
            try:
                with open(path + filename + '.html', 'r') as f:
                    shortcode_templates[filename] = f.read()
            except:
                raise IOError(
                    'unable to read shortcode template file %s.html' % \
                    path + filename
                )

        json_data = {}
        # if json in m.group:
        try:
            json_data = json.loads(m.group('json'))
        except:
            raise IOError(
                'unable to parse json %s for shortcode %s' % \
                (m.group('json'), filename)
            )
        replace_with = process_shortcode(shortcode_templates[filename], json_data)
        html = html.replace(m.group('shortcode'), replace_with)

    return html

#
# begin custom filters
#

def cleanstr(text):
    """ replace any non-alphanumeric chars in text with _ """
    return re.sub('[^a-zA-Z0-9]+', '_', text).strip('_')

#
# end custom filters
#

jenv = jinja2.Environment()
jenv.filters['cleanstr'] = cleanstr
def process_shortcode(template, json_data):
    return jenv.from_string(template).render(**json_data)

def register():
    # process the content only
    signals.content_object_init.connect(process_content)

if __name__ == '__main__':
    print 'test 1'
    test_data1 = json.loads('{"h": 1, "text": "abc  def?"}')
    template1 = '<h{{ h }} id="hed_{{ text | cleanstr }}">{{ text }}</h{{ h }}>'
    expected_res1 = '<h1 id="hed_abc_def">abc  def?</h1>'
    res1 = process_shortcode(template1, test_data1)
    if res1 == expected_res1:
        print "pass"
    else:
        print "fail.\nexpected: %s\nactual  : %s" % (expected_res1, res1)

    print 'test 2'
    test_data2 = '[h{ "h": 3, "text": "a//b"}]'
    expected_res2 = '<h3 id="heading_a_b"><a href="#heading_a_b">a//b</a></h3>'
    res2 = process_shortcodes(test_data2)
    if res2 == expected_res2:
        print "pass"
    else:
        print "fail.\nexpected: %s\nactual  : %s" % (expected_res2, res2)
