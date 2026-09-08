/*
 * title: Counting array elements with a macro
 * level: 1
 * about: Defines COUNT_OF with sizeof to loop over arrays of any length, and shows why it gives the wrong answer for a pointer parameter.
 */
#include <stdio.h>

/*
 * sizeof arr is the size of the whole array in bytes; sizeof arr[0] is
 * the size of one element. Dividing gives the number of elements, and
 * the compiler works it out, so nothing is computed at run time.
 */
#define COUNT_OF(arr) (sizeof(arr) / sizeof((arr)[0]))

/*
 * Inside a function, a parameter written as int a[] is really a
 * pointer, int *a. sizeof a is then the size of a pointer (4 bytes
 * here), so COUNT_OF quietly gives 4 / 4 = 1. That is why functions
 * that take arrays also take a length.
 */
static int sum(const int a[], int n)
{
    int i, total = 0;
    printf("  inside sum: sizeof a = %d, so COUNT_OF(a) would be %d\n",
           (int)sizeof a, (int)COUNT_OF(a));
    for (i = 0; i < n; i++)
        total += a[i];
    return total;
}

int main(void)
{
    int primes[] = { 2, 3, 5, 7, 11, 13, 17, 19 };
    double weights[] = { 0.5, 1.25, 2.0 };
    const char *days[] = { "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun" };
    char word[] = "macro";
    unsigned int i;

    printf("primes: %d elements of %d bytes\n",
           (int)COUNT_OF(primes), (int)sizeof primes[0]);
    printf("weights: %d elements of %d bytes\n",
           (int)COUNT_OF(weights), (int)sizeof weights[0]);
    printf("days: %d pointers of %d bytes\n",
           (int)COUNT_OF(days), (int)sizeof days[0]);
    printf("word: %d chars, including the closing '\\0'\n", (int)COUNT_OF(word));

    /* Add a day or a prime to the list and these loops follow along. */
    for (i = 0; i < COUNT_OF(days); i++)
        printf("%s%s", days[i], i + 1 < COUNT_OF(days) ? ", " : "\n");

    printf("sum of primes: %d\n", sum(primes, (int)COUNT_OF(primes)));

    /*
     * In See, compare primes in main's frame (a block of 32 bytes) with
     * a in sum's frame: a single 4-byte pointer whose arrow leads back
     * to primes.
     */
    return 0;
}
