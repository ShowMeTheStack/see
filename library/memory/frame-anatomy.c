/*
 * title: Anatomy of a stack frame
 * level: 4
 * about: Prints the addresses of a function's parameters and locals and of its caller's locals, showing how arguments sit above the locals in each frame.
 */
#include <stdio.h>

static char *callers_local;

static int frame(int first, int second, int third)
{
    int local_a = first + second;
    int local_b = second + third;
    char buffer[8];

    buffer[0] = 'x';

    /*
     * On i386 the caller pushes the arguments (last one first, so first ends
     * up lowest), then the call pushes the return address, then the callee
     * makes room for its locals below that. The arguments therefore sit just
     * above the return address and the locals just below it.
     */
    printf("caller's local  %p\n", (void *)callers_local);
    printf("param third     %p\n", (void *)&third);
    printf("param second    %p\n", (void *)&second);
    printf("param first     %p\n", (void *)&first);
    printf("  (return address and saved frame pointer live in this gap)\n");
    printf("local_a         %p\n", (void *)&local_a);
    printf("local_b         %p\n", (void *)&local_b);
    printf("buffer          %p .. %p\n", (void *)buffer, (void *)(buffer + 7));

    /*
     * Parameters are ordinary local variables that start with the values the
     * caller passed. Changing one changes only this copy.
     */
    first = 999;
    return local_a + local_b + buffer[0] + first;
}

int main(void)
{
    int mine = 5;
    int result;

    callers_local = (char *)&mine;
    /*
     * Step into frame() with F11 and compare with the stack panel: main's
     * frame on top, frame()'s underneath with its three parameters first.
     */
    result = frame(mine, 20, 30);
    printf("\nresult %d, and mine is still %d\n", result, mine);
    return 0;
}
