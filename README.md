on linux...

    pip install virtualenv
    mkdir analysis.null.place
    cd analysis.null.place
    virtualenv .
    source bin/activate
    pip install pelican Markdown yuicompressor requests image
    git clone git@github.com:mulllhausen/analysis.null.place.git output
    cd output/.source
    make publish
