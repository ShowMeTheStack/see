/*
 * title: Autocomplete with a trie
 * level: 3
 * about: Inserts a dictionary of words into a trie of heap nodes, one letter per level, then lists every word that starts with each typed prefix.
 * input: car cart carbon care cat catalog dog dot dote do\n? ca\n? car\n? do\n? z\n? cata\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* A trie node has one child pointer per letter. A word is spelled by the
   path from the root, and is_word marks where a word ends. Words with a
   common prefix share the nodes of that prefix, which is what makes prefix
   search fast. In the memory picture most of the 26 arrows in each node are
   NULL; only a few lead somewhere. */
struct trie {
    struct trie *child[26];
    int is_word;
};

int nodes_made = 0;

struct trie *new_node(void)
{
    struct trie *t = malloc(sizeof *t);
    int i;
    if (t == NULL)
        exit(1);
    for (i = 0; i < 26; i++)
        t->child[i] = NULL;
    t->is_word = 0;
    nodes_made++;
    return t;
}

void insert(struct trie *root, const char *w)
{
    for (; *w; w++) {
        int c = *w - 'a';
        if (c < 0 || c >= 26)
            return;                      /* only lower-case letters */
        if (root->child[c] == NULL)
            root->child[c] = new_node();
        root = root->child[c];
    }
    root->is_word = 1;
}

/* Walk down the prefix; returns the node it ends on, or NULL. */
struct trie *walk(struct trie *t, const char *prefix)
{
    for (; t != NULL && *prefix; prefix++) {
        int c = *prefix - 'a';
        if (c < 0 || c >= 26)
            return NULL;
        t = t->child[c];
    }
    return t;
}

/* Depth-first: buf holds the letters on the path so far. Visiting children
   in a..z order lists the words alphabetically for free. */
int list_words(const struct trie *t, char *buf, int len)
{
    int i, found = 0;
    if (t->is_word) {
        buf[len] = '\0';
        printf(" %s", buf);
        found++;
    }
    for (i = 0; i < 26; i++)
        if (t->child[i] != NULL) {
            buf[len] = (char)('a' + i);
            found += list_words(t->child[i], buf, len + 1);
        }
    return found;
}

void free_trie(struct trie *t)
{
    int i;
    for (i = 0; i < 26; i++)
        if (t->child[i] != NULL)
            free_trie(t->child[i]);
    free(t);
}

int main(void)
{
    struct trie *root = new_node();
    char word[32], buf[32];
    int words = 0;

    /* First the dictionary, up to the first "?" */
    while (scanf("%31s", word) == 1 && strcmp(word, "?") != 0) {
        insert(root, word);
        words++;
    }
    printf("%d words stored in %d nodes of %d bytes each\n", words, nodes_made,
           (int)sizeof(struct trie));

    /* Then queries. Each "?" is just a marker, and the word after it is a
       prefix whose completions are listed. */
    while (scanf("%31s", word) == 1) {
        struct trie *at;
        int n = 0;
        if (strcmp(word, "?") == 0)
            continue;
        printf("%-5s ->", word);
        at = walk(root, word);
        if (at != NULL) {
            strcpy(buf, word);
            n = list_words(at, buf, (int)strlen(word));
        }
        printf(n ? "   (%d)\n" : " nothing (%d)\n", n);
    }

    free_trie(root);
    return 0;
}
