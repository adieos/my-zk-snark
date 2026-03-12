pragma circom 2.0.0;
include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/escalarmulany.circom";

template Main() {
    signal input pub_key_x;
    signal input pub_key_y;

    signal input msg;
    signal input nonce;

    signal output c1_x;
    signal output c1_y;
    signal output c2_x;
    signal output c2_y;

    signal c2_left_x;
    signal c2_right_x;
    signal c2_left_y;
    signal c2_right_y;

    var g_x = 5299619240641551281634865583518297030282874472190772894086521144482721001553;
    var g_y = 16950150798460657717958625567821834550301663161624707787222815936182638968203;

    // Validate ciphertext

    // (assume this is to ensure a msg follows certain criteria)

    // Exponential Elgamal: process scalar multiplier (nonce and plaintext)
    component n2b_nonce = Num2Bits(253);
    component n2b_msg = Num2Bits(253);

    n2b_nonce.in <== nonce;
    n2b_msg.in <== msg;

    // Exponential ElGamal: Generating C1
    // (r . G)
    component mult_C1 = EscalarMulAny(253);
    for (var i = 0; i<253; i++) {
        mult_C1.e[i] <== n2b_nonce.out[i];
    }
    mult_C1.p[0] <== g_x;
    mult_C1.p[1] <== g_y;

    c1_x <== mult_C1.out[0];
    c1_y <== mult_C1.out[1];

    // Exponential Elgamal: Generating C2
    // (r . H)
    component mult_C2_left = EscalarMulAny(253);
    for (var i = 0; i<253; i++) {
        mult_C2_left.e[i] <== n2b_nonce.out[i];
    }
    mult_C2_left.p[0] <== pub_key_x;
    mult_C2_left.p[1] <== pub_key_y;

    c2_left_x <== mult_C2_left.out[0];
    c2_left_y <== mult_C2_left.out[1];

    // (m . G)
    component mult_C2_right = EscalarMulAny(253);
    for (var i = 0; i<253; i++) {
        mult_C2_right.e[i] <== n2b_msg.out[i];
    }
    mult_C2_right.p[0] <== g_x;
    mult_C2_right.p[1] <== g_y;

    c2_right_x <== mult_C2_right.out[0];
    c2_right_y <== mult_C2_right.out[1];

    // combine them
    component adder = BabyAdd();
    adder.x1 <== c2_left_x;
    adder.y1 <== c2_left_y;
    adder.x2 <== c2_right_x;
    adder.y2 <== c2_right_y;

    c2_x <== adder.xout;
    c2_y <== adder.yout;

}

component main {public [pub_key_x, pub_key_y]} = Main();