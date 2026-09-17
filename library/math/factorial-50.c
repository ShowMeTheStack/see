/*
 * title: Factorial of 50 with a digit array
 * level: 2
 * about: Computes 50! exactly by keeping one decimal digit per array element and multiplying the way you would on paper.
 */
#include <stdio.h>

#define MAXDIGITS 100

/* digits[0] is the units digit, digits[1] the tens, and so on.
   Storing the number backwards makes carrying easy: the carry always
   moves to the next index up. Open the stack panel and watch the array
   fill with digits from the left as the number grows. */
int main(void)
{
    int digits[MAXDIGITS];
    int len = 1;            /* how many digits are in use */
    int n, i, carry, product;

    digits[0] = 1;          /* start with 1 */

    for (n = 2; n <= 50; n++) {
        carry = 0;
        /* Multiply every digit by n, exactly like long multiplication
           by a single number: keep the last digit, carry the rest. */
        for (i = 0; i < len; i++) {
            product = digits[i] * n + carry;
            digits[i] = product % 10;
            carry = product / 10;
        }
        /* Whatever carry is left becomes new digits at the top. */
        while (carry > 0) {
            digits[len] = carry % 10;
            carry /= 10;
            len++;
        }
        if (n % 10 == 0) {
            printf("%2d! = ", n);
            for (i = len - 1; i >= 0; i--)
                printf("%d", digits[i]);
            printf("  (%d digits)\n", len);
        }
    }

    /* An int would have overflowed at 13!, a 32-bit long too. */
    printf("an int could only reach 12! = %d\n", 479001600);
    return 0;
}
