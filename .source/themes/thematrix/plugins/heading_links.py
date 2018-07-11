if __name__ != '__main__':
    from pelican import signals

import re

def process_pelican_headings(data_from_pelican):
    if not data_from_pelican._content:
        return

    data_from_pelican._content = process_headings(data_from_pelican._content)

def process_headings(html):
    for h in xrange(1, 7):
        pattern = re.compile(r'(<h%d>([\s\S]+?)</h%d>)' % (h, h))
        for m in re.finditer(pattern, html):
            find = m.group(0)
            heading_text = m.group(2)
            hid = re.sub('[^a-zA-Z0-9]', '_', heading_text)
            hid = 'heading_' + re.sub('_+', '_', hid).strip('_')
            replace = '<h%d id="%s"><a href="#%s">%s</a></h%d>' % \
            (h, hid, hid, heading_text, h)
            html = html.replace(find, replace)

    return html
    

def register():
    # process the content only
    signals.content_object_init.connect(process_pelican_headings)

if __name__ == '__main__':
    test_data = '<h1>hi there</h1><h3>??sup??</h3>'
    expected_res = '<h1 id="heading_hi_there"><a href="#heading_hi_there">' + \
    'hi there</a></h1><h3 id="heading_sup"><a href="#heading_sup">??sup??</a></h3>'
    res = process_headings(test_data)
    if res == expected_res:
        print "pass"
    else:
        print "fail"
