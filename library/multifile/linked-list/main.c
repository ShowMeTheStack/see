/*
 * title: A sorted linked list module
 * level: 2
 * about: Inserts and removes numbers in a sorted singly linked list kept in its own module.
 * input: 42 7 19 3 88 19 50 0
 */

/* See compiles main.c and list.c separately and links them. Only the head
 * pointer lives in main; the nodes are heap blocks made by list.c. */
#include <stdio.h>
#include "list.h"

int main(void)
{
    struct node *head = NULL;
    int x;

    /* Read numbers until 0, keeping the list sorted. */
    while (scanf("%d", &x) == 1 && x != 0) {
        list_insert_sorted(&head, x);
        printf("insert %2d: ", x);
        list_print(head);
    }

    printf("length %d\n", list_length(head));
    printf("remove 3: %s\n", list_remove(&head, 3) ? "yes" : "no");
    printf("remove 19: %s\n", list_remove(&head, 19) ? "yes" : "no");
    printf("remove 5: %s\n", list_remove(&head, 5) ? "yes" : "no");
    list_print(head);

    /* After this call head is NULL again and the heap panel is empty. */
    list_free(&head);
    printf("after free: ");
    list_print(head);
    return 0;
}
