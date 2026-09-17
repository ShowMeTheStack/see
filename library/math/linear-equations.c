/*
 * title: Solving equations by Gaussian elimination
 * level: 3
 * about: Reads a system of linear equations, eliminates unknowns with partial pivoting, and back-substitutes to find the solution.
 * input: 3\n2 1 -1 8\n-3 -1 2 -11\n-2 1 2 -3\n
 */
#include <stdio.h>
#include <math.h>

#define MAXN 6

/* The augmented matrix: each row holds the coefficients of one
   equation followed by its right-hand side. 2x + y - z = 8 is the row
   2 1 -1 8. */
double m[MAXN][MAXN + 1];

void show(int n, const char *title)
{
    int i, j;

    printf("%s\n", title);
    for (i = 0; i < n; i++) {
        for (j = 0; j <= n; j++)
            printf("%s%9.4f", j == n ? "  |" : "", m[i][j]);
        printf("\n");
    }
}

/* Returns 0 if the system has no single solution. */
int solve(int n, double x[])
{
    int col, row, best, j;
    double factor, t, sum;

    for (col = 0; col < n; col++) {
        /* Partial pivoting: bring up the row with the biggest number in
           this column. Dividing by a tiny pivot would blow up the
           rounding errors, and dividing by zero would be fatal. */
        best = col;
        for (row = col + 1; row < n; row++)
            if (fabs(m[row][col]) > fabs(m[best][col]))
                best = row;
        if (fabs(m[best][col]) < 1e-12)
            return 0;
        if (best != col)
            for (j = 0; j <= n; j++) {
                t = m[col][j];
                m[col][j] = m[best][j];
                m[best][j] = t;
            }

        /* Subtract a multiple of the pivot row from each row below, so
           that this column becomes zero under the pivot. */
        for (row = col + 1; row < n; row++) {
            factor = m[row][col] / m[col][col];
            for (j = col; j <= n; j++)
                m[row][j] -= factor * m[col][j];
        }
    }
    show(n, "upper triangular form:");

    /* The last row now has one unknown, the one above it two, and so
       on. Solve from the bottom up, each time using the answers already
       found. */
    for (row = n - 1; row >= 0; row--) {
        sum = m[row][n];
        for (j = row + 1; j < n; j++)
            sum -= m[row][j] * x[j];
        x[row] = sum / m[row][row];
    }
    return 1;
}

int main(void)
{
    int n, i, j;
    double x[MAXN];

    if (scanf("%d", &n) != 1 || n < 1 || n > MAXN)
        return 1;
    for (i = 0; i < n; i++)
        for (j = 0; j <= n; j++)
            if (scanf("%lf", &m[i][j]) != 1)
                return 1;

    show(n, "equations:");
    if (!solve(n, x)) {
        printf("no unique solution\n");
        return 0;
    }
    for (i = 0; i < n; i++)
        printf("x%d = %g\n", i + 1, x[i]);
    return 0;
}
