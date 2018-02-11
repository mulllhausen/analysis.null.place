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
are not simple, it should be easily accessible to an interested layperson. And I
hope the interacivity will make an otherwise dry subject fun.

<div id="infoPanel" style="position:fixed;top:0;right:0;height:300px;width:200px;">
</div>

## hashing

To understand bitcoin mining, it is first necessary to understand what
cryptographic hashing is and how it works. Rather than bore you with definitions
at the start, lets just dive in and give it a go. Click the *SHA256* button
a few times and then try typing different things in the *pre-image* field:
<div class="form-container">
    <label for="inputMessage0">pre-image</label><br>
    <input id="inputMessage0" type="text" value="hello world!">
    <button id="btnRunHash0">SHA256</button>
    &nbsp;&nbsp;<span id="hash0Duration"></span>
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
of this article, all that is important is to recognise that *SHA256* is merely
one of many hashing algorithms - the one that is used in bitcoin mining
(more on that later). The output of a hash is a numeric value - commonly written
in hexadecimal format - i.e. base 16. Here are some hexadecimal values side by
side with their decimal equivalent values:

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
All you need to remember is that hexadecimal digits go from `0` to `9` then `a`
to `f`.

OK, so now that you have tried hashing, and you know about hexadecimal notation,
lets have a look at the formal definition of hashing:
> Hashing involves taking a string of characters and transforming them into
> another string of characters. We call the initial characters the *pre-image*
> and we call the output the *hash*.<br><br>
> A hashing algorithm has the following properties relevant to bitcoin mining:
><br><br>
> 1. it is deterministic - the same pre-image always results in the same hash<br>
> 2. it is quick to compute the hash value for any given pre-image<br>
> 3. it is infeasible to generate a pre-image from its hash value except by
> trying all possible pre-images<br>
> 4. a small change to a pre-image should change the hash value so extensively
> that the new hash value appears uncorrelated with the old hash value<br>

Lets investigate these properties. Properties 1 and 2 are quite plain to see -
hashing `hello world!` with *SHA256* always gives
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` and takes
less than 4 milliseconds (depending on your computer speed), which is fairly
quick. However it must be noted that performing the hash always takes at least
*some* time, even if it is a very small amount of time. This fact will be
important when we discuss hashing in relation to bitcoin mining later on.

Property 3 explains that hashing is a one-way process. We can easily get from
a pre-image to its hash, but it is impossible to programatically get from a hash
back to its pre-image. If you start with a pre-image and then hash it, then of
course you will know what the pre-image is - for example, if I give you the hash
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` then you now
know that the corresponding pre-image is `hello world!`, since we already hashed
`hello world!` earlier. But if I give you
`0b0f445fe487a967f9d103287057030fa248ff5ad38c55a49383379baa493e58` then you will
not be able to find the pre-image which results in this hash. Seriously - give
it a go - scroll back up and try a few values to see if you can produce a hash
value of `0b0f445fe487a967f9d103287057030fa248ff5ad38c55a49383379baa493e58`.

The difficulty of guessing the pre-image for a given hash is that the resulting
hash values for *SHA256* are so large! *SHA256* has 2<sup>256</sup> possible
different hash values. That's 115792089237316195423570985008687907853269984665640564039457584007913129639936
different possible hash values - there are approximately that many atoms in the
universe! So don't feel bad for not guessing the correct pre-image for 
`0b0f445fe487a967f9d103287057030fa248ff5ad38c55a49383379baa493e58` - for all
intents and purposes it is unguessable. And its also unguessable for computers
too. Even though some computers can do billions of hashes per second, that is
still not good enough to run through all the combinations of pre-images to find
a matching hash within our lifetimes. Infact it would take all computers on this
planet millions of years to try all possible pre-images.

"Ok", you might think to yourself, "but maybe I don't need to try all the
possible combinations to produce the hash I'm after - maybe I can just skip
ahead ... If the pre-image I start with does not give a hash that is close to
what I want, then I will just choose a pre-image further along that gives a hash
closer to what I want, and then make minor adjustments until I zero in on the
hash." But no such luck - property 4 tells us that hashes are both deterministic
and random. A pre-image will always hash to the same value, but that value is
random, so there can be no process of zeroing in. Trying a pre-image that is
"further along" is no better than trying any other pre-image. They all completely
modify the resulting hash.

## bitcoin mining

Now that you know all about hashing, we can apply this knowledge to bitcoin
mining.

> Bitcoin mining involves computers competing to find the pre-image of the hash
of the next block in the bitcoin blockchain. The winner receives bitcoins as a
reward.

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
software running for the transaction to complete.

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

<div class="form-container">
<div class="media-container"><div class="media-positioner">
    <table class="btc-header-definition">
        <tr><td class="btc-header-field">
            version<br>
            <input id="version1" type="text" class="data-value" size="2" value="1">
        </td></tr>
        <tr><td class="btc-header-field">
            previous block hash<br>
            <input id="prevHash1" type="text" class="data-value" size="64" value="0000000000000000000000000000000000000000000000000000000000000000">
        </td></tr>
        <tr><td class="btc-header-field">
            merkle root<br>
            <input id="merkleRoot1" type="text" class="data-value" size="64" value="4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b">
        </td></tr>
        <tr><td class="btc-header-field">
            timestamp <span id="timestamp1Explanation"></span><br>
            <input id="timestamp1" type="text" class="data-value" size="24" value="03 Jan 2009 18:15:05 GMT">
        </td></tr>
        <tr><td class="btc-header-field">
            difficulty<br>
            <input id="bits1" type="text" class="data-value" size="8" value="1d00ffff">
        </td></tr>
        <tr><td class="btc-header-field">
            nonce<br>
            <input id="nonce1" type="text" class="data-value" size="10" value="0">
        </td></tr>
    </table>
    <div class="media-caption">the bitcoin block header</div>
</div></div>
<ul id="blockHeader1Error" class="error"></ul>
<button id="btnRunHash1">mine (with SHA256)</button>
<div class="codeblock-container">
    <div class="button-background">
        <button class="wrap-nowrap" wrapped="false">
            <i class="fa fa-level-down fa-rotate-90" aria-hidden="true"></i>
            <i class="fa fa-arrows-h" aria-hidden="true" style="display:none;"></i>
        </button>
    </div><br>
<div id="block1MiningResults" class="codeblock" style="white-space:pre;">target:     <span id="target1" class="individual-digits"></span>
block hash: <span id="blockhash1" class="individual-digits"></span>
status:     <span id="mineStatus1"></span>
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

