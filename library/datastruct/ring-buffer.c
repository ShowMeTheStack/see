/*
 * title: A circular buffer of recent readings
 * level: 2
 * about: Stores sensor readings in a fixed-size ring buffer that overwrites the oldest value when full, and prints a moving average after each one.
 */
#include <stdio.h>

#define SIZE 5

/* A ring buffer is an ordinary array plus two indices. head is where the
   next value goes, count is how many are stored. When head runs off the end
   it wraps round to 0 with the % operator, so the array is used as if its
   ends were joined in a circle. */
struct ring {
    int data[SIZE];
    int head;
    int count;
};

void ring_put(struct ring *r, int value)
{
    r->data[r->head] = value;
    r->head = (r->head + 1) % SIZE;
    if (r->count < SIZE)
        r->count++;
    /* When full, the slot we just wrote was the oldest value: it is gone. */
}

/* The oldest value sits count places behind head. Adding SIZE before the %
   keeps the index from going negative. */
int ring_get(const struct ring *r, int i)
{
    return r->data[(r->head - r->count + i + SIZE) % SIZE];
}

void ring_print(const struct ring *r)
{
    int i;
    printf("[");
    for (i = 0; i < r->count; i++)
        printf(i ? " %d" : "%d", ring_get(r, i));
    printf("]");
}

int main(void)
{
    int readings[] = { 21, 22, 22, 25, 30, 29, 24, 23, 23, 22, 40, 22 };
    int n = (int)(sizeof readings / sizeof readings[0]);
    struct ring r = { { 0 }, 0, 0 };
    int i, k;

    for (i = 0; i < n; i++) {
        long sum = 0;
        ring_put(&r, readings[i]);
        for (k = 0; k < r.count; k++)
            sum += ring_get(&r, k);
        /* Watch data[] in the memory picture: once full, each new reading
           lands on top of the oldest one while head keeps going round. */
        printf("in %2d  head=%d  oldest..newest ", readings[i], r.head);
        ring_print(&r);
        printf("  average %.1f\n", (double)sum / r.count);
    }
    return 0;
}
