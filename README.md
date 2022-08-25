on linux...
to build:

    pip install virtualenv
    mkdir analysis.null.place
    cd analysis.null.place
    virtualenv .
    source bin/activate
    sudo apt install yui-compressor
    pip install pelican Markdown requests image
    git clone git@github.com:mulllhausen/analysis.null.place.git output
    cd output/.source
    make publish

to debug:

    pip install pudb
    # suppress the "generating..." spinner like so:
    make html | cat
