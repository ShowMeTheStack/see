/*
 * title: Fibonacci with a memo table
 * level: 2
 * about: Speeds up recursive Fibonacci by remembering every answer in an array, cutting thousands of calls to a few dozen.
 */
#include <stdio.h>

#define MAXN 46   /* fib(46) is the largest that fits in a 32-bit int */

/* memo[k] holds fib(k) once known, or -1 meaning "not yet". It is a
   global so every frame of the recursion shares one table. In See,
   watch the cells fill in from the bottom up as the calls return. */
int memo[MAXN + 1];
long calls = 0;

int fib(int n)
{
    calls++;
    if (memo[n] != -1)
        return memo[n];        /* already known: no further calls */
    if (n < 2)
        memo[n] = n;
    else
        memo[n] = fib(n - 1) + fib(n - 2);
    return memo[n];
}

void forget_all(void)
{
    int i;

    for (i = 0; i <= MAXN; i++)
        memo[i] = -1;
}

int main(void)
{
    int n, value;

    printf(" n        fib(n)  calls\n");
    for (n = 10; n <= MAXN; n += 6) {
        forget_all();          /* start each row from an empty table */
        calls = 0;
        value = fib(n);   /* call first: printf's arguments are evaluated
                             right to left, so calls would be read too early */
        printf("%2d %13d %6ld\n", n, value, calls);
    }

    /* With the table kept, a second question costs almost nothing. */
    forget_all();
    calls = 0;
    fib(40);
    printf("\nfib(40) from scratch took %ld calls\n", calls);
    calls = 0;
    value = fib(41);
    printf("then fib(41) = %d took only %ld calls\n", value, calls);
    return 0;
}
