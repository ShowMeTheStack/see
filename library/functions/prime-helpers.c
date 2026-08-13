/*
 * title: A small toolbox of prime functions
 * level: 2
 * about: Builds is_prime, next_prime and count_primes on top of each other, then uses them to find twin primes and Goldbach pairs.
 */
#include <stdio.h>

/* Each helper is small and does one job. Bigger helpers are built by
   calling smaller ones, so each idea is written (and tested) once. */

int is_prime(int n)
{
    int d;

    if (n < 2)
        return 0;
    if (n % 2 == 0)
        return n == 2;
    /* Only odd divisors up to the square root need checking. */
    for (d = 3; d * d <= n; d += 2)
        if (n % d == 0)
            return 0;
    return 1;
}

/* The smallest prime strictly greater than n. */
int next_prime(int n)
{
    int k = n + 1;

    while (!is_prime(k))
        k++;
    return k;
}

/* How many primes lie in [lo, hi]? */
int count_primes(int lo, int hi)
{
    int n, count = 0;

    for (n = lo; n <= hi; n++)
        count += is_prime(n);   /* is_prime returns exactly 0 or 1 */
    return count;
}

/* Twin primes differ by 2, like 11 and 13. */
void print_twins(int limit)
{
    int p = 2, q;

    printf("twin primes below %d:", limit);
    for (;;) {
        q = next_prime(p);
        if (q >= limit)
            break;
        if (q - p == 2)
            printf(" (%d,%d)", p, q);
        p = q;
    }
    printf("\n");
}

/* Goldbach guessed every even number above 2 is a sum of two primes.
   Returns the smaller prime of the first pair found, or 0. */
int goldbach(int even)
{
    int p;

    for (p = 2; p <= even / 2; p = next_prime(p))
        if (is_prime(even - p))
            return p;
    return 0;
}

int main(void)
{
    int n, p;

    printf("primes up to 100: %d\n", count_primes(1, 100));
    printf("primes 1000..1100: %d\n", count_primes(1000, 1100));
    printf("first prime after 1000: %d\n", next_prime(1000));
    print_twins(110);

    /* While goldbach is running, set a breakpoint in is_prime: the call
       stack shows main -> goldbach -> next_prime -> is_prime, or
       main -> goldbach -> is_prime, depending on who asked. */
    for (n = 4; n <= 30; n += 2) {
        p = goldbach(n);
        printf("%d = %d + %d\n", n, p, n - p);
    }
    return 0;
}
