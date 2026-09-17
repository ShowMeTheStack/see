/*
 * title: Matrix multiplication with row pointers
 * level: 3
 * about: Builds matrices as an array of row pointers into one heap block, multiplies them, and raises the Fibonacci matrix to a power.
 */
#include <stdio.h>
#include <stdlib.h>

/* A matrix that can be indexed as m->a[i][j] like a real 2D array.
   a points to an array of row pointers; each row pointer points into
   one shared block of numbers. In the memory picture you can follow
   the arrows: struct -> row pointers -> the rows of data. */
typedef struct {
    int rows, cols;
    long **a;
} Matrix;

Matrix *mat_new(int rows, int cols)
{
    Matrix *m = malloc(sizeof *m);
    long *data;
    int i, j;

    m->rows = rows;
    m->cols = cols;
    m->a = malloc(rows * sizeof *m->a);
    data = malloc(rows * cols * sizeof *data);
    for (i = 0; i < rows; i++) {
        m->a[i] = data + i * cols;    /* row i starts i*cols numbers in */
        for (j = 0; j < cols; j++)
            m->a[i][j] = 0;
    }
    return m;
}

void mat_free(Matrix *m)
{
    free(m->a[0]);   /* the data block starts where row 0 starts */
    free(m->a);
    free(m);
}

/* (rows x n) times (n x cols). Entry [i][j] is row i of x "dotted" with
   column j of y: multiply pairwise and add. */
Matrix *mat_mul(const Matrix *x, const Matrix *y)
{
    Matrix *r;
    int i, j, k;

    if (x->cols != y->rows)
        return NULL;
    r = mat_new(x->rows, y->cols);
    for (i = 0; i < x->rows; i++)
        for (j = 0; j < y->cols; j++)
            for (k = 0; k < x->cols; k++)
                r->a[i][j] += x->a[i][k] * y->a[k][j];
    return r;
}

void mat_print(const char *name, const Matrix *m)
{
    int i, j;

    printf("%s (%d x %d):\n", name, m->rows, m->cols);
    for (i = 0; i < m->rows; i++) {
        for (j = 0; j < m->cols; j++)
            printf("%11ld", m->a[i][j]);
        printf("\n");
    }
}

int main(void)
{
    Matrix *a = mat_new(2, 3), *b = mat_new(3, 2), *c;
    Matrix *f, *p, *t;
    int i, j, n;

    for (i = 0; i < 2; i++)
        for (j = 0; j < 3; j++) {
            a->a[i][j] = i * 3 + j + 1;      /* 1 2 3 / 4 5 6 */
            b->a[j][i] = (j + 1) * (i + 1);  /* columns 1,2,3 and 2,4,6 */
        }
    c = mat_mul(a, b);
    mat_print("A", a);
    mat_print("B", b);
    mat_print("A x B", c);
    mat_free(a);
    mat_free(b);
    mat_free(c);

    /* [[1,1],[1,0]] to the power n holds Fibonacci numbers:
       [[F(n+1), F(n)], [F(n), F(n-1)]]. Square-and-multiply needs only
       about log2(n) multiplications, so F(40) takes a handful. */
    n = 40;
    f = mat_new(2, 2);
    f->a[0][0] = f->a[0][1] = f->a[1][0] = 1;
    p = mat_new(2, 2);
    p->a[0][0] = p->a[1][1] = 1;          /* the identity */
    while (n > 0) {
        if (n & 1) {
            t = mat_mul(p, f);
            mat_free(p);
            p = t;
        }
        n >>= 1;
        if (n > 0) {
            t = mat_mul(f, f);
            mat_free(f);
            f = t;
        }
    }
    mat_print("[[1,1],[1,0]]^40", p);
    printf("so F(40) = %ld\n", p->a[0][1]);
    mat_free(f);
    mat_free(p);
    return 0;
}
