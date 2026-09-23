/* matrix.h - matrices of doubles on the heap.
 * A Matrix is a small header (rows, cols) plus one block of rows*cols
 * doubles stored row after row. Element (r, c) is at data[r * cols + c]. */
#ifndef MATRIX_H
#define MATRIX_H

typedef struct {
    int rows;
    int cols;
    double *data;
} Matrix;

Matrix *mat_new(int rows, int cols);
void mat_free(Matrix *m);
Matrix *mat_identity(int n);
Matrix *mat_from(int rows, int cols, const double *values);
double mat_get(const Matrix *m, int r, int c);
void mat_set(Matrix *m, int r, int c, double v);
Matrix *mat_mul(const Matrix *a, const Matrix *b);
Matrix *mat_transpose(const Matrix *m);
double mat_det(const Matrix *m);
void mat_print(const char *label, const Matrix *m);

#endif
