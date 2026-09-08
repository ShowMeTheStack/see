/*
 * title: Multi-statement macros and do { } while (0)
 * level: 3
 * about: Shows why a SWAP macro made of several statements breaks inside if/else, and how wrapping it in do { } while (0) fixes it.
 */
#include <stdio.h>

/*
 * Attempt 1: braces only. It works when used on its own line, but
 *     if (x > y) SWAP_BRACES(x, y); else ...
 * fails to compile: the ; after the } ends the if, so the else has
 * no if to belong to. (It is shown here unused, as a warning sign.)
 */
#define SWAP_BRACES(a, b) { int t_ = (a); (a) = (b); (b) = t_; }

/*
 * Attempt 2 is worse because it compiles: no braces at all. Under an
 * if without braces, only the first statement is guarded and the other
 * two always run.
 */
#define SWAP_NAKED(a, b) t_ = (a); (a) = (b); (b) = t_

/*
 * The fix: do { ... } while (0) is one statement that runs its body
 * exactly once and needs a ; after it, just like a function call. It
 * fits anywhere a statement fits, including between if and else.
 */
#define SWAP(a, b)              \
    do {                        \
        int t_ = (a);           \
        (a) = (b);              \
        (b) = t_;               \
    } while (0)

/* Sort three numbers with compare-and-swap steps. */
static void sort3(int *p, int *q, int *r)
{
    if (*p > *q) SWAP(*p, *q); else printf("  %d and %d already in order\n", *p, *q);
    if (*q > *r) SWAP(*q, *r);
    if (*p > *q) SWAP(*p, *q);
}

int main(void)
{
    int x = 9, y = 4, z = 6;
    int a = 1, b = 2;
    int t_;

    sort3(&x, &y, &z);
    printf("sorted: %d %d %d\n", x, y, z);

    x = 3; y = 5; z = 8;
    sort3(&x, &y, &z);
    printf("sorted: %d %d %d\n", x, y, z);

    /*
     * Now the naked macro. a < b is false, so nothing should happen,
     * yet two of the three statements run anyway:
     *     if (a > b) t_ = a;   a = b;   b = t_;
     * t_ is set first so that nothing reads an uninitialised value.
     */
    t_ = 0;
    if (a > b)
        SWAP_NAKED(a, b);
    printf("naked swap of 1, 2 under a false if: a = %d, b = %d\n", a, b);

    a = 1; b = 2;
    if (a > b)
        SWAP(a, b);
    printf("do-while swap under a false if:      a = %d, b = %d\n", a, b);

    /*
     * Step through SWAP in See: the block's own t_ appears in the locals
     * pane for three lines, shadowing nothing visible to the caller,
     * and disappears when the do loop ends.
     */
    return 0;
}
