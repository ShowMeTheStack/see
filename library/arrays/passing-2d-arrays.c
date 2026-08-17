/*
 * title: Handing a 2D array to a function
 * level: 3
 * about: Passes the same 3x4 table to functions three ways: fixed columns, pointer to a row, and a flat int pointer.
 */
#include <stdio.h>

#define COLS 4

/* Way 1: the compiler must know the column count to find t[r][c], because
   it computes r * COLS + c. Only the first dimension may be left empty. */
static int total_fixed(int t[][COLS], int rows)
{
    int r, c, s = 0;
    for (r = 0; r < rows; r++)
        for (c = 0; c < COLS; c++)
            s += t[r][c];
    return s;
}

/* Way 2: what way 1 really means. p is a pointer to a whole row of
   4 ints, so p + 1 jumps 16 bytes to the next row. */
static void double_row(int (*p)[COLS], int which)
{
    int c;
    printf("sizeof *p = %lu: one step of p is one full row\n", (unsigned long)sizeof *p);
    for (c = 0; c < COLS; c++)
        (*(p + which))[c] *= 2;
}

/* Way 3: the rows sit end to end in memory, so the table can be walked as
   one flat run of rows*cols ints. Any column count works, at the price of
   doing the index sum by hand. */
static void print_flat(const int *base, int rows, int cols)
{
    int r, c;
    for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++)
            printf("%4d", base[r * cols + c]);
        printf("\n");
    }
}

int main(void)
{
    int t[3][COLS] = { { 1, 2, 3, 4 },
                       { 5, 6, 7, 8 },
                       { 9, 10, 11, 12 } };

    printf("sizeof t = %lu, sizeof t[0] = %lu\n",
           (unsigned long)sizeof t, (unsigned long)sizeof t[0]);
    printf("t at %p, t[1] at %p, t[2] at %p\n", (void *)t, (void *)t[1], (void *)t[2]);
    printf("total = %d\n", total_fixed(t, 3));

    /* t on its own decays to &t[0], a pointer to the first row. */
    double_row(t, 1);
    /* &t[0][0] is a plain int pointer to the very first number. */
    print_flat(&t[0][0], 3, COLS);
    printf("total = %d\n", total_fixed(t, 3));
    return 0;
}
