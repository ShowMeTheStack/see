/*
 * title: Magic squares by the Siamese method
 * level: 3
 * about: Fills odd-sized magic squares by stepping up and to the right with wraparound, then checks every row, column and diagonal.
 */
#include <stdio.h>
#include <stdlib.h>

/* The square is one heap block of n * n ints, used as a 2D grid by
   computing the index row * n + col ourselves. In the heap panel it is
   a single block; the rows sit end to end inside it. */
int *make_magic(int n)
{
    int *sq = malloc(n * n * sizeof *sq);
    int row, col, k, r2, c2;

    if (sq == NULL)
        return NULL;
    for (k = 0; k < n * n; k++)
        sq[k] = 0;

    /* Start in the middle of the top row. Put 1, 2, 3... each one step
       up and one to the right, wrapping round the edges like a torus.
       If that cell is taken, drop down one cell instead. */
    row = 0;
    col = n / 2;
    for (k = 1; k <= n * n; k++) {
        sq[row * n + col] = k;
        r2 = (row - 1 + n) % n;
        c2 = (col + 1) % n;
        if (sq[r2 * n + c2] != 0) {
            r2 = (row + 1) % n;
            c2 = col;
        }
        row = r2;
        col = c2;
    }
    return sq;
}

/* Every line must add to n(n^2 + 1)/2. Returns 1 if all of them do. */
int check(const int *sq, int n)
{
    int target = n * (n * n + 1) / 2;
    int i, j, r, c, d1 = 0, d2 = 0;

    for (i = 0; i < n; i++) {
        r = c = 0;
        for (j = 0; j < n; j++) {
            r += sq[i * n + j];
            c += sq[j * n + i];
        }
        if (r != target || c != target)
            return 0;
        d1 += sq[i * n + i];
        d2 += sq[i * n + (n - 1 - i)];
    }
    return d1 == target && d2 == target;
}

void print_square(const int *sq, int n)
{
    int i, j;

    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++)
            printf("%4d", sq[i * n + j]);
        printf("\n");
    }
}

int main(void)
{
    int sizes[3];
    int i, n;
    int *sq;

    sizes[0] = 3;
    sizes[1] = 5;
    sizes[2] = 7;
    for (i = 0; i < 3; i++) {
        n = sizes[i];
        sq = make_magic(n);
        if (sq == NULL)
            return 1;
        printf("order %d, every line adds to %d:\n", n, n * (n * n + 1) / 2);
        print_square(sq, n);
        printf("check: %s\n\n", check(sq, n) ? "magic" : "NOT magic");
        free(sq);
    }

    /* Spoil one and the check notices. */
    sq = make_magic(3);
    if (sq == NULL)
        return 1;
    sq[0] ^= sq[1];          /* swap the first two cells */
    sq[1] ^= sq[0];
    sq[0] ^= sq[1];
    printf("after swapping two cells: %s\n", check(sq, 3) ? "magic" : "NOT magic");
    free(sq);
    return 0;
}
