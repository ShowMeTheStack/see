/*
 * title: Matrix chain multiplication order
 * level: 4
 * about: Finds the cheapest way to parenthesise a product of five matrices, prints the cost table and the bracketing, and compares it with left-to-right.
 */
#include <stdio.h>

#define N 5     /* number of matrices */

/*
 * Matrix i has dims[i-1] rows and dims[i] columns, so A1 is 30x35,
 * A2 is 35x15 and so on. Multiplying a p x q by a q x r matrix costs
 * p*q*r scalar multiplications.
 */
long dims[N + 1] = { 30, 35, 15, 5, 10, 20 };

long cost[N + 1][N + 1];   /* cost[i][j]: cheapest way to multiply Ai..Aj */
int split[N + 1][N + 1];   /* where that cheapest way makes its last cut */

/* Print the bracketing recursively from the split table. */
void print_order(int i, int j)
{
    if (i == j) {
        printf("A%d", i);
        return;
    }
    printf("(");
    print_order(i, split[i][j]);
    printf(" ");
    print_order(split[i][j] + 1, j);
    printf(")");
}

int main(void)
{
    int i, j, k, len;
    long c, naive;

    for (i = 1; i <= N; i++)
        cost[i][i] = 0;         /* a single matrix needs no work */

    /*
     * Solve short chains before long ones: a chain of length len uses
     * the answers for every shorter chain inside it. Try every place k
     * for the outermost multiplication (Ai..Ak) * (Ak+1..Aj).
     */
    for (len = 2; len <= N; len++) {
        for (i = 1; i + len - 1 <= N; i++) {
            j = i + len - 1;
            cost[i][j] = -1;
            for (k = i; k < j; k++) {
                c = cost[i][k] + cost[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
                if (cost[i][j] < 0 || c < cost[i][j]) {
                    cost[i][j] = c;
                    split[i][j] = k;
                }
            }
        }
    }

    printf("cost table (row i, column j = cheapest Ai..Aj):\n");
    for (i = 1; i <= N; i++) {
        for (j = 1; j <= N; j++) {
            if (j < i)
                printf("%8s", "");
            else
                printf("%8ld", cost[i][j]);
        }
        printf("\n");
    }

    printf("best order: ");
    print_order(1, N);
    printf("\ncost: %ld multiplications\n", cost[1][N]);

    /* For comparison: ((((A1 A2) A3) A4) A5). */
    naive = 0;
    for (k = 2; k <= N; k++)
        naive += dims[0] * dims[k - 1] * dims[k];
    printf("left to right would cost %ld, %.1f times as much\n",
           naive, (double)naive / cost[1][N]);
    return 0;
}
