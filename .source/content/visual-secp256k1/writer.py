"""file that writes text (only text, not images) to stdout or file"""

import re

to_file = '/dev/null' # init default
img_path = '/dev/null' # init default
output_html = None # default

html_title = "" # init
html_metatags = {} # init
html_body = "" # init

def acc(text):
    global html_body

    if output_html is None:
        raise ValueError("unknown output type")

    if text is None:
        text = ""

    text += "\n\n"
    print replace_tags(text)

    if output_html:
        html_body += text

def make_img(filename = None, name = None, css_class = None):
    if not output_html:
        return

    if (filename is None) or (name is None) or (css_class is None):
        raise ValueError("missing arguments")

    img_src = "{{ QS_LINK['%s/%s'] }}" % (img_path, filename)
    html_metatags["img_preloads"].append(filename)
    return "<img src=\"%s\" alt=\"%s\" class=\"%s\">" % \
    (img_src, name, css_class)
  
def replace_tags(text):
    text = re.sub('<\/?h[^<]+?>', '**', text)
    return re.sub('<[^<]+?>', '', text)

def save_all_html():
    global html_body, html_title, html_metatags

    if output_html is None:
        raise ValueError("unknown output type")

    if not output_html:
        return

    # make list unique and convert to string (irreversable)
    html_metatags["img_preloads"] = ",".join(set(html_metatags["img_preloads"]))

    metatags_str = "        ".join(
        "<meta name=\"%s\" content=\"%s\"/>\n" % (k, v)
        for (k, v) in html_metatags.iteritems()
    ).rstrip()

    with open(to_file, "a") as f:
        f.write(
            """<html>
    <head>
        %s
        %s
    </head>
<body>
%s
</body>
</html>""" % (html_title, metatags_str, html_body)
        )
