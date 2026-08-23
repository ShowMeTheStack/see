/*
 * title: const and a pointer typedef
 * level: 3
 * about: Shows that const applied to a typedef for char * makes the pointer const, not the characters, and how to write the typedef you meant.
 */
#include <stdio.h>

typedef char *str;               /* str means "pointer to char" */
typedef const char *cstr;        /* cstr means "pointer to const char" */

int main(void)
{
    char name[] = "kernighan";
    char other[] = "ritchie";

    /*
     * A typedef is not a macro. "const str s" does NOT become
     * "const char *s". The const applies to the whole type str, which is
     * a pointer, so s is a const pointer to (changeable) char:
     *     const str s   is   char * const s
     */
    const str s = name;

    /* And this one really protects the letters. */
    cstr t = name;

    s[0] = 'K';                       /* allowed! the chars are not const */
    printf("s: %s\n", s);

    /*
     *     s = other;
     * fails: error: assignment of read-only variable 's'
     * which surprises people who expected the letters to be protected.
     */

    t = other;                        /* allowed: t itself is not const */
    printf("t: %s\n", t);

    /*
     *     t[0] = 'R';
     * fails: error: assignment of read-only location 't[0]'
     */

    /* "str const s" means the same as "const str s"; writing const after the typedef name makes the trap easier to see. */
    {
        str const u = other;
        u[0] = 'R';
        printf("u: %s\n", u);
    }
    return 0;
}
