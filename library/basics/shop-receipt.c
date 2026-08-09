/*
 * title: A shop receipt in whole cents
 * level: 3
 * about: Reads quantities and prices, keeps all money in integer cents to avoid rounding drift, and prints a lined-up receipt with tax.
 * input: 3 1.99\n1 24.50\n12 0.35\n2 7.05\n0 0
 */
#include <stdio.h>

#define TAX_PERCENT 8
#define LINE "----------------------------------"

int main(void)
{
    int qty;
    double price;
    long cents;
    long line_total;
    long subtotal = 0;
    long tax;
    long total;
    int item = 0;

    printf("%-6s %5s %10s %10s\n", "item", "qty", "each", "amount");
    printf("%s\n", LINE);

    /*
     * Money as double goes wrong slowly: 0.35 is not exactly 0.35 in
     * binary, and a long receipt drifts by a cent here and there. The cure
     * is to turn each price into whole cents once, rounding properly, and
     * from then on use only integer arithmetic, which is exact.
     *
     * A quantity of 0 ends the list.
     */
    while (scanf("%d %lf", &qty, &price) == 2 && qty != 0) {
        item++;
        cents = (long)(price * 100.0 + 0.5);    /* 1.99 -> 199 */
        line_total = qty * cents;
        subtotal += line_total;

        /*
         * Cents are printed as euros with / and %: 2450 / 100 is 24 and
         * 2450 % 100 is 50. %02ld keeps the leading zero in 7.05.
         */
        printf("%-6d %5d %7ld.%02ld %7ld.%02ld\n", item, qty,
               cents / 100, cents % 100, line_total / 100, line_total % 100);
    }

    /*
     * Tax is rounded to the nearest cent in integers: adding 50 before
     * dividing by 100 rounds halves up, like adding 0.5 does for doubles.
     */
    tax = (subtotal * TAX_PERCENT + 50) / 100;
    total = subtotal + tax;

    printf("%s\n", LINE);
    printf("%-23s %7ld.%02ld\n", "subtotal", subtotal / 100, subtotal % 100);
    printf("tax %2d%%%16s %7ld.%02ld\n", TAX_PERCENT, "", tax / 100, tax % 100);
    printf("%-23s %7ld.%02ld\n", "TOTAL", total / 100, total % 100);
    return 0;
}
