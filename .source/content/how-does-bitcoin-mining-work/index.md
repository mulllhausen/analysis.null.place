title: how does bitcoin mining work?
slug: how-does-bitcoin-mining-work
date: 2017-11-28 
category: cryptocurrencies
tags: bitcoin, mining, proof-of-work
status: draft
stylesheets: btc.css
scripts: sjcl.min.js,btc-mining.js
summary: An interactive walkthrough of bitcoin mining. No prior knowledge is necessary.

The simplest definition of Bitcoin mining I can think of is this:

<blockquote><p>
Bitcoin mining involves computers competing with each other to solve a random
puzzle. The answer found by the winner is verified by all participants. The
winner receives bitcoins as a reward.
</p></blockquote>

In this article I will delve into what exactly this *random puzzle* is, and how
the solution found by the winner can be verified. I have made the article
interactive so that you can simulate the mining algorithms for yourself and get
a feel for how mining really works. While the concepts here are not simple, they
are presented so as to be easily understood by someone with no knowledge of
programming, cryptography or bitcoin. And I hope the interactivity will make the
whole process fun.

The article has 3 parts:

- cryptographic hashing - this is background material needed to understand
bitcoin mining
- bitcoin mining
- annex - filling in some of the fine detail not discussed earlier

## cryptographic hashing

To understand bitcoin mining, it is first necessary to understand what
cryptographic hashing is and how it works. Rather than bore you with definitions
at the start, let's just dive in and give it a go. Click the *SHA256* button
a few times and look carefully at what this does each time, then try typing
different things in the *pre-image* field and clicking the *SHA256* button to
see what that does:
<div class="form-container" id="form0">
    <label for="inputMessage0" class="for-textbox">pre-image</label><br>
    <div class="left">
        <input id="inputMessage0" type="text" value="hello world!">
    </div>
    <div class="left">
        <button id="btnRunHash0">SHA256</button>
    </div>
    <br>
    <div class="left">
        <span id="hash0Duration"></span>
    </div>
    <div class="codeblock-container auto-wrap-on-mobile" style="display:none;">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="hash0Results" class="codeblock"></div>
    </div>
</div>

*SHA256* stands for *Secure Hash Algorithm (256 bits)*. There are many different
hashing algorithms - *SHA128*, *SHA512*, *MD5*, *RIPEMD128*, *RIPEMD160*, etc.
The differences between these hashing algorithms are not important for the sake
of this article - all that is important is to recognise that *SHA256* is merely
one of many hashing algorithms - the one that is used in bitcoin mining.

<blockquote>
<p>Cryptographic hashing involves taking a string of characters and transforming
them into another string of characters. We call the input characters the
<i>pre-image</i> and we call the output the <i>hash</i>:</p>
</blockquote>

<div class="horizontal-center">
<div id="hashingFlowchartContainer">
    <object id="hashingFlowchartSVG" data="/img/hashing-flowchart.svg" type="image/svg+xml"></object>
</div>
</div>

The output of a cryptographic hash is actually a number; however, that may not
have been obvious when you ran the *SHA256* hash above, since that number is
written in hexadecimal format - i.e. base 16. To explain what that means, here
are some hexadecimal values side by side with their decimal equivalent values:

<div class="horizontal-center" id="dec2hexTable">
    <div class="constrainWidth">
        <table class="header">
            <tr> <td>decimal</td> <td>hexadecimal</td> </tr>
        </table>
        <div class="vertical-scroll">
            <table id="dec2hexData">
                <tr> <td>0</td>  <td>0</td>  </tr>
                <tr> <td>1</td>  <td>1</td>  </tr>
                <tr> <td>2</td>  <td>2</td>  </tr>
                <tr> <td>3</td>  <td>3</td>  </tr>
                <tr> <td>4</td>  <td>4</td>  </tr>
                <tr> <td>5</td>  <td>5</td>  </tr>
                <tr> <td>6</td>  <td>6</td>  </tr>
                <tr> <td>7</td>  <td>7</td>  </tr>
                <tr> <td>8</td>  <td>8</td>  </tr>
                <tr> <td>9</td>  <td>9</td>  </tr>
                <tr> <td>10</td> <td>a</td>  </tr>
                <tr> <td>11</td> <td>b</td>  </tr>
                <tr> <td>12</td> <td>c</td>  </tr>
                <tr> <td>13</td> <td>d</td>  </tr>
                <tr> <td>14</td> <td>e</td>  </tr>
                <tr> <td>15</td> <td>f</td>  </tr>
                <tr> <td>16</td> <td>10</td> </tr>
                <tr> <td>17</td> <td>11</td> </tr>
                <tr> <td>18</td> <td>12</td> </tr>
            </table>
        </div>
        <div class="instructions noselect">click for more</div>
    </div>
