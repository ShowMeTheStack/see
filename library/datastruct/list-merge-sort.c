/*
 * title: Merge sort on a linked list
 * level: 3
 * about: Sorts a linked list of random scores with recursive merge sort, splitting it with the slow and fast pointer trick and merging the halves by relinking.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

/* Split after the middle: fast moves two steps for each step of slow, so when
   fast reaches the end slow is halfway. The list is cut there, and the
   second half is returned. */
struct node *split(struct node *head)
{
    struct node *slow = head, *fast = head->next, *second;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
    }
    second = slow->next;
    slow->next = NULL;
    return second;
}

/* Recursive merge: the smaller head goes first, followed by the merge of
   everything else. Short and clear; the recursion depth is the total length,
   which is fine for a list this size. */
struct node *merge(struct node *a, struct node *b)
{
    if (a == NULL) return b;
    if (b == NULL) return a;
    if (a->value <= b->value) {
        a->next = merge(a->next, b);
        return a;
    }
    b->next = merge(a, b->next);
    return b;
}

int depth_reached = 0;

/* Lists have no random access, so quicksort and heapsort fit badly. Merge
   sort only ever walks forwards, which is exactly what a list is good at. */
struct node *merge_sort(struct node *head, int depth)
{
    struct node *second;
    if (depth > depth_reached)
        depth_reached = depth;
    if (head == NULL || head->next == NULL)
        return head;
    second = split(head);
    return merge(merge_sort(head, depth + 1), merge_sort(second, depth + 1));
}

void print(const char *label, const struct node *p)
{
    printf("%s", label);
    for (; p; p = p->next)
        printf(" %d", p->value);
    printf("\n");
}

int main(void)
{
    struct node *list = NULL, *p;
    int i;

    srand(42);
    for (i = 0; i < 16; i++) {
        p = malloc(sizeof *p);
        if (p == NULL)
            exit(1);
        p->value = rand() % 100;
        p->next = list;
        list = p;
    }
    print("before:", list);
    list = merge_sort(list, 0);
    print("after: ", list);
    printf("deepest merge_sort call: %d levels (log2 of 16 is 4)\n", depth_reached);

    while (list) {
        p = list->next;
        free(list);
        list = p;
    }
    return 0;
}
