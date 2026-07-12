/* stack.c: the stack's data is static, so no other file can touch it directly */
#include "stack.h"

#define CAPACITY 16

static int items[CAPACITY];   /* static at file level: private to this file */
static int top;

void stack_push(int value)
{
    if (top < CAPACITY)
        items[top++] = value;
}

int stack_pop(void)
{
    return top > 0 ? items[--top] : 0;
}

int stack_size(void)
{
    return top;
}
