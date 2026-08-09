/*
 * title: Adding two numbers from the keyboard
 * level: 1
 * about: Reads two whole numbers with scanf and prints their sum, difference, product, quotient and remainder.
 * input: 38 7
 */
#include <stdio.h>

int main(void)
{
    int a, b;

    printf("Type two whole numbers: ");

    /*
     * scanf is printf's mirror image: it reads text and turns it into
     * values. It needs to store those values somewhere, so it is given the
     * addresses of a and b, written &a and &b. Without the & it would get
     * copies of whatever a and b happen to hold, and could not change them.
     *
     * Step over this line (F10) in See and watch a and b on the stack
     * change from uninitialised to 38 and 7.
     */
    scanf("%d %d", &a, &b);

    /* Input typed at a keyboard is echoed by the terminal; here it is
       canned, so print it back to make the output readable. */
    printf("%d %d\n", a, b);

    printf("%d + %d = %d\n", a, b, a + b);
    printf("%d - %d = %d\n", a, b, a - b);
    printf("%d * %d = %d\n", a, b, a * b);

    /* Dividing by zero would stop the program, so check first. */
    if (b != 0) {
        printf("%d / %d = %d remainder %d\n", a, b, a / b, a % b);
    } else {
        printf("cannot divide by zero\n");
    }
    return 0;
}
