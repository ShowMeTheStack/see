/*
 * title: A linked list handled entirely by recursion
 * level: 3
 * about: Builds a list of numbers on the heap and prints, sums, reverses, copies and frees it with recursive functions only.
 */
#include <stdio.h>
#include <stdlib.h>

/* A list is either empty (NULL) or a node followed by a shorter list.
   That definition is recursive, so recursive functions fit it exactly:
   handle the first node, let a call handle the rest. */
struct node {
    int value;
    struct node *next;
};

struct node *push(int value, struct node *rest)
{
    struct node *n = (struct node *)malloc(sizeof *n);

    if (n == NULL)
        exit(1);
    n->value = value;
    n->next = rest;
    return n;
}

void print_forward(const struct node *l)
{
    if (l == NULL)
        return;
    printf(" %d", l->value);
    print_forward(l->next);
}

/* Same body, two lines swapped: print the rest first. Backwards
   printing with no extra array, because the frames remember. */
void print_backward(const struct node *l)
{
    if (l == NULL)
        return;
    print_backward(l->next);
    printf(" %d", l->value);
}

int length(const struct node *l)
{
    return l == NULL ? 0 : 1 + length(l->next);
}

int sum(const struct node *l)
{
    return l == NULL ? 0 : l->value + sum(l->next);
}

/* A fresh copy with only the even values: new heap blocks. */
struct node *evens(const struct node *l)
{
    if (l == NULL)
        return NULL;
    if (l->value % 2 == 0)
        return push(l->value, evens(l->next));
    return evens(l->next);
}

/* Reverse in place: reverse the rest, then hang this node on the end
   of it. l->next still points at what is now the tail of the reversed
   rest, which is how we find that end without a loop. */
struct node *reverse(struct node *l)
{
    struct node *rest;

    if (l == NULL || l->next == NULL)
        return l;
    rest = reverse(l->next);
    l->next->next = l;
    l->next = NULL;
    return rest;
}

void destroy(struct node *l)
{
    if (l == NULL)
        return;
    destroy(l->next);
    free(l);
}

int main(void)
{
    struct node *list = NULL, *even;
    int i;

    for (i = 8; i >= 1; i--)
        list = push(i * 3, list);

    printf("forward :");
    print_forward(list);
    printf("\nbackward:");
    print_backward(list);
    printf("\nlength %d, sum %d\n", length(list), sum(list));

    even = evens(list);
    printf("evens   :");
    print_forward(even);
    printf("  (a separate list of %d new nodes)\n", length(even));

    /* Step through reverse in See and watch the arrows between the heap
       blocks turn around one by one as the calls return. */
    list = reverse(list);
    printf("reversed:");
    print_forward(list);
    printf("\n");

    destroy(list);
    destroy(even);
    return 0;
}
