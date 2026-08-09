/*
 * title: #define, const and enum
 * level: 2
 * about: Gives names to fixed values in the three ways C89 offers and shows where each one ends up, or does not, in memory.
 */
#include <stdio.h>

/* 1. A macro. The preprocessor swaps the name for the text before the
      compiler runs, so MAX_SCORE never exists as a variable: there is no
      box for it anywhere in See. */
#define MAX_SCORE 100
#define GREETING "Welcome back"

/* 2. A const variable. It is a real object with an address and a type, so
      See shows it among the globals, but the compiler refuses any
      assignment to it. */
const double PASS_MARK = 0.4;

/* 3. An enumeration. Each name is an int constant; counting starts at 0
      unless a value is given. Handy for a set of related choices. */
enum weekday { MONDAY = 1, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY };

int main(void)
{
    int score = 47;
    enum weekday today = FRIDAY;
    const int days_left = SUNDAY - today;

    printf("%s!\n", GREETING);
    printf("score %d out of %d is %.0f%%\n", score, MAX_SCORE, 100.0 * score / MAX_SCORE);

    /* PASS_MARK is used like any variable, only never changed. */
    if ((double)score / MAX_SCORE >= PASS_MARK) {
        printf("that is a pass (the mark is %.0f%%)\n", PASS_MARK * 100.0);
    } else {
        printf("that is not a pass yet\n");
    }

    /* The enum names follow on from MONDAY = 1, so FRIDAY is 5. */
    printf("today is day %d of the week, %d days until Sunday\n", today, days_left);
    printf("MONDAY=%d TUESDAY=%d SUNDAY=%d\n", MONDAY, TUESDAY, SUNDAY);

    /*
     * A const local has a box on the stack like any other local; look for
     * days_left. Writing days_left = 3; would be a compile error.
     */
    printf("address of PASS_MARK %p, of days_left %p\n", (void *)&PASS_MARK, (void *)&days_left);
    return 0;
}
