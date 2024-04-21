build on linux using the `apt` package manager:

    sudo apt install python3-virtualenv yui-compressor
    mkdir analysis.null.place
    cd analysis.null.place
    virtualenv .
    source bin/activate
    sudo apt install yui-compressor
    pip3 install pelican Markdown requests image
    git clone git@github.com:mulllhausen/analysis.null.place.git output
    cd output/.source
    make publish

to debug:

    pip3 install pudb
    # suppress the "generating..." spinner like so:
    make html | cat
