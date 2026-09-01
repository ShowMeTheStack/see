/*
 * title: A print queue as a linked-list queue
 * level: 2
 * about: Simulates a shared printer, queuing jobs in a linked list with front and rear pointers and printing a few pages per tick in arrival order.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* A queue is first in, first out. Keeping a pointer to BOTH ends makes both
   operations cheap: add at the rear, remove from the front. */
struct job {
    char owner[12];
    int pages;
    int id;
    struct job *next;
};

struct queue {
    struct job *front;
    struct job *rear;
    int size;
};

void enqueue(struct queue *q, const char *owner, int pages, int id)
{
    struct job *j = malloc(sizeof *j);
    if (j == NULL)
        exit(1);
    strcpy(j->owner, owner);
    j->pages = pages;
    j->id = id;
    j->next = NULL;
    if (q->rear == NULL)
        q->front = j;            /* empty queue: the job is both ends */
    else
        q->rear->next = j;
    q->rear = j;
    q->size++;
}

struct job *dequeue(struct queue *q)
{
    struct job *j = q->front;
    if (j == NULL)
        return NULL;
    q->front = j->next;
    if (q->front == NULL)
        q->rear = NULL;          /* forget the rear too, or it would dangle */
    q->size--;
    return j;
}

void show(const struct queue *q)
{
    const struct job *j;
    printf("   queue (%d):", q->size);
    for (j = q->front; j != NULL; j = j->next)
        printf(" #%d %s(%d)", j->id, j->owner, j->pages);
    printf("\n");
}

int main(void)
{
    /* Jobs arriving at given ticks: who, how many pages. */
    struct { int tick; const char *owner; int pages; } arrivals[] = {
        { 0, "ana", 3 }, { 0, "bo", 7 }, { 1, "cy", 2 }, { 3, "dee", 4 },
        { 4, "ana", 1 }, { 6, "eli", 5 }
    };
    int narr = 6, next_arrival = 0, tick, speed = 3, id = 1;
    struct queue q = { NULL, NULL, 0 };
    struct job *printing = NULL;

    for (tick = 0; tick < 10; tick++) {
        while (next_arrival < narr && arrivals[next_arrival].tick == tick) {
            enqueue(&q, arrivals[next_arrival].owner, arrivals[next_arrival].pages, id++);
            printf("t=%2d  %s sends %d page%s\n", tick, arrivals[next_arrival].owner,
                   arrivals[next_arrival].pages, arrivals[next_arrival].pages == 1 ? "" : "s");
            next_arrival++;
        }
        if (printing == NULL && (printing = dequeue(&q)) != NULL)
            printf("t=%2d  printer starts #%d for %s\n", tick, printing->id, printing->owner);
        if (printing != NULL) {
            /* The printer does up to `speed` pages per tick. */
            printing->pages -= speed;
            if (printing->pages <= 0) {
                printf("t=%2d  #%d done\n", tick, printing->id);
                free(printing);
                printing = NULL;
            }
        }
        show(&q);
    }
    free(printing);              /* in case a job was still running */
    while ((printing = dequeue(&q)) != NULL)
        free(printing);
    return 0;
}
