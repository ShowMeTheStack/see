/*
 * title: Naive Fibonacci and its explosion of calls
 * level: 2
 * about: Computes Fibonacci numbers by the plain two-branch recursion and counts how many calls each one costs.
 */
#include <stdio.h>

/* A global counter so we can see how much work is being done. */
long calls = 0;

/* fib(n) = fib(n-1) + fib(n-2). Lovely to read, but each call makes two
   more, and they keep recomputing the same small values again and
   again. fib(3) alone is worked out many times inside fib(10). */
int fib(int n)
{
    calls++;
    if (n < 2)
        return n;
    return fib(n - 1) + fib(n - 2);
}

/* Draws the call tree for a small n: each line is one call, indented
   by its depth. Notice fib(2) and fib(1) appearing over and over. */
int fib_traced(int n, int depth)
{
    int a, b;

    printf("%*sfib(%d)\n", depth * 3, "", n);
    if (n < 2)
        return n;
    a = fib_traced(n - 1, depth + 1);
    b = fib_traced(n - 2, depth + 1);
    return a + b;
}

int main(void)
{
    int n, value;

    printf("the call tree of fib(5):\n");
    value = fib_traced(5, 0);
    printf("= %d\n\n", value);

    /* The deepest the stack ever gets is only n frames, but the total
       number of calls grows like the Fibonacci numbers themselves. */
    printf(" n   fib(n)   calls\n");
    for (n = 0; n <= 22; n += 2) {
        calls = 0;
        value = fib(n);
        printf("%2d %8d %7ld\n", n, value, calls);
    }
    return 0;
}
