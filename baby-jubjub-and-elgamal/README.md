The goal of this circuit is to perform **Exponential Elgamal** encryption in a Baby Jubjub curve.

- Baby Jubjub is a slightly modified `bn254` curve. Therefore, the world or ptau or whatever should still be considered in `bn254`, and Baby Jubjub is used for the encryption only as it is friendlier for zk-SNARKs.
- Exponential Elgamal is an additively homomorphic encryption scheme. that means the resulting ciphertext can be added together without needing to be deciphered first. It can come in 2 flavors: under large prime field (integers) or under Elliptic Curve (points).

## Exponential Elgamal

Beforehands, lets clear the ground:

- POINT = a coordinate of 2 integers, `x` and `y`
- INT = an integer...
- uppercase letter variable = POINT
- lowercase letter variable = INT
- a point `P` consists of these integers: `P_x` and `P_y`

- Scalar Multiplication = `INT * POINT`
- Point Addition = `POINT + POINT`

Given that `g` is a generator/base (INT) in integer world and `G` is also a generator/base (POINT) in EC world:

- Multiplication in integers --> Point Addition in EC (e.g., `g^a * g^b = g^(a+b)` --> `a . G + b . G = (a+b) . G`)
- Exponentiation in integers --> Scalar Multiplication in EC (e.g., `g^a --> a . G`)

Now setup some variables for our world:

- `G` = a generator or base point in EC (POINT)
- `x` = private key (INT)
- `H` = public key defined as `H = x . G` (POINT)

And for every encryption:

- `r` = random nonce (INT)
- `m` = message/plaintext (INT)

Now calculate POINTS for resulting ciphertext:

- `C1` = `r . G` (POINT)
- `C2` = (`r . H`) + (`m . G`) (POINT) (In default ElGamal, `m . G` is replaced to be directly `m`)
  Resulting ciphertext is 2 points: `C1` and `C2`

To decrypt:

- `HELPER` = `x . C1` = `x . r . G` = `r . x . G` = `r . H`
- `RESULT` = `C2` - `HELPER` = `m . G`

then bruteforce the `RESULT` to obtain `m`

## Circuit Implementation

We will need the help of Baby Jubjub curve as it is friendly for zk-SNARK. To do that, we will use some external circuits from `circomlib`:

- `BabyAdd()` circuit from `babyjub.circom` to perform point addition
- `EscalarMulAny()` circuit from `escalarmulany.circom` scalar multiplication

Usage:

1. `EscalarMulAny()`

The scalar provided is an array of bits, so convert them first with `Num2Bits()` circuit from `bitify.circom`:

```circom
component n2b = Num2Bits(253);
n2b.in <== scalar;

component mul = EscalarMulAny(253);
for (var i = 0; i < 253; i++) {
  mul.e[i] <== n2b.out[i];
}
mul.p[0] <== point[0];
mul.p[1] <== point[1];

out[0] <== mul.out[0];
out[1] <== mul.out[1];
```

Here we use 253 because that's the bit length used by Baby Jubjub

2. `BabyAdd()`
   This one is pretty straightforward

```circom
component adder = BabyAdd();
adder.x1 <== p1[0];
adder.y1 <== p1[1];
adder.x2 <== p2[0];
adder.y2 <== p2[1];

out[0] <== adder.xout;
out[1] <== adder.yout;
```

## Scripts

Below are scripts used to help this particular circuit. Most part of the scripts are LLM-generated, despite my hatred towards AI

1. `keygen.js`
   This script is used to generate a random private key and derive a public key from the private key and generator. The generator can be (randomly?) obtained from `babyJub.Generator` but can also defined in an array. For user-defined generator, use `babyJub.F.e()` to convert the BigInt (or integer whatever) into the format they internally use.

2. `verify_res.js`
   This is initially used to verify if the **ciphertext generated from the circuit is valid**. In other words, it tries to encrypt the same message with same nonce and setup (i.e., generator, public key, and private key) with the same curve (i.e., Baby Jubjub), and compare the resulting ciphertext with the ciphertext generated from the circuit. It also decrypts the generated ciphertext too to ensure that the script is indeed a valid implementation of Exponential ElGamal over EC.

3. `decrypt.js`
   This script is derived from `verify_res.js` with the single purpose of decrypting given ciphertext supplied as `C1` and `C2`. Instead of bruteforcing (which what would normally happen in actual apps), the plaintext/message is supplied as well and is checked if they match via the exponentiation.

4. `additively-homomorphic.js`
   Similar to `decrypt.js` but instead of a ciphertext, it operates on **operated ciphertext**, which would be addition. Supply ciphertexts in C1-C4 and they will be added before being decrypted with the same procedure.

## NOTES

- In circuit, G should be hardcoded. For this purpose, we will use these:
  `G_x` = `5299619240641551281634865583518297030282874472190772894086521144482721001553`
  `G_y` = `16950150798460657717958625567821834550301663161624707787222815936182638968203`

- Since point substraction doesnt exist, use this to help (at least this works in Baby Jubjub. may not work on other curves)
  `C2 - HELPER` = `BabyAdd(C2, Negated_HELPER)`
  where if `HELPER` = (`H_x`, `H_y`) then `Negated_HELPER` = (`-H_x`, `H_y`)
  handle the negativying appropriately: `neg_H_x <== 0 - H_x`

- Point addition formulas are different with each curve, hence why we need specific circuit for it.

- Since in your thesis the `m` is either `0` or `1`, consider using some cheaper algebra trick instead of using `EscalarMultAny()` (its overkill)

- To generate keys, we will use a helper JS script `keygen.js` that uses `circomlibjs` package. Example:

```
--- PRIVATE KEY (SCALAR) ---
16835259638311923441363769553950755040277659427175462796128849463313243488483

--- PUBLIC KEY (POINT) ---
"pub_key_x": "7502130318837394864910222174307445601138352885532872217912457744703713082281",
"pub_key_y": "9809479265627297265970877892295421238538210118535207163871362848509423237315",
```
