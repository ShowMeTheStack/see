/*
 * title: Finding a loop in a linked list
 * level: 2
 * about: Builds a list whose tail links back into its middle, detects the loop with Floyd's tortoise and hare, finds where it starts, then breaks it so the list can be freed.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

/* The tortoise moves one step, the hare two. Without a loop the hare falls
   off the end. With a loop the hare comes round behind the tortoise and,
   gaining one step per move, must land on it. Uses no extra memory at all. */
struct node *meeting_point(struct node *head)
{
    struct node *slow = head, *fast = head;
    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast)
            return slow;
    }
    return NULL;
}

/* A small piece of arithmetic shows that the distance from the head to the
   loop's start equals the distance from the meeting point to the start (going
   round). So walk one pointer from each, one step at a time, until they meet. */
struct node *loop_start(struct node *head, struct node *meet)
{
    while (head != meet) {
        head = head->next;
        meet = meet->next;
    }
    return head;
}

int main(void)
{
    struct node *nodes[10];
    struct node *meet, *start, *p;
    int i, loop_len = 1;

    for (i = 0; i < 10; i++) {
        nodes[i] = malloc(sizeof *nodes[i]);
        if (nodes[i] == NULL)
            exit(1);
        nodes[i]->value = (i + 1) * 10;
        nodes[i]->next = NULL;
    }
    for (i = 0; i < 9; i++)
        nodes[i]->next = nodes[i + 1];

    printf("straight list: %s\n", meeting_point(nodes[0]) ? "loop" : "no loop");

    /* Now hook the tail back to the 4th node. Look at the memory picture:
       the arrow from the last node bends back into the middle of the chain.
       Printing this list naively would never stop. */
    nodes[9]->next = nodes[3];

    meet = meeting_point(nodes[0]);
    if (meet == NULL) {
        printf("no loop found\n");
    } else {
        printf("tortoise and hare meet at %d\n", meet->value);
        start = loop_start(nodes[0], meet);
        for (p = start->next; p != start; p = p->next)
            loop_len++;
        printf("loop starts at %d and has %d nodes\n", start->value, loop_len);

        /* Break the loop: find the node whose next is the start, from inside
           the loop, and cut it. */
        for (p = start; p->next != start; p = p->next)
            ;
        p->next = NULL;
        printf("cut after %d; the list is now:", p->value);
        for (p = nodes[0]; p != NULL; p = p->next)
            printf(" %d", p->value);
        printf("\n");
    }

    /* With the loop gone, an ordinary walk frees everything exactly once. */
    p = nodes[0];
    while (p != NULL) {
        struct node *next = p->next;
        free(p);
        p = next;
    }
    return 0;
}
