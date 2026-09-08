/*
 * title: #define, enum or const: three kinds of constant
 * level: 1
 * about: Gives the days of a week as #define names, as an enum and as const variables, and compares what each one leaves for the debugger.
 */
#include <stdio.h>

/* 1. Macros: pure text, gone before compiling. */
#define MON_M 0
#define FRI_M 4
#define SUN_M 6

/* 2. An enum: real names known to the compiler, of type int, counted
      up from 0 unless you say otherwise. */
enum weekday { MON, TUE, WED, THU, FRI, SAT, SUN };

/* 3. const variables: real objects with addresses, in memory. */
static const int mon_c = 0;
static const int fri_c = 4;
static const int sun_c = 6;

static const char *day_name(enum weekday d)
{
    switch (d) {
    case MON: return "Monday";
    case TUE: return "Tuesday";
    case WED: return "Wednesday";
    case THU: return "Thursday";
    case FRI: return "Friday";
    case SAT: return "Saturday";
    case SUN: return "Sunday";
    }
    return "?";
}

int main(void)
{
    enum weekday today = FRI;
    int d;

    printf("macro: Friday is %d, enum: %d, const: %d\n", FRI_M, FRI, fri_c);
    printf("today is %s\n", day_name(today));

    printf("the week:");
    for (d = MON; d <= SUN; d++)
        printf(" %.3s", day_name((enum weekday)d));
    printf("\n");

    printf("days from Monday to Sunday: %d %d %d\n",
           SUN_M - MON_M, SUN - MON, sun_c - mon_c);

    /*
     * Macros and enum constants are usable in a case label and an array
     * size; in C89 a const int is not, because it is a variable that
     * happens to be read-only, not a constant expression.
     */
    printf("fri_c is an object of %d bytes; FRI and FRI_M use no memory\n",
           (int)sizeof fri_c);

    /*
     * Open the debugger in See and look at main's locals: today shows
     * as FRI, not 4, because the debugger knows the enum. The globals
     * pane lists mon_c, fri_c and sun_c with their addresses. FRI_M is
     * nowhere: the preprocessor swallowed it.
     */
    return 0;
}
