/* stack.c - a fixed-size stack of ints.
 * "static" at file scope means "private to this file": main.c cannot name
 * data or top, even with an extern declaration. In See, look in the globals
 * panel: both appear there (they live as long as the program), labelled with
 * this file, but only code in stack.c ever touches them. */
#include <stdio.h>
#include <stdlib.h>
#include "stack.h"

#define STACK_MAX 8

static int data[STACK_MAX];
static int top = 0;     /* number of items, and the index of the next free slot */

void stack_push(int value)
{
    if (top == STACK_MAX) {
        printf("stack full, %d dropped\n", value);
        return;
    }
    data[top] = value;
    top++;
}

int stack_pop(void)
{
    if (top == 0) {
        printf("pop from empty stack\n");
        return 0;
    }
    top--;
    return data[top];
}

int stack_empty(void)
{
    return top == 0;
}

int stack_size(void)
{
    return top;
}
