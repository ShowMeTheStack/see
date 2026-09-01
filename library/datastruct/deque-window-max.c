/*
 * title: Sliding window maximum with a deque
 * level: 3
 * about: Finds the hottest day in every 4-day window of a temperature series in one pass, using a double-ended queue of indices held in a circular array.
 */
#include <stdio.h>

#define CAP 16

/* A deque (double-ended queue) can add and remove at both ends. This one
   lives in a circular array: front is the index of the first element, and
   the others follow it, wrapping round at CAP. */
struct deque {
    int item[CAP];
    int front;
    int size;
};

int  dq_empty(const struct deque *d)     { return d->size == 0; }
int  dq_front(const struct deque *d)     { return d->item[d->front]; }
int  dq_back(const struct deque *d)      { return d->item[(d->front + d->size - 1) % CAP]; }
void dq_pop_front(struct deque *d)       { d->front = (d->front + 1) % CAP; d->size--; }
void dq_pop_back(struct deque *d)        { d->size--; }
void dq_push_back(struct deque *d, int v){ d->item[(d->front + d->size) % CAP] = v; d->size++; }

void dq_print(const struct deque *d, const int *temp)
{
    int i;
    printf("{");
    for (i = 0; i < d->size; i++)
        printf(i ? " %d" : "%d", temp[d->item[(d->front + i) % CAP]]);
    printf("}");
}

int main(void)
{
    int temp[] = { 18, 21, 19, 25, 24, 22, 17, 16, 23, 27, 26, 20, 21, 19 };
    int n = (int)(sizeof temp / sizeof temp[0]);
    int k = 4, i;
    struct deque d;

    d.front = 0;
    d.size = 0;

    /* The deque holds indices of days whose temperatures are in decreasing
       order. A new day knocks out every smaller day at the back, since those
       can never be the maximum again while the new one is in the window.
       So the front is always the maximum of the current window. Every index
       is pushed and popped at most once, so the whole thing is O(n). */
    for (i = 0; i < n; i++) {
        while (!dq_empty(&d) && temp[dq_back(&d)] <= temp[i])
            dq_pop_back(&d);
        dq_push_back(&d, i);
        if (dq_front(&d) <= i - k)          /* front has slid out of the window */
            dq_pop_front(&d);

        printf("day %2d temp %2d  deque ", i, temp[i]);
        dq_print(&d, temp);
        if (i >= k - 1)
            printf("  max of days %d..%d = %d", i - k + 1, i, temp[dq_front(&d)]);
        printf("\n");
    }
    return 0;
}
