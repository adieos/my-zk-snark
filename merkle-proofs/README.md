The goal of this circuit is **proving set membership without revealing identity**. That means, the prover is part of a set but they dont reveal which member they are. In implementation, the set is public and is represented by a **merkle tree**, a tree where each node is a hash of its children combined. Here, it can be configured to reveal the identity of each leaf or not. The leaves will represent the hash of each member's secret.

Since we will be using hashes, we will need `poseidon` hash from `circomlib` and will be using `bn254` curve. We will also use `switcher` circuit since at any given time, we dont know if we are at the right or left side of the tree

# At the time of writing this, this particular folder is postponed as it looks easier to implement than the new folder that is going to be prioritized more: baby-jubjub-and-elgamal.
