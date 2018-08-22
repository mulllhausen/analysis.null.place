from pelican import signals
import os
import codecs
#import pudb

def static_file_merge(pelican_obj):
    #pu.db
    full_static_path = os.path.join(
        pelican_obj.theme, pelican_obj.settings['THEME_STATIC_PATHS'][0]
    )
    first = True
    for (dest_rel, sources_rel) in pelican_obj.settings['STATIC_FILE_MERGES']. \
    iteritems():
        dest_abs = os.path.join(full_static_path, dest_rel)
        merged_content = '// this file was generated by merging:\n//- ' + \
        '\n//- '.join(sources_rel) + '\n\n'
        for source_rel in sources_rel:
            source_basename = os.path.basename(source_rel)

            if not first:
                merged_content += '\n\n'

            merged_content += '// original file: ' + source_basename + '\n'
            source_abs = os.path.join(full_static_path, source_rel)
            with codecs.open(source_abs, encoding = 'utf-8') as f:
                merged_content += f.read()

            merged_content += '// end original file: ' + source_basename
            first = False

        # overwrite destination file
        with codecs.open(dest_abs, encoding = 'utf-8', mode = 'w') as f:
            f.write(merged_content)

def register():
    signals.initialized.connect(static_file_merge)
