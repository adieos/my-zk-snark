this is used to prove that the prover knows the pre-image of a certain public poseidon hash. That is, for a public `y = PoseidonHash(x)`, prover knows the value of `x`.

To use poseidon hash (zk-friendly hash algorithm), we need `circomlib`

```bash
$ npm install circomlib
```

secret and salt must be a number and should be under `p`, the modulo. internally yes it will be reduced by the modulo `p` but in applications, the JS or whatever must ensure that the input is less than `p`. Otherwise, its a security flaw as these potentials may rise:

1. double-spending: tricking system into thinking 2 identities are different (e.g. ID `5` and ID `p+5` both are valid in the circuit, but system may think theyre different)
2. breaks range proof: (try to proof `x < 100`, provides a ridiculously high number `p + 5`. since its internally converted to 5, the proof is valid. kinda like integer overflow)

salt is also public, maybe to give context

Futhermore, use `bn254` curve (especially during the ptau initialization) as that is the curve used by circomlib.

The rest should be similar to the others.
