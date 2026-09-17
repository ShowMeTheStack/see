/*
 * title: A prime sieve packed into bits
 * level: 3
 * about: Runs the sieve of Eratosthenes up to 50000 with one bit per odd number, then counts primes, twin primes and checks Goldbach's conjecture.
 */
#include <stdio.h>
#include <string.h>

#define LIMIT 50000L

/* Even numbers above 2 are never prime, so store only the odd ones, and
   store each as a single bit: number n (odd) is bit n / 2. That is 16
   times less memory than an int per number. A set bit means "crossed
   out". 25000 bits fit in 3125 bytes; find the array in the globals. */
unsigned char composite[(LIMIT / 2) / 8 + 1];

/* The bit for n lives in byte (n/2) / 8, at position (n/2) % 8. */
#define BITINDEX(n)   ((n) / 2)
#define TESTBIT(n)    (composite[BITINDEX(n) >> 3] & (1 << (BITINDEX(n) & 7)))
#define SETBIT(n)     (composite[BITINDEX(n) >> 3] |= (unsigned char)(1 << (BITINDEX(n) & 7)))

int is_prime(long n)
{
    if (n < 2)
        return 0;
    if (n % 2 == 0)
        return n == 2;
    return !TESTBIT(n);
}

int main(void)
{
    long i, j, count = 1, twins = 0, n, p;
    int all_ok = 1;

    memset(composite, 0, sizeof composite);
    SETBIT(1L);                     /* 1 is not prime */

    /* Cross out odd multiples of each odd prime, starting at i * i and
       stepping 2i, so that even multiples are skipped too. */
    for (i = 3; i * i <= LIMIT; i += 2)
        if (!TESTBIT(i))
            for (j = i * i; j <= LIMIT; j += 2 * i)
                SETBIT(j);

    for (i = 3; i <= LIMIT; i += 2)
        if (!TESTBIT(i)) {
            count++;
            if (i + 2 <= LIMIT && !TESTBIT(i + 2))
                twins++;
        }
    printf("%ld primes below %ld, using %d bytes of flags\n",
           count, LIMIT, (int)sizeof composite);
    printf("%ld twin prime pairs (p and p + 2 both prime)\n", twins);

    printf("the first bytes of the table in binary, bit 0 on the right:\n");
    for (i = 0; i < 4; i++) {
        printf("  byte %ld (odd numbers %ld..%ld): ", i, 16 * i + 1, 16 * i + 15);
        for (j = 7; j >= 0; j--)
            putchar((composite[i] >> j) & 1 ? '1' : '0');
        printf("\n");
    }

    /* Goldbach: every even number above 2 is a sum of two primes. Never
       proved, never broken. Check it for every even number we can. */
    for (n = 4; n <= LIMIT; n += 2) {
        for (p = 2; p <= n / 2; p++)
            if (is_prime(p) && is_prime(n - p))
                break;
        if (p > n / 2) {
            printf("Goldbach fails at %ld!\n", n);
            all_ok = 0;
        }
        if (n == 100 || n == 1000 || n == 50000)
            printf("%ld = %ld + %ld\n", n, p, n - p);
    }
    printf("Goldbach %s up to %ld\n", all_ok ? "holds" : "fails", LIMIT);
    return 0;
}
