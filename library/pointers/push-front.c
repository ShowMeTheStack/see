/*
 * title: Changing the caller's pointer
 * level: 3
 * about: Pushes nodes onto the front of a linked list with a function that takes a pointer to the head pointer.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

/*
 * This version receives a COPY of head. It links the new node in, then
 * sets its own copy, which vanishes on return: main's head never moves
 * and the node is lost. Kept here only to show the mistake; not called.
 */
void push_wrong(struct node *head, int v)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL) return;
    n->value = v;
    n->next = head;
    head = n;            /* changes the local copy only, and leaks n */
    (void)head;
}

/*
 * The fix: pass the ADDRESS of main's head. *headp is main's head itself,
 * so assigning to it moves main's pointer. Step into push (F11) and see
 * the arrow from headp reach back into main's frame.
 */
int push(struct node **headp, int v)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL)
        return 0;
    n->value = v;
    n->next = *headp;
    *headp = n;
    return 1;
}

/* Same idea for freeing: afterwards main's head is NULL, not dangling. */
void free_list(struct node **headp)
{
    struct node *p = *headp;
    struct node *next;
    while (p != NULL) {
        next = p->next;
        free(p);
        p = next;
    }
    *headp = NULL;
}

void print_list(const struct node *p)
{
    while (p != NULL) {
        printf("%d -> ", p->value);
        p = p->next;
    }
    printf("NULL\n");
}

int main(void)
{
    struct node *head = NULL;
    int i;

    /* Watch the heap grow one block at a time, each new one pointing at the previous. */
    for (i = 1; i <= 5; i++)
        push(&head, i * 10);
    print_list(head);

    free_list(&head);
    printf("after free_list, head = %p\n", (void *)head);
    print_list(head);
    return 0;
}
