// make a sticky footer using js, since the css solution is ugly
//$(window).on('load', make_sticky_footer);
//$(window).on('resize', make_sticky_footer);

function make_sticky_footer() {
    var body_height = $('body').height();

    // add 2px for border-top, 15px for padding-topm 18px for margin-bottom
    var footer_height = $('#about').height() + 2 + 15 + 18;

    var original_footer_top = $('#about').offset().top;
    var spacer_height = body_height - footer_height - original_footer_top;
    if (spacer_height < 0) return;

    $('#js_footer_push').css('padding-top', spacer_height);
}
