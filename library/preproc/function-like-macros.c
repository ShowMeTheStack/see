/*
 * title: Function-like macros for small formulas
 * level: 1
 * about: Defines SQUARE, MAX, MIN, ABS and IS_EVEN as macros and uses them on a few numbers.
 */
#include <stdio.h>

/*
 * A function-like macro takes arguments, written in brackets straight
 * after the name with no space. The preprocessor pastes each argument
 * into the body wherever the parameter name appears.
 *
 * Every parameter is wrapped in its own parentheses, and so is the
 * whole body. The program parenthesise-args.c shows what goes wrong
 * without them; for now, just copy the habit.
 */
#define SQUARE(x)   ((x) * (x))
#define MAX(a, b)   ((a) > (b) ? (a) : (b))
#define MIN(a, b)   ((a) < (b) ? (a) : (b))
#define ABS(x)      ((x) < 0 ? -(x) : (x))
#define IS_EVEN(n)  ((n) % 2 == 0)

/* Macros may use other macros. CLAMP keeps v between lo and hi. */
#define CLAMP(v, lo, hi)  MIN(MAX((v), (lo)), (hi))

int main(void)
{
    int nums[6];
    int i;
    double r = 1.5;

    nums[0] = -7; nums[1] = 3; nums[2] = 12;
    nums[3] = 0;  nums[4] = -2; nums[5] = 25;

    printf("   n  square   abs  even  clamped to 0..10\n");
    for (i = 0; i < 6; i++) {
        printf("%4d %7d %5d %5s %8d\n",
               nums[i], SQUARE(nums[i]), ABS(nums[i]),
               IS_EVEN(nums[i]) ? "yes" : "no",
               CLAMP(nums[i], 0, 10));
    }

    /*
     * A macro does not care about types: the same SQUARE works on a
     * double, because it is only text. A function would need one
     * version for int and another for double.
     */
    printf("SQUARE(%.1f) = %.2f\n", r, SQUARE(r));
    printf("MAX(3, 9) = %d, MIN(3, 9) = %d\n", MAX(3, 9), MIN(3, 9));

    /*
     * Step through main in See: the debugger never enters SQUARE or MAX,
     * because there is no function to enter. The macro body was copied
     * into main's own line before compiling.
     */
    return 0;
}
