/*
 * title: Pascal's triangle by recursion
 * level: 2
 * about: Computes binomial coefficients with Pascal's rule, first naively and then remembering results, and prints the triangle.
 */
#include <stdio.h>

#define ROWS 12

long naive_calls = 0;

/* C(n, k): the number of ways to choose k things from n.
   Pascal's rule: C(n, k) = C(n-1, k-1) + C(n-1, k).
   Either the first thing is chosen (choose k-1 from the rest) or it is
   not (choose k from the rest). The edges of the triangle are 1. */
long choose(int n, int k)
{
    naive_calls++;
    if (k == 0 || k == n)
        return 1;
    return choose(n - 1, k - 1) + choose(n - 1, k);
}

/* The same rule, but each answer is stored the first time it is found.
   table is a 2D array in the globals; 0 means "not worked out yet",
   which is safe because no coefficient is 0. */
long table[31][31];
long memo_calls = 0;

long choose_memo(int n, int k)
{
    memo_calls++;
    if (k == 0 || k == n)
        return 1;
    if (table[n][k] == 0)
        table[n][k] = choose_memo(n - 1, k - 1) + choose_memo(n - 1, k);
    return table[n][k];
}

int main(void)
{
    int n, k;
    long a, b;

    for (n = 0; n < ROWS; n++) {
        printf("%*s", (ROWS - 1 - n) * 3, "");
        for (k = 0; k <= n; k++)
            printf("%6ld", choose(n, k));
        printf("\n");
    }

    naive_calls = 0;
    a = choose(20, 10);
    printf("\nC(20,10) = %ld took %ld calls the naive way\n", a, naive_calls);
    b = choose_memo(20, 10);
    printf("C(20,10) = %ld took %ld calls with the table\n", b, memo_calls);

    memo_calls = 0;
    b = choose_memo(30, 15);
    printf("C(30,15) = %ld took %ld more calls\n", b, memo_calls);
    return 0;
}