</div>

Don't worry, you won't need to do any hexadecimal conversions in this article.
All you need to remember here is that hexadecimal digits go from `0` to `9` to
`a` to `f`.

OK, so now that you have tried cryptographic hashing, and you know about
hexadecimal format, let's have a look at the formal definition of cryptographic
hashing:

<blockquote>
<p>A cryptographic hashing algorithm has the following properties relevant to
bitcoin mining:</p>
<p></p>
<ol>
    <li>it is deterministic - the same pre-image always results in the same hash</li>
    <li>it is quick to compute the hash value for any given pre-image</li>
    <li>it is impossible to reverse a cryptographic hash and recover a pre-image
    from its hash value, except by trying all possible pre-images</li>
    <li>a small change to a pre-image changes the hash value so extensively
    that the new hash value appears uncorrelated with the old hash value</li>
</ol>
</blockquote>

Lets investigate these properties:

Properties 1 and 2 are quite obvious - earlier when we hashed `hello world!`
with *SHA256* it always gave
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` and took
<span id="helloWorldHashSpeed">less than 4 milliseconds (depending on the speed
of your device)</span>, which is fairly quick. However it must be noted that
performing the hash always takes at least *some* time, even if it is a very small
amount of time. This fact will be important when we discuss hashing in relation
to bitcoin mining later on.

Property 3 explains that hashing is a one-way process. We can easily get from
a pre-image to its hash, but it is impossible to programmatically get from a
cryptographic hash back to its pre-image. The process of trying to get from a
hash back to its pre-image is called *inverting the hash*.

<div id="easyImpossibleCodeblock" class="codeblock">easy:       pre-image -> SHA256 -> hash

impossible: pre-image <- SHA256 <- hash
</div>

If we start with a pre-image and then hash it, then of course we will know what
the pre-image for the resulting hash is - for example, if I give you the hash
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` then you
already know that a corresponding SHA256 pre-image is `hello world!`, since we
already hashed `hello world!` with SHA256 earlier and it gave this result. But
if I give you `32bd2fb75ea9fdd49c0a9b97b015b47a9cf41f6fc2f773dde97c67bcfc9830c7`
then you will not be able to find the pre-image which results in this hash - i.e.
you will not be able to invert this hash. Seriously - give it a go:

<div class="form-container" id="form1">
    <input type="checkbox" id="inputCheckbox1" checked>
    <label for="inputCheckbox1">automatically increment pre-image after each hash</label>
    <br><br>
    <label for="inputMessage1" class="for-textbox">pre-image</label><br>
    <div class="left">
        <input id="inputMessage1" type="text" value="a">
    </div>
    <div class="left">
        <button id="btnRunHash1">SHA256</button>
    </div>
    <br>
    <div class="left">
        <span id="info1" style="display:none;">
            (Average hash rate: <span></span> hashes per second)
        </span>
    </div>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="codeblock1HashResults" class="codeblock">? <span class="aligner"></span>-> SHA256 -> <span id="match1" class="individual-digits">32bd2fb75ea9fdd49c0a9b97b015b47a9cf41f6fc2f773dde97c67bcfc9830c7</span>
<span id="showResults1" style="display:none;"><span id="preImage1"></span> <span class="aligner"></span>-> SHA256 -> <span id="hash1Result" class="individual-digits"></span>
status: <span id="matchStatus1"></span></span></div>
    </div>
</div>

The difficulty of inverting a *SHA256* hash is due its length being so large!
*SHA256* has 2<sup>256</sup> possible different hash values. That's
115792089237316195423570985008687907853269984665640564039457584007913129639936
different possible hash values. There are approximately that many atoms in the
universe! So don't feel bad for not being able to invert
`32bd2fb75ea9fdd49c0a9b97b015b47a9cf41f6fc2f773dde97c67bcfc9830c7` - for all
intents and purposes, it cannot be inverted. And that is true even when computers
do the hashing at their maximum speeds. If you click the *Run SHA256 Automatically*
button below then you can have your device cycle through pre-images and show you
the results at its maximum possible speed:

