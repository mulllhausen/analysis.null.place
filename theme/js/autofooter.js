// make a sticky footer using js, since the css solution is ugly
addEvent(window, 'load, resize', make_sticky_footer);

var timeout_id_resize_footer;
function make_sticky_footer() {
    var footer_el = document.getElementsByTagName('footer')[0];
    footer_el.style.visibility = 'hidden';

    // note that bottom:0 has no effect with position:relative
    footer_el.style.position = 'relative';

    // debounce the resize
    clearTimeout(timeout_id_resize_footer);
    timeout_id_resize_footer = setTimeout(function() {
        var footer_bottom = footer_el.getBoundingClientRect().bottom;
        var body_bottom = document.documentElement.clientHeight;
        if (footer_bottom <= body_bottom) {
            // if the bottom of the footer is above the bottom of the body then
            // set position:absolute. the css already has bottom:0.
            footer_el.style.position = 'absolute';
        }
        footer_el.style.visibility = 'visible';
    }, 500);
}
