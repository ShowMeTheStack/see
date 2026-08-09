/*
 * title: Integer division and the remainder
 * level: 1
 * about: Shows that / between ints throws away the fraction, how % gives what is left, and what both do with negative numbers.
 */
#include <stdio.h>

int main(void)
{
    int a = 17;
    int b = 5;
    int q, r;

    /*
     * When both sides of / are ints, the answer is an int: 17 / 5 is 3,
     * not 3.4. The fraction is simply dropped. The % operator gives the
     * remainder: what is left over after taking out as many 5s as fit.
     */
    q = a / b;
    r = a % b;
    printf("%d / %d = %d\n", a, b, q);
    printf("%d %% %d = %d\n", a, b, r);

    /* The two always fit together: quotient times divisor plus remainder
       gives back the number you started with. */
    printf("check: %d * %d + %d = %d\n", q, b, r, q * b + r);

    /* If one side is a double, the division is done in floating point. */
    printf("17.0 / 5 = %f\n", 17.0 / 5);
    printf("(double)a / b = %f\n", (double)a / b);

    /* A common slip: the cast comes too late. a / b is worked out first, as
       ints, giving 3; only then is 3 turned into 3.0. */
    printf("(double)(a / b) = %f\n", (double)(a / b));

    /*
     * With negative numbers, C89 lets compilers choose, but nearly all of
     * them (See included) round the quotient toward zero, and the
     * remainder then takes the sign of the left-hand number.
     */
    printf("\n -17 /  5 = %d,  -17 %%  5 = %d\n", -17 / 5, -17 % 5);
    printf(" 17 / -5 = %d,  17 %% -5 = %d\n", 17 / -5, 17 % -5);
    printf("-17 / -5 = %d, -17 %% -5 = %d\n", -17 / -5, -17 % -5);

    /* Everyday uses of % : is a number even, and what is its last digit? */
    printf("\n%d is %s\n", a, a % 2 == 0 ? "even" : "odd");
    printf("last digit of 2024 is %d, the rest is %d\n", 2024 % 10, 2024 / 10);
    return 0;
}
