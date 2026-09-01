/*
 * title: A self-balancing AVL tree
 * level: 4
 * about: Inserts keys in sorted order into an AVL tree, which rotates itself to stay balanced, and compares its height with a plain binary search tree fed the same keys.
 */
#include <stdio.h>
#include <stdlib.h>

/* Sorted input turns a plain binary search tree into a long chain: every
   key goes to the right. An AVL tree stores each node's height and, after
   every insert, rotates any node whose two subtrees differ in height by more
   than one. That keeps the height near log2(n). */
struct node {
    int key;
    int height;
    struct node *left, *right;
};

int rotations = 0;

int h(const struct node *n) { return n ? n->height : 0; }
int max(int a, int b) { return a > b ? a : b; }
void fix_height(struct node *n) { n->height = 1 + max(h(n->left), h(n->right)); }
int balance(const struct node *n) { return h(n->left) - h(n->right); }

/* Rotate right around y: its left child x becomes the subtree root.
          y              x
         / \            / \
        x   C   ==>    A   y
       / \                / \
      A   B              B   C
   The in-order sequence A x B y C does not change; only the shape does. */
struct node *rotate_right(struct node *y)
{
    struct node *x = y->left;
    y->left = x->right;
    x->right = y;
    fix_height(y);
    fix_height(x);
    rotations++;
    return x;
}

struct node *rotate_left(struct node *x)
{
    struct node *y = x->right;
    x->right = y->left;
    y->left = x;
    fix_height(x);
    fix_height(y);
    rotations++;
    return y;
}

struct node *new_node(int key)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL)
        exit(1);
    n->key = key;
    n->height = 1;
    n->left = n->right = NULL;
    return n;
}

struct node *avl_insert(struct node *t, int key)
{
    if (t == NULL)
        return new_node(key);
    if (key < t->key)
        t->left = avl_insert(t->left, key);
    else if (key > t->key)
        t->right = avl_insert(t->right, key);
    else
        return t;

    /* On the way back up the recursion, repair any node that tipped over.
       The four cases: left-left, left-right, right-right, right-left. */
    fix_height(t);
    if (balance(t) > 1) {
        if (balance(t->left) < 0)
            t->left = rotate_left(t->left);
        return rotate_right(t);
    }
    if (balance(t) < -1) {
        if (balance(t->right) > 0)
            t->right = rotate_right(t->right);
        return rotate_left(t);
    }
    return t;
}

/* A plain BST insert, written as a loop so the long chain it builds does not
   need a deep recursion. */
struct node *bst_insert(struct node *t, int key)
{
    struct node **pp = &t;
    while (*pp != NULL)
        pp = key < (*pp)->key ? &(*pp)->left : &(*pp)->right;
    *pp = new_node(key);
    return t;
}

int depth(const struct node *t)
{
    int l, r;
    if (t == NULL)
        return 0;
    l = depth(t->left);
    r = depth(t->right);
    return 1 + max(l, r);
}

void print_sideways(const struct node *t, int indent)
{
    if (t == NULL)
        return;
    print_sideways(t->right, indent + 4);
    printf("%*s%d\n", indent, "", t->key);
    print_sideways(t->left, indent + 4);
}

void free_tree(struct node *t)
{
    /* Children first, then the node. The plain BST is a 15-deep chain, so
       this recursion goes 15 frames deep for it: still nothing to worry about. */
    if (t == NULL)
        return;
    free_tree(t->left);
    free_tree(t->right);
    free(t);
}

int main(void)
{
    struct node *avl = NULL, *bst = NULL;
    int k;

    for (k = 1; k <= 15; k++) {
        avl = avl_insert(avl, k * 10);
        bst = bst_insert(bst, k * 10);
        if (k == 3 || k == 7 || k == 15)
            printf("after %2d sorted inserts: AVL height %d (rotations so far %d), plain BST height %d\n",
                   k, depth(avl), rotations, depth(bst));
    }
    printf("\nthe AVL tree, root at the left:\n");
    print_sideways(avl, 0);

    free_tree(avl);
    free_tree(bst);
    return 0;
}
