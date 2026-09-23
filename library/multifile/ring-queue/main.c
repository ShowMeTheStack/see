/*
 * title: A ring-buffer queue that wraps around
 * level: 2
 * about: Feeds letters into a five-slot circular queue and takes them out, showing the slots wrap around.
 * input: ABC--DEFGH---IJ-----
 */

/* See compiles main.c and queue.c on their own and links them. Each
 * character of input is a command: '-' takes one item out, and any other
 * character is put in. Watch items[] in the stack panel: the
 * letters march to the right and wrap back to slot 0. */
#include <stdio.h>
#include "queue.h"

int main(void)
{
    struct queue q;
    int c;
    char got;

    queue_init(&q);
    while ((c = getchar()) != EOF && c != '\n') {
        if (c == '-') {
            if (queue_get(&q, &got)) {
                printf("get %c\n", got);
            } else {
                printf("get: empty\n");
            }
            queue_show(&q);
        } else {
            if (queue_put(&q, (char)c)) {
                printf("put %c\n", c);
            } else {
                printf("put %c: full\n", c);
            }
        }
    }
    queue_show(&q);
    return 0;
}
