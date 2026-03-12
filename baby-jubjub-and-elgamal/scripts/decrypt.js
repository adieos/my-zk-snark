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
  const msg = BigInt("1234500054321"); // FILL THIS!

  C1 = [
    F.e(
      "17267562901697211805975977256029983768546092318328976138309172337544733920795",
    ),
    F.e(
      "8732717601619700956524492905791975584741997586210185692889021012117166585053",
    ),
  ];
  C2 = [
    F.e(
      "3782390201185739428454672117206656111305872057485760570356750456607272008140",
    ),
    F.e(
      "21668133279046431861459870864341516500512956508366711134391820855753319329492",
    ),
  ];

  // decrypt logic
  const helper = babyJub.mulPointEscalar(C1, privKey);
  const negHelper = [F.sub(F.e("0"), helper[0]), helper[1]];
  const resultPoint = babyJub.addPoint(C2, negHelper);

  // in practice, this would b bruteforced
  const rawExpected = babyJub.mulPointEscalar(GENERATOR, msg);

  console.log("--- DECRYPTION RESULT ---");
  console.log("Decrypted X:", F.toObject(resultPoint[0]).toString());
  console.log("Decrypted Y:", F.toObject(resultPoint[1]).toString());

  console.log("\n--- EXPECTED RESULT ---");
  console.log("Expected X: ", F.toObject(rawExpected[0]).toString());
  console.log("Expected Y: ", F.toObject(rawExpected[1]).toString());

  const matchX = F.toObject(resultPoint[0]) === F.toObject(rawExpected[0]);
  const matchY = F.toObject(resultPoint[1]) === F.toObject(rawExpected[1]);

  console.log("\nMatch Found:", matchX && matchY);
}

run();
