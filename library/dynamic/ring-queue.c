/*
 * title: A ring-buffer queue that grows
 * level: 3
 * about: Keeps a queue in a circular heap array and, when it fills up, moves the items in order into a block twice the size, unwrapping the ring as it goes.
 */
#include <stdio.h>
#include <stdlib.h>

struct queue {
    int *items;
    int head;       /* index of the oldest item */
    int count;
    int cap;
};

static int grow(struct queue *q)
{
    int newcap = q->cap * 2;
    int *bigger = malloc(newcap * sizeof *bigger);
    int i;

    if (bigger == NULL)
        return 0;
    /*
     * realloc would copy the slots in their wrapped order, with the oldest
     * item somewhere in the middle. Copying by hand puts the oldest at 0.
     */
    for (i = 0; i < q->count; i++)
        bigger[i] = q->items[(q->head + i) % q->cap];
    printf("  grow %d -> %d\n", q->cap, newcap);
    free(q->items);
    q->items = bigger;
    q->head = 0;
    q->cap = newcap;
    return 1;
}

static int enqueue(struct queue *q, int v)
{
    if (q->count == q->cap && !grow(q))
        return 0;
    q->items[(q->head + q->count) % q->cap] = v;
    q->count++;
    return 1;
}

static int dequeue(struct queue *q)
{
    int v = q->items[q->head];
    q->head = (q->head + 1) % q->cap;
    q->count--;
    return v;
}

static void show(const struct queue *q)
{
    int i;
    printf("  slots:");
    for (i = 0; i < q->cap; i++) {
        /* A slot is in use if it is within count steps after head. */
        int age = (i - q->head + q->cap) % q->cap;
        if (age < q->count)
            printf(" %3d", q->items[i]);
        else
            printf("   .");
    }
    printf("   head=%d count=%d\n", q->head, q->count);
}

int main(void)
{
    struct queue q;
    int i, next = 1;

    q.cap = 4;
    q.head = q.count = 0;
    q.items = malloc(q.cap * sizeof *q.items);
    if (q.items == NULL)
        return 0;

    /* Add three, take two, so the ring starts to wrap round. */
    for (i = 0; i < 3; i++)
        enqueue(&q, next++);
    show(&q);
    printf("took %d", dequeue(&q));
    printf(" and %d\n", dequeue(&q));
    for (i = 0; i < 3; i++)
        enqueue(&q, next++);
    show(&q);

    /* One more forces a grow; watch the heap panel swap blocks. */
    for (i = 0; i < 3; i++)
        enqueue(&q, next++);
    show(&q);

    printf("draining:");
    while (q.count > 0)
        printf(" %d", dequeue(&q));
    printf("\n");
    free(q.items);
    return 0;
}
