/*
 * title: Word frequency with a binary tree
 * level: 3
 * about: Reads words with getword, counts them in a binary search tree built from heap nodes, and prints them in alphabetical order.
 * input: now is the time for all good men to come to the aid of the party\nthe time is now\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAXWORD 100

/* Each node holds a pointer to its own copy of the word, a count and two
   children. Smaller words go left, bigger words go right. In the heap
   panel every node is a block with arrows to its word and its children;
   the first word, "now", becomes the root. */
struct tnode {
    char *word;
    int count;
    struct tnode *left;
    struct tnode *right;
};

/* Copy a string into a fresh heap block (strdup is not in C89). */
char *str_dup(const char *s)
{
    char *p = malloc(strlen(s) + 1);   /* +1 for the '\0' */
    if (p != NULL)
        strcpy(p, s);
    return p;
}

/* Add w at or below p and return the (possibly new) subtree root.
   The recursion follows one path down from the root, so its depth is
   the height of the tree: watch the stack panel grow by one frame for
   each level it descends. */
struct tnode *addtree(struct tnode *p, const char *w)
{
    int cond;

    if (p == NULL) {                    /* a new word: make a node */
        p = malloc(sizeof *p);
        if (p == NULL)
            exit(1);
        p->word = str_dup(w);
        p->count = 1;
        p->left = p->right = NULL;
    } else if ((cond = strcmp(w, p->word)) == 0)
        p->count++;                     /* seen before */
    else if (cond < 0)
        p->left = addtree(p->left, w);
    else
        p->right = addtree(p->right, w);
    return p;
}

/* In-order walk: everything on the left (smaller), this node, then
   everything on the right (bigger). That visits the words sorted. */
void treeprint(const struct tnode *p, int depth)
{
    if (p != NULL) {
        treeprint(p->left, depth + 1);
        printf("%4d  %*s%s\n", p->count, depth * 2, "", p->word);
        treeprint(p->right, depth + 1);
    }
}

/* Free the children before the parent: once the parent is gone, its
   pointers to the children cannot be read any more. */
void treefree(struct tnode *p)
{
    if (p != NULL) {
        treefree(p->left);
        treefree(p->right);
        free(p->word);
        free(p);
    }
}

/* Read the next word (letters and digits) into word; return its first
   character, or EOF. Anything else is skipped. */
int getword(char *word, int lim)
{
    int c;
    char *w = word;

    while ((c = getchar()) != EOF && !isalnum(c))
        ;
    if (c == EOF)
        return EOF;
    *w++ = (char)c;
    for (; --lim > 1; w++) {
        c = getchar();
        if (!isalnum(c)) {
            if (c != EOF)
                ungetc(c, stdin);   /* not ours: give it back */
            break;
        }
        *w = (char)c;
    }
    *w = '\0';
    return word[0];
}

int main(void)
{
    struct tnode *root = NULL;
    char word[MAXWORD];

    while (getword(word, MAXWORD) != EOF)
        root = addtree(root, word);

    printf("count word (indented by depth in the tree)\n");
    treeprint(root, 0);
    treefree(root);
    return 0;
}
