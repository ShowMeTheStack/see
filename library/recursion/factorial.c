/*
 * title: Factorial, one frame per number
 * level: 1
 * about: Computes factorials recursively and prints each call on the way down and each answer on the way back up.
 */
#include <stdio.h>

/* n! = n * (n-1)!, and 0! = 1. The definition refers to itself, and so
   does the function. Every call gets its own frame with its own n:
   step into fact(5) with F11 and watch five, six frames pile up, each
   with a different n, before the first one can finish. */
long fact(int n)
{
    long smaller, result;

    printf("%*sfact(%d) called\n", (5 - n) * 2, "", n);
    if (n == 0) {
        /* The base case stops the descent. Without it the calls would
           go on until the stack ran out. */
        printf("%*sfact(0) = 1, the base case\n", (5 - n) * 2, "");
        return 1;
    }
    smaller = fact(n - 1);     /* this frame waits here */
    result = n * smaller;
    printf("%*sfact(%d) = %d * %ld = %ld\n", (5 - n) * 2, "", n, n, smaller, result);
    return result;
}

/* The same thing without the printing, to fill a table. */
long fact_quiet(int n)
{
    return n == 0 ? 1 : n * fact_quiet(n - 1);
}

int main(void)
{
    int i;

    printf("5! = %ld\n\n", fact(5));

    /* long is 32 bits here, so 12! is the largest that fits. */
    for (i = 0; i <= 12; i++)
        printf("%2d! = %ld\n", i, fact_quiet(i));
    return 0;
}
