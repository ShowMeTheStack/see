/*
 * title: Trimming and squeezing spaces
 * level: 2
 * about: Cleans up messy input in place by removing leading and trailing blanks and collapsing runs of spaces into one.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* Remove trailing blanks by moving the NUL back, then return a pointer to
   the first non-blank. Nothing is copied: the result points into s. */
static char *trim(char *s)
{
    char *end = s + strlen(s);
    while (end > s && isspace((unsigned char)end[-1]))
        end--;
    *end = '\0';
    while (isspace((unsigned char)*s))
        s++;
    return s;
}

/* Collapse each run of blanks to a single space, with a read pointer and a
   write pointer over the same buffer. The writer never gets ahead of the
   reader, so nothing is overwritten before it has been read. */
static void squeeze(char *s)
{
    char *r = s, *w = s;
    int lastSpace = 0;
    for (; *r; r++) {
        if (isspace((unsigned char)*r)) {
            if (!lastSpace)
                *w++ = ' ';
            lastSpace = 1;
        } else {
            *w++ = *r;
            lastSpace = 0;
        }
    }
    *w = '\0';
}

int main(void)
{
    char a[] = "   hello,     world   ";
    char b[] = "\t tabs\tand   spaces\t\n";
    char c[] = "      ";
    char *t;

    printf("[%s]\n", a);
    t = trim(a);
    /* t is not a: in the memory picture its arrow points three bytes in. */
    printf("trim:     [%s]  starts %d bytes into the array\n", t, (int)(t - a));
    squeeze(t);
    printf("squeeze:  [%s]\n", t);

    t = trim(b);
    squeeze(t);
    printf("tabs:     [%s]\n", t);

    t = trim(c);
    printf("blank:    [%s]  length %lu\n", t, (unsigned long)strlen(t));
    return 0;
}
