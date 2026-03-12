const { buildBabyjub } = require("circomlibjs");
const crypto = require("crypto");

async function generate() {
  // 1. Wait for the BabyJubJub module to build (it uses WASM under the hood)
  const babyJub = await buildBabyjub();

  // 2. Generate 32 random bytes for the private key
  const rawPriv = crypto.randomBytes(32);

  // 3. Prune the buffer to make it a valid BabyJub scalar
  // In newer versions, we use the 'unpackPoint' or direct buffer manipulation
  // but for simple testing, we can just treat the buffer as a BigInt
  // and ensure it is within the curve's order.
  const scalar = BigInt("0x" + rawPriv.toString("hex")) % babyJub.order;

  const F = babyJub.F; // Field helper

  const GENERATOR = [
    F.e(
      "5299619240641551281634865583518297030282874472190772894086521144482721001553",
    ),
    F.e(
      "16950150798460657717958625567821834550301663161624707787222815936182638968203",
    ),
  ];

  // 4. Derive Public Key (H = x * G)
  const pubKey = babyJub.mulPointEscalar(GENERATOR, scalar);

  console.log("--- PRIVATE KEY (SCALAR) ---");
  console.log(scalar.toString());

  console.log("\n--- PUBLIC KEY (POINT) ---");
  console.log(`"pub_key_x": "${babyJub.F.toObject(pubKey[0]).toString()}",`);
  console.log(`"pub_key_y": "${babyJub.F.toObject(pubKey[1]).toString()}",`);
}

generate();
