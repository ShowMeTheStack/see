/*
 * title: Subtracting pointers to find a position
 * level: 2
 * about: Finds values in an array with a pointer search and turns the found pointer back into an index by subtraction.
 */
#include <stdio.h>
#include <stddef.h>

/*
 * Returns a pointer to the first element equal to want, or NULL.
 * Returning a pointer is handy: it says both "found" and "where".
 */
int *find(int *first, int *last, int want)
{
    int *p;
    for (p = first; p != last; p++)
        if (*p == want)
            return p;
    return NULL;
}

int main(void)
{
    int primes[8];
    int wanted[3];
    int *hit;
    int *second;
    ptrdiff_t gap;
    int i;

    primes[0] = 2;  primes[1] = 3;  primes[2] = 5;  primes[3] = 7;
    primes[4] = 11; primes[5] = 13; primes[6] = 17; primes[7] = 19;
    wanted[0] = 13; wanted[1] = 4;  wanted[2] = 2;

    for (i = 0; i < 3; i++) {
        hit = find(primes, primes + 8, wanted[i]);
        if (hit == NULL) {
            printf("%2d is not in the list\n", wanted[i]);
        } else {
            /*
             * Subtracting two pointers into the same array counts the
             * elements between them, not the bytes. The type of the
             * result is ptrdiff_t, a signed integer from <stddef.h>.
             */
            printf("%2d is at index %ld\n", wanted[i], (long)(hit - primes));
        }
    }

    /* The difference between two element pointers, in elements and in bytes. */
    hit = &primes[1];
    second = &primes[6];
    gap = second - hit;
    printf("from primes[1] to primes[6]: %ld elements, %ld bytes\n",
           (long)gap, (long)((char *)second - (char *)hit));

    /* Order matters: the difference is negative the other way round. */
    printf("and backwards: %ld\n", (long)(hit - second));

    /*
     * Subtracting pointers into two different arrays is undefined: they
     * may sit anywhere relative to each other, so the answer means nothing.
     */
    return 0;
}