<div class="form-container" id="form2">
    <input type="checkbox" id="inputCheckbox2" checked disabled>
    <label for="inputCheckbox2">automatically increment pre-image after each hash</label>
    <br><br>
    <label for="inputMessage2" class="for-textbox">pre-image</label><br>
    <div class="left">
        <input id="inputMessage2" type="text" value="a" disabled>
    </div>
    <div class="left">
        <button id="btnRunHash2">Run SHA256 Automatically</button>
    </div>
    <br>
    <div class="left">
        <span id="info2" style="display:none;">
            (Average hash rate: <span></span> hashes per second)
        </span>
    </div>
    <br><br>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="codeblock2HashResults" class="codeblock">? <span class="aligner"></span>-> SHA256 -> <span id="match2" class="individual-digits">32bd2fb75ea9fdd49c0a9b97b015b47a9cf41f6fc2f773dde97c67bcfc9830c7</span>
<span id="showResults2" style="display:none;"><span id="preImage2"> </span> <span class="aligner"></span>-> SHA256 -> <span id="hash2Result" class="individual-digits"></span>
status: <span id="matchStatus2"></span></span></div>
    </div>
</div>

<span id="showHowLongForThisDevice" style="display:none;">Using your device's
average hash rate of <span class="hash2Rate"></span> hashes per second, then we
can calculate that it is going to take <span id="howLongForThisDeviceWords"></span>
to try enough combinations to invert this hash and find the solution. That's
<span id="howLongForThisDeviceNumber"></span>.</span>

When it comes to hashing, <span class="hash2Rate">30</span> hashes per second is
actually not quick at all by computer standards. Specialized computer chips are
built to run billions of hashes per second. At the time of writing (March 2018)
the total global SHA256 hashpower is 25,000,000,000,000,000,000 hashes per second,
or 25 million million million hashes per second, but even at this rate it would
take 146 million million million million million million million million years
to try all pre-image combinations for SHA256. That's about a million million
million years quicker than your device, but it doesn't really matter - by the
time it comes around, our sun will have long since burned out.

"Ok", you might think to yourself, "but maybe I don't need to try all the
possible combinations to produce the hash I'm after - maybe I can just skip
ahead ... If the pre-image I start with does not give a hash that is close to
what I want, then I will just choose a pre-image further along that gives a hash
closer to what I want, and then make minor adjustments until I zero in on the
hash." But alas, this is not how cryptographic hashing works - Property 4 tells
us that hashes are both deterministic and random. They are deterministic because
a pre-image will always hash to the same value, but that value is random, so
there can be no process of zeroing in. Trying a pre-image that is "further along"
is no better than trying any other different pre-image - they all completely
modify the resulting hash.

Now that we have discussed the properties of cryptographic hashing we can
investigate how it is used in a technique known as *proof of work*, also known
as *mining*. *Proof of work*, as the name implies, is a way for one computer to
prove to another computer that it has completed a certain amount of work. Lets
call the computer doing the work the *miner*, and the other computer the
*examiner*. The examiner sets a test for the miner to pass by giving it 3 things:

- part of a pre-image
- a hash value that must be matched (called the target)
- the difficulty level of the test

