/*
 * title: The Ackermann function, small but furious
 * level: 3
 * about: Evaluates Ackermann's function for tiny arguments while measuring how many calls and how deep the stack goes.
 */
#include <stdio.h>

/* Ackermann's function is famous for growing faster than any function
   built from ordinary loops. Even A(3, 3) needs thousands of calls, and
   the nested call A(m-1, A(m, n-1)) keeps the stack surprisingly deep.
   Keep the arguments tiny: A(4, 1) would already take far too long. */
long calls;
int depth, max_depth;

int ack(int m, int n)
{
    int r;

    calls++;
    if (++depth > max_depth)
        max_depth = depth;

    if (m == 0)
        r = n + 1;
    else if (n == 0)
        r = ack(m - 1, 1);
    else
        r = ack(m - 1, ack(m, n - 1));   /* the inner call finishes first */

    depth--;
    return r;
}

/* Traces every call for a very small case, so the pattern is visible. */
int ack_trace(int m, int n, int level)
{
    int inner, r;

    printf("%*sA(%d,%d)\n", level * 2, "", m, n);
    if (m == 0)
        return n + 1;
    if (n == 0)
        return ack_trace(m - 1, 1, level + 1);
    inner = ack_trace(m, n - 1, level + 1);
    r = ack_trace(m - 1, inner, level + 1);
    return r;
}

int main(void)
{
    int m, n, value;

    printf("trace of A(1,2):\n");
    printf("= %d\n\n", ack_trace(1, 2, 0));

    printf("  m n   A(m,n)    calls  deepest stack\n");
    for (m = 0; m <= 3; m++)
        for (n = 0; n <= 3; n++) {
            calls = 0;
            depth = max_depth = 0;
            value = ack(m, n);
            printf("  %d %d %8d %8ld %8d\n", m, n, value, calls, max_depth);
        }
    /* Pattern: A(1,n) = n+2, A(2,n) = 2n+3, A(3,n) = 2^(n+3) - 3. */
    return 0;
}
