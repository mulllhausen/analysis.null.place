title: how does bitcoin mining work?
slug: how-does-bitcoin-mining-work
date: 2017-11-28 
category: cryptocurrencies
tags: bitcoin, mining, proof-of-work
status: draft
stylesheets: btc.css
scripts: sjcl.min.js,btc-mining.js
summary: An interactive walkthrough of bitcoin mining. No prior knowledge is necessary.

This article is for people who want to understand the inner workings of bitcoin
mining. I have made it interactive so that you can simulate the mining algorithms
for yourself and get a feel for how mining really works. While the concepts here
are not simple, they should be easily accessible to an interested layperson. And
I hope the interacivity will make an otherwise dry subject fun.

## cryptographic hashing

To understand bitcoin mining, it is first necessary to understand what
cryptographic hashing is and how it works. Rather than bore you with definitions
at the start, lets just dive in and give it a go. Click the *SHA256* button
a few times and then try typing different things in the *pre-image* field:
<div class="form-container" id="form0">
    <div class="left">
        <label for="inputMessage0" class="for-textbox">pre-image</label><br>
        <input id="inputMessage0" type="text" value="hello world!">
    </div>
    <div class="left">
        <span class="line-spacer hidden-phone"></span>
        <button id="btnRunHash0">SHA256</button>
    </div>
    <div class="left">
        <span class="line-spacer"></span>
        <span class="line-spacer hidden-phone"></span>
        <span id="hash0Duration"></span>
    </div>
    <div class="codeblock-container" style="display:none;">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="true">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true" style="display:none;"></i>
                <i class="fa fa-arrows-h" aria-hidden="true"></i>
            </button>
        </div><br>
        <div id="hash0Results" class="codeblock"></div>
    </div>
</div>

*SHA256* stands for *Secure Hash Algorithm (256 bits)*. There are many different
hashing algorithms - *SHA128*, *SHA512*, *MD5*, *RIPEMD128*, *RIPEMD160*, etc.
The differences between these hashing alporithms are not important for the sake
of this article - all that is important is to recognise that *SHA256* is merely
one of many hashing algorithms - the one that is used in bitcoin mining (more on
that soon). The output of a cryptographic hash is actually a number, however
that may not have been obvious when you ran the *SHA256* hash above, since that
number is written in hexadecimal format - i.e. base 16. To explain what that
means, here are some hexadecimal values side by side with their decimal
equivalent values:

<div class="horizontal-center">
<pre>
hex 0 = dec 0
hex 1 = dec 1
hex 2 = dec 2
hex 3 = dec 3
hex 4 = dec 4
hex 5 = dec 5
hex 6 = dec 6
hex 7 = dec 7
hex 8 = dec 8
hex 9 = dec 9
hex a = dec 10
hex b = dec 11
hex c = dec 12
hex d = dec 13
hex e = dec 14
hex f = dec 15
</pre>
<pre>
hex 10 = dec 16
hex 11 = dec 17
hex 12 = dec 18
hex 13 = dec 19
hex 14 = dec 20
hex 15 = dec 21
hex 16 = dec 22
hex 17 = dec 23
hex 18 = dec 24
hex 19 = dec 25
hex 1a = dec 26
hex 1b = dec 27
hex 1c = dec 28
hex 1d = dec 29
hex 1e = dec 30
hex 1f = dec 31
</pre>
</div>

Don't worry, you won't need to do any hexadecimal conversions in this article.
All you need to remember here is that hexadecimal digits go from `0` to `9` to
`a` to `f`.

OK, so now that you have tried cryptographic hashing, and you know about
hexadecimal format, lets have a look at the formal definition of cryptographic
hashing:

<blockquote>
<p>Cryptographic hashing involves taking a string of characters and transforming
them into another string of characters. We call the initial characters the
<i>pre-image</i> and we call the output the <i>hash</i>.</p>
<p></p>
<p>A hashing algorithm has the following properties relevant to bitcoin mining:</p>
<p></p>
<ol>
    <li>it is deterministic - the same pre-image always results in the same hash</li>
    <li>it is quick to compute the hash value for any given pre-image</li>
    <li>it is impossible to reverse a cryptographic hash and recover a pre-image
    from its hash value, except by trying all possible pre-images</li>
    <li>a small change to a pre-image should change the hash value so extensively
    that the new hash value appears uncorrelated with the old hash value</li>
