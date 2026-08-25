/*
 * title: Where const things are kept
 * level: 2
 * about: Compares the addresses of const and ordinary globals, a const local and a table of strings to see which land in read-only memory and which on the stack.
 */
#include <stdio.h>

const int limit = 100;                 /* a const global: read-only data */
int counter = 0;                       /* an ordinary global: writable data */
const char *const days[] = { "Mon", "Tue", "Wed" };  /* pointers and strings both fixed */

int main(void)
{
    const int local_limit = 7;         /* const, but still an automatic: on the stack */
    int i;

    printf("limit       %p  (const global)\n", (void *)&limit);
    printf("days        %p  (const table of pointers)\n", (void *)days);
    printf("\"Mon\"       %p  (the literal itself)\n", (void *)days[0]);
    printf("counter     %p  (plain global)\n", (void *)&counter);
    printf("local_limit %p  (const local)\n", (void *)&local_limit);

    /*
     * const is a promise checked by the compiler: "I will not change this
     * through this name". For globals the toolchain can also put the object
     * in a read-only area, so even a sneaky write through a cast would trap.
     * A const local is still in the writable stack; only the compiler stops you.
     */
    for (i = 0; i < 3 && counter < limit; i++)
        counter += local_limit;
    printf("\ncounter = %d after %d steps of %d (limit %d)\n", counter, i, local_limit, limit);

    for (i = 0; i < 3; i++)
        printf("%s ", days[i]);
    printf("\n");
    return 0;
}
