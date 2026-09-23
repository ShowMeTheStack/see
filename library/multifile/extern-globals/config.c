/* config.c - DEFINES the globals declared in config.h, exactly once.
 * A definition is what actually reserves memory. If two .c files both
 * defined items_processed, the linker would complain about a duplicate;
 * if none did, it would complain that the name is undefined. */
#include "config.h"

int verbose = 1;
int items_processed = 0;
const char program_name[] = "till";
double tax_rate = 0.08;
