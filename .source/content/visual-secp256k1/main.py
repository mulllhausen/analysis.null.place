#!/usr/bin/env python2.7

"""
a walkthrough of secp256k1 - bitcoin's elliptic curve.

there are 2 ways to run this script:

1) ./main.py --stdout
2) ./main.py --html

(1) runs the script and pauses at each popup graph. in this mode you are able to
zoom in on the graphs

(2) does not display any text in the terminal, but saves the content to
index.html and images into the specified img dir.

disclaimer: these scripts are just for understanding concepts. they should not
be used for performing live crypto operations.
"""

import version_check
import operations
import graphics
import writer
import sys
import sympy

writer.to_file = "index.html"
writer.img_path = "/img" # url
graphics.img_dir = "../img" # disk

if "--html" in sys.argv:
    writer.output_html = True
    graphics.output_html = True
elif "--stdout" in sys.argv:
    writer.output_html = False
    graphics.output_html = False
else:
    raise ValueError(
        "you must specify either --html or --stdout for the output type"
    )

if writer.output_html:
    # a notice when running in html output mode. not printed to html file
    print "writing output to %s. graphs and equations stored in %s\n" \
    % (writer.to_file, graphics.img_dir)

if writer.output_html:
    import os, errno
    # create the img directory to store the graph and equation images in
    try:
        os.makedirs(graphics.img_dir)
    except OSError as exception:
        if exception.errno != errno.EEXIST:
            raise

    # clear the writer.to_file, ready for writing again
    try:
        os.remove(writer.to_file)
    except OSError as exception:
        # errno.ENOENT = no such file or directory
        if exception.errno != errno.ENOENT:
            raise

    # init html
    writer.html_title = "<title>visual secp256k1</title>"
    writer.html_metatags = {
        "slug": "visual-secp256k1",
        "date": "2018-12-10",
        "category": "cryptography",
        "tags": "bitcoin, cryptography",
        "stylesheets": "visual-secp256k1.css",
        "scripts": "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML",
        "img_preloads": [], # init
        "summary": "A walkthrough of secp256k1 - Bitcoin's elliptic curve."
    }
    writer.acc("{% from 'h.html' import h with context %}")

##########decimal_places = 30
if not writer.output_html:
    # detect the best form of pretty printing available in this terminal
    sympy.init_printing()

writer.acc("""<ol>
<li>point addition (infinite field)</li>
<li>subtraction and halving (infinite field)</li>
<li>point addition (finite field)</li>
<li>subtraction and halving (finite field)</li>
<li>bitcoin deterministic keys</li>
<li>signing a message</li>
<li>verifying a message signature</li>
<li>recovering a public key from a signature</li>
<li>cracking a private key</li>
</ol>""")

writer.acc("<p>The equation of the bitcoin elliptic curve is as follows:</p>")
writer.acc(latex = operations.secp256k1_eq)
writer.acc("<p>This equation is called <i>secp256k1</i> and looks like this:</p>")
graphics.init_secp256k1_plot(x_max = 7)
writer.acc(writer.make_img(**graphics.finalize_plot("secp256k1")))

writer.acc("""<br><br><br>{{ h(2, 'point addition (infinite field)') }}

<p>To add two points on the elliptic curve, just draw a line through them and
find the third intersection with the curve, then mirror this third point about
the \(x\) axis. For example, adding point \(p\) to point \(q\):</p>""")
graphics.init_secp256k1_plot(x_max = 7)

# define point p
xp = 5
yp_pos = False
yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)

# define point q
xq = 1
yq_pos = False
yq = operations.y_secp256k1(xq, yq_pos)
q = (xq, yq)

graphics.plot_add_inf_field(p, q, "p", "q", "p + q", color = "r")
writer.acc(writer.make_img(**graphics.finalize_plot("point_addition1")))

writer.acc("""<p>Note that the third intersection with the curve can also lie
between the points being added:</p>""")

graphics.init_secp256k1_plot(x_max = 7)

