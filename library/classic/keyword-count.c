/*
 * title: Counting C keywords with an array of structs
 * level: 3
 * about: Counts C keywords in some source text using a sorted table of structs and binary search over it, as in section 6.3.
 */
#include <stdio.h>
#include <string.h>
#include <ctype.h>

/* One struct per keyword: a pointer to the word and its count. The
   table must be sorted, because binary search relies on it. In the
   globals panel keytab is an array of 8-byte structs; each word field
   is an arrow to a string literal. */
struct key {
    const char *word;
    int count;
};

struct key keytab[] = {
    { "auto", 0 }, { "break", 0 }, { "case", 0 }, { "char", 0 },
    { "const", 0 }, { "continue", 0 }, { "default", 0 }, { "do", 0 },
    { "double", 0 }, { "else", 0 }, { "enum", 0 }, { "extern", 0 },
    { "float", 0 }, { "for", 0 }, { "goto", 0 }, { "if", 0 },
    { "int", 0 }, { "long", 0 }, { "register", 0 }, { "return", 0 },
    { "short", 0 }, { "signed", 0 }, { "sizeof", 0 }, { "static", 0 },
    { "struct", 0 }, { "switch", 0 }, { "typedef", 0 }, { "union", 0 },
    { "unsigned", 0 }, { "void", 0 }, { "volatile", 0 }, { "while", 0 }
};

/* The number of entries, worked out by the compiler: total size divided
   by the size of one entry. Add a keyword and NKEYS follows. */
#define NKEYS ((int)(sizeof keytab / sizeof keytab[0]))

/* Binary search on the word field. Returns a pointer to the entry, or
   NULL. Returning a pointer rather than an index is the section 6.4
   version; the caller then writes p->count++. */
struct key *binsearch(const char *word, struct key *tab, int n)
{
    struct key *low = &tab[0];
    struct key *high = &tab[n];     /* one past the end: allowed */
    struct key *mid;
    int cond;

    while (low < high) {
        /* Not (low + high) / 2: adding two pointers is meaningless in C.
           Subtracting them gives a count, which can be halved. */
        mid = low + (high - low) / 2;
        if ((cond = strcmp(word, mid->word)) < 0)
            high = mid;
        else if (cond > 0)
            low = mid + 1;
        else
            return mid;
    }
    return NULL;
}

int main(void)
{
    const char *text =
        "int main(void) { int i; static char buf[10];\n"
        "  for (i = 0; i < 10; i++) { if (i % 2) continue; else buf[i] = 0; }\n"
        "  while (i > 0) { i--; if (i == 3) break; }\n"
        "  switch (i) { case 1: return 1; default: return sizeof(int); }\n"
        "}\n";
    const char *p = text;
    char word[32];
    int n, total = 0;
    struct key *k;

    while (*p != '\0') {
        if (isalpha((unsigned char)*p)) {
            n = 0;
            while (isalnum((unsigned char)*p) && n < 31)
                word[n++] = *p++;
            word[n] = '\0';
            if ((k = binsearch(word, keytab, NKEYS)) != NULL) {
                k->count++;
                total++;
            }
        } else
            p++;
    }

    printf("%d keywords in the table, %d found in the text:\n", NKEYS, total);
    for (k = keytab; k < keytab + NKEYS; k++)
        if (k->count > 0)
            printf("%4d %s\n", k->count, k->word);
    return 0;
}
