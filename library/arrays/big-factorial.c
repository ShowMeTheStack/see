/*
 * title: 50 factorial, digit by digit
 * level: 4
 * about: Computes factorials far too big for any C integer by keeping one decimal digit per array element and multiplying like on paper.
 */
#include <stdio.h>

#define MAXD 200

/* digits[0] is the ones digit, digits[1] the tens, and so on: storing the
   number backwards means a carry always grows the array at the end. */
static int multiply(int *digits, int len, int m)
{
    int i, carry = 0, prod;
    for (i = 0; i < len; i++) {
        prod = digits[i] * m + carry;
        digits[i] = prod % 10;
        carry = prod / 10;
    }
    /* Leftover carry becomes new high digits. */
    while (carry > 0) {
        if (len >= MAXD) {
            printf("out of room\n");
            return len;
        }
        digits[len++] = carry % 10;
        carry /= 10;
    }
    return len;
}

static void print_number(const int *digits, int len)
{
    int i;
    for (i = len - 1; i >= 0; i--)   /* backwards, so most significant first */
        putchar('0' + digits[i]);
}

int main(void)
{
    int digits[MAXD];
    int len = 1, n;
    unsigned long small = 1;

    digits[0] = 1;   /* start from the number 1 */
    for (n = 1; n <= 50; n++) {
        len = multiply(digits, len, n);
        if (n <= 12)
            small *= (unsigned long)n;    /* 12! is the last that fits in 32 bits */
        if (n == 12 || n == 13 || n == 20 || n == 30 || n == 50) {
            printf("%2d! = ", n);
            print_number(digits, len);
            printf("  (%d digits)\n", len);
        }
    }
    printf("12! in an unsigned long is %lu, which matches; 13! would not fit.\n", small);
    return 0;
}
