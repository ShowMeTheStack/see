/*
 * title: Passing 2D arrays to functions
 * level: 3
 * about: Multiplies, transposes and prints fixed-size matrices, and rotates a picture by composing those functions.
 */
#include <stdio.h>

#define N 3

/* A 2D array parameter must state every size except the first, so
   the function knows how long each row is: m[i][j] is found at
   (i * N + j) ints from the start. "int m[][N]" means "pointer to rows
   of N ints". */

void print(const char *name, int m[][N])
{
    int i, j;

    printf("%s\n", name);
    for (i = 0; i < N; i++) {
        for (j = 0; j < N; j++)
            printf("%4d", m[i][j]);
        printf("\n");
    }
}

/* The result goes into a third matrix supplied by the caller, because
   a function cannot return an array. */
void multiply(int a[][N], int b[][N], int out[][N])
{
    int i, j, k;

    for (i = 0; i < N; i++)
        for (j = 0; j < N; j++) {
            out[i][j] = 0;
            for (k = 0; k < N; k++)
                out[i][j] += a[i][k] * b[k][j];
        }
}

void transpose(int m[][N], int out[][N])
{
    int i, j;

    for (i = 0; i < N; i++)
        for (j = 0; j < N; j++)
            out[j][i] = m[i][j];
}

/* Reverse the order of the columns in place. */
void mirror(int m[][N])
{
    int i, j, t;

    for (i = 0; i < N; i++)
        for (j = 0; j < N / 2; j++) {
            t = m[i][j];
            m[i][j] = m[i][N - 1 - j];
            m[i][N - 1 - j] = t;
        }
}

void copy(int from[][N], int to[][N])
{
    int i, j;

    for (i = 0; i < N; i++)
        for (j = 0; j < N; j++)
            to[i][j] = from[i][j];
}

int main(void)
{
    int a[N][N], id[N][N], t[N][N], r[N][N];
    int i, j;

    for (i = 0; i < N; i++)
        for (j = 0; j < N; j++) {
            a[i][j] = i * N + j + 1;
            id[i][j] = (i == j);
        }

    print("a:", a);

    /* Multiplying by the identity gives a back: a quick self-test. */
    multiply(a, id, r);
    print("a times identity:", r);

    multiply(a, a, r);
    print("a squared:", r);

    /* Rotate 90 degrees clockwise = transpose, then mirror each row.
       Two simple functions combine into a new trick. */
    transpose(a, t);
    mirror(t);
    print("a rotated clockwise:", t);

    /* Four rotations bring it home. */
    copy(t, r);
    for (i = 0; i < 3; i++) {
        transpose(r, t);
        mirror(t);
        copy(t, r);
    }
    print("after four rotations:", r);
    return 0;
}
