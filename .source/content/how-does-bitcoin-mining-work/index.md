title: how does bitcoin mining work?
slug: how-does-bitcoin-mining-work
date: 2017-11-28 
category: cryptocurrencies
tags: bitcoin, mining, proof-of-work
stylesheets: btc.css
scripts: sjcl.min.js,btc-mining.js
summary: An interactive thorough explanation of bitcoin mining. No prior knowledge is necessary.

This article is for people who want to understand the inner workings of bitcoin
mining. I have made it interactive so that you can simulate the mining algorithms
for yourself and get a feel for how mining really works. While the concepts are
not simple, it should be easily accessible to the average person. And the
interacive aspect should make an otherwise dry subject fun.

## hashing

To understand bitcoin mining, it is first necessary to understand what
cryptographic hashing is and how it works. Rather than bore you with definitions
at the start, lets just dive in and give it a go. Click the *SHA256* button
a few times and then try typing different things in the *message* field:
<br>
<br>
message:<br>
<input id="inputMessage0" type="text" value="hello world!">
<button class="btn" id="btnRunHash0">SHA256</button>
&nbsp;&nbsp;<span id="hash0Duration"></span>
<div id="hash0Results" class="codeblock" style="display:none;"></div>
<br>
*SHA256* stands for *Secure Hash Algorithm (256 bits)*. There are many different
hashing algorithms - *SHA128*, *SHA512*, *MD5*, *RIPEMD128*, *RIPEMD160*, etc.
The differences between these hashing alporithms are not important for the sake
of this article, all that is important is to recognise that *SHA256* is merely
one of many hashing algorithms - the one that is used in bitcoin mining
(more on that later). The output of a hash is a numeric value - commonly written
in hexadecimal format - i.e. base 16. Here are some hexadecimal values side by
side with their decimal equivalent values:

    hex 0  = dec 0       hex 10  = dec 16     etc
    hex 1  = dec 1       hex 11  = dec 17
    hex 2  = dec 2       hex 12  = dec 18
    hex 3  = dec 3       hex 13  = dec 19
    hex 4  = dec 4       hex 14  = dec 20
    hex 5  = dec 5       hex 15  = dec 21
    hex 6  = dec 6       hex 16  = dec 22
    hex 7  = dec 7       hex 17  = dec 23
    hex 8  = dec 8       hex 18  = dec 24
    hex 9  = dec 9       hex 19  = dec 25
    hex a  = dec 10      hex 1a  = dec 26
    hex b  = dec 11      hex 1b  = dec 27
    hex c  = dec 12      hex 1c  = dec 28
    hex d  = dec 13      hex 1d  = dec 29
    hex e  = dec 14      hex 1e  = dec 30
    hex f  = dec 15      hex 1f  = dec 31

Don't worry, you won't need to do any hexadecimal conversions in this article.
All you need to remember is that the digits go from `0` to `9` then `a` to `f`.

OK, so now that you have tried hashing, and you know about hexadecimal notation,
lets have a look at the formal definition of hashing:
> Hashing involves taking a string of characters and transforming them into
> another string of characters. We call the initial characters the *message*
> and we call the output the *hash*. A hashing algorithm has the following
> properties:<br>
> 1. it is deterministic - the same message always results in the same hash<br>
> 2. it is quick to compute the hash value for any given message<br>
> 3. it is infeasible to generate a message from its hash value except by
> trying all possible messages<br>
> 4. a small change to a message should change the hash value so extensively
> that the new hash value appears uncorrelated with the old hash value<br>
> 5. it is infeasible to find two different messages with the same hash value

Lets investigate these properties. Properties 1 and 2 are quite plain to see -
hashing `hello world!` with *SHA256* always gives
`7509e5bda0c762d2bac7f90d758b5b2263fa01ccbc542ab5e3df163be08e6ca9` and takes
less than 4 milliseconds (depending on your computer speed), which is fairly
quick. However it must be noted that performing the hash always takes at least
*some* time, even if it is a very small amount of time. This fact will be
important when we discuss hashing in relation to bitcoin mining later on.

I can't think of a way of demonstrating property 3 short of investigating a
hashing algorithm in detail, which would be beyond the scope of this simple
article. So we will just have to trust the definition for that one.

