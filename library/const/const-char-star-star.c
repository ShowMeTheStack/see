/*
 * title: Why char ** does not convert to const char **
 * level: 4
 * about: Explains, with the exact trick it would allow, why the compiler refuses to turn char ** into const char ** although char * to const char * is fine.
 */
#include <stdio.h>

/* Prints a list of strings. It promises not to change the strings OR the list. */
void print_all(const char * const *list, int n)
{
    int i;
    for (i = 0; i < n; i++)
        printf("  %s\n", list[i]);
}

int main(void)
{
    char a[] = "alpha";
    char b[] = "beta";
    char *words[2];
    const char *literal = "gamma";
    char *p;
    char **pp = &p;

    words[0] = a;
    words[1] = b;

    /*
     * char ** to const char * const * is actually safe: the const at the
     * middle level means nobody can store anything into the list through
     * this pointer. C++ accepts it silently, but C's rule only adds const
     * one level deep, so C still warns:
     *     passing argument from incompatible pointer type
     *     ('char **' to 'const char *const *')
     * Here an explicit cast is the right answer, because we know it is safe.
     */
    print_all((const char * const *)words, 2);

    /*
     * Now the forbidden one. Suppose this were allowed silently:
     *
     *     const char **cpp = pp;     (char ** to const char **)
     *     *cpp = literal;            fine: *cpp is a const char *
     *     *p = 'G';                  p now points at the literal!
     *
     * Step two stores the address of read-only text into p, because *cpp
     * and p are the same object. Step three then writes into the literal
     * with no cast anywhere. To close that hole C refuses the first line:
     *     warning: initialization from incompatible pointer type
     *     ('char **' to 'const char **')
     * (gcc and See warn; strictly it is a constraint violation.)
     */
    p = a;
    *pp = b;                    /* the honest version: pp changes p to point at b */
    printf("p now reads %s\n", p);

    /* const char ** is perfectly usable when the pointer you point at is const char * too. */
    {
        const char **cpp = &literal;
        printf("through cpp: %s\n", *cpp);
    }
    return 0;
}
