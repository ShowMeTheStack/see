/*
 * title: A stack module with hidden data
 * level: 1
 * about: Pushes numbers onto a stack kept in another file, then pops them back off in reverse order.
 */

/* This program is a folder of three files: main.c, stack.c and stack.h.
 * See compiles every .c file in the folder on its own, then links them into
 * one program, the same way "cc main.c stack.c" would. The header stack.h is
 * not compiled by itself; it is pasted into each .c file that includes it, so
 * both files agree on what the functions look like. */
#include <stdio.h>
#include "stack.h"

int main(void)
{
    int i;

    /* Step into stack_push (F11) and watch the editor jump to stack.c.
     * The array data[] in the globals panel fills from the left. */
    for (i = 1; i <= 5; i++) {
        stack_push(i * 10);
    }
    printf("size after pushing: %d\n", stack_size());

    /* A stack hands things back last-in, first-out. */
    printf("popped:");
    while (!stack_empty()) {
        printf(" %d", stack_pop());
    }
    printf("\n");

    /* main.c cannot write "top = 0;" here: top is static in stack.c, so
     * the name simply does not exist in this file. The only way in is
     * through the functions in stack.h. That is how C hides data. */
    return 0;
}
