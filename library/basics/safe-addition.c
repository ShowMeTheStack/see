/*
 * title: Adding without overflowing
 * level: 4
 * about: Reads pairs of ints and adds them only when the sum fits, testing against INT_MAX and INT_MIN before the addition rather than after.
 * input: 2000000000 100000000\n2147483000 647\n2147483000 648\n-2147483000 -648\n-2147483000 -649\n-5 7
 */
#include <stdio.h>
#include <limits.h>

/*
 * Returns 1 and stores the sum in *result if a + b fits in an int,
 * otherwise returns 0 and leaves *result alone.
 *
 * The test must not do the overflowing addition itself, because once a
 * signed int overflows the program has already gone wrong: the C standard
 * says nothing about what happens next, and See flags it with a warning.
 * So the question "is a + b > INT_MAX?" is rearranged into
 * "is a > INT_MAX - b?", which can be worked out safely when b > 0.
 */
static int add_checked(int a, int b, int *result)
{
    if (b > 0 && a > INT_MAX - b) {
        return 0;               /* too big */
    }
    if (b < 0 && a < INT_MIN - b) {
        return 0;               /* too small */
    }
    *result = a + b;
    return 1;
}

int main(void)
{
    int a, b;
    int sum;
    int bits;

    printf("INT_MAX is %d, INT_MIN is %d\n\n", INT_MAX, INT_MIN);

    while (scanf("%d %d", &a, &b) == 2) {
        printf("%11d + %11d : ", a, b);

        /* &sum lets add_checked write into main's sum. Step into the call
           (F11) and watch the pointer arrow from result to sum. */
        if (add_checked(a, b, &sum)) {
            printf("%d\n", sum);
        } else {
            /*
             * The answer still exists, it just does not fit in an int.
             * Doing the sum in double, which has 53 bits of precision,
             * shows what it would have been. (long is also 32 bits here,
             * so it would not help.)
             */
            bits = (int)sizeof(int) * CHAR_BIT;
            printf("overflow! the true sum %.0f needs more than %d bits\n",
                   (double)a + (double)b, bits);
        }
    }
    return 0;
}