</ol>
</blockquote>

Lets investigate these properties. Properties 1 and 2 are quite plain to see -
hashing `hello world!` with *SHA256* always gives
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` and takes
less than 4 milliseconds (depending on your computer speed), which is fairly
quick. However it must be noted that performing the hash always takes at least
*some* time, even if it is a very small amount of time. This fact will be
important when we discuss hashing in relation to bitcoin mining later on.

Property 3 explains that hashing is a one-way process. We can easily get from
a pre-image to its hash, but it is impossible to programatically get from a
cryptographic hash back to its pre-image. The process of trying to get from a
hash back to its pre-image is called *inverting* the hash.

<div class="codeblock" style="white-space:pre;">easy:       pre-image -> SHA256 -> hash

impossible: pre-image <- SHA256 <- hash
</div>

If we start with a pre-image and then hash it, then of course we will know what
the pre-image for the resulting hash is - for example, if I give you the hash
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` then you
already know that a corresponding SHA256 pre-image is `hello world!`, since we
already hashed `hello world!` with SHA256 earlier and it gave this result. But
if I give you `ab50638d692c4342675a028fe7c926387fe6fbd677d9417b5a32449b78b0af22`
then you will not be able to find the pre-image which results in this hash - i.e.
you will not be able to invert this hash. Seriously - give it a go:

<div class="form-container" id="form1">
    <input type="checkbox" id="inputCheckbox1" checked>
    <label for="inputCheckbox1">automatically increment pre-image after each hash</label>
    <br><br>
    <div class="left">
        <label for="inputMessage1" class="for-textbox">pre-image</label><br>
        <input id="inputMessage1" type="text" value="a">
    </div>
    <div class="left">
        <span class="line-spacer hidden-phone"></span>
        <button id="btnRunHash1">SHA256</button>
    </div>
    <div class="left">
        <span class="line-spacer hidden-phone"></span>
        <span class="line-spacer hidden-phone"></span>
        <span id="info1" style="display:none;">
            (Average hash rate: <span></span> hashes per second)
        </span>
    </div>
    <div class="codeblock-container">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="codeblock1HashResults" class="codeblock" style="white-space:pre;">? <span class="aligner"></span>-> SHA256 -> <span id="match1" class="individual-digits">ab50638d692c4342675a028fe7c926387fe6fbd677d9417b5a32449b78b0af22</span>
<span id="showResults1" style="display:none;"><span id="preImage1"></span> <span class="aligner"></span>-> SHA256 -> <span id="hash1Result" class="individual-digits"></span>
status: <span id="matchStatus1"></span></span></div>
    </div>
</div>

The difficulty of inverting a *SHA256* hash is due its length being so large!
*SHA256* has 2<sup>256</sup> possible different hash values. That's
115792089237316195423570985008687907853269984665640564039457584007913129639936
different possible hash values. There are approximately that many atoms in the
universe! So don't feel bad for not being able to invert
`ab50638d692c4342675a028fe7c926387fe6fbd677d9417b5a32449b78b0af22` - for all
intents and purposes it cannot be inverted. And that is true even when computers
do the hashing at their maximum speeds. If you click the button below then you
can have your device cycle through all pre-images at the maximum speed possible
on your device:

<div class="form-container" id="form2">
    <input type="checkbox" id="inputCheckbox2" checked disabled>
    <label for="inputCheckbox2">automatically increment pre-image after each hash</label>
    <br><br>
    <div class="left">
        <label for="inputMessage2" class="for-textbox">pre-image</label><br>
        <input id="inputMessage2" type="text" value="a" disabled>
    </div>
    <div class="left">
        <span class="line-spacer hidden-phone"></span>
        <button id="btnRunHash2">Run SHA256 Automatically</button>
    </div>
    <div class="left">
        <span class="line-spacer hidden-phone"></span>
        <span class="line-spacer hidden-phone"></span>
        <span id="info2" style="display:none;">
            (Average hash rate: <span></span> hashes per second)
        </span>
    </div>
    <br><br>
    <div class="codeblock-container">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="codeblock2HashResults" class="codeblock" style="white-space:pre;">? <span class="aligner"></span>-> SHA256 -> <span id="match2" class="individual-digits">ab50638d692c4342675a028fe7c926387fe6fbd677d9417b5a32449b78b0af22</span>
