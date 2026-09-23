/* frac.h - exact fractions. Every Frac the module hands out is in lowest
 * terms with a positive denominator, so equal values look equal. */
#ifndef FRAC_H
#define FRAC_H

typedef struct {
    long num;
    long den;
} Frac;

Frac frac_make(long num, long den);
Frac frac_add(Frac a, Frac b);
Frac frac_sub(Frac a, Frac b);
Frac frac_mul(Frac a, Frac b);
Frac frac_div(Frac a, Frac b);
int frac_cmp(Frac a, Frac b);
void frac_print(Frac f);

#endif
