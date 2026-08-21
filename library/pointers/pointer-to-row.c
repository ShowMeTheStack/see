/*
 * title: A pointer to a whole row, int (*p)[4]
 * level: 3
 * about: Walks a 3 by 4 matrix one row at a time with a pointer to an array of four ints.
 */
#include <stdio.h>

/*
 * A 2D array parameter really arrives as a pointer to its first row.
 * "int m[][4]" and "int (*m)[4]" mean the same thing here.
 */
int row_total(int (*row)[4])
{
    int k, s = 0;
    for (k = 0; k < 4; k++)
        s += (*row)[k];          /* *row is the whole row, an int[4] */
    return s;
}

int main(void)
{
    int m[3][4];
    int (*r)[4];      /* pointer to an array of 4 ints: the parentheses matter */
    int *cell;        /* plain pointer to one int, for comparison */
    int i, j;

    for (i = 0; i < 3; i++)
        for (j = 0; j < 4; j++)
            m[i][j] = 10 * i + j;

    /*
     * Without the parentheses, int *r[4] would be an array of four
     * pointers. With them, r points to one row of 4 ints, so r + 1 jumps
     * a whole row: 16 bytes. Watch r's arrow land on each row in turn.
     */
    for (r = m; r < m + 3; r++)
        printf("row %ld total %d\n", (long)(r - m), row_total(r));

    r = m;
    cell = &m[0][0];
    printf("sizeof *r = %lu, sizeof *cell = %lu\n",
           (unsigned long)sizeof *r, (unsigned long)sizeof *cell);
    printf("r+1    is %ld bytes after r\n", (long)((char *)(r + 1) - (char *)r));
    printf("cell+1 is %ld bytes after cell\n", (long)((char *)(cell + 1) - (char *)cell));

    /* r[i][j] works because r[i] is *(r + i), a row, and a row can be indexed. */
    printf("r[2][3] = %d, (*(r + 2))[3] = %d, *(*(r + 2) + 3) = %d\n",
           r[2][3], (*(r + 2))[3], *(*(r + 2) + 3));

    /* The rows sit end to end, so a plain int pointer can walk all 12 cells. */
    printf("flat walk:");
    for (cell = &m[0][0]; cell < &m[0][0] + 12; cell++)
        printf(" %d", *cell);
    printf("\n");
    return 0;
}
