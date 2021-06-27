import pelican
import os
#import pudb

def update_static_paths(article_generator, metadata):
    #pu.db
    new_static_paths = []

    for prop in (
        "stylesheets",
        "scripts",
        "img_preloads",
        "jsons"
    ):
        if (metadata is not None) and (prop not in metadata):
            continue

        val = metadata[prop]

        if type(val) not in (str, unicode):
            continue

        if val.strip() == "":
            continue

        val_list = [x.strip() for x in val.split(",")]
        for filename in val_list:
            dirname = os.path.dirname(filename)
            if dirname == "":
                continue

            # remove leading slash
            if dirname[0] == "/":
                dirname = dirname[1:]

            if dirname in new_static_paths:
                continue

            new_static_paths.append(dirname)

    if not new_static_paths:
        return

    article_generator.settings["STATIC_PATHS"].extend(new_static_paths)
    article_generator.settings["STATIC_PATHS"] = \
    list(set(article_generator.settings["STATIC_PATHS"]))

def register():
    # article_generator_context is called early on - before the static paths
    # have been copied by pelican. only metadata is available here (no content)
    # but that's fine - its all we need.
    pelican.signals.article_generator_context.connect(update_static_paths)
