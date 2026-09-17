/*
 * title: Happy numbers and the tortoise and hare
 * level: 3
 * about: Repeatedly sums the squares of digits and uses Floyd's two-speed cycle detection to tell happy numbers from sad ones without a table.
 */
#include <stdio.h>

/* 19 -> 1 + 81 = 82 -> 64 + 4 = 68 -> 100 -> 1. Reaching 1 means happy.
   Every other start falls into the loop 4 -> 16 -> 37 -> 58 -> 89 ->
   145 -> 42 -> 20 -> 4 and goes round for ever. */
int next(int n)
{
    int s = 0, d;

    while (n > 0) {
        d = n % 10;
        s += d * d;
        n /= 10;
    }
    return s;
}

/* Floyd's idea: send a tortoise one step at a time and a hare two steps
   at a time along the sequence. If there is a loop, the hare must
   eventually land on the same number as the tortoise. No memory of
   past values is needed, only two ints. The same trick finds loops in
   linked lists. */
int is_happy(int n, int verbose)
{
    int slow = n, fast = n;

    do {
        slow = next(slow);
        fast = next(next(fast));
        if (verbose)
            printf("  tortoise %3d   hare %3d\n", slow, fast);
    } while (slow != fast);
    /* They met. If they met at 1, it is the fixed point 1 -> 1. */
    return slow == 1;
}

int main(void)
{
    int n, count = 0;

    printf("19:\n");
    printf("  %s\n", is_happy(19, 1) ? "happy" : "sad");
    printf("4:\n");
    printf("  %s\n", is_happy(4, 1) ? "happy" : "sad");

    printf("happy numbers up to 100:");
    for (n = 1; n <= 100; n++)
        if (is_happy(n, 0)) {
            printf(" %d", n);
            count++;
        }
    printf("\n%d of them\n", count);
    return 0;
}
