/*
 * title: scanf without the ampersand
 * level: 1
 * about: Reads a number with scanf("%d", n) instead of scanf("%d", &n).
 * input: 42
 * expect: warning, fault
 */

/*
 * THE PUZZLE
 * scanf must store the number somewhere, so it needs to know where:
 * an address. What does this call pass instead?
 *
 * HOW TO HUNT IT WITH SEE
 * The build panel already has a warning: %d expects an int *, but the
 * argument is an int. Run anyway. scanf takes the value of n, which is
 * 0, uses it as an address, and tries to write 42 there. See stops
 * with a NULL pointer dereference inside scanf. Had n held 1000 or some
 * leftover value instead, the 42 would have been written to some random
 * place in memory, and the crash (if any) would happen far away.
 */
#include <stdio.h>

int main(void)
{
    int n = 0;

    printf("How many tickets? ");
    scanf("%d", n);
    printf("\nYou asked for %d tickets.\n", n);
    return 0;
}

/*
 * THE FIX
 *     scanf("%d", &n);
 * printf gets values, scanf gets addresses. The one exception that
 * catches beginners the other way round is a char array:
 * scanf("%9s", word) is right because the array name already turns
 * into the address of its first element.
 */
