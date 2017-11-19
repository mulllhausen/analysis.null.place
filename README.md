    mkdir inquisitive-ibis
    cd inquisitive-ibis
    virtualenv .
    source bin/activate
    pip install pelican Markdown

for clean URLs edit file `lib/python2.7/site-packages/pelican/generators.py` like so:

    def generate_direct_templates(self, write):
        """Generate direct templates pages"""
        PAGINATED_TEMPLATES = self.settings['PAGINATED_DIRECT_TEMPLATES']
        for template in self.settings['DIRECT_TEMPLATES']:
            paginated = {}
            if template in PAGINATED_TEMPLATES:
                paginated = {'articles': self.articles, 'dates': self.dates}
            save_as = self.settings.get("%s_SAVE_AS" % template.upper(),
                                        #'%s.html' % template)
                                        '%s/index.html' % template)
            if not save_as:
                continue

            write(save_as, self.get_template(template),
                  self.context, blog=True, paginated=paginated,
                  page_name=os.path.splitext(save_as)[0])

back in bash...

    cd inquisitive-ibis
    git clone git@github.com:mulllhausen/mulllhausen.github.io.git output
    cd output/.source
    make publish
