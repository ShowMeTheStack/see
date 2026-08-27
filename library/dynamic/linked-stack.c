/*
 * title: A stack of nodes on the heap
 * level: 2
 * about: Uses a linked stack, one malloc per push and one free per pop, to check whether brackets in some expressions are balanced.
 * input: (a[b]{c})\n{[(])}\n((()\n[x*(y+z)]-{w}\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct node {
    char ch;
    struct node *below;
};

static int push(struct node **top, char ch)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL)
        return 0;
    n->ch = ch;
    n->below = *top;    /* the new node points at the old top */
    *top = n;
    return 1;
}

/* Remove the top node, return its character. The stack must not be empty. */
static char pop(struct node **top)
{
    struct node *n = *top;
    char ch = n->ch;     /* read it before the node is gone */
    *top = n->below;
    free(n);
    return ch;
}

static void clear(struct node **top)
{
    while (*top != NULL)
        pop(top);
}

static int matches(char open, char close)
{
    return (open == '(' && close == ')') || (open == '[' && close == ']')
        || (open == '{' && close == '}');
}

int main(void)
{
    char line[100];
    struct node *top = NULL;
    int i, ok;

    while (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        ok = 1;
        for (i = 0; line[i] != '\0' && ok; i++) {
            if (strchr("([{", line[i]) != NULL)
                ok = push(&top, line[i]);
            else if (strchr(")]}", line[i]) != NULL)
                ok = top != NULL && matches(pop(&top), line[i]);
        }
        /*
         * Anything left on the stack is an opener that never closed. Clear
         * it either way, or those nodes would leak.
         */
        if (top != NULL)
            ok = 0;
        clear(&top);
        printf("%-16s %s\n", line, ok ? "balanced" : "NOT balanced");
    }
    return 0;
}
