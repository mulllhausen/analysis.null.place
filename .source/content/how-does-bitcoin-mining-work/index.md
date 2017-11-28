title: how does bitcoin mining work?
slug: how-does-bitcoin-mining-work
date: 2017-11-28 
category: cryptocurrencies
tags: bitcoin, mining, proof-of-work
summary: An interactive thorough explanation of bitcoin mining. No prior knowledge is necessary.

This article is for people who want to understand the inner workings of bitcoin
and other similar cryptocurrencies. If you are just looking to buy or mine some
bitcoin then this article is massive overkill and I would not recommend reading
it. Just like you do not need to know how the HTTP protocol works to perform a
google search, you also do not need to know how bitcoin works in order to use it.

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

1. A bitcoin block
2. The bitcoin blockchain
3. A hash and its pre-image

## A bitcoin block

When someone sends bitcoin to someone else, they type in the recipient and the
amnount of bitcoin they want to send into their wallet software, and the wallet
software generates a transaction. It then sends that transaction out over the
internet to all the other bitcoin participants it can find. Transactions are the
only way that bitcoins are moved between owners. I won't get into the details of
all the data which makes up a transaction here, for the purposes of this article
all that you need to know is that transactions are basically chunks of text
containing instructions of how to move bitcoins between various people.

<image - 1 bitcoin transaction>

There are many people using bitcoin and so there are many bitcoin transactions
flying around on the internet at any given time. This is where bitcoin miners
come in - mining computers listen for bitcoin transactions and store them so that
they can access them quickly at will. They then create what is known as a bitcoin
block. A block is just a whole load of transactions grouped together, one after
another. As miners receive more transactions they include these into the block.

<image - 1 bitcoin block>

## The bitcoin blockchain

The bitcoin blockchain is basically a chain of blocks. Each block references the
previous block, right back to the very first block created by Satoshi Nakamoto on
4 Jan 2009.

<image - bitcoin blockchain>

## A hash and its pre-image

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
