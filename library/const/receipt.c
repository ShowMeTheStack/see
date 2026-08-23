/*
 * title: Prices that stay put
 * level: 1
 * about: Prints a cafe receipt using const prices and a const tax rate, so a slip of the keyboard cannot change them mid-way.
 */
#include <stdio.h>

int main(void)
{
    /* Facts about the shop: they do not change while the program runs. */
    const double tea_price = 2.50;
    const double cake_price = 3.20;
    const double tax_rate = 0.08;
    const int max_cakes = 5;

    /* Facts about this order: these do change. */
    int teas = 3;
    int cakes = 7;
    double subtotal, tax;

    if (cakes > max_cakes) {
        printf("only %d cakes left, you get %d\n", max_cakes, max_cakes);
        cakes = max_cakes;
    }

    subtotal = teas * tea_price + cakes * cake_price;
    tax = subtotal * tax_rate;

    printf("%d x tea   @ %.2f = %6.2f\n", teas, tea_price, teas * tea_price);
    printf("%d x cake  @ %.2f = %6.2f\n", cakes, cake_price, cakes * cake_price);
    printf("subtotal           %6.2f\n", subtotal);
    printf("tax (%.0f%%)           %6.2f\n", tax_rate * 100, tax);
    printf("total              %6.2f\n", subtotal + tax);

    /*
     * A typing slip such as  if (tax_rate = 0) ...  instead of == would
     * quietly zero the tax on an ordinary variable. Because tax_rate is
     * const, the compiler refuses:
     *     error: assignment of read-only variable 'tax_rate'
     */
    return 0;
}
