/*
 * title: A queue made from two stacks
 * level: 2
 * about: Builds a first-in first-out queue out of two array stacks, pouring one into the other only when needed, and counts the moves to show the cost evens out.
 */
#include <stdio.h>

#define CAP 16

struct stack {
    int item[CAP];
    int top;
};

void push(struct stack *s, int v) { s->item[s->top++] = v; }
int pop(struct stack *s) { return s->item[--s->top]; }
int empty(const struct stack *s) { return s->top == 0; }

/* New arrivals go on the "in" stack. Leavers come off the "out" stack.
   When "out" is empty, pour all of "in" into it: that reverses their order,
   so the oldest arrival ends up on top. Each value is moved at most once,
   so on average every operation is cheap even though one pour may be big. */
struct queue {
    struct stack in, out;
    int moves;
};

void enqueue(struct queue *q, int v)
{
    push(&q->in, v);
}

int dequeue(struct queue *q)
{
    if (empty(&q->out))
        while (!empty(&q->in)) {
            push(&q->out, pop(&q->in));
            q->moves++;
        }
    return pop(&q->out);
}

void show(const struct queue *q)
{
    int i;
    printf("   in [");
    for (i = 0; i < q->in.top; i++)
        printf(" %d", q->in.item[i]);
    printf(" ]  out [");
    for (i = 0; i < q->out.top; i++)
        printf(" %d", q->out.item[i]);
    printf(" ]  (tops are on the right)\n");
}

int main(void)
{
    struct queue q;
    int i, ops = 0;

    q.in.top = q.out.top = 0;
    q.moves = 0;

    for (i = 1; i <= 4; i++) {
        enqueue(&q, i * 11);
        ops++;
    }
    show(&q);
    printf("dequeue -> %d   (this one poured everything across)\n", dequeue(&q));
    ops++;
    show(&q);
    enqueue(&q, 55);
    enqueue(&q, 66);
    ops += 2;
    show(&q);
    while (!empty(&q.in) || !empty(&q.out)) {
        printf("dequeue -> %d\n", dequeue(&q));
        ops++;
    }
    show(&q);
    printf("%d operations, %d values moved between stacks\n", ops, q.moves);
    return 0;
}
