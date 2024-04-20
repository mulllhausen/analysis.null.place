build on linux with the `apt` package manager installed:

    sudo apt install python3-virtualenv yui-compressor
    mkdir analysis.null.place
    cd analysis.null.place
    virtualenv .
    source bin/activate
    pip install pelican Markdown requests image
    git clone git@github.com:mulllhausen/analysis.null.place.git output
    cd output/.source
    make publish

to debug:

    sudo apt install python3-pudb
    # suppress the "generating..." spinner like so:
    make html | cat
