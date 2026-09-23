/* queue.c - the ring buffer. The tail is not stored: it is always
 * (head + count) % QSIZE. When an index runs off the end of the array,
 * % brings it back to 0, so the slots are reused round and round. */
#include <stdio.h>
#include "queue.h"

void queue_init(struct queue *q)
{
    int i;
    for (i = 0; i < QSIZE; i++) {
        q->items[i] = '.';  /* just so empty slots are visible */
    }
    q->head = 0;
    q->count = 0;
}

int queue_put(struct queue *q, char c)
{
    if (q->count == QSIZE) {
        return 0;
    }
    q->items[(q->head + q->count) % QSIZE] = c;
    q->count++;
    return 1;
}

int queue_get(struct queue *q, char *out)
{
    if (q->count == 0) {
        return 0;
    }
    *out = q->items[q->head];
    q->items[q->head] = '.';
    q->head = (q->head + 1) % QSIZE;
    q->count--;
    return 1;
}

/* Shows the raw slots, with ^ under the head. */
void queue_show(const struct queue *q)
{
    int i;

    printf("  slots: ");
    for (i = 0; i < QSIZE; i++) {
        printf("%c ", q->items[i]);
    }
    printf("  count %d\n         ", q->count);
    for (i = 0; i < QSIZE; i++) {
        printf("%s", i == q->head ? "^ " : "  ");
    }
    printf("\n");
}
