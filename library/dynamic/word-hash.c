/*
 * title: Word counts in a chained hash table
 * level: 4
 * about: Counts words in a chained hash table that grows and rehashes when it gets crowded, prints the most frequent words and frees every chain.
 * input: it was the best of times it was the worst of times it was the age of wisdom it was the age of foolishness it was the epoch of belief it was the epoch of incredulity
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct entry {
    char *word;              /* owned */
    int count;
    struct entry *next;      /* next entry in the same bucket */
};

struct table {
    struct entry **buckets;  /* an array of chain heads */
    unsigned size;           /* number of buckets */
    unsigned used;           /* number of entries */
};

/* djb2, a classic string hash: h = h * 33 + c. */
static unsigned long hash(const char *s)
{
    unsigned long h = 5381;
    while (*s != '\0')
        h = h * 33 + (unsigned char)*s++;
    return h;
}

static int table_init(struct table *t, unsigned size)
{
    t->buckets = calloc(size, sizeof *t->buckets);   /* all chains start empty (NULL) */
    t->size = size;
    t->used = 0;
    return t->buckets != NULL;
}

/*
 * Rehash into twice as many buckets. The entries themselves are not copied:
 * each is unhooked from its old chain and pushed onto its new one, so only
 * the bucket array is replaced.
 */
static void grow(struct table *t)
{
    struct table bigger;
    struct entry *e, *next;
    unsigned i, b;

    if (!table_init(&bigger, t->size * 2))
        return;
    for (i = 0; i < t->size; i++)
        for (e = t->buckets[i]; e != NULL; e = next) {
            next = e->next;
            b = (unsigned)(hash(e->word) % bigger.size);
            e->next = bigger.buckets[b];
            bigger.buckets[b] = e;
        }
    printf("(rehash: %u -> %u buckets at %u words)\n", t->size, bigger.size, t->used);
    bigger.used = t->used;
    free(t->buckets);
    *t = bigger;
}

static void add(struct table *t, const char *w)
{
    unsigned b = (unsigned)(hash(w) % t->size);
    struct entry *e;

    for (e = t->buckets[b]; e != NULL; e = e->next)
        if (strcmp(e->word, w) == 0) {
            e->count++;
            return;
        }
    e = malloc(sizeof *e);
    if (e == NULL)
        return;
    e->word = malloc(strlen(w) + 1);
    if (e->word == NULL) {
        free(e);
        return;
    }
    strcpy(e->word, w);
    e->count = 1;
    e->next = t->buckets[b];
    t->buckets[b] = e;
    /* Keep chains short: grow when there are more words than buckets. */
    if (++t->used > t->size)
        grow(t);
}

static int by_count(const void *a, const void *b)
{
    const struct entry *x = *(const struct entry *const *)a;
    const struct entry *y = *(const struct entry *const *)b;
    if (x->count != y->count)
        return y->count - x->count;
    return strcmp(x->word, y->word);
}

int main(void)
{
    struct table t;
    struct entry **all, *e, *next;
    char word[32];
    unsigned i, k = 0, longest = 0, len;

    if (!table_init(&t, 4))
        return 0;
    while (scanf("%31s", word) == 1)
        add(&t, word);

    /* Gather pointers to every entry so qsort can rank them. */
    all = malloc(t.used * sizeof *all);
    if (all != NULL) {
        for (i = 0; i < t.size; i++) {
            len = 0;
            for (e = t.buckets[i]; e != NULL; e = e->next) {
                all[k++] = e;
                len++;
            }
            if (len > longest)
                longest = len;
        }
        qsort(all, k, sizeof *all, by_count);
        printf("%u different words, %u buckets, longest chain %u\n", t.used, t.size, longest);
        for (i = 0; i < k && i < 6; i++)
            printf("%-12s %d\n", all[i]->word, all[i]->count);
        free(all);   /* only the array of pointers: the entries still belong to the table */
    }

    /* Each entry owns a word; each bucket owns a chain; the table owns the buckets. */
    for (i = 0; i < t.size; i++)
        for (e = t.buckets[i]; e != NULL; e = next) {
            next = e->next;
            free(e->word);
            free(e);
        }
    free(t.buckets);
    return 0;
}
