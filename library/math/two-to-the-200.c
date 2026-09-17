/*
 * title: 2 to the power 200 in base 10000
 * level: 4
 * about: Doubles a big number 200 times, storing four decimal digits in each array cell, and checks it against 2^100 squared.
 */
#include <stdio.h>
#include <string.h>

#define BASE 10000      /* each cell holds 0..9999: four digits */
#define CELLS 20        /* 80 decimal digits is plenty for 2^200 */

/* A big number: cells[0] holds the lowest four digits. Using base 10000
   instead of base 10 means four times fewer cells and four times fewer
   steps, and printing stays easy because 10000 is a power of ten. */
typedef struct {
    int cells[CELLS];
    int used;
} Big;

void big_set(Big *b, int value)
{
    memset(b->cells, 0, sizeof b->cells);
    b->cells[0] = value;
    b->used = 1;
}

void big_double(Big *b)
{
    int i, carry = 0, t;

    for (i = 0; i < b->used; i++) {
        t = b->cells[i] * 2 + carry;
        b->cells[i] = t % BASE;
        carry = t / BASE;
    }
    if (carry)
        b->cells[b->used++] = carry;
}

/* r = x * y, schoolbook style: every cell of x meets every cell of y.
   A product of two cells is at most 9999 * 9999, just under 10^8, so it
   fits comfortably in a 32-bit long, carry included. */
void big_mul(Big *r, const Big *x, const Big *y)
{
    long acc[2 * CELLS];
    long carry;
    int i, j;

    for (i = 0; i < 2 * CELLS; i++)
        acc[i] = 0;
    for (i = 0; i < x->used; i++) {
        carry = 0;
        for (j = 0; j < y->used; j++) {
            acc[i + j] += (long)x->cells[i] * y->cells[j] + carry;
            carry = acc[i + j] / BASE;
            acc[i + j] %= BASE;
        }
        acc[i + y->used] += carry;
    }
    r->used = x->used + y->used;
    while (r->used > 1 && acc[r->used - 1] == 0)
        r->used--;
    for (i = 0; i < CELLS; i++)
        r->cells[i] = (i < r->used) ? (int)acc[i] : 0;
}

/* The top cell prints as it is; every lower cell must print exactly
   four digits, so 7 shows as 0007. %04d does the padding for us. */
void big_print(const char *label, const Big *b)
{
    int i;

    printf("%s", label);
    printf("%d", b->cells[b->used - 1]);
    for (i = b->used - 2; i >= 0; i--)
        printf("%04d", b->cells[i]);
    printf("\n");
}

int main(void)
{
    Big p, half, check;
    int k;

    big_set(&p, 1);
    for (k = 1; k <= 200; k++) {
        big_double(&p);
        if (k == 100)
            half = p;      /* struct assignment copies all the cells */
        if (k % 50 == 0) {
            printf("2^%-3d = ", k);
            big_print("", &p);
        }
    }

    /* Two different routes must land on the same number. */
    big_mul(&check, &half, &half);
    big_print("2^100 squared = ", &check);
    printf("they %s\n",
           memcmp(check.cells, p.cells, sizeof p.cells) == 0 ? "match" : "differ");
    return 0;
}
