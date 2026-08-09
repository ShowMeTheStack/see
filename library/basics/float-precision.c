/*
 * title: Why 0.1 + 0.2 is not 0.3
 * level: 3
 * about: Prints floats and doubles with many digits to show they are close binary approximations, and compares them safely.
 */
#include <stdio.h>
#include <math.h>
#include <float.h>

int main(void)
{
    double a = 0.1;
    double b = 0.2;
    double sum = a + b;
    float f = 0.1f;
    float total_f = 0.0f;
    double total_d = 0.0;
    int i;

    /*
     * Numbers like 0.1 cannot be written exactly in binary, just as 1/3
     * cannot be written exactly in decimal. The computer stores the
     * nearest value it can. With enough digits the difference shows.
     */
    printf("0.1         = %.20f\n", a);
    printf("0.2         = %.20f\n", b);
    printf("0.1 + 0.2   = %.20f\n", sum);
    printf("0.3         = %.20f\n", 0.3);
    printf("sum == 0.3 ? %s\n", sum == 0.3 ? "yes" : "no");

    /*
     * Compare with a tolerance instead: are the two values closer than a
     * tiny amount? DBL_EPSILON is the gap between 1.0 and the next double.
     */
    printf("close to 0.3? %s\n", fabs(sum - 0.3) < 1e-9 ? "yes" : "no");

    /* A float has about 7 good digits, a double about 15. */
    printf("\nfloat  0.1  = %.20f\n", f);
    printf("FLT_DIG = %d, DBL_DIG = %d, DBL_EPSILON = %g\n", FLT_DIG, DBL_DIG, DBL_EPSILON);

    /*
     * Small errors add up. Adding 0.1 ten thousand times should give 1000.
     * The float total drifts further than the double one.
     */
    for (i = 0; i < 10000; i++) {
        total_f += 0.1f;
        total_d += 0.1;
    }
    printf("\nten thousand times 0.1:\n");
    printf("  as float : %.6f\n", total_f);
    printf("  as double: %.6f\n", total_d);
    return 0;
}
