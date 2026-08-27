/*
 * title: Building and tearing down a binary search tree
 * level: 3
 * about: Inserts words into a binary search tree of heap nodes that own copies of the words, prints them in order, and frees the tree bottom-up with a post-order walk.
 * input: mango kiwi apple pear banana fig cherry lime grape apple kiwi
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct node {
    char *word;          /* owned copy */
    int count;
    struct node *left, *right;
};

static struct node *new_node(const char *w)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL)
        return NULL;
    n->word = malloc(strlen(w) + 1);
    if (n->word == NULL) {
        free(n);
        return NULL;
    }
    strcpy(n->word, w);
    n->count = 1;
    n->left = n->right = NULL;
    return n;
}

/* Walk down with a pointer-to-pointer so the new node can be hooked in directly. */
static void insert(struct node **link, const char *w)
{
    int cmp;
    while (*link != NULL) {
        cmp = strcmp(w, (*link)->word);
        if (cmp == 0) {
            (*link)->count++;
            return;
        }
        link = cmp < 0 ? &(*link)->left : &(*link)->right;
    }
    *link = new_node(w);
}

static void print_in_order(const struct node *n, int depth)
{
    if (n == NULL)
        return;
    print_in_order(n->left, depth + 1);
    printf("%*s%s x%d\n", depth * 2, "", n->word, n->count);
    print_in_order(n->right, depth + 1);
}

/*
 * Post-order: free both children before the parent. Freeing the parent
 * first would throw away the only pointers to its children, leaking them
 * (or worse, reading n->left after free(n)).
 */
static int free_tree(struct node *n)
{
    int freed;
    if (n == NULL)
        return 0;
    freed = free_tree(n->left) + free_tree(n->right);
    free(n->word);
    free(n);
    return freed + 2;
}

int main(void)
{
    struct node *root = NULL;
    char word[32];

    while (scanf("%31s", word) == 1)
        insert(&root, word);

    /* Indentation shows each word's depth in the tree. */
    print_in_order(root, 0);

    /* Step into free_tree and watch the leaves vanish first. */
    printf("freed %d blocks\n", free_tree(root));
    root = NULL;
    return 0;
}
