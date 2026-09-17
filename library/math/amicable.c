/*
 * title: Amicable number pairs
 * level: 2
 * about: Builds a table of divisor sums for every number up to 20000 with a sieve, then finds the pairs that point at each other.
 */
#include <stdio.h>
#include <stdlib.h>

#define N 20000

int main(void)
{
    long *sum;
    long i, j, partner;
    int pairs = 0;

    /* One long per number lives on the heap: 80 KB in one block. */
    sum = malloc((N + 1) * sizeof *sum);
    if (sum == NULL)
        return 1;

    /* A sieve for divisor sums. Instead of asking "what divides j?" for
       every j, turn it round: every i is a proper divisor of 2i, 3i, 4i...
       so add i into each of those. Total work is about N log N steps. */
    for (i = 0; i <= N; i++)
        sum[i] = 0;
    for (i = 1; i <= N / 2; i++)
        for (j = 2 * i; j <= N; j += i)
            sum[j] += i;

    /* a and b are amicable when sum(a) = b, sum(b) = a and a != b.
       Requiring a < b prints each pair once. */
    for (i = 2; i <= N; i++) {
        partner = sum[i];
        if (partner > i && partner <= N && sum[partner] == i) {
            pairs++;
            printf("%5ld and %5ld: divisors of %ld add to %ld and back again\n",
                   i, partner, i, partner);
        }
    }
    printf("%d amicable pairs below %d\n", pairs, N);

    free(sum);
    return 0;
}
