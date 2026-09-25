/*
 * title: Double factorial that never stops
 * level: 2
 * about: Computes n!! = n * (n-2) * (n-4) ... recursively, with a base case that even numbers step over.
 * expect: fault
 */

/*
 * THE PUZZLE
 * dfact(5) works: 5 * 3 * 1 = 15. dfact(6) should be 6 * 4 * 2 = 48.
 * Follow the calls for 6 by hand: 6, 4, 2, 0, -2, ... Which call is
 * supposed to stop the recursion, and does 6 ever reach it?
 *
 * HOW TO HUNT IT WITH SEE
 * See stops with "stack overflow" after tens of thousands of calls.
 * Look at the stack panel: a tower of dfact frames, each one with its
 * own n. Scroll to the top of the tower and see how negative n has
 * become. To catch it earlier, right-click the margin beside the
 * return line, choose "Stop only when..." and type n < 0, then run
 * again: the first stop shows you the call that jumped over the base
 * case, with the whole chain of callers still on the stack.
 */
#include <stdio.h>

static int dfact(int n)
{
    if (n == 1)
        return 1;
    return n * dfact(n - 2);
}

int main(void)
{
    printf("5!! = %d\n", dfact(5));
    printf("6!! = %d\n", dfact(6));
    return 0;
}

/*
 * THE FIX
 *     if (n <= 1)
 *         return 1;
 * A base case written as "equals" is fragile when the recursion
 * steps by more than one. Write it as a range ("n <= 1") so that no
 * path can skip it. The same applies to loops: "while (i != 10)" with
 * i += 3 never ends either.
 */
