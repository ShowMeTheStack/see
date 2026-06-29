#include <stdio.h>
#include <math.h>
#include <limits.h>
#include <float.h>
int main(void)
{
    double ip, d;
    int e;
    printf("%.4f %.4f %.4f\n", sqrt(2.0), pow(2, 10), atan2(1, 1) * 4);
    printf("%.1f %.1f %.1f %.1f\n", floor(-2.5), ceil(-2.5), fabs(-3.0), fmod(7.5, 2));
    d = modf(3.75, &ip);
    printf("%.3f %.3f\n", d, ip);
    d = frexp(8.0, &e);
    printf("%.3f %d\n", d, e);
    printf("%d %d %u\n", INT_MAX, INT_MIN, UINT_MAX);
    printf("%d %d\n", CHAR_BIT, SHRT_MIN);
    printf("%g %g\n", FLT_EPSILON, DBL_MAX);
    printf("%.2e\n", exp(10.0));
    printf("%f %f\n", 1.0 / 3, (float)(1.0 / 3));
    return 0;
}
/* OUTPUT
1.4142 1024.0000 3.1416
-3.0 -2.0 3.0 1.5
0.750 3.000
0.500 4
2147483647 -2147483648 4294967295
8 -32768
1.19209e-07 1.79769e+308
2.20e+04
0.333333 0.333333
*/
