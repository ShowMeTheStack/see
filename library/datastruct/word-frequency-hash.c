/*
 * title: Word frequency with a hash table
 * level: 3
 * about: Reads text, counts each word in a chained hash table, then prints the bucket chains and the ten most common words.
 * input: It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness.\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define BUCKETS 13

/* Each bucket is the head of a linked list (a "chain") of entries whose words
   hashed to that bucket. Collisions are fine: they just make a chain longer. */
struct entry {
    char *word;
    int count;
    struct entry *next;
};

struct table {
    struct entry *bucket[BUCKETS];
    int distinct;
};

/* The djb2 hash: multiply by 33 and add each character. unsigned arithmetic
   wraps round silently instead of overflowing. */
unsigned long hash(const char *s)
{
    unsigned long h = 5381;
    while (*s)
        h = h * 33 + (unsigned char)*s++;
    return h % BUCKETS;
}

void count_word(struct table *t, const char *w)
{
    unsigned long b = hash(w);
    struct entry *e;
    for (e = t->bucket[b]; e != NULL; e = e->next)
        if (strcmp(e->word, w) == 0) {
            e->count++;
            return;
        }
    /* Not there yet: add a new entry at the front of its chain. */
    e = malloc(sizeof *e);
    if (e == NULL)
        exit(1);
    e->word = malloc(strlen(w) + 1);
    if (e->word == NULL)
        exit(1);
    strcpy(e->word, w);
    e->count = 1;
    e->next = t->bucket[b];
    t->bucket[b] = e;
    t->distinct++;
}

int by_count(const void *a, const void *b)
{
    const struct entry *x = *(const struct entry * const *)a;
    const struct entry *y = *(const struct entry * const *)b;
    if (x->count != y->count)
        return y->count - x->count;
    return strcmp(x->word, y->word);
}

int main(void)
{
    struct table t;
    struct entry **all, *e;
    char word[32];
    int c, len = 0, i, k = 0;

    for (i = 0; i < BUCKETS; i++)
        t.bucket[i] = NULL;
    t.distinct = 0;

    /* Read character by character, building lower-case words of letters. */
    do {
        c = getchar();
        if (c != EOF && isalpha(c)) {
            if (len < (int)sizeof word - 1)
                word[len++] = (char)tolower(c);
        } else if (len > 0) {
            word[len] = '\0';
            count_word(&t, word);
            len = 0;
        }
    } while (c != EOF);

    /* The chains, as they sit in memory. */
    for (i = 0; i < BUCKETS; i++) {
        printf("bucket %2d:", i);
        for (e = t.bucket[i]; e != NULL; e = e->next)
            printf(" %s(%d)", e->word, e->count);
        printf("\n");
    }

    /* To rank them, gather pointers to every entry in one array and sort
       the pointers. The entries themselves stay where they are. */
    all = malloc(t.distinct * sizeof *all);
    if (all == NULL)
        exit(1);
    for (i = 0; i < BUCKETS; i++)
        for (e = t.bucket[i]; e != NULL; e = e->next)
            all[k++] = e;
    qsort(all, t.distinct, sizeof *all, by_count);

    printf("%d distinct words; the ten most common:\n", t.distinct);
    for (i = 0; i < 10 && i < t.distinct; i++)
        printf("%3d  %s\n", all[i]->count, all[i]->word);

    free(all);
    for (i = 0; i < BUCKETS; i++)
        while (t.bucket[i] != NULL) {
            e = t.bucket[i];
            t.bucket[i] = e->next;
            free(e->word);
            free(e);
        }
    return 0;
}
