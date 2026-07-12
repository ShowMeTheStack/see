/* main.c: uses the stack module. See builds every .c file in this folder
   and links them into one program; stack.h is how main.c knows the names. */
#include <stdio.h>
#include "stack.h"

int main(void)
{
    stack_push(1);
    stack_push(2);
    stack_push(3);
    printf("size %d\n", stack_size());
    while (stack_size() > 0)
        printf("popped %d\n", stack_pop());
    return 0;
}
