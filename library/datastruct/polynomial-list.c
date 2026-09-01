/*
 * title: Polynomials as linked lists of terms
 * level: 3
 * about: Represents polynomials as sorted linked lists of (coefficient, power) terms, then adds, multiplies, differentiates and evaluates them.
 */
#include <stdio.h>
#include <stdlib.h>

/* Only the terms that exist are stored, highest power first. 3x^100 + 1 is
   two nodes, not a hundred and one coefficients. */
struct term {
    int coef;
    int power;
    struct term *next;
};

/* Add coef*x^power into the polynomial, keeping it sorted and merging equal
   powers. Every other operation is built on this one function. */
void add_term(struct term **pp, int coef, int power)
{
    struct term *t;
    if (coef == 0)
        return;
    while (*pp != NULL && (*pp)->power > power)
        pp = &(*pp)->next;
    if (*pp != NULL && (*pp)->power == power) {
        (*pp)->coef += coef;
        if ((*pp)->coef == 0) {           /* the terms cancelled */
            t = *pp;
            *pp = t->next;
            free(t);
        }
        return;
    }
    t = malloc(sizeof *t);
    if (t == NULL)
        exit(1);
    t->coef = coef;
    t->power = power;
    t->next = *pp;
    *pp = t;
}

struct term *poly_add(const struct term *a, const struct term *b)
{
    struct term *sum = NULL;
    for (; a; a = a->next) add_term(&sum, a->coef, a->power);
    for (; b; b = b->next) add_term(&sum, b->coef, b->power);
    return sum;
}

/* Every term of a times every term of b. */
struct term *poly_mul(const struct term *a, const struct term *b)
{
    struct term *prod = NULL;
    const struct term *q;
    for (; a; a = a->next)
        for (q = b; q; q = q->next)
            add_term(&prod, a->coef * q->coef, a->power + q->power);
    return prod;
}

struct term *derivative(const struct term *a)
{
    struct term *d = NULL;
    for (; a; a = a->next)
        if (a->power > 0)
            add_term(&d, a->coef * a->power, a->power - 1);
    return d;
}

/* Horner's rule would be faster for dense polynomials; for sparse ones,
   computing each power directly is simpler. */
long evaluate(const struct term *a, int x)
{
    long sum = 0;
    for (; a; a = a->next) {
        long p = 1;
        int k;
        for (k = 0; k < a->power; k++)
            p *= x;
        sum += a->coef * p;
    }
    return sum;
}

void print_poly(const char *name, const struct term *t)
{
    int first = 1;
    printf("%-8s = ", name);
    if (t == NULL)
        printf("0");
    for (; t; t = t->next, first = 0) {
        int c = t->coef;
        if (!first)
            printf(c < 0 ? " - " : " + ");
        else if (c < 0)
            printf("-");
        if (c < 0)
            c = -c;
        if (c != 1 || t->power == 0)
            printf("%d", c);
        if (t->power > 0)
            printf("x");
        if (t->power > 1)
            printf("^%d", t->power);
    }
    printf("\n");
}

void free_poly(struct term *t)
{
    while (t) {
        struct term *n = t->next;
        free(t);
        t = n;
    }
}

int main(void)
{
    struct term *p = NULL, *q = NULL, *s, *m, *d;

    /* p = x^2 - 3x + 2, entered in jumbled order on purpose */
    add_term(&p, 2, 0);
    add_term(&p, 1, 2);
    add_term(&p, -3, 1);
    /* q = x^3 + 3x - 2 */
    add_term(&q, 3, 1);
    add_term(&q, -2, 0);
    add_term(&q, 1, 3);

    print_poly("p", p);
    print_poly("q", q);
    s = poly_add(p, q);
    print_poly("p + q", s);
    m = poly_mul(p, q);
    print_poly("p * q", m);
    d = derivative(m);
    print_poly("(p*q)'", d);
    printf("p(1) = %ld, p(2) = %ld (roots!), p(5) = %ld\n",
           evaluate(p, 1), evaluate(p, 2), evaluate(p, 5));
    printf("(p*q)(3) = %ld = p(3) * q(3) = %ld * %ld\n",
           evaluate(m, 3), evaluate(p, 3), evaluate(q, 3));

    free_poly(p);
    free_poly(q);
    free_poly(s);
    free_poly(m);
    free_poly(d);
    return 0;
}
