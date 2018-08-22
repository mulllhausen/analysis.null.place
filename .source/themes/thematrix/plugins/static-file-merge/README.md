# Static File Merge Plugin

This plugin is very simple - it merges static files. You must define the global
variable STATIC_FILE_MERGES in pelicanconf.py to use it. For example:

    STATIC_FILE_MERGES = {
        'js/base.js': [
            'js/file1.js',
            'js/file2.js'
        ]
    }

This would create a new file 'js/base.js' which contains the contents of
js/file1.js and js/file2.js.
