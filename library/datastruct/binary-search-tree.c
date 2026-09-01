/*
 * title: Binary search tree with insert, find and delete
 * level: 3
 * about: Builds a binary search tree of numbers, prints it sideways and in three traversal orders, searches it, deletes leaves and inner nodes, and frees it.
 */
#include <stdio.h>
#include <stdlib.h>

/* Every node has up to two children. Everything in the left subtree is
   smaller than the node, everything in the right subtree is larger. In the
   memory picture each heap node has two arrows going down. */
struct node {
    int key;
    struct node *left;
    struct node *right;
};

struct node *insert(struct node *root, int key)
{
    if (root == NULL) {
        struct node *n = malloc(sizeof *n);
        if (n == NULL)
            exit(1);
        n->key = key;
        n->left = n->right = NULL;
        return n;
    }
    if (key < root->key)
        root->left = insert(root->left, key);
    else if (key > root->key)
        root->right = insert(root->right, key);
    return root;                     /* duplicates are ignored */
}

/* Search without recursion: at each node go left or right. The number of
   steps is the depth of the key, not the size of the tree. */
int find(const struct node *root, int key, int *steps)
{
    *steps = 0;
    while (root != NULL) {
        (*steps)++;
        if (key == root->key)
            return 1;
        root = key < root->key ? root->left : root->right;
    }
    return 0;
}

struct node *delete_key(struct node *root, int key)
{
    struct node *child, *succ;
    if (root == NULL)
        return NULL;
    if (key < root->key) {
        root->left = delete_key(root->left, key);
        return root;
    }
    if (key > root->key) {
        root->right = delete_key(root->right, key);
        return root;
    }
    /* Found it. With at most one child, the child takes its place. */
    if (root->left == NULL || root->right == NULL) {
        child = root->left ? root->left : root->right;
        free(root);
        return child;
    }
    /* Two children: copy in the smallest key of the right subtree (the
       in-order successor), then delete that key from the right subtree. */
    succ = root->right;
    while (succ->left != NULL)
        succ = succ->left;
    root->key = succ->key;
    root->right = delete_key(root->right, succ->key);
    return root;
}

void preorder(const struct node *t)  { if (t) { printf(" %d", t->key); preorder(t->left); preorder(t->right); } }
void inorder(const struct node *t)   { if (t) { inorder(t->left); printf(" %d", t->key); inorder(t->right); } }
void postorder(const struct node *t) { if (t) { postorder(t->left); postorder(t->right); printf(" %d", t->key); } }

/* Print the tree turned 90 degrees: right subtree on top, root at the left
   margin. Pause inside it and count the print_sideways frames on the stack:
   that is the depth of the node being printed. */
void print_sideways(const struct node *t, int depth)
{
    if (t == NULL)
        return;
    print_sideways(t->right, depth + 1);
    printf("%*s%d\n", depth * 4, "", t->key);
    print_sideways(t->left, depth + 1);
}

int height(const struct node *t)
{
    int l, r;
    if (t == NULL)
        return 0;
    l = height(t->left);
    r = height(t->right);
    return 1 + (l > r ? l : r);
}

/* Postorder is the natural order for freeing: children before parent. */
void free_tree(struct node *t)
{
    if (t) {
        free_tree(t->left);
        free_tree(t->right);
        free(t);
    }
}

void show(const struct node *t)
{
    print_sideways(t, 0);
    printf("pre: ");  preorder(t);  printf("\n");
    printf("in:  ");  inorder(t);   printf("   (sorted!)\n");
    printf("post:");  postorder(t); printf("\n");
    printf("height %d\n\n", height(t));
}

int main(void)
{
    int keys[] = { 50, 30, 70, 20, 40, 60, 80, 35, 45, 65 };
    int probes[] = { 45, 65, 10, 50 };
    struct node *root = NULL;
    int i, steps;

    for (i = 0; i < 10; i++)
        root = insert(root, keys[i]);
    show(root);

    for (i = 0; i < 4; i++) {
        int found = find(root, probes[i], &steps);
        printf("find %d: %s after %d step%s\n", probes[i], found ? "found" : "missing",
               steps, steps == 1 ? "" : "s");
    }

    printf("\ndelete 20 (a leaf), 70 (two children), 30 (two children):\n");
    root = delete_key(root, 20);
    root = delete_key(root, 70);
    root = delete_key(root, 30);
    show(root);

    free_tree(root);
    return 0;
}
