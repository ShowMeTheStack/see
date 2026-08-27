/*
 * title: Factorials with as many digits as they need
 * level: 4
 * about: Computes n! exactly by keeping its decimal digits in a heap array that is extended with realloc whenever a multiplication carries past the last digit.
 * input: 52
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * digits[0] is the ones digit, digits[1] the tens, and so on: storing the
 * number backwards means a carry always grows it at the end of the array,
 * which is exactly where realloc can add room.
 */
struct bignum {
    unsigned char *digits;
    int len;
    int cap;
};

static int push_digit(struct bignum *b, int d)
{
    unsigned char *bigger;
    if (b->len == b->cap) {
        bigger = realloc(b->digits, b->cap * 2);
        if (bigger == NULL)
            return 0;
        b->digits = bigger;
        b->cap *= 2;
    }
    b->digits[b->len++] = (unsigned char)d;
    return 1;
}

/* Schoolbook multiplication by a small number, carrying digit by digit. */
static int multiply(struct bignum *b, int m)
{
    long carry = 0, v;
    int i;
    for (i = 0; i < b->len; i++) {
        v = (long)b->digits[i] * m + carry;
        b->digits[i] = (unsigned char)(v % 10);
        carry = v / 10;
    }
    while (carry > 0) {
        if (!push_digit(b, (int)(carry % 10)))
            return 0;
        carry /= 10;
    }
    return 1;
}

int main(void)
{
    struct bignum f;
    int n, k, i;

    if (scanf("%d", &n) != 1 || n < 0 || n > 400)
        return 0;

    f.cap = 4;
    f.len = 0;
    f.digits = malloc(f.cap);
    if (f.digits == NULL || !push_digit(&f, 1)) {
        free(f.digits);
        return 0;
    }

    /*
     * Watch the digits block in the heap panel: it doubles from 4 to 8 to
     * 16 to 32 to 64 to 128 bytes as the factorial gets longer.
     */
    for (k = 2; k <= n; k++) {
        if (!multiply(&f, k))
            break;
        if (k % 10 == 0 || k == n) {
            printf("%3d! has %3d digits (block of %3d bytes): ", k, f.len, f.cap);
            for (i = f.len - 1; i >= 0; i--)
                putchar('0' + f.digits[i]);
            putchar('\n');
        }
    }

    /* A long holds 10 digits here; 52! has 68, and 52 cards can be shuffled 52! ways. */
    free(f.digits);
    return 0;
}
