/*
 * title: Factorials that wrap around
 * level: 1
 * about: Prints a table of n! for n up to 15 in an int, which overflows at 13!.
 * expect: runtime
 */

/*
 * THE PUZZLE
 * The table looks right up to 12! = 479001600. Then 13! comes out
 * smaller than 12!, and 14! smaller again. Factorials only grow. What
 * is the largest value an int can hold on this machine?
 *
 * HOW TO HUNT IT WITH SEE
 * Run it and read the warning: See points at the multiplication and
 * shows the two numbers whose product does not fit. Look up INT_MAX
 * (2147483647 here, since int is 32 bits). Signed overflow is
 * undefined behaviour in C: the hardware usually wraps around, but an
 * optimising compiler is allowed to assume it never happens, and may
 * produce code that does something stranger still. Start with F5, add f
 * to the Watch panel and click its eye to make it a watchpoint; then
 * each F5 runs to the next change of f, and you can see the jump.
 */
#include <stdio.h>
#include <limits.h>

int main(void)
{
    int n;
    int f = 1;

    printf("INT_MAX is %d\n", INT_MAX);
    for (n = 1; n <= 15; n++) {
        f = f * n;
        printf("%2d! = %d\n", n, f);
    }
    return 0;
}

/*
 * THE FIX
 * Check before multiplying, and stop when the next step would not fit:
 *
 *     if (f > INT_MAX / n) {
 *         printf("%d! does not fit in an int\n", n);
 *         break;
 *     }
 *
 * C89 has no long long, and long is also 32 bits here, so a double (exact
 * up to about 9e15) or an unsigned long (defined to wrap, though still
 * wrong) are the other choices. The real answer is to know your range.
 */
