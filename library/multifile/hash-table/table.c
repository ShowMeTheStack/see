/* table.c - an array of buckets, each the head of a linked list.
 * The hash function picks the bucket; words that land in the same bucket
 * share a chain. With 7 buckets and a dozen or so words, chains form:
 * the bucket view at the end shows it. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "table.h"

struct table {
    struct entry **buckets;     /* a heap array of list heads */
    int nbuckets;
    int size;
};

/* djb2, by Dan Bernstein: start at 5381, then hash = hash * 33 + c.
 * unsigned arithmetic wraps cleanly, with no overflow to worry about. */
static unsigned long hash(const char *s)
{
    unsigned long h = 5381;
    while (*s != '\0') {
        h = h * 33 + (unsigned char)*s++;
    }
    return h;
}

Table *table_new(int nbuckets)
{
    Table *t = malloc(sizeof *t);

    if (t == NULL) {
        return NULL;
    }
    t->buckets = calloc(nbuckets, sizeof *t->buckets);   /* all NULL */
    if (t->buckets == NULL) {
        free(t);
        return NULL;
    }
    t->nbuckets = nbuckets;
    t->size = 0;
    return t;
}

void table_free(Table *t)
{
    int b;
    struct entry *e, *next;

    for (b = 0; b < t->nbuckets; b++) {
        for (e = t->buckets[b]; e != NULL; e = next) {
            next = e->next;
            free(e->word);
            free(e);
        }
    }
    free(t->buckets);
    free(t);
}

void table_add(Table *t, const char *word)
{
    unsigned long b = hash(word) % t->nbuckets;
    struct entry *e;

    for (e = t->buckets[b]; e != NULL; e = e->next) {
        if (strcmp(e->word, word) == 0) {
            e->count++;
            return;
        }
    }
    /* New word: two heap blocks, the entry and its own copy of the text
     * (word points into main's line buffer, which will be overwritten). */
    e = malloc(sizeof *e);
    if (e == NULL) {
        return;
    }
    e->word = malloc(strlen(word) + 1);
    if (e->word == NULL) {
        free(e);
        return;
    }
    strcpy(e->word, word);
    e->count = 1;
    e->next = t->buckets[b];    /* push on the front of the chain */
    t->buckets[b] = e;
    t->size++;
}

int table_size(const Table *t)
{
    return t->size;
}

void table_entries(const Table *t, struct entry **out)
{
    int b, n = 0;
    struct entry *e;

    for (b = 0; b < t->nbuckets; b++) {
        for (e = t->buckets[b]; e != NULL; e = e->next) {
            out[n++] = e;
        }
    }
}

void table_show_buckets(const Table *t)
{
    int b;
    struct entry *e;

    for (b = 0; b < t->nbuckets; b++) {
        printf("  [%d]", b);
        for (e = t->buckets[b]; e != NULL; e = e->next) {
            printf(" -> %s", e->word);
        }
        printf("\n");
    }
}
