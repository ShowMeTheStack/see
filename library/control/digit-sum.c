/*
 * title: Digits of a number
 * level: 1
 * about: Peels the digits off a number with % and / to count them and add them up.
 * input: 90417
 */
#include <stdio.h>

int main(void)
{
    long n;
    long rest;
    int digits = 0;
    int sum = 0;

    scanf("%ld", &n);
    rest = n;

    /* n % 10 is the last digit; n / 10 throws the last digit away.
       Repeat until nothing is left. Step through and watch rest lose a
       digit from the right each time: 90417, 9041, 904, 90, 9, 0. */
    do {
        printf("last digit %ld, ", rest % 10);
        sum += (int)(rest % 10);
        digits++;
        rest /= 10;
        printf("what is left %ld\n", rest);
    } while (rest != 0);
    /* do-while, not while, so that the number 0 still counts as one digit. */

    printf("%ld has %d digits adding up to %d\n", n, digits, sum);
    return 0;
}
