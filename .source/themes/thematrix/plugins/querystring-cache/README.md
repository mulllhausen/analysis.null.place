# Querystring Cache

This plugin is very simple - it populates the QS_LINK dict with url links containing
a hash, so that they can be used within templates and articles. For example, if
a file has a url of `/theme/img/x.jpg` and SITEURL = 'http://example.com' then
using the following jinja2 variable:

    {{ QS_LINK['/theme/img/x.jpg'] }}

will result in the following output string:

    http://example.com/theme/img/x.jpg?hash=jeN3hb4F_vdf

where `jeN3hb4F_vdf` is the hash of file `x.jpg`. This is useful to prevent
caching of javascript and css files after they are changed (since changing the
file changes the hash).
