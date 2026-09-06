/*
 * title: Taming declarations with typedef
 * level: 2
 * about: Declares the same function-pointer variables, arrays and parameters twice, once spelled out and once with typedefs, and shows they behave the same.
 */
#include <stdio.h>

int inc(int x) { return x + 1; }
int dbl(int x) { return x * 2; }
int sqr(int x) { return x * x; }

/*
 * Two styles of typedef:
 *   intfn_ptr is "pointer to function (int) returning int"
 *   intfn     is "function (int) returning int" itself; you then write
 *             intfn * to get the pointer, which some people find clearer
 *             because the star stays visible.
 */
typedef int (*intfn_ptr)(int);
typedef int intfn(int);

/* Spelled out: a function taking a pointer-to-function and an int. */
int apply_raw(int (*f)(int), int x) { return f(x); }

/* The same with the typedef. */
int apply(intfn_ptr f, int x) { return f(x); }

/* And with the function-type typedef. */
int apply_twice(intfn *f, int x) { return f(f(x)); }

int main(void)
{
    /* An array of three pointers, spelled out. */
    int (*raw[3])(int);
    /* The same array with a typedef. */
    intfn_ptr nice[3];
    int i;

    raw[0] = inc; raw[1] = dbl; raw[2] = sqr;
    nice[0] = inc; nice[1] = dbl; nice[2] = sqr;

    /*
     * In See both arrays look identical in the frame: three 4-byte
     * pointers each. A typedef creates a new name, not a new type.
     */
    printf("sizeof raw = %d, sizeof nice = %d\n", (int)sizeof raw, (int)sizeof nice);

    for (i = 0; i < 3; i++)
        printf("f%d: apply_raw(5) = %3d  apply(5) = %3d  apply_twice(5) = %3d  same pointer: %s\n",
               i, apply_raw(raw[i], 5), apply(nice[i], 5), apply_twice(nice[i], 5),
               raw[i] == nice[i] ? "yes" : "no");
    return 0;
}
