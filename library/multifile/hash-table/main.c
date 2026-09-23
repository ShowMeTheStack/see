/*
 * title: A hash table module counting words
 * level: 3
 * about: Counts the words of a passage in a hash table module, then prints the commonest and the shape of each bucket chain.
 * input: It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.
 */

/* table.c is the hash table, words.c splits input into words, main.c sorts
 * and prints. See compiles each .c file separately and links them. After
 * the reading loop, the heap panel holds a bucket array plus two blocks for
 * every distinct word; follow the next arrows along a chain. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "table.h"
#include "words.h"

static int by_count(const void *a, const void *b)
{
    const struct entry *x = *(struct entry * const *)a;
    const struct entry *y = *(struct entry * const *)b;

    if (x->count != y->count) {
        return y->count - x->count;
    }
    return strcmp(x->word, y->word);
}

int main(void)
{
    Table *t = table_new(7);
    struct entry **all;
    char word[32];
    int i, n, total = 0;

    if (t == NULL) {
        return 1;
    }
    while (next_word(word, sizeof word)) {
        table_add(t, word);
        total++;
    }
    n = table_size(t);
    printf("%d words, %d different\n", total, n);

    /* An array of pointers to the entries, so sorting moves pointers only. */
    all = malloc(n * sizeof *all);
    if (all != NULL) {
        table_entries(t, all);
        qsort(all, n, sizeof *all, by_count);
        for (i = 0; i < n && i < 6; i++) {
            printf("  %-12s %d\n", all[i]->word, all[i]->count);
        }
        free(all);
    }

    printf("buckets:\n");
    table_show_buckets(t);
    table_free(t);
    return 0;
}
