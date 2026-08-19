/*
 * title: Writing strcpy and strcat
 * level: 2
 * about: Implements string copy and concatenate by hand, then uses them to build a greeting in a buffer that is checked to be big enough.
 */
#include <stdio.h>
#include <string.h>

/* Copy src, NUL included, into dst. Returns dst like the library does.
   The loop copies a byte and then tests it, so the NUL is copied too and
   ends the loop. */
static char *my_strcpy(char *dst, const char *src)
{
    char *d = dst;
    while ((*d++ = *src++) != '\0')
        ;
    return dst;
}

/* Find dst's NUL, then copy src over it. Note the cost: strcat must walk
   the whole of dst every time, which adds up in a loop of appends. */
static char *my_strcat(char *dst, const char *src)
{
    char *d = dst;
    while (*d)
        d++;
    my_strcpy(d, src);
    return dst;
}

int main(void)
{
    char buf[32];
    const char *parts[4] = { "Good ", "morning, ", "Ada", "!" };
    int i;
    size_t need = 1;   /* room for the NUL */

    /* Neither function knows how big buf is. The caller must check first;
       copying more would run off the end of buf, and See would stop the
       program at the exact byte. */
    for (i = 0; i < 4; i++)
        need += strlen(parts[i]);
    printf("need %lu bytes, have %lu\n", (unsigned long)need, (unsigned long)sizeof buf);
    if (need > sizeof buf)
        return 0;

    my_strcpy(buf, parts[0]);
    printf("[%s]\n", buf);
    for (i = 1; i < 4; i++) {
        my_strcat(buf, parts[i]);
        printf("[%s]\n", buf);
    }
    /* The return value allows chaining. */
    printf("[%s]\n", my_strcat(my_strcpy(buf, "abc"), "def"));
    return 0;
}
