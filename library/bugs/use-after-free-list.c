/*
 * title: Freeing a list and then following it
 * level: 3
 * about: Builds a linked list of four numbers and frees it with a loop that reads each node after freeing it.
 * expect: fault
 */

/*
 * THE PUZZLE
 * The list is built and printed correctly. The trouble is in the last
 * loop, the one that gives the memory back. Look at the order of
 * events in one pass: free(p) runs in the body, and then the for
 * statement's third part, p = p->next, runs. Where does p->next live?
 *
 * HOW TO HUNT IT WITH SEE
 * Run it. See stops on the for line with "use after free". Step back
 * with F8 to just before the free and look at the heap: four blocks,
 * each arrow pointing to the next. Step forward with F10 and watch the
 * first block turn into freed memory, while p still points at it. The
 * arrow is still drawn, but it now leads to memory that is not yours.
 */
#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

static struct node *push(struct node *head, int value)
{
    struct node *n = malloc(sizeof *n);

    if (n == NULL) {
        printf("out of memory\n");
        exit(1);
    }
    n->value = value;
    n->next = head;
    return n;
}

int main(void)
{
    struct node *head = NULL;
    struct node *p;
    int i;

    for (i = 1; i <= 4; i++)
        head = push(head, i * 10);

    for (p = head; p != NULL; p = p->next)
        printf("%d ", p->value);
    printf("\n");

    for (p = head; p != NULL; p = p->next)
        free(p);

    printf("list freed\n");
    return 0;
}

/*
 * THE FIX
 * Save the next pointer before you free the node that holds it:
 *
 *     while (head != NULL) {
 *         struct node *next = head->next;
 *         free(head);
 *         head = next;
 *     }
 *
 * Programs with this bug often appear to work, because freed memory
 * usually still holds the old bytes for a while. That is luck, not
 * correctness: the next malloc can hand those bytes to someone else.
 */
