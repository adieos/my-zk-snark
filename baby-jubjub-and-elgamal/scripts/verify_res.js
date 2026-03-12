const { buildBabyjub } = require("circomlibjs");

async function run() {
  const babyJub = await buildBabyjub();
  const F = babyJub.F; // Field helper
  const GENERATOR = [
    F.e(
      "5299619240641551281634865583518297030282874472190772894086521144482721001553",
    ),
    F.e(
      "16950150798460657717958625567821834550301663161624707787222815936182638968203",
    ),
  ];

  const privKey = BigInt(
    "16835259638311923441363769553950755040277659427175462796128849463313243488483",
  );
  const nonce = BigInt("12");
  const msg = BigInt("5");

  // Derived Public Key: H = privKey * G
  const H = babyJub.mulPointEscalar(GENERATOR, privKey);

  console.log("--- INPUTS FOR YOUR CIRCUIT ---");
  console.log("JS G_x:", babyJub.F.toObject(GENERATOR[0]).toString());
  console.log("JS G_y:", babyJub.F.toObject(GENERATOR[1]).toString());
  console.log("pub_key_x:", F.toObject(H[0]).toString());
  console.log("pub_key_y:", F.toObject(H[1]).toString());
  console.log("nonce (r):", nonce.toString());
  console.log("msg (m):", msg.toString());
  console.log("-------------------------------\n");

  // --- 2. ENCRYPTION (Mirroring the Circuit) ---
  // C1 = r * G
  const C1 = babyJub.mulPointEscalar(GENERATOR, nonce);

  // C2 = (r * H) + (m * G)
  const rH = babyJub.mulPointEscalar(H, nonce);
  const mG = babyJub.mulPointEscalar(GENERATOR, msg);
  const C2 = babyJub.addPoint(rH, mG);

  console.log("--- EXPECTED OUTPUTS (FROM CIRCUIT) ---");
  console.log("C1_x:", F.toObject(C1[0]).toString());
  console.log("C1_y:", F.toObject(C1[1]).toString());
  console.log("C2_x:", F.toObject(C2[0]).toString());
  console.log("C2_y:", F.toObject(C2[1]).toString());
  console.log("---------------------------------------\n");

  // --- 3. DECRYPTION (The Admin Logic) ---
  // HELPER = x * C1
  const helper = babyJub.mulPointEscalar(C1, privKey);

  // Negate HELPER: (-x, y)
  // In Finite Field: (FieldPrime - x, y)
  const negHelper = [F.sub(F.e("0"), helper[0]), helper[1]];

  // RESULT = C2 + NegatedHelper
  const resultPoint = babyJub.addPoint(C2, negHelper);

  // --- 4. EXPECTED POINT CALCULATION ---
  const rawExpected = babyJub.mulPointEscalar(GENERATOR, msg);

  console.log("--- DECRYPTION RESULT ---");
  console.log("Decrypted X:", F.toObject(resultPoint[0]).toString());
  console.log("Decrypted Y:", F.toObject(resultPoint[1]).toString());

  console.log("\n--- EXPECTED RESULT ---");
  console.log("Expected X: ", F.toObject(rawExpected[0]).toString());
  console.log("Expected Y: ", F.toObject(rawExpected[1]).toString());

  // --- 5. THE ULTIMATE COMPARISON ---
  const matchX = F.toObject(resultPoint[0]) === F.toObject(rawExpected[0]);
  const matchY = F.toObject(resultPoint[1]) === F.toObject(rawExpected[1]);

  console.log("\nMatch Found:", matchX && matchY);
}

run();
