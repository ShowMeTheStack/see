/*
 * title: An emergency room priority queue on a binary heap
 * level: 3
 * about: Admits patients with urgency levels into a min-heap stored in an array, always treats the most urgent next, and keeps arrival order among equals.
 */
#include <stdio.h>
#include <string.h>

#define CAP 16

struct patient {
    char name[12];
    int urgency;      /* 1 is most urgent */
    int arrival;      /* tie-breaker: earlier first */
};

/* A binary heap is a complete binary tree stored in an array with no
   pointers at all. The children of slot i are slots 2i+1 and 2i+2, and its
   parent is (i-1)/2. Every parent is "more urgent" than its children, so the
   most urgent patient is always in slot 0. */
struct heap {
    struct patient a[CAP];
    int n;
};

int before(const struct patient *x, const struct patient *y)
{
    if (x->urgency != y->urgency)
        return x->urgency < y->urgency;
    return x->arrival < y->arrival;
}

void swap(struct patient *x, struct patient *y)
{
    struct patient t = *x;
    *x = *y;
    *y = t;
}

/* Put the new patient at the end, then let them climb past any parent that
   should come after them. At most log2(n) swaps. */
void push(struct heap *h, const char *name, int urgency, int arrival)
{
    int i = h->n++;
    memset(&h->a[i], 0, sizeof h->a[i]);
    strcpy(h->a[i].name, name);
    h->a[i].urgency = urgency;
    h->a[i].arrival = arrival;
    while (i > 0 && before(&h->a[i], &h->a[(i - 1) / 2])) {
        swap(&h->a[i], &h->a[(i - 1) / 2]);
        i = (i - 1) / 2;
    }
}

/* Take the root, move the last patient into the root's place, then let them
   sink below any child that should go first. */
struct patient pop(struct heap *h)
{
    struct patient top = h->a[0];
    int i = 0;
    h->a[0] = h->a[--h->n];
    for (;;) {
        int l = 2 * i + 1, r = 2 * i + 2, best = i;
        if (l < h->n && before(&h->a[l], &h->a[best])) best = l;
        if (r < h->n && before(&h->a[r], &h->a[best])) best = r;
        if (best == i)
            break;
        swap(&h->a[i], &h->a[best]);
        i = best;
    }
    return top;
}

void show_heap(const struct heap *h)
{
    int i;
    printf("   heap array:");
    for (i = 0; i < h->n; i++)
        printf(" %s/%d", h->a[i].name, h->a[i].urgency);
    printf("\n");
}

int main(void)
{
    struct heap er;
    struct patient p;
    int clock = 0;

    er.n = 0;
    push(&er, "Sprain", 4, clock++);
    push(&er, "Fever", 3, clock++);
    push(&er, "Burn", 2, clock++);
    push(&er, "Cough", 5, clock++);
    push(&er, "Fracture", 2, clock++);
    show_heap(&er);

    p = pop(&er);
    printf("treat %s (urgency %d)\n", p.name, p.urgency);
    show_heap(&er);

    push(&er, "Cardiac", 1, clock++);
    push(&er, "Rash", 4, clock++);
    printf("two more arrive\n");
    show_heap(&er);

    while (er.n > 0) {
        p = pop(&er);
        printf("treat %-8s urgency %d, arrived %d\n", p.name, p.urgency, p.arrival);
    }
    return 0;
}
