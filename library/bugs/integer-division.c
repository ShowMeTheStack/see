/*
 * title: Fahrenheit to Celsius gives zero
 * level: 1
 * about: Converts temperatures with 5 / 9 * (f - 32) and gets 0 for every one of them.
 */

/*
 * THE PUZZLE
 * c is a double, so the answer should have decimals. Instead every
 * temperature converts to 0.0 Celsius. The program runs cleanly; the
 * mistake is in the arithmetic.
 *
 *   expected:  32 -> 0.0, 50 -> 10.0, 98 -> 36.7, 212 -> 100.0
 *   actual:    0.0 for all of them
 *
 * What type is 5? What type is 9? What is 5 / 9 in that type?
 *
 * HOW TO HUNT IT WITH SEE
 * Add the expression 5 / 9 to the Watch panel while stopped in the
 * loop: it shows 0. Then try 5.0 / 9. The type of the variable on the
 * left of = does not matter: C works out the right-hand side first,
 * using the types of its own operands, and only converts the finished
 * result to double when it is stored.
 */
#include <stdio.h>

int main(void)
{
    int temps[4];
    double c;
    int i;

    temps[0] = 32;
    temps[1] = 50;
    temps[2] = 98;
    temps[3] = 212;

    for (i = 0; i < 4; i++) {
        c = 5 / 9 * (temps[i] - 32);
        printf("%3d F = %5.1f C\n", temps[i], c);
    }
    return 0;
}

/*
 * THE FIX
 *     c = 5.0 / 9.0 * (temps[i] - 32);
 * or keep the integers but multiply first:  (temps[i] - 32) * 5 / 9.0.
 * K&R's very first temperature program makes this point too: as soon
 * as one operand is floating point, the other is converted and the
 * division keeps its fraction.
 */