# redefine point p
xp = 6
yp_pos = False
yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)

# redefine point q
xq = -1
yq_pos = True
yq = operations.y_secp256k1(xq, yq_pos)
q = (xq, yq)

graphics.plot_add_inf_field(p, q, "p", "q", "p + q", color = "r")
writer.acc(writer.make_img(**graphics.finalize_plot("point_addition2")))

writer.acc("""<p>Try moving point \(q\) towards point \(p\) along the
curve:</p>""")

graphics.init_secp256k1_plot(x_max = 7)

# redefine point p
xp = 5
yp_pos = False
yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)

# redefine point q
xq1 = 0
yq1_pos = False
yq1 = operations.y_secp256k1(xq1, yq1_pos)
q1 = (xq1, yq1)
graphics.plot_add_inf_field(p, q1, "p", "q_1", "p+q_1", color = "r")

# redefine point q
xq2 = 1
yq2_pos = False
yq2 = operations.y_secp256k1(xq2, yq2_pos)
q2 = (xq2, yq2)
graphics.plot_add_inf_field(p, q2, "", "q_2", "p+q_2", color = "c")

# redefine point q
xq3 = 4
yq3_pos = False
yq3 = operations.y_secp256k1(xq3, yq3_pos)
q3 = (xq3, yq3)
graphics.plot_add_inf_field(p, q3, "", "q_3", "p+q_3", color = "w")

writer.acc(writer.make_img(**graphics.finalize_plot("point_addition3")))

writer.acc("""<p>Clearly as \(q\) approaches \(p\), the line between \(q\) and
\(p\) approaches the tangent at \(p\). And at \(q = p\) this line <i>is</i> the
tangent. So a point can be added to itself (\(p + p\), i.e. \(2p\)) by finding
the tangent to the curve at that point and the third intersection with the
curve:</p>""")
graphics.init_secp256k1_plot(x_max = 5)

# redefine point p
xp = 2
yp_pos = False
yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)
graphics.plot_add_inf_field(p, p, "p", "", "2p", color = "r")
writer.acc(writer.make_img(**graphics.finalize_plot("point_doubling1")))

# you can change this to anything and it will still work (though some values
# will give coordinates of 4p which are too large for matplotlib to compute
# and graph)
xp = 10
yp_pos = True
writer.acc("""<p>OK, but so what? When you say <i>add points on the curve</i> is
this just fancy mathematical lingo, or does this form of addition work like
regular addition? For example does \(p + p + p + p = 2p + 2p\) on the
curve?</p>

<p>To answer that, lets check with \(p\) at \(x = %s\) in the %s half of the
curve:</p>""" % (xp, "top" if yp_pos else "bottom"))
def plot_4p(xp, yp_pos, labels_on = True):
    """note: turn labels off when zooming, else they are positioned wrong"""
    # first calculate the rightmost x coordinate for the plot area
    yp = operations.y_secp256k1(xp, yp_pos)
    p = (xp, yp)
    two_p = operations.add_points(p, p)
    three_p = operations.add_points(p, two_p)
    four_p = operations.add_points(p, three_p)
    (x2p, y2p) = two_p
    (x3p, y3p) = three_p
    (x4p, y4p) = four_p
    rightmost_x = max(xp, x2p, x3p, x4p)

    graphics.init_secp256k1_plot(rightmost_x + 2)
    p_label = "p" if labels_on else ""
    p2_label = "2p" if labels_on else ""
    p3_label = "3p" if labels_on else ""
    p4_label = "4p" if labels_on else ""
    graphics.plot_add_inf_field(p, p, p_label, p_label, p2_label, color = "r")
    graphics.plot_add_inf_field(p, two_p, p_label, p2_label, p3_label, color = "c")
    graphics.plot_add_inf_field(p, three_p, p_label, p3_label, p4_label, color = "w")
    graphics.plot_add_inf_field(two_p, two_p, p2_label, p2_label, p4_label, color = "#ff69b4")

