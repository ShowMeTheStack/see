/* list.h - a singly linked list of ints, sorted as items go in. */
#ifndef LIST_H
#define LIST_H

struct node {
    int value;
    struct node *next;
};

void list_insert_sorted(struct node **head, int value);
int list_remove(struct node **head, int value);
int list_length(const struct node *head);
void list_print(const struct node *head);
void list_free(struct node **head);

#endif
