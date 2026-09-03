/*
 * title: Fast power by repeated squaring
 * level: 2
 * about: Raises numbers to large powers modulo m by squaring, counting multiplications against the slow way, and checks Fermat's little theorem.
 */
#include <stdio.h>

static int mults;

/*
 * Write the exponent in binary: 13 = 1101. Then
 *   b^13 = b^8 * b^4 * b^1
 * and b, b^2, b^4, b^8 come from squaring over and over. So the work
 * grows with the number of bits in e, not with e itself.
 *
 * Everything is reduced mod m after each multiplication. With m below
 * 46341 the product of two remainders always fits in a 32-bit long.
 */
long power_mod(long b, long e, long m)
{
    long result = 1;
    b %= m;
    while (e > 0) {
        if (e & 1) {            /* this bit of the exponent is set */
            result = result * b % m;
            mults++;
        }
        b = b * b % m;          /* b, b^2, b^4, b^8, ... */
        mults++;
        e >>= 1;
    }
    return result;
}

long slow_power_mod(long b, long e, long m)
{
    long result = 1;
    while (e-- > 0) {
        result = result * b % m;
        mults++;
    }
    return result;
}

int main(void)
{
    long primes[] = { 7, 13, 101, 997, 40009 };
    int i, fast, slow;
    long r1, r2, e = 1000;

    printf("3^%ld mod m, fast against slow:\n", e);
    for (i = 0; i < 5; i++) {
        mults = 0;
        r1 = power_mod(3, e, primes[i]);
        fast = mults;
        mults = 0;
        r2 = slow_power_mod(3, e, primes[i]);
        slow = mults;
        printf("  m = %5ld: %5ld (%d mults)  %5ld (%d mults)\n",
               primes[i], r1, fast, r2, slow);
    }

    /*
     * Fermat: if p is prime and a is not a multiple of p, then
     * a^(p-1) mod p = 1. For a composite number it usually fails,
     * which is the basis of quick primality tests.
     */
    printf("2^(n-1) mod n:\n");
    for (i = 0; i < 5; i++)
        printf("  n = %5ld: %ld\n", primes[i], power_mod(2, primes[i] - 1, primes[i]));
    printf("  n = %5d: %ld   (561 = 3*11*17, yet it passes: a Carmichael number)\n",
           561, power_mod(2, 560, 561));
    printf("  n = %5d: %ld   (a composite that fails the test)\n",
           221, power_mod(2, 220, 221));
    return 0;
}
