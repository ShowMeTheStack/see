/*
 * title: A dictionary with bsearch
 * level: 3
 * about: Looks up words in a sorted table of English-to-French entries using bsearch with a key comparison callback.
 * input: cat house zebra apple dog water bread
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct entry {
    const char *en;
    const char *fr;
};

/* Must be sorted by en, because bsearch halves the range each step. */
const struct entry dict[] = {
    { "apple", "pomme" }, { "bread", "pain" },   { "cat", "chat" },
    { "dog", "chien" },   { "friend", "ami" },   { "house", "maison" },
    { "moon", "lune" },   { "night", "nuit" },   { "sun", "soleil" },
    { "tree", "arbre" },  { "water", "eau" }
};
#define NDICT (sizeof dict / sizeof dict[0])

static int probes;

/*
 * bsearch calls this with the key first and an array element second.
 * The key does not have to be the same type as the elements: here it
 * is just a char pointer (passed as the address of one), while the
 * elements are whole entries. That saves building a dummy entry.
 */
int compare_key(const void *key, const void *elem)
{
    const char *word = *(const char * const *)key;
    const struct entry *e = elem;
    probes++;
    return strcmp(word, e->en);
}

/* qsort, on the other hand, always compares two elements. */
int compare_entries(const void *a, const void *b)
{
    const struct entry *x = a, *y = b;
    return strcmp(x->en, y->en);
}

int main(void)
{
    char word[32];
    const char *key = word;
    const struct entry *hit;
    struct entry copy[NDICT];
    size_t i;

    /* Check the table really is sorted: sort a copy and compare. */
    memcpy(copy, dict, sizeof dict);
    qsort(copy, NDICT, sizeof copy[0], compare_entries);
    for (i = 0; i < NDICT; i++)
        if (copy[i].en != dict[i].en) {
            printf("dictionary is not sorted at %s\n", dict[i].en);
            return 0;
        }

    while (scanf("%31s", word) == 1) {
        probes = 0;
        hit = bsearch(&key, dict, NDICT, sizeof dict[0], compare_key);
        if (hit != NULL)
            printf("%-6s -> %-7s (probes: %d, entry %d)\n",
                   word, hit->fr, probes, (int)(hit - dict));
        else
            printf("%-6s -> ?       (probes: %d)\n", word, probes);
    }
    return 0;
}
