/*
 * title: Choosing code with #if, #elif and #else
 * level: 2
 * about: Selects a temperature scale and a level of detail at compile time, and shows which branches survived.
 */
#include <stdio.h>

/*
 * Change these two numbers and rebuild to get a different program.
 * The lines the preprocessor drops are not compiled at all, so they
 * cannot cost time or memory when the program runs.
 */
#define SCALE    2      /* 1 Celsius, 2 Fahrenheit, 3 Kelvin */
#define DETAIL   1      /* 0 terse, 1 normal, 2 chatty */

#if SCALE == 1
#  define UNIT "C"
#  define CONVERT(c) (c)
#elif SCALE == 2
#  define UNIT "F"
#  define CONVERT(c) ((c) * 9.0 / 5.0 + 32.0)
#elif SCALE == 3
#  define UNIT "K"
#  define CONVERT(c) ((c) + 273.15)
#else
   /* Only reached for an unknown SCALE. A real project might use
      #error here; see error-directive.c. */
#  define UNIT "?"
#  define CONVERT(c) (c)
#endif

int main(void)
{
    double readings[5];
    int i;
    double total = 0.0;

    readings[0] = -5.0; readings[1] = 12.5; readings[2] = 21.0;
    readings[3] = 30.5; readings[4] = 18.0;

#if DETAIL >= 1
    printf("Readings in degrees %s\n", UNIT);
#endif

    for (i = 0; i < 5; i++) {
        total += readings[i];
#if DETAIL >= 2
        printf("reading %d raw %.1f C\n", i, readings[i]);
#endif
#if DETAIL >= 1
        printf("  day %d: %7.2f %s\n", i + 1, CONVERT(readings[i]), UNIT);
#endif
    }

    printf("average: %.2f %s\n", CONVERT(total / 5), UNIT);

    /*
     * #if works on whole numbers known to the preprocessor. It cannot
     * look at variables like total, because variables do not exist yet
     * when the preprocessor runs.
     */
#if DETAIL == 0
    printf("(terse mode)\n");
#elif DETAIL == 1
    printf("(normal mode: chatty lines were removed before compiling)\n");
#else
    printf("(chatty mode)\n");
#endif
    return 0;
}
