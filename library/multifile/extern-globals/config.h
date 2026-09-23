/* config.h - DECLARES the program-wide variables.
 * "extern" says: this variable exists, it is defined in some other file,
 * do not make storage for it here. Every file that includes this header
 * can then use the same variables. */
#ifndef CONFIG_H
#define CONFIG_H

extern int verbose;
extern int items_processed;
extern const char program_name[];
extern double tax_rate;

void process_item(const char *name, double price);

#endif
