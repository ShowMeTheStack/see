/*
 * title: Three ways to write strlen
 * level: 1
 * about: Counts the characters of a string with an index, with a moving pointer, and by subtracting two pointers.
 */
#include <stdio.h>
#include <string.h>

/* With an index: the most readable. */
static int len_index(const char *s)
{
    int n = 0;
    while (s[n] != '\0')
        n++;
    return n;
}

/* With a counter and a moving pointer. s is a local copy of the caller's
   pointer, so moving it here does not move theirs. */
static int len_walk(const char *s)
{
    int n = 0;
    while (*s++)
        n++;
    return n;
}

/* Find the NUL, then subtract. Pointer minus pointer counts elements
   between them. Step through and watch p's arrow slide along the string
   in the memory picture while s stays at the start. */
static int len_diff(const char *s)
{
    const char *p = s;
    while (*p)
        p++;
    return (int)(p - s);
}

int main(void)
{
    const char *tests[4] = { "", "a", "hello", "the quick brown fox" };
    int i;

    for (i = 0; i < 4; i++)
        printf("\"%s\"%*s index %2d  walk %2d  diff %2d  library %2lu\n",
               tests[i], 20 - len_index(tests[i]), "", len_index(tests[i]), len_walk(tests[i]),
               len_diff(tests[i]), (unsigned long)strlen(tests[i]));
    return 0;
}
