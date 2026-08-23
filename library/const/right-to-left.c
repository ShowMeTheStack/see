/*
 * title: Reading declarations right to left
 * level: 3
 * about: Declares a ladder of increasingly tangled const pointer types and reads each one aloud from the name outwards.
 */
#include <stdio.h>

int main(void)
{
    char c = 'x';
    char d = 'y';
    char *pc = &c;
    const char *cpc = &c;

    /*
     * Start at the name and read to the left, saying "pointer to" for
     * each * and "const" where you meet it.
     */

    /* s1 is a pointer to char. */
    char *s1 = &c;

    /* s2 is a pointer to const char. */
    const char *s2 = &c;

    /* s3 is a const pointer to char. */
    char * const s3 = &c;

    /* s4 is a const pointer to const char. */
    const char * const s4 = &c;

    /* s5 is a pointer to pointer to const char. */
    const char **s5 = &cpc;

    /* s6 is a pointer to const pointer to char. */
    char * const *s6 = &s3;

    /* s7 is a const pointer to pointer to char. */
    char ** const s7 = &pc;

    /* s8 is a const pointer to const pointer to const char. Everything is locked. */
    const char * const * const s8 = &s4;

    /* What each one may change, tested for real: */
    s1 = &d;  *s1 = 'Y';           /* moves, writes */
    s2 = &d;                       /* moves only */
    *s3 = 'X';                     /* writes only */
    *s5 = &d;                      /* changes cpc: the middle pointer is not const */
    **s6 = 'Z';                    /* the char at the end of s6's chain is plain char */
    *s7 = &d;                      /* changes pc */
    **s7 = 'W';                    /* d through pc */

    printf("c = %c, d = %c\n", c, d);
    printf("*s2 = %c, *s4 = %c, **s5 = %c, **s8 = %c\n", *s2, *s4, **s5, **s8);

    /*
     * And the refusals:
     *     **s5 = 'q';  error: assignment of read-only location '**s5'
     *     *s6 = &d;    error: assignment of read-only location '*s6'
     *     s7 = NULL;   error: assignment of read-only variable 's7'
     */
    return 0;
}
