"""
functions related to plotting and calculating points on bitcoin's elliptic curve
polynomial (secp256k1)

disclaimer: these scripts are just for understanding concepts. they should not
be used for performing live crypto operations.
"""

prime = (2 ** 256) - (2 ** 32) - 977
N = 115792089237316195423570985008687907852837564279074904382605163141518161494337
secp256k1_eq = "y^2 = x^3 + 7"

from distutils.version import LooseVersion
import sympy, mpmath, numpy, matplotlib, hashlib
import matplotlib.pyplot as plt

def y_secp256k1(xp, yp_pos, modular = False):
    """
    return either the value of y at point x = xp, or the equation for y in terms
    of xp. xp defines the scalar value of y but does not specify whether the
    result is in the top or the bottom half of the curve. the yp_pos input gives
    this:
    yp_pos == True means yp is a positive value: y = +sqrt(x^3 + 7)
    yp_pos == False means yp is a negative value: y = -sqrt(x^3 + 7)
    """
    y = square_root(power(xp, 3, modular) + 7, modular)

    if yp_pos == False:
        y = -y
        if modular:
            y = y % prime

    return y

def power(num, exp, modular):
    if modular:
        return pow(num, exp, prime)
    else:
        return num**exp

def square_root(num, modular = False):
    if modular:
        return modular_sqrt(num)
    else:
        return sympy.sqrt(num)

def invert(num, modular = False):
    if modular:
        # only works if the modulus is prime.
        # https://stackoverflow.com/questions/4798654/modular-multiplicative-inverse-function-in-python
        return pow(num, prime - 2, prime)
    else:
        if isinstance(num, sympy.Expr):
            return 1 / num
        else:
            return 1.0 / num

def modular_sqrt(a):
    """
    Find a quadratic residue (mod prime) of 'a'. prime must be an odd prime.

    Solve the congruence of the form: x^2 = a (mod prime) and return x. Note that
    prime - x is also a root.

    0 is returned if no square root exists for these a and prime.

    The Tonelli-Shanks algorithm is used (except for some simple cases in which
    the solution is known from an identity). This algorithm runs in polynomial
    time (unless the generalized Riemann hypothesis is false).

    Thanks to
    https://eli.thegreenplace.net/2009/03/07/computing-modular-square-roots-in-python
    """
    global prime
    # simple cases
    if legendre_symbol(a) != 1:
        return 0
    elif a == 0:
        return 0
    elif prime == 2:
        return 0
    elif prime % 4 == 3:
        return pow(a, (prime + 1) / 4, prime)

    # partition prime - 1 to s * 2^e for an odd s (i.e. reduce all the powers of 2
    # from prime - 1)
    s = prime - 1
    e = 0
    while (s % 2) == 0:
        s /= 2
        e += 1

    # find some n with a legendre symbol n|prime = -1. shouldn't take long.
    n = 2
    while legendre_symbol(n) != -1:
        n += 1

    # here be dragons! read the paper "Square roots from 1; 24, 51, 10 to Dan
    # Shanks" by Ezra Brown for more information

    # x is a guess of the square root that gets better with each iteration. b is
    # the "fudge factor" - by how much we're off with the guess. The invariant
    # x^2 = ab (mod prime) is maintained throughout the loop. g is used for
    # successive powers of n to update both a and b r is the exponent -
    # decreases with each update
    x = pow(a, (s + 1) / 2, prime)
    b = pow(a, s, prime)
    g = pow(n, s, prime)
    r = e

    while True:
        t = b
        m = 0
        for m in xrange(r):
            if t == 1:
                break
            t = pow(t, 2, prime)

        if m == 0:
            return x

        gs = pow(g, 2 ** (r - m - 1), prime)
        g = (gs * gs) % prime
        x = (x * gs) % prime
        b = (b * g) % prime
        r = m

def legendre_symbol(a):
    """
    Compute the Legendre symbol a|prime using Euler's criterion. prime is a prime, a is
    relatively prime to prime (if prime divides a, then a|prime = 0)

    Returns 1 if a has a square root modulo prime, -1 otherwise.
    """
    global prime
    ls = pow(a, (prime - 1) / 2, prime)
    return -1 if (ls == (prime - 1)) else ls

def y_line(x, p, m, modular = False):
    """
    either calculate and return the value of y at point x on the line passing
    through (xp, yp) with slope m, or return the symbolic expression for y as a
    function of x along the line:
    y = mx + c
    ie yp = m(xp) + c
    ie c = yp - m(xp)
    ie y = mx + yp - m(xp)
    ie y = m(x - xp) + yp
    """
    (xp, yp) = p
    y = m * (x - xp) + yp
    if modular:
        y = y % prime

    return y

def slope(p, q, modular = False):
    """
    either calculate and return the value of the slope of the line which passes
    through (xp, yp) and (xq, yq) or return the symbolic expression for this
    slope
    """
    if p == q:
        # when both points are on top of each other then we need to find the
        # tangent slope at (xp, yp)
        return tan_slope(p, modular)
    else:
        # p and q are two different points
        return non_tan_slope(p, q, modular)

def tan_slope(p, modular = False):
    """
    calculate the slope of the tangent to curve y^2 = x^3 + 7 at xp.

    the curve can be written as y = sqrt(x^3 + 7) (positive and negative) and
    the slope of the tangent is the derivative:
    m = dy/dx = [+/-](0.5(x^3 + 7)^-0.5)(3x^2)
    m = [+/-]3x^2 / (2sqrt(x^3 + 7))
    m = 3x^2 / 2y
    """
    (xp, yp) = p
    slope = (3 * power(xp, 2, modular)) * invert(2 * yp, modular)
    if modular:
        slope = slope % prime

    return slope

