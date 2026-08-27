/*
 * title: m[r][c] on the heap with two mallocs
 * level: 3
 * about: Builds a dynamic 2D array with one block of row pointers and one block of cells, so it can be indexed as m[r][c], and multiplies two matrices with it.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * The trick: allocate all the cells in one block, then a small table of
 * row pointers, each aimed at the start of its row inside that block.
 * m[r] is a pointer, m[r][c] an int, exactly as with a real 2D array.
 */
static double **make_matrix(int rows, int cols)
{
    double **m = malloc(rows * sizeof *m);
    double *cells = malloc(rows * cols * sizeof *cells);
    int r, c;

    if (m == NULL || cells == NULL) {
        free(m);
        free(cells);
        return NULL;
    }
    for (r = 0; r < rows; r++) {
        m[r] = cells + r * cols;
        for (c = 0; c < cols; c++)
            m[r][c] = 0.0;
    }
    return m;
}

/* Two blocks to free: the cells (whose address is m[0]) and the table. */
static void free_matrix(double **m)
{
    if (m != NULL) {
        free(m[0]);
        free(m);
    }
}

static void print_matrix(const char *name, double **m, int rows, int cols)
{
    int r, c;
    printf("%s:\n", name);
    for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++)
            printf("%7.1f", m[r][c]);
        printf("\n");
    }
}

int main(void)
{
    double **a = make_matrix(2, 3);
    double **b = make_matrix(3, 2);
    double **p = make_matrix(2, 2);
    int r, c, k;

    if (a == NULL || b == NULL || p == NULL) {
        free_matrix(a);
        free_matrix(b);
        free_matrix(p);
        return 0;
    }

    for (r = 0; r < 2; r++)
        for (c = 0; c < 3; c++) {
            a[r][c] = r + c + 1;
            b[c][r] = (c + 1) * (r == 0 ? 1 : -1);
        }

    /*
     * In the heap panel, follow a: an arrow to a two-entry table, and from
     * each entry an arrow into the middle of one long block of doubles.
     */
    for (r = 0; r < 2; r++)
        for (c = 0; c < 2; c++)
            for (k = 0; k < 3; k++)
                p[r][c] += a[r][k] * b[k][c];

    print_matrix("A (2x3)", a, 2, 3);
    print_matrix("B (3x2)", b, 3, 2);
    print_matrix("A x B", p, 2, 2);

    free_matrix(a);
    free_matrix(b);
    free_matrix(p);
    return 0;
}
