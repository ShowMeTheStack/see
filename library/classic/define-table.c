/*
 * title: A #define processor with a hash table
 * level: 3
 * about: Collects #define lines into a chained hash table with install and lookup, then replaces the defined names in the rest of the text.
 * input: #define MAXLINE 1000\n#define YES 1\n#define NO 0\n#define OFF NO\n#define TABSTOP 8\n#define BUFSIZE MAXLINE\nchar line[MAXLINE];\nint ok = YES, done = NO, light = OFF;\nint tab = TABSTOP;\n#undef NO\nreturn NO + BUFSIZE;\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define HASHSIZE 11   /* tiny on purpose, so some names share a chain */

/* One entry: a name, its replacement text, and the next entry that
   landed in the same bucket. */
struct nlist {
    struct nlist *next;
    char *name;
    char *defn;
};

/* The table is an array of chain heads, all NULL to start with because
   it is static. In the globals panel it is 11 pointers; after the
   defines are read some of them point to chains of heap nodes. */
static struct nlist *hashtab[HASHSIZE];

/* Mix the characters of s into a number and reduce it to a bucket. */
unsigned hash(const char *s)
{
    unsigned hashval;

    for (hashval = 0; *s != '\0'; s++)
        hashval = (unsigned char)*s + 31 * hashval;
    return hashval % HASHSIZE;
}

struct nlist *lookup(const char *s)
{
    struct nlist *np;

    for (np = hashtab[hash(s)]; np != NULL; np = np->next)
        if (strcmp(s, np->name) == 0)
            return np;
    return NULL;
}

char *str_dup(const char *s)
{
    char *p = malloc(strlen(s) + 1);
    if (p != NULL)
        strcpy(p, s);
    return p;
}

/* Put (name, defn) in the table. A new name goes to the front of its
   chain; an existing one has its definition replaced. */
struct nlist *install(const char *name, const char *defn)
{
    struct nlist *np;
    unsigned hashval;

    if ((np = lookup(name)) == NULL) {
        np = malloc(sizeof *np);
        if (np == NULL || (np->name = str_dup(name)) == NULL)
            return NULL;
        hashval = hash(name);
        np->next = hashtab[hashval];
        hashtab[hashval] = np;
    } else
        free(np->defn);
    np->defn = str_dup(defn);
    return np;
}

/* Exercise 6-5: remove a name. We need a pointer to the pointer that
   leads to the node, so that the link can be rerouted round it. */
void undef(const char *name)
{
    struct nlist **pp = &hashtab[hash(name)];
    struct nlist *np;

    for (; *pp != NULL; pp = &(*pp)->next)
        if (strcmp((*pp)->name, name) == 0) {
            np = *pp;
            *pp = np->next;
            free(np->name);
            free(np->defn);
            free(np);
            return;
        }
}

/* Copy a line to stdout, replacing each defined identifier with its
   definition. Replacements are looked up again, so BUFSIZE becomes
   MAXLINE and then 1000. The depth limit stops a name defined as
   itself from looping for ever. */
void expand(const char *s, int depth)
{
    char word[64];
    int n;
    struct nlist *np;

    while (*s != '\0') {
        if (isalpha((unsigned char)*s) || *s == '_') {
            n = 0;
            while ((isalnum((unsigned char)*s) || *s == '_') && n < 63)
                word[n++] = *s++;
            word[n] = '\0';
            if (depth < 8 && (np = lookup(word)) != NULL)
                expand(np->defn, depth + 1);
            else
                fputs(word, stdout);
        } else
            putchar(*s++);
    }
}

int main(void)
{
    char line[200], name[64], defn[128];
    int i;
    struct nlist *np, *next;

    while (fgets(line, sizeof line, stdin) != NULL) {
        if (sscanf(line, "#define %63s %127[^\n]", name, defn) == 2)
            install(name, defn);
        else if (sscanf(line, "#undef %63s", name) == 1)
            undef(name);
        else
            expand(line, 0);
    }

    printf("\nthe table, bucket by bucket:\n");
    for (i = 0; i < HASHSIZE; i++) {
        if (hashtab[i] == NULL)
            continue;
        printf("  [%2d]", i);
        for (np = hashtab[i]; np != NULL; np = np->next)
            printf(" -> %s=%s", np->name, np->defn);
        printf("\n");
    }

    for (i = 0; i < HASHSIZE; i++)
        for (np = hashtab[i]; np != NULL; np = next) {
            next = np->next;          /* read it before freeing np */
            free(np->name);
            free(np->defn);
            free(np);
        }
    return 0;
}
