/* queue.h - a first-in, first-out queue in a fixed ring of slots. */
#ifndef QUEUE_H
#define QUEUE_H

#define QSIZE 5

struct queue {
    char items[QSIZE];
    int head;   /* index of the oldest item */
    int count;  /* how many are in the queue */
};

void queue_init(struct queue *q);
int queue_put(struct queue *q, char c);
int queue_get(struct queue *q, char *out);
void queue_show(const struct queue *q);

#endif
