/* list.c - every function that may change the first node takes a
 * struct node **: the address of the caller's head pointer. Then it can
 * update the caller's head directly, instead of returning a new one. */
#include <stdio.h>
#include <stdlib.h>
#include "list.h"

/* link walks the chain of "next" fields. It starts at the caller's head
 * pointer and stops at the link that should point to the new node.
 * In See, link's arrow hops from main's head into one heap node after
 * another. */
void list_insert_sorted(struct node **head, int value)
{
    struct node **link = head;
    struct node *n;

    while (*link != NULL && (*link)->value < value) {
        link = &(*link)->next;
    }
    n = malloc(sizeof *n);
    if (n == NULL) {
        return;
    }
    n->value = value;
    n->next = *link;
    *link = n;      /* this one line handles the front, middle and end alike */
}

int list_remove(struct node **head, int value)
{
    struct node **link = head;
    struct node *gone;

    while (*link != NULL && (*link)->value != value) {
        link = &(*link)->next;
    }
    if (*link == NULL) {
        return 0;
    }
    gone = *link;
    *link = gone->next;     /* unhook first, then free */
    free(gone);
    return 1;
}

int list_length(const struct node *head)
{
    int n = 0;
    for (; head != NULL; head = head->next) {
        n++;
    }
    return n;
}

void list_print(const struct node *head)
{
    printf("[");
    for (; head != NULL; head = head->next) {
        printf(" %d", head->value);
    }
    printf(" ]\n");
}

void list_free(struct node **head)
{
    struct node *next;

    while (*head != NULL) {
        next = (*head)->next;   /* read next before the node disappears */
        free(*head);
        *head = next;
    }
}
