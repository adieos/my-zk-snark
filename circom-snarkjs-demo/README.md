Steps by steps:

## Circom (Circuit Compiler)

1. Write circuit and save with `.circom` extension (here stored in `circuits` folder)
2. Compile with `circom <file.circuit> --r1cs --wasm --sym --c`

- `--rics` = generates R1CS of the circuit in binary
- `--wasm` = generates directory containing the WASM code and files needed to generate witness
- `--sym` = generates symbols file to debug ig and printing constraint system in annotated mode
- `--c` generates files needed to generate witness but in C++. however this must be compiled and may not be cross-compatible. try using `--no_asm` too
- Optionally, one can add `-o` flag to specify the dir of files created

3. There are 2 ways to generate witness, with one must create `input.json` file first as the inputs:

- via JS:
  a. go inside the js directory created and run `node generate_witness.js <WASM file> <JSON input file> <WITNESS output file, in .wtns format>`
- via C++:
  a. go inside the cpp directory and run `make`. This will create compiled binary (e.g, `the-binary`)
  b. execute that binary: `./the-binary <JSON input file> <WITNESS output file in .wtns format>`

Next is to create trusted setup and verify with snarkjs. Since this part is gonna be very long, they will be in a dedicated section

## snarkjs

We will be using snarkjs with **Groth16** as the engine. It requires a trusted setup **per circuit**, and will be divided into 2 parts:

- Powers of Tau, independent of the circuit
- Phase 2, dependent of the circuit

#### Powers of Tau

This is a ceremony to create a set of points from randomness, and is almost always done with contribution

1. First we create "Powers of Tau" ceremony

```bash
snarkjs powersoftau new bn128 12 pot12_0000.ptau -v
```

- `bn128`: the elliptic curve used, supported by Ethereum
- `12`: defines the power of two and serves as limit on max number of constraints the circuit can have (in this case, 2^12)
- `pot12_0000.ptau` the resulting file. Initially, this would essentially be an "empty canvas" of ptau ceremony

2. Then, we contribute. This part can be done indefinitely, the more the merrier as it significantly reduces the risk of toxic waste problem (since only 1 trusted person is needed to prevent leakage)

```bash
snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="lorem ipsum" -v
```

with `pot12_0000.ptau` is the "input" and `pot12_0001.ptau` is the "output" or the new, contributed ptau file. You will be prompted a keyboard input to feed the randomness

> There exists a project called **Perpetual Powers of Tau** that basically does this whole thing, indefinitely, since 2019. ANYONE can contribute and ANYONE can use the resulting ptau file(s) at ANY given time, saving time and increases security for free. neat!

#### Phase 2

Now since Groth16 is circuit-specific, we need to bind the ptau with our circuit.

0. Prepare the ptau file to be "phase2-friendly". This uses fast fourier transform (FFT) and can be quite expensive. afaik Perpetual Projects of Tau already does this too so thats very cool

```bash
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v
```

with `pot12_00001.ptau` be the "raw" ptau file and `pot12_final.ptau` be the "output" ptau file that is ready to be linked to a circuit

1. Now we generate a zkey file which contains the `Sp` and `Sv`, keys or security parameters to create proof and verify proof respectfully.

```bash
snarkjs groth16 setup multiplier2.r1cs pot12_final.ptau multiplier2_0000.zkey
```

- `multiplier2.r1cs` is our circuit in R1CS format
- `pot12_final.ptau` is the output of our preparation phase
- `multiplier2_0000.zkey` is the "empty" zkey file ("empty" as in no contribution yet)

2. Again, we can contribute and run this indefinitely just like in ptau ceremony

```bash
snarkjs zkey contribute multiplier2_0000.zkey multiplier2_0001.zkey --name="dolor sit amet" -v
```

3. Afterwards, we can extract or export the `Sv` (verification key) to a small json file

```bash
snarkjs zkey export verificationkey multiplier2_0001.zkey verification_key.json
```

> Reminder: All `.zkey` file contains both `Sv` and `Sp`, but the `0000` or initial ones has no contributions yet so is considered insecure. Then, the command on point #3 is just extracting the `Sv` to a json file

#### Proving & Verifying

1. To create a proof, run this command

```bash
snarkjs groth16 prove multiplier2_0001.zkey witness.wtns proof.json public.json
```

Internally, it extracts the `Sp` from the `.zkey` file and creates 2 files:

- `proof.json`: well, the proof. grass is green. amazing
- `public.json`: contains the values of public inputs and outputs. If theres something like `signal output <variable>` inside the circuit, then that will show up in the `public.json` file

2. To verify a proof, run this command

```bash
snarkjs groth16 verify verification_key.json public.json proof.json
```

Dont worry, the `proof.json` and `public.json` file is cryptographically linked, so manually modifying `public.json` will give "Invalid proof" error when trying to verify it

> Ideally, only the prover would hold the heavy `.zkey` and the verifier would only need the `.json` verification key (its succint, afterall. small prove & fast verification)
