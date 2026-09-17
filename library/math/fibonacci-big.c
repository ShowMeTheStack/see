/*
 * title: Huge Fibonacci numbers on the heap
 * level: 4
 * about: Computes Fibonacci numbers far beyond a long by adding heap-allocated decimal digit strings, rotating three buffers.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* A big number is a heap block of digits, least significant first, plus
   its length. Storing digits as values 0..9 (not '0'..'9') keeps the
   arithmetic simple; we add '0' only when printing. */
typedef struct {
    char *digits;
    int len;
    int cap;
} BigNum;

BigNum *big_new(int cap, int value)
{
    BigNum *b = malloc(sizeof *b);
    if (b == NULL)
        exit(1);
    b->digits = malloc(cap);
    if (b->digits == NULL)
        exit(1);
    b->cap = cap;
    b->len = 0;
    do {                                /* store value's digits */
        b->digits[b->len++] = (char)(value % 10);
        value /= 10;
    } while (value > 0);
    return b;
}

void big_free(BigNum *b)
{
    free(b->digits);
    free(b);
}

/* r = x + y, the way you add on paper. r must have room for one more
   digit than the longer of x and y. */
void big_add(BigNum *r, const BigNum *x, const BigNum *y)
{
    int i, carry = 0, s;
    int n = x->len > y->len ? x->len : y->len;

    for (i = 0; i < n; i++) {
        s = carry;
        if (i < x->len) s += x->digits[i];
        if (i < y->len) s += y->digits[i];
        r->digits[i] = (char)(s % 10);
        carry = s / 10;
    }
    if (carry)
        r->digits[i++] = (char)carry;
    r->len = i;
}

void big_print(const BigNum *b)
{
    int i;

    for (i = b->len - 1; i >= 0; i--)
        putchar('0' + b->digits[i]);
}

int main(void)
{
    /* F(n) has about n * 0.209 digits, so 120 is plenty for F(500). */
    BigNum *a = big_new(120, 0);   /* F(n-1) */
    BigNum *b = big_new(120, 1);   /* F(n)   */
    BigNum *c = big_new(120, 0);   /* scratch for F(n+1) */
    BigNum *t;
    int n;

    for (n = 1; n <= 500; n++) {
        if (n <= 10 || n == 46 || n == 47 || n % 100 == 0) {
            printf("F(%d) = ", n);
            big_print(b);
            printf("%s\n", n == 46 ? "   <- the last one that fits in a signed long"
                   : n == 47 ? "   <- too big for a 32-bit signed long" : "");
        }
        /* c = a + b, then rotate: a <- b, b <- c, c <- old a. No copying
           of digits, no new blocks: only three pointers swap places.
           Watch the arrows from a, b and c move round in a circle. */
        big_add(c, a, b);
        t = a;
        a = b;
        b = c;
        c = t;
    }

    big_free(a);
    big_free(b);
    big_free(c);
    return 0;
}
