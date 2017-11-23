// make a sticky footer using js, since the css solution is ugly

// --<body>----------------------------------------------
//      ^                 |
//      |                 |
//      |                 |
//      |                 v js_footer_push top
//      |        --<js_footer_push>----------------------
//      |                 ^
//      |                 |
//      |                 | js_footer_push height ???
//      |                 |
//      |                 v
//      |        --</js_footer_push><footer>-------------
// body height                          ^
//      |                               |
//      |                               | footer height
//      |                               |
//      |                               v
//      |        -------------------</footer>------------
//      |                               ^
//      |                               | should be 0
//      v                               v
// --</body>---------------------------------------------

// so: body height = js_footer_push top + js_footer_push height? + footer height
// ie: js_footer_push height? = body height - js_footer_push top - footer height

$(window).on('load', make_sticky_footer);
$(window).on('resize', make_sticky_footer);

function make_sticky_footer() {
    var body_height = $('body').height();

    // add 2px for border-top, 15px for padding-top, 18px for margin-bottom
    var footer_height = $('#about').height() + 2 + 15 + 18;

    var original_footer_top = $('#about').offset().top;
    var js_footer_push_top = $('#js_footer_push').offset().top;
    var js_footer_push_height = body_height - js_footer_push_top - footer_height;
    if (js_footer_push_height < 0) return; // stickyness

    // use padding-top to set the height
    $('#js_footer_push').css('padding-top', js_footer_push_height);
}