plot_4p(xp, yp_pos)
writer.acc(writer.make_img(**graphics.finalize_plot("4p1")))

writer.acc("""<p>Notice how the tangent to \(2p\) and the line through \(p\) and
\(3p\) both result in the same intersection with the curve. Lets zoom in to
check:</p>""")

plot_4p(xp, yp_pos, labels_on = False)
graphics.plt.axis([-2, 0, -3, 3]) # xmin, xmax, ymin, ymax
writer.acc(writer.make_img(**graphics.finalize_plot("4p1_zoom")))

xp = 4
yp_pos = False
writer.acc("""<p>They sure seem to converge on the same point, but maybe
\(x = 10\) is just a special case? Does point addition work for other values of
\(x\)?</p>

<p>Lets try \(x = %s\) in the %s half of the curve:</p>"""
% (xp, "top" if yp_pos else "bottom"))
plot_4p(xp, yp_pos)
writer.acc(writer.make_img(**graphics.finalize_plot("4p2")))

writer.acc("<p>So far so good. Zooming in:</p>")
plot_4p(xp, yp_pos, labels_on = False)
graphics.plt.axis([-0.6, 0.3, -3.5, -1.5]) # xmin, xmax, ymin, ymax
writer.acc(writer.make_img(**graphics.finalize_plot("4p2_zoom")))

xp = 3
yp_pos = True
writer.acc("""<p>Cool. Lets do one last check using point \(x = %s\) in the %s
half of the curve:</p>""" % (xp, "top" if yp_pos else "bottom"))
plot_4p(xp, yp_pos)
writer.acc(writer.make_img(**graphics.finalize_plot("4p3")))

xp = 10
yp_pos = True

writer.acc("""<p>Well, this point addition on the bitcoin elliptic curve
certainly works in the graphs. But what if the graphs are innaccurate? Maybe the
point addition is only approximate and the graphs do not display the inaccuracy...

A more accurate way of testing whether point addition really does work would be
to compute the \(x\) and \(y\) coordinates at point \(p + p + p + p\) and also
compute the \(x\) and \(y\) coordinates at point \(2p + 2p\) and see if they are
identical. Lets check for \(x = %s\) with y in the %s half of the curve:</p>"""
% (xp, "top" if yp_pos else "bottom"))

# p + p + p + p
yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)
two_p = operations.add_points(p, p)
three_p = operations.add_points(p, two_p)
four_p = operations.add_points(p, three_p)
writer.acc("$$p + p + p + p = %s$$" % (four_p, ))

# 2p + 2p
two_p_plus_2p = operations.add_points(two_p, two_p)
writer.acc("$$2p + 2p = %s$$" % (two_p_plus_2p, ))

yp_pos = False
writer.acc("""<p>Cool! clearly they are identical :) However lets check the more
general case where \(x\) at point \(p\) is a variable in the %s half of the
curve:</p>""" % ("top" if yp_pos else "bottom"))
xp = sympy.symbols("x_p")

yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)
two_p = operations.add_points(p, p)
three_p = operations.add_points(p, two_p)
four_p = operations.add_points(p, three_p)
(x4p, y4p) = four_p
writer.acc("<p>at \(p + p + p + p\), \(x\) is computed as:</p>")
writer.acc(latex = "x_{(p+p+p+p)} = %s" % sympy.latex(x4p.simplify()))

writer.acc("<p>and \(y\) is computed as:</p>")
writer.acc(latex = "y_{(p+p+p+p)} = %s" % sympy.latex(y4p.simplify()))

