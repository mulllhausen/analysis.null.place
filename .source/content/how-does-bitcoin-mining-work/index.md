title: how does bitcoin mining work?
slug: how-does-bitcoin-mining-work
date: 2017-11-28 
category: cryptocurrencies
tags: bitcoin, mining, proof-of-work
stylesheet: btc.css
summary: An interactive thorough explanation of bitcoin mining. No prior knowledge is necessary.

This article is for people who want to understand the inner workings of bitcoin
and other similar cryptocurrencies. If you are just looking to buy or mine some
bitcoins then this article is massive overkill and I would not recommend reading
it. Just like you do not need to know how the HTTP protocol works to do a Google
search, you also do not need to know how bitcoin works in order to use it.

## hashing

To understand bitcoin mining, it is first necessary to understand how
cryptographic hashing works. This section is certainly the most difficult to
understand, however I have made it interactive, which will make the learning
process easier and fun. Lets start with the definition of a hash, and then we
can walk through and test each of the parts of that definition using some
interactive tools to see if they make sense.

> Hashing involves taking a string of characters and transforming them into
> another string of characters. We call the initial characters the <i>pre-image</i>
> and we call the output the <i>hash</i>. The algorythm has the following properties:<br>
> 1. it is deterministic so the same message always results in the same hash<br>
> 2. it is quick to compute the hash value for any given message<br>
> 3. it is infeasible to generate a message from its hash value except by trying all possible messages<br>
> 4. a small change to a message should change the hash value so extensively that the new hash value appears uncorrelated with the old hash value<br>
> 5. it is infeasible to find two different messages with the same hash value




I think the best way to explain how bitcoin mining works is to jump straight to
the detailed explanation at the start, and then unpack that explanation piece b
piece. If you are new to bitcoin then you will almost certainly not
understand the sentence that follows, however by the end of this article you will
- I promise - and I have included plenty of diagrams and interactive tools to help
you along the way too!

> Bitcoin mining involves computers competing to find the pre-image of the hash
of the next block in the bitcoin blockchain. The winner receives bitcoins as a
reward.

That sentence contains 3 completely new concepts, and once you understand them
then it will make perfect sense:

1. a bitcoin block
2. the bitcoin blockchain
3. a hash and its pre-image

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

## 3. a hash and its pre-image

A hash can be thought of as a one-way transformation of some text into some other
text. The original text is called the pre-image, and the result is called the hash.
Hashing is done using a cryptographic algorythm carefully designed so that
there is no way to algorythmically get from the hash back to its pre-image. Here
are some examples of pre-images and their resulting hashes:

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
            <span class="data-value">0100</span>
        </div>
        <div class="btc-header-field">
            previous block hash<br>
            <span class="data-value">0000000000000000000000000000000000000000000000000000000000000000000000</span>
        </div>
        <div class="btc-header-field">
            merkle root<br>
            <span class="data-value">a718a42b7ce7fc5d85e015a8199fe30cab6d4d59f6f6d9923c52620ec636a6ca</span>
        </div>
        <div class="btc-header-field">
            timestamp<br>
            <span class="data-value">1513019329</span>
        </div>
        <div class="btc-header-field">
            difficulty<br>
            <span class="data-value">402698477</span>
        </div>
        <div class="btc-header-field">
            nonce<br>
            <input id="input_pre_image1" type="text" value="0">
        </div>
    </div>
    <div class="media-caption">the bitcoin block header</div>
</div></div>

<button class="btn" id="btn_run_hash1">mine</button>

<div class="codeblock">target:     <span class="individual-digits">0123456789012345678901234567890123456789012345678901234567890000</span>
block hash: <span id="hash_output1" class="individual-digits">22a2fa7d04248931a8853a7714b86546610afd01b2b1841890e979ba7ba6bcae</span>
status: <span id="mine_status1">fail</span>
</div>




<input id="input_pre_image0" type="text">
<button class="btn" id="btn_run_hash0">run hash</button>
><span id="span_hash0">hash output</span>


## annex

This section goes into all the detail skipped above. It is really just intended
for those (such as myself) who like to leave no stone unturned.

<script>

window.onload = function() {
    addEvent(document.getElementById('btn_run_hash0'), 'click', function() {
        var pre_image = document.getElementById('input_pre_image0').value;
        var bitArray = sjcl.hash.sha256.hash(pre_image);
        var sha256hash = sjcl.codec.hex.fromBits(bitArray);
        document.getElementById('span_hash0').innerText = sha256hash;
    });
    addEvent(document.getElementById('btn_run_hash1'), 'click', function() {
        var nonce = document.getElementById('input_pre_image1').value;
        var pre_image = '123' + nonce;
        var bitArray = sjcl.hash.sha256.hash(pre_image);
        var sha256hash = sjcl.codec.hex.fromBits(bitArray);
        document.getElementById('hash_output1').innerText = sha256hash;
        border_the_digits('#hash_output1');
        // increment the nonce
        document.getElementById('input_pre_image1').value = parseInt(nonce) + 1;
    });
    border_the_digits('.individual-digits');
};
function border_the_digits(cssSelectors) {
    var subject_els = document.querySelectorAll(cssSelectors);
    for (var i = 0; i < subject_els.length; i++) {
        var text = subject_els[i].innerText; // get
        var new_text = '';
        for (var letter_i = 0; letter_i < text.length; letter_i++) {
            new_text += '<span class="individual-digit">' + text[letter_i] + '</span>';
        }
        subject_els[i].innerHTML = new_text; // set
    }
}
function mine() {
    return { blockhash: 123, status: 'pass' };
}
</script>

<script src="/scripts/sjcl.min.js"></script>
