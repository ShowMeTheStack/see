/*
 * title: Merging two sorted linked lists
 * level: 2
 * about: Merges two sorted linked lists into one by relinking their nodes, without allocating anything new, using a dummy head node on the stack.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

/* Build a list from an array, back to front so each new node goes first. */
struct node *from_array(const int *a, int n)
{
    struct node *head = NULL;
    while (n-- > 0) {
        struct node *p = malloc(sizeof *p);
        if (p == NULL)
            exit(1);
        p->value = a[n];
        p->next = head;
        head = p;
    }
    return head;
}

void print(const char *label, const struct node *p)
{
    printf("%-8s", label);
    for (; p; p = p->next)
        printf(" %d", p->value);
    printf("\n");
}

/* The dummy node lives on the stack and is never part of the answer. It
   gives tail somewhere to start, so the first node needs no special case.
   Step through and watch: no new heap blocks appear; existing nodes just get
   their next arrows redirected, zig-zagging between the two lists. */
struct node *merge(struct node *a, struct node *b)
{
    struct node dummy;
    struct node *tail = &dummy;
    dummy.next = NULL;

    while (a != NULL && b != NULL) {
        if (a->value <= b->value) {      /* <= keeps equal values stable */
            tail->next = a;
            a = a->next;
        } else {
            tail->next = b;
            b = b->next;
        }
        tail = tail->next;
    }
    /* One list ran out; the rest of the other is already sorted. */
    tail->next = (a != NULL) ? a : b;
    return dummy.next;
}

void free_list(struct node *p)
{
    while (p) {
        struct node *n = p->next;
        free(p);
        p = n;
    }
}

int main(void)
{
    int odd[] = { 1, 3, 5, 9, 11, 21 };
    int mixed[] = { 2, 3, 4, 10, 30 };
    struct node *a = from_array(odd, 6);
    struct node *b = from_array(mixed, 5);
    struct node *m;

    print("a:", a);
    print("b:", b);
    m = merge(a, b);
    /* a and b still point at their old first nodes, which are now inside m.
       Freeing m frees them all; freeing a or b as well would be a double free. */
    print("merged:", m);

    m = merge(m, NULL);
    print("with {}:", m);

    free_list(m);
    return 0;
}
