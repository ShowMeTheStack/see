/*
 * title: extern globals shared by three files
 * level: 2
 * about: Defines a few globals once in config.c, declares them extern in a header, and uses them from two other files.
 */

/* See compiles main.c, config.c and till.c one at a time and links them.
 * Each compiled file has a list of names it uses but does not define
 * (verbose, items_processed, ...); the linker matches each one with the
 * single definition in config.c. In See's globals panel each variable
 * appears once, whichever file you are stepping through. */
#include <stdio.h>
#include "config.h"

int main(void)
{
    process_item("bread", 2.50);
    process_item("milk", 1.20);

    /* Turning verbose off here changes what till.c does: same variable. */
    verbose = 0;
    process_item("eggs", 3.10);

    /* Set a watchpoint on items_processed and run: See stops inside till.c
     * each time it changes, though the variable lives in config.c. */
    tax_rate = 0.20;
    verbose = 1;
    process_item("wine", 9.00);

    printf("%s processed %d items\n", program_name, items_processed);
    return 0;
}
