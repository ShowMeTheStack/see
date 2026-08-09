/*
 * title: Celsius to Fahrenheit, three ways
 * level: 1
 * about: Converts a Celsius temperature to Fahrenheit using int arithmetic, then double arithmetic, and shows why 9/5 gives the wrong answer.
 * input: 37
 */
#include <stdio.h>

int main(void)
{
    int celsius;
    int f_int;
    double f_wrong;
    double f_right;

    printf("Temperature in Celsius: ");
    scanf("%d", &celsius);
    printf("%d\n", celsius);

    /*
     * The formula is F = C * 9 / 5 + 32. In int arithmetic the order
     * matters: multiplying first keeps as much as possible before the
     * division throws the fraction away. 37 * 9 is 333, 333 / 5 is 66.
     */
    f_int = celsius * 9 / 5 + 32;

    /*
     * Writing 9 / 5 on its own is a classic trap. Both are ints, so 9 / 5
     * is 1, and the result is just C + 32, even though it ends up stored
     * in a double. The type of the variable on the left does not change
     * how the right-hand side is worked out.
     */
    f_wrong = 9 / 5 * celsius + 32;

    /* Writing 9.0 makes the whole calculation happen in double. */
    f_right = 9.0 / 5.0 * celsius + 32.0;

    printf("int arithmetic   : %d F\n", f_int);
    printf("9 / 5 trap       : %.1f F\n", f_wrong);
    printf("double arithmetic: %.1f F\n", f_right);
    return 0;
}
