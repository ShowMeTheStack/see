/*
 * title: Prime factorisation by trial division
 * level: 1
 * about: Reads whole numbers and breaks each one into prime factors, printed with powers like 2^3 * 3 * 5.
 * input: 360\n97\n1001\n65536\n2147483646\n0
 */
#include <stdio.h>

/* Print n as a product of primes. Division strips each factor out
   completely before moving on, so the next divisor that works is
   automatically prime: all its own factors were already removed. */
void factorise(long n)
{
    long d = 2;
    int power;
    int first = 1;

    printf("%ld = ", n);
    /* We only need to try d while d * d <= n. If n still has a factor
       bigger than its square root, it can have only one such factor,
       and that factor is n itself. Writing the test as d <= n / d
       instead of d * d <= n means d * d can never overflow. */
    while (d <= n / d) {
        power = 0;
        while (n % d == 0) {
            n /= d;
            power++;
        }
        if (power > 0) {
            printf("%s%ld", first ? "" : " * ", d);
            if (power > 1)
                printf("^%d", power);
            first = 0;
        }
        /* After 2, only odd numbers can be prime. */
        d = (d == 2) ? 3 : d + 2;
    }
    if (n > 1)                     /* the big prime left over, if any */
        printf("%s%ld", first ? "" : " * ", n);
    printf("\n");
}

int main(void)
{
    long n;

    /* Keep reading until the input says 0 (or runs out). */
    while (scanf("%ld", &n) == 1 && n > 0) {
        if (n == 1)
            printf("1 has no prime factors\n");
        else
            factorise(n);
    }
    return 0;
}