two_p_plus_2p = operations.add_points(two_p, two_p)
(x2p_plus_2p, y2p_plus_2p) = two_p_plus_2p 
writer.acc("<p>at \(2p + 2p\), \(x\) is computed as:</p>")
writer.acc(latex = "x_{(2p+2p)} = %s" % sympy.latex(x2p_plus_2p.simplify()))
writer.acc("<p>and \(y\) is computed as:</p>")
writer.acc(latex = "y_{(2p+2p)} = %s" % sympy.latex(y2p_plus_2p.simplify()))
writer.acc("""<p>Compare these results and you will see that that they are
identical. This means that addition and multiplication of points on the bitcoin
elliptic curve really does work the same way as regular addition and
multiplication!</p>

<br><br><br>{{ h(2, 'subtraction and halving (infinite field)') }}

<p>Just as points can be added together and doubled and on the bitcoin elliptic,
so they can also be subtracted and halved. Subtraction is simply the reverse of
addition - i.e. if we add point \(q\) to point \(p\) and arrive at point \(r\)
then logically if we subtract point \(q\) from point \(r\) we should arrive back
at \(p\): \(p + q = r\), therefore (subtracting \(q\) from both sides):
\(p = r - q\). Another way of writing this is \(r + (-q) = p\). But what is
\(-q\)? It is simply the mirroring of point \(q\) about the \(x\) axis:</p>""")
graphics.init_secp256k1_plot(x_max = 7)

xp = 5
yp_pos = False
yp = operations.y_secp256k1(xp, yp_pos)
p = (xp, yp)

xq = 1
yq_pos = False
yq = operations.y_secp256k1(xq, yq_pos)
q = (xq, yq)

r = operations.add_points(p, q)
graphics.plot_add_inf_field(p, q, "p", "q", "r", color = "r")

graphics.plot_subtract_inf_field(r, q, "", "-q", "", color = "w")
writer.acc(writer.make_img(**graphics.finalize_plot("point_subtraction1")))

writer.acc("""<p>Clearly, subtracting point \(q\) from point \(r\) does indeed
result in point \(p\) - back where we started.</p>

<p>So if subtraction is possible on the bitcoin elliptic curve, then how about
division? Well we have already seen how a point can be added to itself - i.e. a
doubling (\(p + p = 2p\)), so the converse must also hold true. To get from
point \(2p\) back to point \(p\) constitutes a halving operation. But is it
possible? While it is certainly possible to find the tangent to the curve which
passes through a given point, it must be noted that there exist 2 such tangents
- one in the top half of the curve and one in the bottom:</p>""")

# works best if you pick a value between cuberoot(-7) and -0.5
x2p = -1.7
y2p_pos = False # 2p is below the x-axis
y2p = operations.y_secp256k1(x2p, y2p_pos)
two_p = (x2p, y2p)

y2q1_pos = False
half_p1 = operations.half_point(two_p, y2q1_pos)
(half_p1_x, half_p1_y) = half_p1

y2q2_pos = True
half_p2 = operations.half_point(two_p, y2q2_pos)
(half_p2_x, half_p2_y) = half_p2

x_max = max(x2p, half_p1_x, half_p2_x)

graphics.init_secp256k1_plot(x_max = x_max + 2)
graphics.plot_add_inf_field(half_p1, half_p1, "p_1", "", "2p", color = "r")
graphics.plot_add_inf_field(half_p2, half_p2, "p_2", "", "", color = "w")

writer.acc(writer.make_img(**graphics.finalize_plot("point_halving1")))

writer.acc("""<p>This means that it is not possible to conduct a point division
and arrive at a single solution on the bitcoin elliptic curve. Note that this
conclusion does not apply to elliptic curves over a finite field, as we will see
later on.</p>""")
writer.acc("<br><br><br>{{ h(2, 'point addition (finite field)') }}")
writer.acc("<br><br><br>{{ h(2, 'subtraction and halving (finite field)') }}")
writer.acc("<br><br><br>{{ h(2, 'bitcoin master public keys') }}")
writer.acc("<br><br><br>{{ h(2, 'signing a message') }}")
writer.acc("<br><br><br>{{ h(2, 'verifying a message signature') }}")
writer.acc("<br><br><br>{{ h(2, 'recovering a public key from a signature') }}")
writer.acc("<br><br><br>{{ h(2, 'cracking a private key') }}")

if writer.output_html:
    writer.save_all_html()
