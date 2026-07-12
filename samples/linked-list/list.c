/* list.c: a linked list, built at the front.
   Every node is a heap block; each next pointer is an arrow to the following node. */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

/* head is passed by address so push can change the caller's pointer */
void push(struct node **head, int value)
{
    struct node *n = malloc(sizeof *n);
    n->value = value;
    n->next = *head;
    *head = n;
}

void free_list(struct node *n)
{
    while (n != NULL) {
        struct node *next = n->next;   /* read next before the node is gone */
        free(n);
        n = next;
    }
}

int main(void)
{
    struct node *head = NULL;
    struct node *p;
    int i;

    for (i = 1; i <= 4; i++)
        push(&head, i * 10);
    for (p = head; p != NULL; p = p->next)
        printf("%d -> ", p->value);
    printf("NULL\n");
    free_list(head);
    return 0;
}
