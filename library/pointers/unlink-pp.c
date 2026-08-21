/*
 * title: Removing from a list with a pointer to a link
 * level: 4
 * about: Deletes every node matching a test from a linked list without a special case for the head, by walking a pointer to the link itself.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

struct node *build(const int *v, int n)
{
    struct node *head = NULL;
    struct node **tail = &head;     /* where the next node should be hooked in */
    int i;
    for (i = 0; i < n; i++) {
        struct node *nd = malloc(sizeof *nd);
        if (nd == NULL)
            break;
        nd->value = v[i];
        nd->next = NULL;
        *tail = nd;                 /* the first time, this sets head itself */
        tail = &nd->next;
    }
    return head;
}

/*
 * The usual way keeps a "previous" pointer and needs an extra branch when
 * the node to delete is the first one. Here link points at whichever
 * pointer currently leads to the node: first &head, later &some->next.
 * Deleting is then always the same: *link = victim->next.
 *
 * Step through and watch link's arrow: it starts on main's head
 * variable, then hops onto the next field inside each heap block.
 */
int remove_if(struct node **link, int (*doomed)(int))
{
    int removed = 0;
    struct node *victim;
    while (*link != NULL) {
        if (doomed((*link)->value)) {
            victim = *link;
            *link = victim->next;   /* bypass it; link stays where it is */
            free(victim);
            removed++;
        } else {
            link = &(*link)->next;  /* move on to the next link */
        }
    }
    return removed;
}

int is_even(int x) { return x % 2 == 0; }
int over_50(int x) { return x > 50; }

void print_list(const char *label, const struct node *p)
{
    printf("%-14s", label);
    for (; p != NULL; p = p->next)
        printf(" %d", p->value);
    printf("\n");
}

void free_list(struct node *p)
{
    struct node *next;
    for (; p != NULL; p = next) {
        next = p->next;
        free(p);
    }
}

int main(void)
{
    int data[9];
    struct node *head;
    int n;

    data[0] = 4;  data[1] = 8;  data[2] = 15; data[3] = 16; data[4] = 23;
    data[5] = 42; data[6] = 61; data[7] = 70; data[8] = 99;

    head = build(data, 9);
    print_list("start:", head);

    /* The first two nodes are even, so the head has to move; no special case needed. */
    n = remove_if(&head, is_even);
    printf("removed %d\n", n);
    print_list("odd only:", head);

    n = remove_if(&head, over_50);
    printf("removed %d\n", n);
    print_list("odd, <= 50:", head);

    free_list(head);
    return 0;
}