def non_tan_slope(p, q, modular = False):
    """
    either calculate and return the value of the slope of the line which passes
    through (xp, yp) and (xq, yq) where p != q, or return the symbolic
    expression for this slope. the slope is the y-step over the x-step, ie
    m = (yp - yq) / (xp - xq)
    """
    (xp, yp) = p
    (xq, yq) = q
    slope = (yp - yq) * invert(xp - xq)

    if modular:
        slope = slope % prime

    return slope

def intersection(p, q, modular = False):
    """
    either calculate and return the value of the intersection coordinates of the
    line through (xp, yp) and (xq, yq) with the curve, or the symbolic
    expressions for the coordinates at this point.

    ie the intersection of line y = mx + c with curve y^2 = x^3 + 7.

    in y_line() we found y = mx + c has c = yp - m(xp) and the line and curve
    will have the same y coordinate and x coordinate at their intersections, so:

    (mx + c)^2 = x^3 + 7
    ie (mx)^2 + 2mxc + c^2 = x^3 + 7
    ie x^3 - (m^2)x^2 - 2mcx + 7 - c^2 = 0

    and we already know 2 roots of this equation (ie values of x which satisfy
    the equation) - we know that the curve and line intersect at (xp, yp) and
    at (xq, yq) :)

    the equation is order-3 so it must have 3 roots, and can be written like so:

    (x - r1)(x - r2)(x - r3) = 0
    ie (x^2 - xr2 - xr1 + r1r2)(x - r3) = 0
    ie (x^2 + (-r1 - r2)x + r1r2)(x - r3) = 0
    ie x^3 + (-r1 - r2)x^2 + xr1r2 - (r3)x^2 + (-r3)(-r1 - r2)x - r1r2r3 = 0
    ie x^3 + (-r1 - r2 - r3)x^2 + (r1r2 + r1r3 + r2r3)x - r1r2r3 = 0

    comparing terms:
    -m^2 = -r1 - r2 - r3
    and -2mc = r1r2 + r1r3 + r2r3
    and 7 - c^2 = -r1r2r3

    and since r1 = xp and r2 = xq we can just pick one of these equations to
    solve for r3. the first looks simplest:

    m^2 = r1 + r2 + r3
    ie r3 = m^2 - r1 - r2
    ie r3 = m^2 - xp - xq

    this r3 is the x coordinate of the intersection of the line with the curve.
    """
    m = slope(p, q, modular)
    (xp, yp) = p
    (xq, yq) = q
    r3 = power(m, 2, modular) - xp - xq

    if modular:
        r3 = r3 % prime

    return (r3, y_line(r3, p, m, modular))
    #return (r3, y_line(r3, q, m, modular)) # would also return the exact same thing

def tangent_intersection(p, yq_pos):
    """
    note: this function is not intended for finite fields

    calculate and return the value of the tangent-intersection coordinates
    (xq, yq) of the line through (xp, yp) with the curve.

    the easiest way to find the tangent point (q) of the line which passes
    through point p is to equate the two different slope equations:

    1) m = 3xq^2 / 2yq
    2) m = (yp - yq) / (xp - xq)

    (1) is the tangent slope and (2) is the non-tangent slope. we can use these
    equations to solve for xq, knowing that:

    yq = [+/-]sqrt(xq^3 + 7)

    where + or - is determined by the input variable yq_pos. note that it is a
    very difficult (impossible?) equation to solve for certain values of p, so
    we will solve numerically.

    this function works best if you pick an xp value between cuberoot(-7) and
    -0.5. for xp values outside this range you will need to adjust the numerical
    solver function - ie pick a different starting point and algorythm.
    """
    (xp, yp) = p
    if float(xp) < -7**(1 / 3.0):
        raise ValueError("xp must be greater than cuberoot(-7)")
    xq = sympy.symbols("xq")
    yq = y_secp256k1(xq, yq_pos)
    q = (xq, yq)
    m1 = tan_slope(q)
    m2 = non_tan_slope(p, q)
    # solve numerically, and start looking for solutions at xq = 0
    xq = float(sympy.nsolve(m1 - m2, xq, 0))
    return (xq, y_secp256k1(xq, yq_pos))

def add_points(p, q, modular = False):
    """
    add points (xp, yp) and (xq, yq) by finding the line through them and its
    intersection with the elliptic curve (xr, yr), then mirroring point r about
    the x-axis
    """
    r = intersection(p, q, modular)
    (xr, yr) = r
    return (xr, -yr)

def negative(p, modular = False):
    """return the negative of point p - ie mirror it about the x-axis"""
    (xp, yp) = p
    neg_yp = -yp
    if modular:
        neg_yp = neg_yp % prime
    return (xp, neg_yp)

def subtract_points(p, q, modular = False):
    """p - q == p + (-q)"""
    return add_points(p, negative(q), modular)

def half_point(p, yq_pos):
    """
    note: this function is not intended for finite fields

    return the halving of point p. basically do the opposite of doubling - first
    mirror the point about the x-axis (-p), then compute the tangent line which 
    passes through this point and locate the tangent point (half p)
    """
    return tangent_intersection(negative(p), yq_pos)
