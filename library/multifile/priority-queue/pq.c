/* pq.c - a binary heap stored in an array. For the item at index i, its
 * children are at 2i+1 and 2i+2 and its parent at (i-1)/2. No pointers
 * needed: the shape of the tree is all in the arithmetic.
 * Expand items[] in See while patients arrive: the most urgent is always
 * at items[0], but the rest are only partly ordered. */
#include "pq.h"

static int before(const struct patient *a, const struct patient *b)
{
    if (a->priority != b->priority) {
        return a->priority < b->priority;
    }
    return a->arrival < b->arrival;
}

static void swap(struct patient *a, struct patient *b)
{
    struct patient t = *a;
    *a = *b;
    *b = t;
}

void pq_init(struct pq *q)
{
    q->count = 0;
}

/* Put the newcomer at the end, then let it bubble up past less urgent parents. */
int pq_push(struct pq *q, const struct patient *p)
{
    int i, parent;

    if (q->count == PQ_CAP) {
        return 0;
    }
    i = q->count++;
    q->items[i] = *p;
    while (i > 0) {
        parent = (i - 1) / 2;
        if (!before(&q->items[i], &q->items[parent])) {
            break;
        }
        swap(&q->items[i], &q->items[parent]);
        i = parent;
    }
    return 1;
}

/* Take the root, move the last item into its place, let it sink down. */
int pq_pop(struct pq *q, struct patient *out)
{
    int i = 0, child;

    if (q->count == 0) {
        return 0;
    }
    *out = q->items[0];
    q->count--;
    q->items[0] = q->items[q->count];
    for (;;) {
        child = 2 * i + 1;
        if (child >= q->count) {
            break;
        }
        if (child + 1 < q->count && before(&q->items[child + 1], &q->items[child])) {
            child++;
        }
        if (!before(&q->items[child], &q->items[i])) {
            break;
        }
        swap(&q->items[i], &q->items[child]);
        i = child;
    }
    return 1;
}

int pq_size(const struct pq *q)
{
    return q->count;
}
