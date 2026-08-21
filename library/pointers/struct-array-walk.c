/*
 * title: Walking an array of structs with p++
 * level: 2
 * about: Totals a shopping basket by moving a struct pointer through an array of items, using -> to read each one.
 */
#include <stdio.h>

struct item {
    const char *name;
    int qty;
    double price;
};

/*
 * p++ moves a whole struct along: sizeof(struct item) bytes, here 16
 * (4 for the pointer, 4 for qty, 8 for the double).
 */
double total(const struct item *p, const struct item *end, const struct item **dearest)
{
    double sum = 0.0;
    *dearest = p;
    for (; p < end; p++) {
        sum += p->qty * p->price;
        if (p->qty * p->price > (*dearest)->qty * (*dearest)->price)
            *dearest = p;
    }
    return sum;
}

int main(void)
{
    struct item basket[4];
    struct item *p;
    const struct item *top;
    double sum;

    basket[0].name = "bread";  basket[0].qty = 2; basket[0].price = 1.20;
    basket[1].name = "cheese"; basket[1].qty = 1; basket[1].price = 4.75;
    basket[2].name = "apples"; basket[2].qty = 6; basket[2].price = 0.35;
    basket[3].name = "tea";    basket[3].qty = 1; basket[3].price = 3.10;

    /* p->qty is shorthand for (*p).qty; the parentheses are needed because . binds tighter than *. */
    for (p = basket; p < basket + 4; p++)
        printf("%-7s %d x %5.2f = %6.2f\n", p->name, p->qty, p->price, p->qty * p->price);

    sum = total(basket, basket + 4, &top);
    printf("total            %6.2f\n", sum);
    printf("biggest line: %s (item %ld)\n", top->name, (long)(top - basket));
    printf("each step of p is %lu bytes\n", (unsigned long)sizeof *p);
    return 0;
}