<span id="showResults2" style="display:none;"><span id="preImage2"> </span> <span class="aligner"></span>-> SHA256 -> <span id="hash2Result" class="individual-digits"></span>
status: <span id="matchStatus2"></span></span></div>
    </div>
</div>

<span id="showHowLongForThisDevice" style="display:none;">Using your device's
average hash rate of <span class="hash2Rate"></span> hashes per second, then we
can calculate that it is going to take <span id="howLongForThisDeviceWords"></span>
to try enough combinations to invert this hash and find the solution. That's
<span id="howLongForThisDeviceNumber"></span>.</span>

When it comes hashing, <span class="hash2Rate"></span> hashes per second is
actually not quick at all. Specialized computer chips are built to run billions
of hashes per second. At the time of writing (March 2018) the total global
SHA256 hashpower is 25,000,000,000,000,000,000 hashes per second, or 25 million
million million hashes per second, but even at this rate it would take 146
million million million million million million million million years to try all
pre-image combinations for SHA256. Thats about a million million million years
quicker than your device, but it doesn't really matter - by the time it comes
around our sun will have long since burned out and humanity will be long gone.

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
investigate how it is used in a technique known as *proof of work*. *Proof of work*,
as the name implies, is a way for one computer to prove to another computer that
it has completed a certain amount of work. The *work* is cryptographic hashing
of a pre-image (incremented after each attempt). Because the output of a
cryptographic hash is simultaneously random and deterministic, then once we have
found the correct pre-image we can submit it as the solution to another computer,
which can verify that it is indeed correct. "But wait", you might be thinking,
"didn't you say that it would take millions of years to try all the pre-images
for SHA256 before we find one which matches the output?" And indeed that is true.
But the beauty of *proof of work* is that we don't have to match the entire
SHA256 output - we need only match a specified number of characters.

Lets give it a go. Click the *Mine with SHA256* button and once you find the
solution try changing the difficulty:

<div class="form-container" id="form3">
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
        <input id="inputMessage3" type="text" value="a" disabled>
    </div>
    <div class="left">
        <span class="line-spacer hidden-phone"></span>
        <button id="btnRunHash3">Mine with SHA256</button>
    </div>
    <div class="left">
        <span id="info3" style="display:none;">
            (<span></span>)
        </span>
    </div>
    <br><br>
    <div class="codeblock-container">
        <div class="button-background">
            <button class="wrap-nowrap" wrapped="false">
                <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
                <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
            </button>
        </div><br>
        <div id="codeblock3HashResults" class="codeblock" style="white-space:pre;">SHA256 target: <span class="aligner"></span><span id="match3" class="individual-digits">0000000000000000000000000000000000000000000000000000000000000000</span>
<span id="showResults3" style="display:none;"><span id="preImage3"> </span> -> SHA256 -> <span class="aligner"></span><span id="hash3Result" class="individual-digits"></span>
status: <span id="matchStatus3"></span>
<span id="mining3Statistics"></span></span></div>
    </div>
</div>


## bitcoin mining

Now that you know all about hashing, we can apply this knowledge to bitcoin
mining.

> Bitcoin mining involves computers competing to find part of the pre-image of
the hash of the next block in the bitcoin blockchain. The winner receives
bitcoins as a reward.

That sentence contains a couple of new concepts, and once you understand them
then it will make perfect sense:

- a bitcoin block
- the bitcoin blockchain

When someone sends some bitcoins to someone else, they begin by opening their
bitcoin wallet (which is a program, app or website running on their computer or
phone), and then type in the recipient and the amount of bitcoin they want to
send to them. The bitcoin wallet uses this information to construct a
transaction. Here is an example bitcoin transaction:

