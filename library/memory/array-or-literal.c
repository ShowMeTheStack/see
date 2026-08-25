/*
 * title: char s[] versus char *s
 * level: 2
 * about: Compares an array initialised from a string literal (a private copy on the stack) with a pointer to the literal itself (read-only data).
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char copy[] = "hello";          /* 6 bytes on the stack, a copy of the literal */
    const char *shared = "hello";   /* 4 bytes on the stack, pointing at the literal */

    /*
     * In the memory picture, copy is a little box of six characters in main's
     * frame. shared is a pointer whose arrow leaves the stack and lands in the
     * string literals area.
     */
    printf("copy   at %p, holds \"%s\", sizeof copy   = %u\n",
           (void *)copy, copy, (unsigned)sizeof copy);
    printf("shared at %p, points to %p, sizeof shared = %u\n",
           (void *)&shared, (void *)shared, (unsigned)sizeof shared);

    /* The copy is ours, so changing it is fine. */
    copy[0] = 'j';
    printf("after copy[0] = 'j': copy is \"%s\", the literal is still \"%s\"\n", copy, shared);

    /*
     * shared[0] = 'j' would not compile here because shared points to const
     * char. Without the const it would compile, and See would stop the
     * program: string literals are read-only.
     */

    /* A pointer can be moved; an array name cannot. */
    shared = shared + 1;
    printf("shared + 1 now points at \"%s\"\n", shared);

    /* strlen agrees on both, because both end in the same '\0'. */
    printf("strlen(copy) = %u, strlen(shared) = %u\n",
           (unsigned)strlen(copy), (unsigned)strlen(shared));
    return 0;
}
