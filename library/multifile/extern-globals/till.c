/* till.c - uses the globals without defining them. The extern declarations
 * come in through config.h. */
#include <stdio.h>
#include "config.h"

void process_item(const char *name, double price)
{
    double with_tax = price * (1.0 + tax_rate);

    items_processed++;     /* the very same int that main.c reads */
    if (verbose) {
        printf("[%s] %-8s %6.2f -> %6.2f\n", program_name, name, price, with_tax);
    }
}