The test works like this: the miner takes the pre-image it has been given and
appends a bunch of random data (called a
[nonce](https://en.wikipedia.org/wiki/Cryptographic_nonce)) to the end of it. It
then hashes the whole thing and checks if it matches the target given by the
examiner. However, it does not need to match the entire hash (that would take
millions of years); rather, it just needs to match part of the hash, as
specified by the difficulty level.

That all sounds very complicated, but don't worry, it will be much clearer after
you give it a go. Click the *Mine with SHA256* button and once you find the
solution try changing the difficulty:

<a name="form3"></a>
<div class="form-container" id="form3">
    <input type="checkbox" id="inputCheckbox3">
    <label for="inputCheckbox3">mine automatically</label>
    <br><br>
    <div class="left">
        <label for="difficulty3" class="for-select">difficulty</label><br>
        <select id="difficulty3"></select>
    </div>
    <div class="left">
        <label for="inputMessage3Prefix" class="for-textbox">pre-image prefix</label><br>
        <input id="inputMessage3Prefix" type="text" value="" disabled>
    </div>
    <div class="left">
        <label for="inputMessage3" class="for-textbox">pre-image nonce</label><br>
        <input id="inputMessage3" type="text" value="a">
    </div>
    <div class="left">
        <button id="btnRunHash3">Mine manually with SHA256</button>
    </div>
    <br>
    <div class="left">
        <span id="info3" style="display:none;">(Average hash rate: <span></span> hashes per second)</span>
    </div>
    <br><br>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="codeblock3HashResults" class="codeblock">SHA256 target: <span class="aligner"></span><span id="match3" class="individual-digits">0000000000000000000000000000000000000000000000000000000000000000</span>
<span id="showResults3" style="display:none;"><span id="preImage3"> </span> -> SHA256 -> <span class="aligner"></span><span id="hash3Result" class="individual-digits"></span>
status: <span id="matchStatus3"></span><span id="mining3Statistics"></span></span></div>
    </div>
</div>

Whenever you pass the test, you can send the nonce back to the examiner and it
can verify that you did indeed pass by running the hash for itself. It will take
you lots of attempts at hashing to pass the test, but it only takes the examiner
a single hash to know whether you passed or failed. This means that you are doing
all the work and the examiner barely does any at all.

As you can see, the higher the difficulty, the more attempts it will take on
average to pass the test. From the results, you can also see that there is a
degree of luck involved in mining - sometimes it takes fewer attempts than
expected and sometimes it takes more. This is because hashing is a random process.

Another thing to note is that the examiner can set the target value without
having to hash a pre-image to get it. The examiner does not need to know the
answer to the test before it sets the test for the miner. In this way, mining is
different from a normal school exam. All that matters is that the examiner can
verify the test once the miner submits the nonce as a solution.

The final thing to understand from this section, before we move on to bitcoin
mining, is that the test we have done here - matching a specified number of
characters at the left-hand-side of the target - is just one of many possible
types of proof-of-work test. The only criteria for a good proof-of-work test is
that the examiner must be able to fine-tune the number of attempts it takes the
miner to pass. Here are some other possible proof-of-work tests:

- matching a specified number of characters at the right-hand-side of the target
- matching a specified number of characters anywhere within the target
- treating both the target and the mined hash as (hexadecimal) numbers, setting
the target to some large number, and mandating that the miner must find a hash
lower than the target

That last type of proof-of-work test is the one used in bitcoin mining.

## bitcoin mining

Now that we have explored hashing and mining in general, we can apply this
knowledge to bitcoin mining.

> Bitcoin mining involves computers competing to find the nonce part of the
pre-image for the hash of the next block in the bitcoin blockchain. The winner
receives bitcoins as a reward.

That definition contains a couple of new concepts, and once you understand them,
it will make perfect sense:

- a bitcoin block
- the bitcoin blockchain

When someone sends some bitcoins to someone else, they begin by opening their
bitcoin wallet (which is a program, app or website running on their device), and
then typing in the address of the recipient and the amount of bitcoin they want
to send to them. The bitcoin wallet uses this information to construct a
transaction. Here is an example bitcoin transaction:

<div class="media-container"><div class="media-positioner">
    <div class="btc-transaction-full">
        01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0704ffff001d0102ffffffff0100f2052a01000000434104d46c4968bde02899d2aa0963367c7a6ce34eec332b32e42e5f3407e052d64ac625da6f0718e7b302140434bd725706957c092db53805b821a85b23a7ac61725bac00000000
    </div>
    <div class="media-caption">example bitcoin transaction</div>
</div></div>

For the purposes of this article, the details of this transaction are not
important, but if you are curious you can view all of this transaction's
information
[here](https://blockchain.info/tx/b1fea52486ce0c62bb442b530a3f0132b826c74e473d1f2c220bfa78111c5082).
However, the only thing you really need to understand at this point is that a
bitcoin transaction is just a string of characters.

Once the wallet software has created the transaction, it sends it out over the
internet to all the other bitcoin nodes it can find (a bitcoin node is just a
device running the bitcoin software). You might have expected the transaction to
only be sent to the person who is receiving the bitcoins, but that is not the
case. In fact, that person does not even have to have their wallet software
running for the transaction to be processed.

Some of the bitcoin nodes which receive the transaction are bitcoin miners (more
on these later). These miners gather the transactions they receive and put them
into a block:

<div class="media-container"><div class="media-positioner">
    <table>
        <tr><td class="btc-block-header-mini">header</td></tr>
        <tr><td class="btc-transaction-mini">transaction 1</td></tr>
        <tr><td class="btc-transaction-mini">transaction 2</td></tr>
        <tr><td class="btc-transaction-mini">transaction 3</td></tr>
    </table>
    <div class="media-caption">a bitcoin block</div>
</div></div>

A bitcoin block consists of a header, followed by a list of transactions. The
block shown here only has 3 transactions, for simplicity, but blocks containing
thousands of transactions are most common.

Just as bitcoin transactions are a string of characters, so is the block header.
The header contains all the data needed to uniquely identify the block:

<div class="media-container"><div class="media-positioner">
    <table class="btc-header-definition">
        <tr><td class="btc-header-field">version</td></tr>
        <tr><td class="btc-header-field">previous block hash</td></tr>
        <tr><td class="btc-header-field">merkle root</td></tr>
        <tr><td class="btc-header-field">timestamp</td></tr>
        <tr><td class="btc-header-field">difficulty</td></tr>
        <tr><td class="btc-header-field">nonce</td></tr>
    </table>
    <div class="media-caption">the bitcoin block header</div>
</div></div>
Lets look at each of these fields within the block header:

The *version* is just a number indicating the current version of the bitcoin
protocol.

The *previous block hash* is where the *blockchain* concept comes in - the
current block references the previous block so that blocks build upon each other
over time, like so:

<div class="form-container">
    <object id="blockchainSVG" data="/img/bitcoin-blockchain.svg" type="image/svg+xml"></object>
</div>
<div class="media-caption">the bitcoin blockchain</div>

The *previous block hash* is found by doing a *SHA265* hash twice in succession
on all the data in the previous block header. As we saw in the hashing section
earlier, that is a very quick thing for a computer to do.

The *merkle root* is loosely defined as a hash of all transactions contained
within the block. The transaction data is the pre-image and the *merkle root* is
the hash. This is another useful feature of cryptographic hashing - it can be
used to summarise a large amount of data using only a very small amount of data.
The transactions in a block generally take up over 1MB, however the merkle root
is only 32 bytes (64 hexadecimal digits).

The *timestamp* is the current date and time of the block.

The *difficulty* is a description of how many attempts, on average, a miner will
need to make to find a solution to the test. As mentioned at the end of the
previous section on hashing, the test in bitcoin mining involves finding a hash
that is lower than a given target. The *difficulty* value in the block header
specifies what that target value is. The way this works is quite technical and
is not necessary to understand bitcoin mining; however, if you are curious, I
have included it in the annex (the final section of this article). The basic
principle, however, is simple - increasing the difficulty lowers the target
value so that miners will have to put in more hashing attempts, and decreasing
the difficulty raises the target value so that miners will have to put in fewer
hashing attempts.

Finally the *nonce* is something we have already discussed in the section on
hashing. The only difference here is that with bitcoin the nonce is an integer.

OK, lets dive into a practical simulation of bitcoin mining to see how all this
works. Click the *Mine manually with SHA256* button a few times and have a look
at what this does, both to the results area and to the nonce in the block header:

<div class="form-container" id="form4">
<div class="media-container"><div class="media-positioner">
    <table class="btc-header-definition">
        <tr><td class="btc-header-field">
            version<br>
            <input id="version4" type="text" class="data-value" size="2" value="1">
        </td></tr>
        <tr><td class="btc-header-field">
            previous block hash<br>
            <input id="prevHash4" type="text" class="data-value" size="64" value="0000000000000000000000000000000000000000000000000000000000000000">
        </td></tr>
        <tr><td class="btc-header-field">
            merkle root<br>
            <input id="merkleRoot4" type="text" class="data-value" size="64" value="4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b">
        </td></tr>
        <tr><td class="btc-header-field">
            timestamp<span id="timestamp4Explanation"></span><br>
            <input id="timestamp4" type="text" class="data-value" size="24" value="03 Jan 2009 18:15:05 GMT">
        </td></tr>
        <tr><td class="btc-header-field">
            difficulty<br>
            <input id="bits4" type="text" class="data-value" size="8" value="1d00ffff">
        </td></tr>
        <tr><td class="btc-header-field">
            nonce<br>
            <input id="nonce4" type="text" class="data-value" size="10" value="0">
        </td></tr>
    </table>
    <div class="media-caption">the bitcoin block header</div>
</div></div>
<ul class="error"></ul>
<button id="btnRunHash4">Mine manually with SHA256</button>
<div class="codeblock-container auto-wrap-on-mobile">
    <div class="button-background">
        <button class="wrap-nowrap" wrapped="false">
            <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
            <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
        </button>
    </div><br>
<div class="codeblock">nonce: <span class="aligner">     </span><span id="nonce4Results">0</span>
target: <span class="aligner">    </span><span id="target4" class="individual-digits"></span>
block hash: <span class="aligner"></span><span id="blockhash4" class="individual-digits"></span>
status: <span class="aligner">    </span><span id="mineStatus4"></span></div>
</div>
</div>

The data in the simulation block header is actually that of the very first
bitcoin block ever. It was mined by Satoshi Nakamoto - the creator(s) of Bitcoin
on the 3rd of January 2009.

As you can see, each mining attempt increments the nonce by 1. To find the block
hash, all of the data in the block header shown here is hashed with SHA256 twice
- i.e. it is all put together in one big string of characters and then hashed
once with SHA256, and then that result is hashed with SHA256 again. There is a
walkthrough of this process in the following annex section, however the details
are really not important in order to understand how bitcoin mining works.

The biggest apparent difference between this mining example and the one in the
previous section on hashing is that the test here involves comparing two
hexadecimal numbers, whereas previously the test involved matching a certain
number of digits from the left-hand-side. However, there is actually a lot of
similarity between these two types of test. Let's forget about hexadecimal
numbers for a moment and just look at some unrelated decimal numbers:

<div class="codeblock">1000000000000
      1000000
</div>

It is obvious that the first number is bigger than the second number - the first
one is longer so clearly it must be bigger. But how about if we zero-pad them so
that they are the same length? They are still the same numbers, but now they are
the same length:

<div class="codeblock">1000000000000
0000001000000
</div>

How can we tell which is bigger? The easiest way is to begin at the
left-hand-side of the number compare the digits:

<div class="codeblock"><span class="individual-digit">1</span>000000000000
<span class="individual-digit">0</span>000001000000
</div>

Because `1` is greater than `0` then we know that the first number must be a
bigger number.

OK, now what if we pad them both to 64 digits? Again they are exactly the same
numbers as before, and they are the same length, but now they have lots of
leading zeros:

<div class="codeblock-container auto-wrap-on-mobile">
    <div class="button-background">
        <button class="wrap-nowrap" wrapped="false">
            <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
            <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
        </button>
    </div><br>
    <div class="codeblock">0000000000000000000000000000000000000000000000000001000000000000
0000000000000000000000000000000000000000000000000000000001000000</div>
</div>

The way to tell which is larger is again to begin at the left-hand-side and keep
moving to the right until we find a digit that is different. Then the digit that
is higher belongs to the bigger number:

<div class="codeblock-container auto-wrap-on-mobile">
    <div class="button-background">
        <button class="wrap-nowrap" wrapped="false">
            <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
            <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
        </button>
    </div><br>
    <div class="codeblock"><span class="individual-digits">0000000000000000000000000000000000000000000000000001</span>000000000000
<span class="individual-digits">0000000000000000000000000000000000000000000000000000</span>000001000000</div>
</div>

That's the technique for decimal numbers, and it is exactly the same for
hexadecimal numbers. The only difference is that decimal numbers go from `0` to
`9` whereas hexadecimal numbers go from `0` to `f`, as you will recall from the
start of this article. If you now go back and mine a few more times in the
previous simulation then the results should make a lot more sense.

So finally we arrive at the end of this article on bitcoin mining. You now know
all about hashing and how hashing is used in bitcoin for mining. There is a bit
more information in the annex to fill in some small gaps, however everything
already covered above is certainly enough to understand what bitcoin mining is
and to get a feel for the amount of effort that it requires even for the fastest
computers on the planet.

All that remains now is to mine a block. We can cheat at this because the above
block was already mined by Satoshi Nakomoto. If we [inspect the blockchain](
http://blockchain.info/block-height/0) we can see that the correct nonce is
2,083,236,893. <a id="makeBlockPass4">Click here</a> to copy the nonce back into
the previous mining simulation and then click the *Mine manually with SHA256*
button to see what happens.

## annex

This section goes into all the detail skipped above. It is really just intended
for those (such as myself) who like to leave no stone unturned. One thing that
was not previously explained in detail was how the bitcoin block hashes are
derived from the block header. The block header is stored as bytes in the
bitcoin blockchain (1 byte is 2 hex digits). Previously the values for each
field in the block header were shown in formats which are easy for humans to
understand, however conversions must be done to arrive at the storage method
used by bitcoin.

The *version* is stored in the blockchain as 4 bytes. Try altering the
human-readable *version* value to see how this changes the value stored in the
blockchain:

<div class="form-container annex" id="form5">
    <label for="version5" class="for-textbox">version</label><br>
    <input id="version5" type="text" class="data-value" size="10" value="1">
    <ul class="error"></ul>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div class="codeblock">convert to hex: <span class="aligner">                 </span><span id="version5Hex"></span>
convert to 4 bytes (big endian): <span class="aligner"></span><span id="version5Bytes"></span>
convert to little endian: <span class="aligner">       </span><span id="version5BytesLE"></span></div>
    </div>
</div>

Note that converting to [little endian](https://en.wikipedia.org/wiki/Endianness)
format simply means reversing the bytes.

The *timestamp* is also stored in the blockchain as 4 bytes. This currently
imposes some restrictions on the permissible date range. Try altering the
human-readable *timestamp* value to see how this changes the value stored in the
blockchain:

<div class="form-container annex" id="form6">
    <label for="timestamp6" class="for-textbox">timestamp<span id="timestamp6Explanation"></span></label><br>
    <input id="timestamp6" type="text" class="data-value" size="24" value="03 Jan 2009 18:15:05 GMT">
    <ul class="error"></ul>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div class="codeblock">timestamp: <span class="aligner">                                   </span><span id="timestamp6GMT"></span>
convert to unixtime (integer): <span class="aligner">               </span><span id="timestamp6Unixtime"></span>
convert to hex (always 4 bytes - big endian): <span class="aligner"></span><span id="timestamp6Bytes"></span>
convert to little endian: <span class="aligner">                    </span><span id="timestamp6BytesLE"></span></div>
    </div>
</div>

The bitcoin *difficulty* (generally called *bits* when expressed in its 4-byte
compact format) is somewhat similar to
[floating point notation](https://en.wikipedia.org/wiki/Floating-point_arithmetic).
*Bits* are stored in the blockchain, and the *target* is used as a threshold
during mining:

<div class="form-container annex" id="form7">
    <label for="bits7" class="for-textbox">difficulty</label><br>
    <input id="bits7" type="text" class="data-value" size="8" value="1d00ffff">
    <ul class="error"></ul>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div class="codeblock">difficulty: <span class="aligner">                        </span><span id="difficulty7"></span>
extract the target length (byte 1): <span class="aligner"></span><span id="lenHex7"></span> hex = <span id="len7"></span> decimal
extract the target prefix: <span class="aligner">         </span><span id="msBytes7"></span><span class="preserve-newline">
</span>
set the prefix to the length and <span class="always-one-newline">
</span>zero-pad to 32 bytes to get target: <span class="aligner"></span><span id="target7"></span><span class="preserve-newline">
</span>
convert to bits (little endian): <span class="aligner">   </span><span id="bits7LE"></span></div>
    </div>
</div>

The human readable *nonce* is stored in the blockchain as 4 little endian bytes:

<div class="form-container annex" id="form8">
    <label for="nonce8" class="for-textbox">nonce</label><br>
    <input id="nonce8" type="text" class="data-value" size="10" value="2083236893">
    <ul class="error"></ul>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div class="codeblock">convert to hex: <span class="aligner">                 </span><span id="nonce8Hex"></span>
convert to 4 bytes (big endian): <span class="aligner"></span><span id="nonce8Bytes"></span>
convert to little endian: <span class="aligner">       </span><span id="nonce8BytesLE"></span></div>
    </div>
</div>

Now we can put all this together. In the following form, note how each field in
the human-readable block header is converted to bytes to be stored in the
blockchain, and how these are concatenated together. The block header is always
80 bytes:

<div class="form-container" id="form9">
<div class="media-container"><div class="media-positioner">
    <table class="btc-header-definition">
        <tr><td class="btc-header-field">
            version<br>
            <input id="version9" type="text" class="data-value" size="2" value="1">
        </td></tr>
        <tr><td class="btc-header-field">
            previous block hash<br>
            <input id="prevHash9" type="text" class="data-value" size="64" value="0000000000000000000000000000000000000000000000000000000000000000">
        </td></tr>
        <tr><td class="btc-header-field">
            merkle root<br>
            <input id="merkleRoot9" type="text" class="data-value" size="64" value="4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b">
        </td></tr>
        <tr><td class="btc-header-field">
            timestamp<span id="timestamp9Explanation"></span><br>
            <input id="timestamp9" type="text" class="data-value" size="24" value="03 Jan 2009 18:15:05 GMT">
        </td></tr>
        <tr><td class="btc-header-field">
            difficulty<br>
            <input id="bits9" type="text" class="data-value" size="8" value="1d00ffff">
        </td></tr>
        <tr><td class="btc-header-field">
            nonce<br>
            <input id="nonce9" type="text" class="data-value" size="10" value="2083236893">
        </td></tr>
    </table>
    <div class="media-caption">human-readable bitcoin block header</div>
</div></div>
<ul  class="error"></ul>
<div class="codeblock-container auto-wrap-on-mobile">
    <div class="button-background">
        <button class="wrap-nowrap" wrapped="false">
            <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
            <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
        </button>
    </div><br>
<div class="codeblock">block header (hex): <span class="aligner">                </span><span id="block9Bytes"><span id="version9Output" class="outputField"></span><span id="prevHash9Output" class="outputField"></span><span id="merkleRoot9Output" class="outputField"></span><span id="timestamp9Output" class="outputField"></span><span id="bits9Output" class="outputField"></span><span id="nonce9Output" class="outputField"></span></span>
block header -> SHA256 -> <span class="aligner">          </span><span id="firstSHA256Output9"></span>
convert to little endian: <span class="aligner">          </span><span id="firstSHA256OutputLE9"></span>
block header -> SHA256 -> SHA256 -> <span class="aligner"></span><span id="secondSHA256Output9"></span>
convert to little endian: <span class="aligner">          </span><span id="secondSHA256OutputLE9"></span></div>
</div>
</div>

If you are very astute you would have noticed that copying and pasting this
block header into the *SHA256* hash forms at the start of this article gives a
different result to the *SHA256* hashes here. This is because these hashes are
implemented upon the pre-image as a hexadecimal number, whereas the hashes
in the first section were implemented for a pre-image expressed in bytes. You
can see the difference in the following form by ticking and unticking the
*pre-image is hex* checkbox and observing how the resulting hash changes:

<div class="form-container" id="form10">
    <input type="checkbox" id="inputCheckbox10" checked>
    <label for="inputCheckbox10">pre-image is hex</label>
    <br><br>
    <label for="inputMessage10" class="for-textbox">pre-image</label><br>
    <textarea id="inputMessage10">0100000000000000000000000000000000000000000000000000000000000000000000003ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a29ab5f49ffff001d1dac2b7c</textarea>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="hash10Results" class="codeblock">pre-image -> SHA256 -> <span class="aligner">                </span><span id="sha256Output10"></span>
pre-image -> SHA256 (little endian) -> <span class="aligner"></span><span id="sha256OutputLE10"></span></div>
    </div>
</div>

That covers most of the nitty-gritty detail regarding the process of hashing a
bitcoin block.

The final thing to discuss is the luck involved in mining. As you may have
guessed, each bitcoin block will contain different data to all the blocks that
have come before it. No other block will have the same transactions, the same
timestamp, the same previous block hash, etc, as the current block. This means
that miners will need to try lots of nonce values in order to mine a block - i.e.
they cannot simply guess the nonce value straight away. The more digits that
must be matched, the more hashing attempts that must be made on average. In fact
the average number of hashing attempts needed to match a hex digit with a hash
can be calculated using the following expression:

<div class="horizontal-center">
<pre>
average attempts = (16<sup>number of hex digits</sup>) / 2
</pre>
</div>

I have created a difficulty calculator so you can see the average number of
hashes that must be made for a given difficulty:

<div class="form-container annex" id="form11">
    <label for="difficulty11" class="for-select">difficulty</label><br>
    <select id="difficulty11"></select>
    <div class="codeblock-container auto-wrap-on-mobile">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="difficulty11Calculation" class="codeblock"></div>
    </div>
</div>

Of course, a miner may be lucky or unlucky. You will have noticed this when you
tried mining using the [final form](#form3) of the *cryptographic hashing*
section - sometimes you find a valid nonce in many fewer attempts than the
average, and sometimes in many more. The process is random, just like trying to
shake a 6 with a dice.

Interestingly, if 9 or more characters must be matched, then the nonce alone is
not large enough for the average number of attempts that must be made. Matching 9
characters will require on average 34,359,738,368 double-hash attempts, however
the nonce field is only 4 bytes long and so has a maximum value of 4,294,967,295.
What is a miner to do if it reaches 4,294,967,295 attempts and a solution has
still not been found? One option is to increment the timestamp field in the
block by 1 second and begin mining again with a nonce of 0. But what if the
miners are so fast that they can hash at more than 4,294,967,295 hashes per
second? In that case they can change some redundant data in the first transaction
of the block they are currently mining and reset the nonce to 0.
