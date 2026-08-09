/*
 * title: Where variables live
 * level: 2
 * about: Prints the address and size of a few local and global variables so you can match them to the boxes in See's memory picture.
 */
#include <stdio.h>

/* Variables declared outside every function are globals. They exist for
   the whole run, in their own area of memory: find them in See's globals
   panel, not on the stack. A global without an initialiser starts as 0. */
int visits;
double rate = 0.25;

int main(void)
{
    /* Locals live on the stack and exist only while main runs. */
    char initial = 'K';
    short year = 1978;
    int count = 42;
    double ratio = 1.5;

    /*
     * & gives the address of a variable: the number of its first byte.
     * %p prints an address; the cast to void * is what %p expects.
     * Compare the printed numbers with the addresses See shows next to
     * each box. The gaps between them come from each variable's size and
     * from alignment: a double likes to start at a multiple of 8.
     */
    printf("%-8s %-12s %s\n", "name", "address", "size");
    printf("%-8s %-12p %lu\n", "initial", (void *)&initial, (unsigned long)sizeof initial);
    printf("%-8s %-12p %lu\n", "year",    (void *)&year,    (unsigned long)sizeof year);
    printf("%-8s %-12p %lu\n", "count",   (void *)&count,   (unsigned long)sizeof count);
    printf("%-8s %-12p %lu\n", "ratio",   (void *)&ratio,   (unsigned long)sizeof ratio);
    printf("%-8s %-12p %lu\n", "visits",  (void *)&visits,  (unsigned long)sizeof visits);
    printf("%-8s %-12p %lu\n", "rate",    (void *)&rate,    (unsigned long)sizeof rate);

    /*
     * Assigning changes what is in the box, never where the box is. Step
     * over these lines and watch the values change while the addresses
     * above stay true.
     */
    visits = visits + 1;
    count = count * 2;
    ratio = ratio + rate;

    printf("\ninitial=%c year=%d count=%d ratio=%.2f visits=%d\n",
           initial, year, count, ratio, visits);
    return 0;
}
