/*
 * title: Unit tests for a Roman numeral module
 * level: 3
 * about: Runs a small test suite, built from a CHECK macro and a reporting file, against a Roman numeral converter.
 */

/* The folder has four .c files: roman.c (the code), check.c (the tiny
 * framework), test_roman.c (the tests) and main.c. See compiles each one
 * and links them into a single test program. In a real project the same
 * roman.c would also be linked into the real program, without the tests.
 *
 * Every FAIL line names the file and line of the CHECK, thanks to
 * __FILE__ and __LINE__, which the preprocessor fills in where the macro
 * is used, not where it is defined. */
#include <stdio.h>
#include <assert.h>
#include "check.h"

void test_roman(void);

int main(void)
{
    test_roman();
    printf("%d checks, %d failed\n", checks_run, checks_failed);
    /* assert is the opposite style: if its condition is false it prints a
     * message and stops the program on the spot. Good for "this can never
     * happen" claims, like the suite having run at all. */
    assert(checks_run > 0);
    /* A test runner would normally return 1 when anything failed, so a
     * build script could stop. Here we return 0 to keep the demo tidy. */
    return 0;
}
