/* matrix.c - every function that makes a matrix returns a new one, and
 * the caller frees it with mat_free. One rule, no surprises. */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include "matrix.h"

Matrix *mat_new(int rows, int cols)
{
    Matrix *m = malloc(sizeof *m);
    int i;

    if (m == NULL) {
        return NULL;
    }
    m->data = malloc(rows * cols * sizeof(double));
    if (m->data == NULL) {
        free(m);
        return NULL;
    }
    m->rows = rows;
    m->cols = cols;
    for (i = 0; i < rows * cols; i++) {
        m->data[i] = 0.0;
    }
    return m;
}

void mat_free(Matrix *m)
{
    if (m != NULL) {
        free(m->data);
        free(m);
    }
}

Matrix *mat_identity(int n)
{
    Matrix *m = mat_new(n, n);
    int i;

    for (i = 0; i < n; i++) {
        mat_set(m, i, i, 1.0);
    }
    return m;
}

Matrix *mat_from(int rows, int cols, const double *values)
{
    Matrix *m = mat_new(rows, cols);
    int i;

    for (i = 0; i < rows * cols; i++) {
        m->data[i] = values[i];
    }
    return m;
}

double mat_get(const Matrix *m, int r, int c)
{
    return m->data[r * m->cols + c];
}

void mat_set(Matrix *m, int r, int c, double v)
{
    m->data[r * m->cols + c] = v;
}

/* Row of a times column of b. a must be n x k and b k x p. */
Matrix *mat_mul(const Matrix *a, const Matrix *b)
{
    Matrix *m;
    int i, j, k;
    double sum;

    if (a->cols != b->rows) {
        return NULL;
    }
    m = mat_new(a->rows, b->cols);
    for (i = 0; i < a->rows; i++) {
        for (j = 0; j < b->cols; j++) {
            sum = 0.0;
            for (k = 0; k < a->cols; k++) {
                sum += mat_get(a, i, k) * mat_get(b, k, j);
            }
            mat_set(m, i, j, sum);
        }
    }
    return m;
}

Matrix *mat_transpose(const Matrix *m)
{
    Matrix *t = mat_new(m->cols, m->rows);
    int i, j;

    for (i = 0; i < m->rows; i++) {
        for (j = 0; j < m->cols; j++) {
            mat_set(t, j, i, mat_get(m, i, j));
        }
    }
    return t;
}

/* Determinant by Gaussian elimination on a scratch copy, with partial
 * pivoting (swap in the row with the biggest entry) to keep it stable. */
double mat_det(const Matrix *m)
{
    Matrix *w;
    int n = m->rows;
    int i, j, k, best;
    double det = 1.0;
    double f, t;

    if (m->rows != m->cols) {
        return 0.0;
    }
    w = mat_from(n, n, m->data);
    for (i = 0; i < n; i++) {
        best = i;
        for (k = i + 1; k < n; k++) {
            if (fabs(mat_get(w, k, i)) > fabs(mat_get(w, best, i))) {
                best = k;
            }
        }
        if (mat_get(w, best, i) == 0.0) {
            mat_free(w);
            return 0.0;
        }
        if (best != i) {
            for (j = 0; j < n; j++) {
                t = mat_get(w, i, j);
                mat_set(w, i, j, mat_get(w, best, j));
                mat_set(w, best, j, t);
            }
            det = -det;
        }
        det *= mat_get(w, i, i);
        for (k = i + 1; k < n; k++) {
            f = mat_get(w, k, i) / mat_get(w, i, i);
            for (j = i; j < n; j++) {
                mat_set(w, k, j, mat_get(w, k, j) - f * mat_get(w, i, j));
            }
        }
    }
    mat_free(w);
    return det;
}

void mat_print(const char *label, const Matrix *m)
{
    int i, j;

    printf("%s (%dx%d)\n", label, m->rows, m->cols);
    for (i = 0; i < m->rows; i++) {
        printf("  [");
        for (j = 0; j < m->cols; j++) {
            printf(" %7.2f", mat_get(m, i, j));
        }
        printf(" ]\n");
    }
}
