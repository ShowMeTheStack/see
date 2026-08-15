/*
 * title: Measuring a binary search tree recursively
 * level: 3
 * about: Builds a binary search tree of words on the heap, then measures its height, size and leaves and prints it sideways, all with recursion.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct node {
    const char *word;          /* points at a string literal */
    struct node *left, *right;
};

/* Insert returns the (possibly new) root of the subtree, so the parent
   can store it: root->left = insert(root->left, w). No double pointers
   needed. */
struct node *insert(struct node *root, const char *w)
{
    if (root == NULL) {
        root = (struct node *)malloc(sizeof *root);
        if (root == NULL)
            exit(1);
        root->word = w;
        root->left = root->right = NULL;
    } else if (strcmp(w, root->word) < 0)
        root->left = insert(root->left, w);
    else
        root->right = insert(root->right, w);
    return root;
}

/* Every question about a tree has the same shape: answer for the
   empty tree, otherwise combine the answers for the two subtrees. */
int height(const struct node *t)
{
    int l, r;

    if (t == NULL)
        return 0;
    l = height(t->left);
    r = height(t->right);
    return 1 + (l > r ? l : r);
}

int size(const struct node *t)
{
    return t == NULL ? 0 : 1 + size(t->left) + size(t->right);
}

int leaves(const struct node *t)
{
    if (t == NULL)
        return 0;
    if (t->left == NULL && t->right == NULL)
        return 1;
    return leaves(t->left) + leaves(t->right);
}

/* Right subtree first, then the node, then the left, each indented by
   its depth: the tree appears lying on its side, root at the left. */
void print_sideways(const struct node *t, int depth)
{
    if (t == NULL)
        return;
    print_sideways(t->right, depth + 1);
    printf("%*s%s\n", depth * 6, "", t->word);
    print_sideways(t->left, depth + 1);
}

void in_order(const struct node *t)
{
    if (t == NULL)
        return;
    in_order(t->left);
    printf(" %s", t->word);
    in_order(t->right);
}

void destroy(struct node *t)
{
    if (t == NULL)
        return;
    destroy(t->left);
    destroy(t->right);
    free(t);
}

int main(void)
{
    const char *words[11] = {
        "maple", "fern", "oak", "birch", "ivy", "pine",
        "yew", "ash", "holly", "elm", "rowan"
    };
    struct node *root = NULL;
    int i;

    /* In See's heap view each node is a block with a word arrow into the
       string literals and left/right arrows to other blocks. */
    for (i = 0; i < 11; i++)
        root = insert(root, words[i]);

    print_sideways(root, 0);
    printf("\nin order:");
    in_order(root);
    printf("\nheight %d, size %d, leaves %d\n", height(root), size(root), leaves(root));

    destroy(root);

    /* Sorted input makes the worst tree: every node hangs to the right,
       and the height equals the number of words. */
    root = NULL;
    root = insert(root, "a");
    root = insert(root, "b");
    root = insert(root, "c");
    root = insert(root, "d");
    root = insert(root, "e");
    printf("\nsorted insertions a..e give height %d:\n", height(root));
    print_sideways(root, 0);
    destroy(root);
    return 0;
}