<div class="media-container"><div class="media-positioner">
    <div class="btc-transaction-full">
        01000000010000000000000000000000000000000000000000000000000000000000000000ffffffff0704ffff001d0102ffffffff0100f2052a01000000434104d46c4968bde02899d2aa0963367c7a6ce34eec332b32e42e5f3407e052d64ac625da6f0718e7b302140434bd725706957c092db53805b821a85b23a7ac61725bac00000000
    </div>
    <div class="media-caption">example bitcoin transaction</div>
</div></div>

For the purposes of this article the details of this transaction are not important,
but if you are curious you can view all of this transaction's information [here](https://blockchain.info/tx/b1fea52486ce0c62bb442b530a3f0132b826c74e473d1f2c220bfa78111c5082). However the only thing you really need to
understand at this point is that a bitcoin transaction is just a string of characters.

Once the wallet software has created the transaction it sends it out over the
internet to all the other bitcoin nodes it can find (a bitcoin node is just a
computer or phone running the bitcoin software). You might have expected the
transaction to only be sent to the person who is receiving the bitcoins, but
that is not the case. Infact that person does not even have to have their wallet
software running for the transaction to be processed.

Some of the bitcoin nodes which receive the transaction are bitcoin miners (more
on these later). These miners gather the transactions they receive and put them
into a block:

<div class="media-container"><div class="media-positioner">
    <table class="btc-block-mini">
        <tr><td class="btc-block-header-mini">header</td></tr>
        <tr><td class="btc-transaction-mini">transaction 1</td></tr>
        <tr><td class="btc-transaction-mini">transaction 2</td></tr>
        <tr><td class="btc-transaction-mini">transaction 3</td></tr>
    </table>
    <div class="media-caption">a bitcoin block</div>
</div></div>

A bitcoin block consists of a header, followed by a list of transactions. The
block shown here only has 3 transactions, but blocks containing thousands of
transactions are most common.

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

The *version* field is just a number indicating the current version of the
bitcoin protocol.

The *previous block hash* field is where the *blockchain* concept comes in - the
current block references the previous block so that blocks build upon each other
over time.

<div class="form-container">
    <object id="blockchainSVG" data="/img/bitcoin-blockchain.svg" type="image/svg+xml"></object>
</div>
<div class="media-caption">the bitcoin blockchain</div>

The *previous block hash* is found by doing a *SHA265* hash twice in succession
on the previous block header. As we saw in the hashing section at the start,
that is a very quick thing for a computer to do.

The *merkle root* is loosely defined as a hash of all transactions contained
within the block. The transaction data is the pre-image and the *merkle root* is
the hash. The transactions in a block will always have the same merkle root,
because hashing is deterministic, and the merkle root is only 32 bytes, whereas
all of the transactions can come to 1MB, so it is more efficient.


- timestamp: the current date-time of the block
- difficulty: this is a representation of the 


The bitcoin blockchain is basically a chain of blocks. Each block references the
previous block, right back to the very first block created by Satoshi Nakamoto on
4 Jan 2009.

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
            timestamp <span id="timestamp4Explanation"></span><br>
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
<ul id="blockHeader4Error" class="error"></ul>
<button id="btnRunHash4">mine (with SHA256)</button>
<div class="codeblock-container">
    <div class="button-background">
        <button class="wrap-nowrap" wrapped="false">
            <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
            <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
        </button>
    </div><br>
<div id="block4MiningResults" class="codeblock" style="white-space:pre;">target: <span class="aligner">    </span><span id="target4" class="individual-digits"></span>
block hash: <span class="aligner"></span><span id="blockhash4" class="individual-digits"></span>
status: <span class="aligner">    </span><span id="mineStatus4"></span>
</div>
</div>
</div>

## annex

This section goes into all the detail skipped above. It is really just intended
for those (such as myself) who like to leave no stone unturned.

- version int to version in hex
- merkle root from transaction hash
- timestamp to unixtime
- bits to target
- nonce to hex
- block to hex

