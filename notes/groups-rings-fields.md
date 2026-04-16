# Groups, Rings, Fields

I decided to make this small quick guide to remind myself about these things bc damn theyre easy for me to forget

### A. Groups

A set G alongside with an operation `#` (usually addition or multiplication) that satisfies these conditions (for all elements a, b, and c in G):

1. **Closure**: For every a and b in set G, a `#` b = c, where c is also inside G
2. **Associativity**: For every a, b, and c in set G, a `#` (b `#` c) = (a `#` b) `#` c
3. **Identity Element**: For every a in set G, There exists an identity element `e` such that a `#` e = a. (Usually, you know this element as `1`)
4. **Inverse Element**: For every a in set G, there exists b in set G so that a `#` b = b `#` a = e, where e is the identity element. (Usually b is simply `a^-1`, or additive/multiplicative inverse)

> If you're confused, replace `#` with `+` for addition or `*` for multiplication

If the opeartion is commutative (i.e., a `#` b = b `#` a for ALL a and b in set G), the group is called an **abelian group**. Therefore, an abelian group has 5 traits instead of 4.

Examples:

- Integers under addition (Z, +)
- Non-zero real numbers under multiplication (R\*, x)

### B. Rings

A set R with 2 operations, addition and multiplication, such that:

1. Under addition, it forms an abelian group
2. Under multiplication, it satisfies **Closure** and **Associativity**
3. Multiplication distributes over addition

Essentially, a group with 2 operations.

### C. Fields

A set F with 2 operations, addition and multiplication, such that:

1. Under addition, it forms an abelian group
2. Under multiplication, it forms an abelian group (excluding zero)
3. Multiplication distributes over addition

Essentially, a ring whose **all elements are divisible** (all elements have multiplicative inverse)

Example:

## Notes

- `Fp` is a finite **field** with `p` elements. (Where `p` is usually prime)
- `Zp` (integer under modulo `p`) is a field if and only if `p` is prime. Therefore, it is equivalent to `Fp`. However, `Zp` might refer to p-adic integers, which is unrelated so just stick to `Fp`.
- `Fn` where `n` is non-prime may exist but in other forms like polynomial. And in those cases, `n` is usually replaced with `q`, where `q` = `p^e`, with `p` is a prime and `e` is an arbitrary exponent

## Inverse

1. Additive inverse
   is literally just substraction instead of addition.

```
a - b = a + (-a) = 0
```

so the additive inverse of a is -a

2. Multiplicative inverse
   is literally just division instead of multiplication.

```
a / b = a * (a^-1) = 1
```

so the multiplicative inverse of a is a^-1

This one is interesting bc in modular arithmetic, its called **modular multiplicative inverse**, and may not always exist. If `a * n = 1 (mod m)`, then `n` is the modular multiplicative inverse of `a` **BUT** it exists if and only if `a` and `m` are relatively prime (i.e., `gcd(a, m) = 1` )
