/*
 * title: Singly linked list: insert, delete, reverse
 * level: 2
 * about: Builds a linked list of heap nodes, inserts at the front, the back and in sorted position, deletes by value, reverses it in place and frees it.
 */
#include <stdio.h>
#include <stdlib.h>

/* Each node holds a value and the address of the next node. The last node's
   next is NULL. The list itself is just a pointer to the first node. */
struct node {
    int value;
    struct node *next;
};

struct node *new_node(int value)
{
    struct node *n = malloc(sizeof *n);
    if (n == NULL) {
        printf("out of memory\n");
        exit(1);
    }
    n->value = value;
    n->next = NULL;
    return n;
}

void print_list(const char *label, const struct node *head)
{
    printf("%-22s", label);
    for (; head != NULL; head = head->next)
        printf("%d -> ", head->value);
    printf("NULL\n");
}

/* Pushing on the front changes the head, so we pass the ADDRESS of the head
   pointer (a pointer to a pointer). Step in and see that headp points at
   main's head variable, not at a node. */
void push_front(struct node **headp, int value)
{
    struct node *n = new_node(value);
    n->next = *headp;
    *headp = n;
}

void push_back(struct node **headp, int value)
{
    /* Walk a pointer-to-pointer along the links until it reaches the NULL at
       the end, then hang the new node there. This needs no special case for
       an empty list. */
    while (*headp != NULL)
        headp = &(*headp)->next;
    *headp = new_node(value);
}

void insert_sorted(struct node **headp, int value)
{
    struct node *n;
    while (*headp != NULL && (*headp)->value < value)
        headp = &(*headp)->next;
    n = new_node(value);
    n->next = *headp;
    *headp = n;
}

/* Remove the first node holding value. Returns 1 if one was removed. */
int delete_value(struct node **headp, int value)
{
    while (*headp != NULL) {
        if ((*headp)->value == value) {
            struct node *dead = *headp;
            *headp = dead->next;      /* bypass it... */
            free(dead);               /* ...then give its memory back */
            return 1;
        }
        headp = &(*headp)->next;
    }
    return 0;
}

/* Reverse by turning every arrow round. Three pointers walk the list:
   prev (already reversed), cur (being turned) and next (not yet seen).
   Step through it in the debugger and watch the arrows flip one by one. */
struct node *reverse(struct node *head)
{
    struct node *prev = NULL;
    while (head != NULL) {
        struct node *next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}

void free_list(struct node *head)
{
    while (head != NULL) {
        struct node *next = head->next;   /* read next BEFORE freeing */
        free(head);
        head = next;
    }
}

int main(void)
{
    struct node *list = NULL;

    push_front(&list, 20);
    push_front(&list, 10);
    push_back(&list, 40);
    push_back(&list, 50);
    print_list("after pushes:", list);

    insert_sorted(&list, 30);
    insert_sorted(&list, 5);
    insert_sorted(&list, 60);
    print_list("after sorted inserts:", list);

    delete_value(&list, 5);
    delete_value(&list, 40);
    if (!delete_value(&list, 99))
        printf("99 was not in the list\n");
    print_list("after deletes:", list);

    list = reverse(list);
    print_list("reversed:", list);

    free_list(list);
    return 0;
}
