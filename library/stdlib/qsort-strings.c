/*
 * title: Sorting an array of strings with qsort
 * level: 3
 * about: Sorts an array of char pointers alphabetically, by length and case-blind, showing why the comparator receives pointers to pointers.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

/*
 * The array holds char * values. qsort passes the comparator a pointer
 * to each ELEMENT, so each argument is really a char ** in disguise.
 * Passing them straight to strcmp would compare the bytes of the
 * pointers themselves: a classic bug.
 */
static int alpha(const void *a, const void *b)
{
    const char *x = *(const char * const *)a;
    const char *y = *(const char * const *)b;
    return strcmp(x, y);
}

static int shortest_first(const void *a, const void *b)
{
    const char *x = *(const char * const *)a;
    const char *y = *(const char * const *)b;
    size_t lx = strlen(x), ly = strlen(y);
    if (lx != ly)
        return lx < ly ? -1 : 1;
    return strcmp(x, y);     /* equal lengths: alphabetical */
}

/* C89 has no strcasecmp, so compare letter by letter. */
static int nocase(const void *a, const void *b)
{
    const unsigned char *x = *(const unsigned char * const *)a;
    const unsigned char *y = *(const unsigned char * const *)b;
    while (*x && tolower(*x) == tolower(*y)) {
        x++;
        y++;
    }
    return tolower(*x) - tolower(*y);
}

static void show(const char *title, char **v, int n)
{
    int i;
    printf("%-16s", title);
    for (i = 0; i < n; i++)
        printf(" %s", v[i]);
    printf("\n");
}

int main(void)
{
    char *words[8];
    int n = 8;

    words[0] = "pear";
    words[1] = "Fig";
    words[2] = "banana";
    words[3] = "apple";
    words[4] = "Cherry";
    words[5] = "kiwi";
    words[6] = "date";
    words[7] = "Elderberry";

    show("as given:", words, n);
    qsort(words, n, sizeof words[0], alpha);
    show("strcmp order:", words, n);   /* capitals first: 'C' < 'a' in ASCII */
    qsort(words, n, sizeof words[0], nocase);
    show("ignoring case:", words, n);
    qsort(words, n, sizeof words[0], shortest_first);
    show("by length:", words, n);

    /*
     * Only the 4-byte pointers in words move; the strings stay where
     * they are among the literals. In See, watch the arrows from words
     * re-cross each other after every qsort.
     */
    return 0;
}
