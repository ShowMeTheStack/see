/*
 * title: Zero for free: .bss versus .data
 * level: 2
 * about: Shows that globals and static locals without an initialiser start as zero (they live in .bss), while initialised ones live in .data next door.
 */
#include <stdio.h>

int with_value = 5;                /* .data: the 5 is stored in the program file */
int no_value;                      /* .bss: just "reserve 4 bytes, all zero"     */
double readings[4];                /* .bss: 32 zero bytes                        */
char name[8];                      /* .bss: eight '\0' characters, an empty string */
int *nowhere;                      /* .bss: a null pointer                       */

static int calls(void)
{
    static int count;              /* also .bss, also zero, even though it is inside a function */
    count++;
    return count;
}

int main(void)
{
    int local;                     /* NOT zero: an automatic local holds whatever was there */

    /*
     * Before the next line runs, look at local in the stack panel: See
     * marks it as uninitialised. Reading it now would be a mistake that See
     * reports. The globals above, by contrast, are already zero.
     */
    local = 0;

    printf("with_value = %d   (at %p)\n", with_value, (void *)&with_value);
    printf("no_value   = %d   (at %p)\n", no_value, (void *)&no_value);
    printf("readings   = %g %g %g %g\n", readings[0], readings[1], readings[2], readings[3]);
    printf("name       = \"%s\" (length 0)\n", name);
    printf("nowhere    = %s\n", nowhere == NULL ? "NULL" : "not NULL");
    printf("calls()    = %d", calls());
    printf(", then %d\n", calls());
    printf("local      = %d (only because we set it)\n", local);

    /*
     * Why two segments? A big zero-filled array costs nothing in the
     * program file: the loader only needs to know its size. An initialised
     * array has to carry its values with it.
     */
    return 0;
}
