/*
 * title: A matrix struct with heap storage
 * level: 3
 * about: Wraps a heap-allocated grid of doubles and its dimensions in a struct, then multiplies, transposes and raises a Fibonacci matrix to a power.
 */
#include <stdio.h>
#include <stdlib.h>

/* The struct is small (rows, cols and one pointer) and can be passed by
   value cheaply; the numbers themselves live in one heap block. Element
   (r, c) is stored at data[r * cols + c], row after row. */
typedef struct {
    int rows, cols;
    double *data;
} Matrix;

Matrix mat_new(int rows, int cols)
{
    Matrix m;
    int i;
    m.rows = rows;
    m.cols = cols;
    m.data = malloc(rows * cols * sizeof *m.data);
    if (m.data == NULL) {
        printf("out of memory\n");
        exit(1);
    }
    for (i = 0; i < rows * cols; i++)
        m.data[i] = 0.0;
    return m;
}

void mat_free(Matrix *m)
{
    free(m->data);
    m->data = NULL;      /* leave no dangling arrow behind */
    m->rows = m->cols = 0;
}

/* A function, rather than a macro, so the debugger can step into it. */
double *at(Matrix m, int r, int c)
{
    return &m.data[r * m.cols + c];
}

Matrix mat_mul(Matrix a, Matrix b)
{
    Matrix p = mat_new(a.rows, b.cols);
    int i, j, k;
    for (i = 0; i < a.rows; i++)
        for (j = 0; j < b.cols; j++)
            for (k = 0; k < a.cols; k++)
                *at(p, i, j) += *at(a, i, k) * *at(b, k, j);
    return p;
}

Matrix mat_transpose(Matrix a)
{
    Matrix t = mat_new(a.cols, a.rows);
    int i, j;
    for (i = 0; i < a.rows; i++)
        for (j = 0; j < a.cols; j++)
            *at(t, j, i) = *at(a, i, j);
    return t;
}

void mat_print(const char *name, Matrix m)
{
    int i, j;
    printf("%s (%dx%d):\n", name, m.rows, m.cols);
    for (i = 0; i < m.rows; i++) {
        for (j = 0; j < m.cols; j++)
            printf(" %8.1f", *at(m, i, j));
        printf("\n");
    }
}

int main(void)
{
    Matrix a = mat_new(2, 3);
    Matrix at_, prod, fib, power;
    int i, n;

    for (i = 0; i < 6; i++)
        a.data[i] = i + 1;            /* 1 2 3 / 4 5 6 */
    mat_print("A", a);

    at_ = mat_transpose(a);
    mat_print("A transposed", at_);

    prod = mat_mul(a, at_);
    mat_print("A times A transposed", prod);

    /* [[1 1] [1 0]] to the n-th power holds Fibonacci numbers. Each round
       makes a new product and frees the old one, so the heap holds only a
       few blocks at any time. */
    fib = mat_new(2, 2);
    fib.data[0] = 1; fib.data[1] = 1; fib.data[2] = 1;
    power = mat_new(2, 2);
    power.data[0] = 1; power.data[3] = 1;    /* identity */
    for (n = 1; n <= 20; n++) {
        Matrix next = mat_mul(power, fib);
        mat_free(&power);
        power = next;
        if (n % 5 == 0)
            printf("F(%d) = %.0f\n", n, power.data[1]);
    }

    mat_free(&a);
    mat_free(&at_);
    mat_free(&prod);
    mat_free(&fib);
    mat_free(&power);
    return 0;
}
