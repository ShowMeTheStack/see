/*
 * title: The NUL at the end
 * level: 1
 * about: Prints a string byte by byte with its codes, then cuts it short and joins it up again by moving the terminating zero.
 */
#include <stdio.h>

int main(void)
{
    char s[12] = "Good night";   /* 10 letters, a NUL, and one spare byte (also 0) */
    int i;

    /* Every C string function walks until it meets a byte equal to 0.
       That byte, written '\0', is the only thing that marks the end:
       nothing stores the length. */
    for (i = 0; i < 12; i++)
        printf("s[%2d] = %3d  %c\n", i, s[i], s[i] ? s[i] : '.');

    /* Put a NUL in the middle. The bytes after it are untouched, but no
       string function will look past the new end. Watch the array in the
       stack panel: only one byte changes. */
    s[4] = '\0';
    printf("after s[4] = 0:  \"%s\"\n", s);
    printf("but s + 5 still spells \"%s\"\n", s + 5);

    /* Put the space back and the old string returns. */
    s[4] = ' ';
    printf("after s[4] = ' ': \"%s\"\n", s);

    /* '0' (the digit, code 48) is not '\0' (code 0). Mixing them up is a
       classic first mistake. */
    printf("'0' is %d, '\\0' is %d\n", '0', '\0');
    return 0;
}
