/*
 * title: A matrix library on the heap
 * level: 3
 * about: Multiplies, transposes and takes determinants of matrices built by a separate matrix module.
 */

/* See compiles main.c and matrix.c separately and links them into one
 * program. Every Matrix you see in the heap panel is two blocks: the
 * 12-byte header and the block of doubles it points to. */
#include <stdio.h>
#include "matrix.h"

int main(void)
{
    static const double av[6] = { 1, 2, 3,
                                  4, 5, 6 };
    static const double bv[6] = { 7,  8,
                                  9, 10,
                                 11, 12 };
    static const double cv[9] = { 2, -1, 0,
                                  1,  3, 2,
                                  0,  5, 4 };
    Matrix *a, *b, *c, *ab, *at, *ci, *cc;

    a = mat_from(2, 3, av);
    b = mat_from(3, 2, bv);
    c = mat_from(3, 3, cv);

    mat_print("A", a);
    mat_print("B", b);

    /* A 2x3 times a 3x2 gives a 2x2. */
    ab = mat_mul(a, b);
    mat_print("A x B", ab);

    at = mat_transpose(a);
    mat_print("A transposed", at);

    /* Multiplying by the identity changes nothing. */
    ci = mat_identity(3);
    cc = mat_mul(c, ci);
    mat_print("C x I", cc);
    printf("det(C) = %.2f\n", mat_det(c));
    printf("det(A x B) = %.2f\n", mat_det(ab));

    /* Seven matrices, fourteen heap blocks, all handed back. */
    mat_free(a);
    mat_free(b);
    mat_free(c);
    mat_free(ab);
    mat_free(at);
    mat_free(ci);
    mat_free(cc);
    return 0;
}
