on linux...

    pip install virtualenv
    mkdir analysis.null.place
    cd analysis.null.place
    virtualenv .
    source bin/activate
    pip install pelican Markdown
    cd analysis.null.place
    git clone git@github.com:mulllhausen/mulllhausen.github.io.git output
    cd output/.source
    make publish
