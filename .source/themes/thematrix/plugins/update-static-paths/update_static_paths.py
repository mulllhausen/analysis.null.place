import pelican
import os
#import pudb

def process_content(data_from_pelican):
    #pu.db
    new_static_paths = []
    for prop in (
        "stylesheets",
        "scripts",
        "img_preloads",
        "jsons"
    ):
        if not hasattr(data_from_pelican, prop):
            continue

        val = getattr(data_from_pelican, prop)

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

    data_from_pelican.settings["STATIC_PATHS"].extend(new_static_paths)
    data_from_pelican.settings["STATIC_PATHS"] = \
    list(set(data_from_pelican.settings["STATIC_PATHS"]))

def register():
    # runs for every article and page
    pelican.signals.content_object_init.connect(process_content)