However we can verify property 4 with a demonstration. Property 4 is quite a
mouthfull and has some interesting implications which are very relevant to
Bitcoin mining. If property 4 were not true then we would expect to see a
correlation in the hash values as we make changes to the message. For example,
we might expect to see that each digit of the hash increases by the same amount,
or decreases by the same amount, lets think about what it would Basically it is saying that when we make a small changes to the
message then every hex digit in the resulting hash



I think the best way to explain how bitcoin mining works is to jump straight to
the detailed explanation at the start, and then unpack that explanation piece b
piece. If you are new to bitcoin then you will almost certainly not
understand the sentence that follows, however by the end of this article you will
- I promise - and I have included plenty of diagrams and interactive tools to help
you along the way too!

> Bitcoin mining involves computers competing to find the message of the hash
of the next block in the bitcoin blockchain. The winner receives bitcoins as a
reward.

That sentence contains 3 completely new concepts, and once you understand them
then it will make perfect sense:

1. a bitcoin block
2. the bitcoin blockchain
3. a hash and its message

## 1. a bitcoin block

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
    <div class="btc-header-definition">
        <div class="btc-header-field">version</div>
        <div class="btc-header-field">previous block hash</div>
        <div class="btc-header-field">merkle root</div>
        <div class="btc-header-field">timestamp</div>
        <div class="btc-header-field">difficulty</div>
        <div class="btc-header-field">nonce</div>
    </div>
    <div class="media-caption">the bitcoin block header</div>
</div></div>

The remainder of this article is devoted to explaining what each of these fields
is. Section 2 will explain what the previous block hash and section 3 will give
an explanation of 

## 2. the bitcoin blockchain

The bitcoin blockchain is basically a chain of blocks. Each block references the
previous block, right back to the very first block created by Satoshi Nakamoto on
4 Jan 2009.

<image - bitcoin blockchain>

## 3. a hash and its message

A hash can be thought of as a one-way transformation of some text into some other
text. The original text is called the message, and the result is called the hash.
Hashing is done using a cryptographic algorythm carefully designed so that
there is no way to algorythmically get from the hash back to its message. Here
are some examples of messages and their resulting hashes:

    1 blah
    2 blah
    3 blah

The hashing algorythm used by bitcoin is the 256 bit Secure Hash Algorythm (SHA256).
The details of how SHA256 works are not at all important here, infact even most
software developers do not know the inner workings of hashing algorythms. What
is important is to know the features of a hashing algorythm:

1. it is deterministic so the same message always results in the same hash
2. it is quick to compute the hash value for any given message
3. it is infeasible to generate a message from its hash value except by trying all possible messages
4. a small change to a message should change the hash value so extensively that the new hash value appears uncorrelated with the old hash value
5. it is infeasible to find two different messages with the same hash value

<div class="media-container"><div class="media-positioner">
    <div class="btc-header-definition">
        <div class="btc-header-field">
            version<br>
            <input id="version1" type="text" class="data-value" size="2" value="1">
        </div>
        <div class="btc-header-field">
            previous block hash<br>
            <input id="prevHash1" type="text" class="data-value" size="64" value="0000000000000000000000000000000000000000000000000000000000000000">
        </div>
        <div class="btc-header-field">
            merkle root<br>
            <input id="merkleRoot1" type="text" class="data-value" size="64" value="4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b">
        </div>
        <div class="btc-header-field">
            timestamp <span id="timestamp1Explanation"></span><br>
            <input id="timestamp1" type="text" class="data-value" size="24" value="03 Jan 2009 18:15:05 GMT">
        </div>
        <div class="btc-header-field">
            difficulty<br>
            <input id="bits1" type="text" class="data-value" size="8" value="1d00ffff">
        </div>
        <div class="btc-header-field">
            nonce<br>
            <input id="nonce1" type="text" class="data-value" size="10" value="2083236892">
        </div>
    </div>
    <div class="media-caption">the bitcoin block header</div>
</div></div>
<ul id="blockHeader1Error" class="error"></ul>

<button class="btn" id="btnRunHash1">mine</button>

<div id="block1MiningResults" class="codeblock">target:     <span id="target1" class="individual-digits"></span>
block hash: <span id="blockhash1" class="individual-digits"></span>
status:     <span id="mineStatus1"></span>
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

