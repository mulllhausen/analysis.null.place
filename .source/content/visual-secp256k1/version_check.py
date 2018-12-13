"""
disclaimer: these scripts are just for understanding concepts. they should not
be used for performing live crypto operations.
"""
from distutils.version import LooseVersion
import sympy, mpmath, numpy, matplotlib, hashlib
import matplotlib.pyplot as plt

if LooseVersion(mpmath.__version__) < LooseVersion("0.19"):
	raise ImportError(
		"mpmath 0.19 or later is required. install it with `sudo python -m"
		" easy_install mpmath`"
	)

if LooseVersion(sympy.__version__) < LooseVersion("0.7.6"):
	raise ImportError(
		"sympy 0.7.6 or later is required. install it with `sudo python -m"
		" easy_install sympy`"
	)

if LooseVersion(numpy.__version__) < LooseVersion("1.6.2"):
	raise ImportError(
		"numpy 1.6.2 or later is required. install it with `sudo pip install"
		" --upgrade numpy"
	)

if LooseVersion(matplotlib.__version__) < LooseVersion("1.1.1"):
	raise ImportError(
		"matplotlib 1.1.1 or later is required. install it with `sudo apt-get"
		" install matplotlib`"
	)
