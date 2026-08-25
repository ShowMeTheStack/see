/*
 * title: The stack grows downwards
 * level: 2
 * about: Calls three nested functions and prints the address of a local in each, showing every new frame sits below its caller.
 */
#include <stdio.h>

static void third(int depth)
{
    int here = depth;
    printf("third : local at %p (depth %d)\n", (void *)&here, here);
}

static void second(int depth)
{
    int here = depth;
    printf("second: local at %p (depth %d)\n", (void *)&here, here);
    /* Step into this call (F11): a new frame appears at the bottom of the stack panel. */
    third(depth + 1);
}

static void first(int depth)
{
    int here = depth;
    printf("first : local at %p (depth %d)\n", (void *)&here, here);
    second(depth + 1);
}

int main(void)
{
    int here = 0;

    printf("main  : local at %p (depth %d)\n", (void *)&here, here);
    first(1);

    /*
     * Every address printed is smaller than the one before. On this machine
     * (like most) the stack starts near the top of memory and each call
     * pushes its frame below the caller's. When a function returns, its
     * frame is simply forgotten: the stack pointer moves back up.
     */
    printf("\nBack in main: the deeper frames are gone, main's local is still %d\n", here);
    return 0;
}
