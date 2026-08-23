/*
 * title: Where const globals live
 * level: 3
 * about: Prints the addresses of const and non-const globals, a local and a string literal to show which ones share the read-only area.
 */
#include <stdio.h>

struct point { int x, y; };

int counter = 0;                          /* ordinary global: writable data */
const int answer = 42;                    /* const global: read-only data */
const double rate = 0.175;                /* const global: read-only data */
const struct point origin = { 0, 0 };     /* a const struct: read-only data */
const char *motto = "keep it simple";     /* a writable POINTER to read-only chars */
const char * const fixed = "for ever";    /* a read-only pointer to read-only chars */

int main(void)
{
    int local = 7;

    /*
     * Open the globals and literals views in See. The const objects sit
     * with the string literals in the read-only region at low addresses
     * (0x0804....). counter and motto are in the writable data a page
     * higher, and local is on the stack near 0xbfff.....
     */
    printf("answer   %p  const int\n", (void *)&answer);
    printf("rate     %p  const double\n", (void *)&rate);
    printf("origin   %p  const struct\n", (void *)&origin);
    printf("fixed    %p  const pointer\n", (void *)&fixed);
    printf("literal  %p  what motto points at\n", (void *)motto);
    printf("counter  %p  plain int\n", (void *)&counter);
    printf("motto    %p  plain pointer\n", (void *)&motto);
    printf("local    %p  on the stack\n", (void *)&local);

    counter++;
    motto = "changed";        /* fine: motto itself is not const, only what it points at */
    printf("%d %s %s %d %.3f (%d,%d)\n", counter, motto, fixed, answer, rate, origin.x, origin.y);

    /*
     * The compiler rejects direct attempts:
     *     answer = 1;      error: assignment of read-only variable 'answer'
     *     origin.x = 1;    error: assignment of read-only member 'x'
     *     fixed = motto;   error: assignment of read-only variable 'fixed'
     * And because the region itself is protected, a write that slipped
     * past the compiler through a cast would still be stopped at run time.
     */
    return 0;
}
