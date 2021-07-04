# Media Reviews Plugin

To enable this plugin, add `'media-reviews'` to the list of `PLUGINS` in
pelican.py.

Currently supported \<media> are:
- book
- movie
- tv-series

To instruct the plugin to build the pages for all these types, create the
following list in pelican.py:

    MEDIA_REVIEW_TYPES = ['book', 'movie', 'tv-series']

Or include only the list items you want the plugin to build.

## Plugin Files 

- `PATH/<media>-reviews/json/list-all.json` - The list of all <media> data. This
file must be created manually by the user. The plugin generates all the other
files automatically using the data from this file.

For the following files, "cached" refers to the service worker. Each of the
following files is initially created automatically in the
`PATH/<media>-reviews/json/` directory by this plugin, and is then automatically
copied to the `OUTPUT_PATH/<media>-reviews/json/` directory by pelican.

- `list-highest-rating.json` - A simple list of absolutely all <media> <id>s and
their `data-<id>.json` file hashes (see below for a description of this file).
The list is sorted by highest rating then by title alphabetically. Not Cached.

- `list-lowest-rating.json` - Same but sorted by lowest rating then title.
- `list-newest.json` - Same but sorted only by newest.
- `list-oldest.json` - Same but sorted only by oldest.
- `list-title-a-z.json` - Same but sorted only by title alphabetically.
- `list-title-z-a.json` - Same but sorted only by title reverse alphabetically.

- `list-highest-rating-first-10.json` - Just the first 10 items from
`list-highest-rating.json`. This file is cached. It is a nice always-small file,
whereas `list-highest-rating.json` grows as more reviews are added, and so
should not be cached.

- `search-index-highest-rating.json` - A simple list of absolutely all <media>
search data in the same order as `list-highest-rating.json`. Used for searching
and finding reviews. Not cached.

- `search-index-lowest-rating.json` - Same but for `list-lowest-rating.json`.
- `search-index-newest.json` - Same but for `list-newest.json`.
- `search-index-oldest.json` - Same but for `list-oldest.json`.
- `search-index-title-a-z.json` - Same but for `list-title-a-z.json`.
- `search-index-title-z-a.json` - Same but for `list-title-z-a.json`.

- `data-<id>.json` - All data needed to render 1 <media> item, except for the
review text. Only the files listed in `list-highest-rating-first-10.json` are
cached.

- `review-<id>.json` - The text for 1 review. Only the files referenced by the
cached `data-<id>.json` files are cached.

The following files is initially created automatically in the
`PATH/<media>-reviews/` directory, and are then automatically copied to the
`OUTPUT_PATH/<media>-reviews/` directory by pelican.

- `index.html` - The landing page for all <media> reviews. No <media> <id>s
are in the html here, so as to avoid them being indexed by search engines. If
search engines were to index these <media>s then the page will be out of date
every time new reviews are added and a user searching for <media> <id> x would
click in the search engine and not find <media> <id> x without searching. This
would be annoying. A better way is for them to land on the page specific to the
<media> review they want to read.

- `<id>/index.html` - The page for each <media> <id> review. All data for the
<media> <id>, including the thumbnail and review text is in html so it can be
indexed by search engines.

## Functionality

This plugin is fully functional online and falls back gracefully to limited
functionality offline. Online, all media and their reviews are available, but
offline only the files associated with `list-highest-rating-first-10.json` (see
file description above) are available.

The following sort modes are available:

- highest rating
- lowest rating
- newest reviews
- oldest reviews
- title ascending
- title descending

Initially I had thought to split json data into pages of 10 <media> items and
load a page at a time as the user scrolls. But this would make it impossible to
efficiently load data when searching. When searching we want to show a page of
10 items, but in the worst case scenario each search item might be in a
different page file. So we would end up loading 10 x 10 reviews and then
discarding 90 of them. Its not a lot of data, but the network would slow down
searching. So instead we will just load the searched items and not use pages for
the items. The only exception is the first page of 10 items that are stored in
their own json file - `list-highest-rating-first-10.json`. This enables the
<media> landing page to quickly download a small amount of content for
rendering.

### Online Functionality

Initially the <media> search/sort box is disabled by the glass-case css. The
search is always empty at page-load and the sorting always defaults to _highest
rating_.

`index.html` preloads `list-highest-rating-first-10.json` as well as the
thumbnails, `data-<id>.json` and `review-<id>.json` files it references. These
10 items (30 files max.) form the initial content and are rendered immediately.
Once they are rendered, the counter that keeps track of the number of items
rendered is set to 10.

Once the initial content is rendered, the glass-case is removed.

The search need not be changed by the user, however it is immediately triggered,
just as if the user had clicked the search button with an empty search box and
the sort mode in its default position. This causes the page to download the
`list-highest-rating.json` and `search-index-highest-rating.json` files. The
files are saved in generic _list_ and _search index_ variables for later. Any
time the sort mode is changed by the user, these same variables are updated by
downloading and parsing the 2 corresponding json files. A third generic
variable - _filtered list_ - is populated with a subset of data from _list_. If
the search box is empty then _filtered list_ contains all the indexes of _list_.
However, if the search box contains text then only the indexes of items from
_list_ that are relevant to the search text appear in _filtered list_. This way,
the _filtered list_ is updated as the user types in the search box using the
static data from _list_. As a shortcut, if _filtered list_ and _list_ are the
same then _filtered list_ is set to "all". This is much quicker than populating
a list with potentially millions of entries which are not needed.

The logical steps to get all data for a review are:

    counter value
            |
            v
    filtered list index
            |
            v
    list item (gives data file <id> & <hash>)
            |
            v
    download data using <id> & <hash>
            |
            v
    download thumbnail & review text files

As the user scrolls, the area below the last rendered item comes into view. This
automatically triggers javascript to render the next page of 10 items (30 files
max.) if available. We compare the counter position to the length of
_filtered list_. If they are the same then there is nothing more to render.
But if the rendered list is shorter than the complete list then the next page is
rendered.

The functionality for `<id>/index.html` is similar but the review for <id>
remains pinned to the top. This is done by first setting _filtered list_ to

    [<id>, "all"]

then proceeding as before. The value of <id> within "all" is skipped.

If the user changes the search/sort box, then the <id> is removed from the url,
unpinned from the top, and _filtered list_ is reset. On browsers that support
altering the history object, this is done by updating the url. Otherwise it is
done by loading the landing page for this type of media.

### Offline Functionality

Offline functionality will only work if the site is loaded (online) at least
once, so the service worker can cache the required files. In offline mode, only
10 <media> items are shown on the <media> landing page, and none of the <id>
pages are available.

This offline functionality is a natural consequence of only caching the
`list-highest-rating-first-10.json` file and the files it references.

After the first 10 items are rendered, javascript attempts to download the list
off all <media> and its accompanying search file. However, these requests will
time-out, at which point, an offline notice is presented. None of the rendered
review items on the page is updated in this case.

Likewise, when the user enters text in the search box or alters sort mode,
javascript attempts to download data, fails, and renders an offline notice
without removing any of the review items.

Each time javascript detects that the site is offline, it resets the search/sort
box, to avoid misleading the user into thinking that a search has been done.

If the site is initially online then goes offline, then the thumbnails or review
text may fail to download. If a thumbnail is not available then that review item
is not rendered. And if review text is not available then the offline notice is
shown and the button to show the review does not disapear.
