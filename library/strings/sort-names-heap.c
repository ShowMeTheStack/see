/*
 * title: Sorting names kept on the heap
 * level: 3
 * about: Reads names into exactly-sized heap copies made by a hand-written strdup, sorts the pointers with qsort, and frees every block.
 * input: Rosalind\nalan\nGrace\nAda\nedsger\nBarbara\nKen\nlinus\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAXN 20

/* strdup is not in C89, so here it is: measure, allocate one more byte for
   the NUL, copy. Each call adds one block to the heap picture, sized to
   the name. */
static char *copy_string(const char *s)
{
    char *p = malloc(strlen(s) + 1);
    if (p != NULL)
        strcpy(p, s);
    return p;
}

/* qsort hands the comparison function pointers to two elements. The
   elements are char pointers, so these arrive as pointers to char
   pointers and must be unwrapped once. */
static int by_name(const void *a, const void *b)
{
    const char *x = *(const char * const *)a;
    const char *y = *(const char * const *)b;
    return strcmp(x, y);
}

/* The same but ignoring case, so "alan" sits next to "Ada". */
static int by_name_nocase(const void *a, const void *b)
{
    const char *x = *(const char * const *)a;
    const char *y = *(const char * const *)b;
    while (*x && tolower((unsigned char)*x) == tolower((unsigned char)*y)) {
        x++;
        y++;
    }
    return tolower((unsigned char)*x) - tolower((unsigned char)*y);
}

static void list(const char *title, char **names, int n)
{
    int i;
    printf("%s:", title);
    for (i = 0; i < n; i++)
        printf(" %s", names[i]);
    printf("\n");
}

int main(void)
{
    char line[64];             /* one reusable buffer for reading */
    char *names[MAXN];         /* the pointers, on the stack */
    int n = 0, i;

    while (n < MAXN && scanf("%63s", line) == 1) {
        /* names[n] = line would store the same address every time, and all
           the names would end up as the last one read. A copy is needed. */
        names[n] = copy_string(line);
        if (names[n] == NULL)
            break;
        n++;
    }
    list("as read", names, n);

    /* Only the 4-byte pointers move; the heap blocks stay where they are.
       Watch the arrows from names[] swap targets after this line. */
    qsort(names, n, sizeof names[0], by_name);
    list("strcmp order", names, n);
    qsort(names, n, sizeof names[0], by_name_nocase);
    list("ignoring case", names, n);

    for (i = 0; i < n; i++)
        free(names[i]);
    return 0;
}
