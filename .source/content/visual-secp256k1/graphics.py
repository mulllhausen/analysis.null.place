"""
functions related to plotting and calculating points on bitcoin's elliptic curve
polynomial (secp256k1)

disclaimer: these scripts are just for understanding concepts. they should not
be used for performing live crypto operations.
"""

import operations
import sympy, mpmath, numpy, matplotlib, hashlib
import matplotlib.pyplot as plt

img_dir = "" # init
output_html = None # init

# increase this to plot a finer-grained curve - good for zooming in.
# note that this does not affect lines (which only require 2 points).
curve_steps = 10000
done_labels = [] # list of labels already done per graph - to avoid duplication
done_dots = [] # list of dot points already done per graph - to avoid duplication

# define matplotlib styles (matplotlib.org/users/customizing.html)
green = "#7db904"
grey = "#2b2b2b"
matplotlib.rc("axes", grid = True, edgecolor = green, facecolor = grey)
matplotlib.rc("xtick", color = green)
matplotlib.rc("ytick", color = green)
matplotlib.rc("figure", facecolor = grey) # for --stdout
matplotlib.rc("savefig", facecolor = grey, bbox = "tight") # for --html
matplotlib.rc("grid", color = green)

def init_secp256k1_plot(x_max = 4):
    """
    initialize the elliptic curve plot - create the figure and plot the curve
    but do not put any multiplication (doubling) lines on it yet and don't show
    it yet.

    we need to determine the minimum x value on the curve. y = sqrt(x^3 + 7) has
    imaginary values when (x^3 + 7) < 0, eg x = -2 -> y = sqrt(-8 + 7) = i,
    which is not a real number. so x^3 = -7, ie x = -cuberoot(7) is the minimum
    real value of x.
    """
    global plt, x_text_offset, y_text_offset, done_labels, done_dots
    done_labels = [] # clear
    done_dots = [] # clear
    x_min = -(7**(1 / 3.0))

    x_text_offset = 0 # (x_max - x_min) / 30
    y_max = operations.y_secp256k1(x_max, yp_pos = True)
    y_min = operations.y_secp256k1(x_max, yp_pos = False)
    y_text_offset = (y_max - y_min) / 20

    x = sympy.symbols("x")
    y = sympy.lambdify(x, operations.y_secp256k1(x, yp_pos = True), "numpy")
    plt.figure() # init
    x_array = numpy.linspace(x_min, x_max, curve_steps)
    # the top half of the elliptic curve
    plt.plot(x_array, y(x_array), color = green)
    plt.plot(x_array, -y(x_array), color = green)
    plt.ylabel("$y$", rotation = 0, color = green)
    plt.xlabel("$x$", color = green)
    plt.title("secp256k1: $%s$" % operations.secp256k1_eq, color = green)

def plot_add_inf_field(p, q, p_name, q_name, p_plus_q_name, color = "r"):
    """
    add-up two points on the curve (p & q). this involves plotting a line
    through both points and finding the third intersection with the curve (r),
    then mirroring that point about the x-axis. note that it is possible for the
    intersection to fall between p and q.

    colors:
    b: blue
    g: green
    r: red
    c: cyan
    m: magenta
    y: yellow
    k: black
    w: white

    use labels_on = False when zooming, otherwise the plot area will be expanded
    to see the text outside the zoom area
    """
    global plt, x_text_offset, y_text_offset
    (xp, yp) = p
    (xq, yq) = q
    # first, plot the line between the two points upto the intersection with the
    # curve...

    # get the point of intersection (r)
    (xr, yr) = operations.intersection(p, q)

    # convert sympy values into floats
    (xp, xq, xr) = (float(xp), float(xq), float(xr))
    (yp, yq, yr) = (float(yp), float(yq), float(yr))

    # get the range of values the x-axis covers
    x_min = min(xp, xq, xr)
    x_max = max(xp, xq, xr)

    # a line only needs two points
    x_array = numpy.linspace(x_min, x_max, 2)

    m = operations.slope(p, q)
    y_array = operations.y_line(x_array, p, m)
    plt.plot(x_array, y_array, color)

    # plot a point at p
    plot_dot_point(xp, yp, color)
    y_label_pos = yp + (1 if yp > 0 else -1) * y_text_offset 
    plot_label(p_name, xp - x_text_offset, y_label_pos, color)

    if p is not q:
        # plot a point at q
        plot_dot_point(xq, yq, color)
        y_label_pos = yq + (1 if yq > 0 else -1) * y_text_offset 
        plot_label(q_name, xq - x_text_offset, y_label_pos, color)

    # second, plot the vertical line to the other half of the curve...
    y_array = numpy.linspace(yr, -yr, 2)
    x_array = numpy.linspace(xr, xr, 2)
    plt.plot(x_array, y_array, "%s" % color)
    plot_dot_point(xr, -yr, color)
    y_label_pos = -yr + (1 if -yr > 0 else -1) * y_text_offset 
    plot_label(p_plus_q_name, xr - x_text_offset, y_label_pos, color)

def plot_subtract_inf_field(p, q, p_name, q_name, p_minus_q_name, color = "r"):
    "p - q == p + (-q)"
    plot_add_inf_field(
        p, operations.negative(q), p_name, q_name, p_minus_q_name, color
    )

def finalize_plot(img_filename = None):
    """
    either display the graph as a new window or save the graph as an image and
    write a link to the image in the img dir
    """
    try:
        save = output_html
    except:
        save = False

    if save:
        plt.savefig("%s/%s.png" % (img_dir, img_filename))
        return {
            "filename": "%s.png" % img_filename,
            "name": img_filename,
            "css_class": "secp256k1-plot"
        }

    else:
        plt.show(block = True)
        return {}

def plot_label(name, x_pos, y_pos, color):
    global plt, done_labels
    if (name is None) or not len(name):
        return

    label_record = (name, x_pos, y_pos)
    if label_record in done_labels:
        return

    plt.text(x_pos, y_pos, "$%s$" % name, color = color, ha = "center", va = "center")
    done_labels.append(label_record)

def plot_dot_point(x, y, color):
    global plt, done_dots
    dot_record = (x, y)
    if dot_record in done_dots:
        return

    plt.plot(x, y, "%so" % color)
    done_dots.append(dot_record)
