/* test_roman.c - the tests, kept apart from the code they test. This file
 * only knows roman.h, so it tests the promises, not the insides. */
#include <stdio.h>
#include <string.h>
#include "check.h"
#include "roman.h"

void test_roman(void)
{
    char buf[16];
    int n, bad = 0;

    printf("from_int:\n");
    CHECK(roman_from_int(1, buf) && strcmp(buf, "I") == 0);
    CHECK(roman_from_int(4, buf) && strcmp(buf, "IV") == 0);
    CHECK(roman_from_int(1994, buf) && strcmp(buf, "MCMXCIV") == 0);
    CHECK(roman_from_int(3888, buf) && strcmp(buf, "MMMDCCCLXXXVIII") == 0);
    CHECK(!roman_from_int(0, buf));
    CHECK(!roman_from_int(4000, buf));

    printf("to_int:\n");
    CHECK(roman_to_int("XLII") == 42);
    CHECK(roman_to_int("MMXXVI") == 2026);
    CHECK(roman_to_int("IIII") == 0);
    CHECK(roman_to_int("IC") == 0);
    CHECK(roman_to_int("") == 0);
    CHECK(roman_to_int("hello") == 0);

    /* A property test: every number survives the round trip. */
    printf("round trip 1..3999:\n");
    for (n = 1; n <= 3999; n++) {
        roman_from_int(n, buf);
        if (roman_to_int(buf) != n) {
            bad++;
        }
    }
    CHECK(bad == 0);

    /* This one is wrong on purpose, to show what a failure looks like. */
    printf("a deliberately wrong expectation:\n");
    CHECK(roman_to_int("IX") == 11);
}
