/* The C reference: <math.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  HUGE_VAL: {
    text: 'HUGE_VAL is a positive double that the math functions return when the true result is too large to represent. On this machine, as on every IEEE 754 machine, it is positive infinity, which printf shows as inf.\n\nWhen a result overflows, the function returns HUGE_VAL (or -HUGE_VAL for a huge negative result) and sets errno to ERANGE. To detect it reliably, set errno to 0 before the call and look at it afterwards; comparing with HUGE_VAL alone cannot tell an overflow from a genuine infinity that was passed in.\n\nIn C89 HUGE_VAL is the only such constant: there is no INFINITY or NAN macro. Here it expands to a call of a library helper, so it cannot be used to initialise a static variable.',
    example: `#include <stdio.h>
#include <math.h>
#include <errno.h>

int main(void)
{
    double r;

    errno = 0;
    r = exp(1000.0);
    if (errno == ERANGE && r == HUGE_VAL)
        printf("exp(1000) overflowed: %g\\n", r);
    printf("-HUGE_VAL prints as %g\\n", -HUGE_VAL);
    return 0;
}
`,
    see: ['ERANGE', 'errno', 'exp', 'pow', 'DBL_MAX'],
  },
  acos: {
    text: 'acos(x) returns the arc cosine of x: the angle in radians, from 0 to pi, whose cosine is x.\n\nx must lie between -1 and 1. Outside that range it is a domain error: errno is set to EDOM and the result is a NaN, which printf shows as nan. Values computed by floating-point arithmetic can drift slightly past 1, so clamp them first when that can happen.\n\nThere is no pi constant in C89; acos(-1.0) is a common way to get one.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double pi = acos(-1.0);

    printf("pi = %.10f\\n", pi);
    printf("acos(0.5) = %f radians = %f degrees\\n", acos(0.5), acos(0.5) * 180.0 / pi);
    return 0;
}
`,
    see: ['asin', 'atan', 'cos', 'EDOM'],
  },
  asin: {
    text: 'asin(x) returns the arc sine of x: the angle in radians, from -pi/2 to pi/2, whose sine is x.\n\nx must be between -1 and 1; otherwise errno is set to EDOM and the result is NaN.\n\nAll the trigonometric functions work in radians. Multiply by 180/pi to get degrees.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double pi = acos(-1.0);

    printf("asin(1) = %f (pi/2 = %f)\\n", asin(1.0), pi / 2);
    printf("asin(0.5) in degrees = %.1f\\n", asin(0.5) * 180.0 / pi);
    return 0;
}
`,
    see: ['acos', 'sin', 'atan'],
  },
  atan: {
    text: 'atan(x) returns the arc tangent of x, an angle in radians between -pi/2 and pi/2. Every x is allowed.\n\nBecause it only sees the ratio y/x, atan cannot tell which quadrant an angle is in: atan(1/1) and atan(-1/-1) are the same. Use atan2(y, x) when you have the two coordinates.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("atan(1) * 4 = %.6f\\n", atan(1.0) * 4);
    printf("atan(1e9) = %.6f\\n", atan(1e9));
    return 0;
}
`,
    see: ['atan2', 'tan', 'asin'],
  },
  atan2: {
    text: 'atan2(y, x) returns the angle in radians, from -pi to pi, of the point (x, y) measured from the positive x axis. Note the order: y comes first.\n\nUnlike atan(y / x) it uses the signs of both arguments to pick the right quadrant, and it works when x is 0. atan2(0, 0) may be a domain error.\n\nIt is the usual way to turn a direction vector into an angle.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double deg = 180.0 / acos(-1.0);

    printf("( 1, 1) -> %6.1f degrees\\n", atan2(1.0, 1.0) * deg);
    printf("(-1, 1) -> %6.1f degrees\\n", atan2(1.0, -1.0) * deg);
    printf("(-1,-1) -> %6.1f degrees\\n", atan2(-1.0, -1.0) * deg);
    return 0;
}
`,
    see: ['atan', 'sqrt', 'cos'],
  },
  cos: {
    text: 'cos(x) returns the cosine of x, where x is in radians.\n\nFor very large x the result loses precision, because x itself cannot hold enough digits to say where in the cycle it lies. Keep angles small by reducing them yourself when you can.\n\nThe result is a double; floating-point rounding means cos(pi / 2) prints as a tiny number like 6.1e-17 rather than exactly 0.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double pi = acos(-1.0);
    int d;

    for (d = 0; d <= 180; d += 45)
        printf("cos(%3d degrees) = %9.6f\\n", d, cos(d * pi / 180.0));
    return 0;
}
`,
    see: ['sin', 'tan', 'acos'],
  },
  sin: {
    text: 'sin(x) returns the sine of x, where x is in radians.\n\nTo use degrees, multiply by pi/180 first. C89 has no M_PI; compute pi once with acos(-1.0) or 4 * atan(1.0).\n\nThe result is between -1 and 1.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double pi = acos(-1.0);
    int i;

    for (i = 0; i <= 8; i++)
        printf("%*s*\\n", (int)(20 + 18 * sin(i * pi / 4)), "");
    return 0;
}
`,
    see: ['cos', 'tan', 'asin'],
  },
  tan: {
    text: 'tan(x) returns the tangent of x, where x is in radians.\n\nNear pi/2 (and every pi after it) the tangent grows without limit. Because pi/2 cannot be represented exactly, tan never returns infinity there, just a very large number.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double pi = acos(-1.0);

    printf("tan(pi/4) = %f\\n", tan(pi / 4));
    printf("tan(pi/2) = %g\\n", tan(pi / 2));
    return 0;
}
`,
    see: ['sin', 'cos', 'atan'],
  },
  cosh: {
    text: 'cosh(x) returns the hyperbolic cosine of x, (e^x + e^-x) / 2.\n\nIt grows like exp, so for large |x| (around 710 and up) it overflows: the result is HUGE_VAL and errno is set to ERANGE.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double x = 1.0;

    printf("cosh(1) = %f\\n", cosh(x));
    printf("cosh^2 - sinh^2 = %f\\n", cosh(x) * cosh(x) - sinh(x) * sinh(x));
    return 0;
}
`,
    see: ['sinh', 'tanh', 'exp'],
  },
  sinh: {
    text: 'sinh(x) returns the hyperbolic sine of x, (e^x - e^-x) / 2.\n\nFor large |x| it overflows to plus or minus HUGE_VAL with errno set to ERANGE.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("sinh(0) = %f, sinh(2) = %f\\n", sinh(0.0), sinh(2.0));
    return 0;
}
`,
    see: ['cosh', 'tanh', 'exp'],
  },
  tanh: {
    text: 'tanh(x) returns the hyperbolic tangent of x, sinh(x) / cosh(x). The result always lies between -1 and 1, so it never overflows.\n\nIt is used as a smooth "squashing" function that turns any number into one between -1 and 1.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double x;

    for (x = -3.0; x <= 3.0; x += 1.5)
        printf("tanh(%4.1f) = %f\\n", x, tanh(x));
    return 0;
}
`,
    see: ['sinh', 'cosh'],
  },
  exp: {
    text: 'exp(x) returns e raised to the power x, where e is about 2.71828.\n\nIf the result is too large (x above about 709.78) the function returns HUGE_VAL and sets errno to ERANGE. If it is too small to represent (x below about -745) it returns 0 and may set ERANGE.\n\nThe inverse is log.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("e = %.10f\\n", exp(1.0));
    printf("exp(log(42)) = %f\\n", exp(log(42.0)));
    return 0;
}
`,
    see: ['log', 'pow', 'HUGE_VAL', 'ERANGE'],
  },
  frexp: {
    text: 'frexp(value, &e) splits value into a fraction and a power of two: it returns a fraction f with 0.5 <= |f| < 1 and stores an int e so that value == f * 2 to the power e. For 0 both parts are 0.\n\nThis is exactly how a double is stored: a mantissa and a binary exponent. The second argument must point to an int you own.\n\nDo not read e in the same printf call that calls frexp: the order in which arguments are evaluated is unspecified, so e may be read before frexp stored it.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    int e;
    double f = frexp(48.0, &e);

    printf("48 = %g * 2^%d\\n", f, e);
    printf("ldexp gives back %g\\n", ldexp(f, e));
    return 0;
}
`,
    see: ['ldexp', 'modf'],
  },
  ldexp: {
    text: 'ldexp(x, e) returns x multiplied by 2 to the power e. It is the inverse of frexp.\n\nIt is exact as long as the result neither overflows nor becomes too small: it only changes the exponent of the double. On overflow it returns HUGE_VAL and sets errno to ERANGE.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("ldexp(3, 4) = %g\\n", ldexp(3.0, 4));
    printf("ldexp(1, -3) = %g\\n", ldexp(1.0, -3));
    return 0;
}
`,
    see: ['frexp', 'pow'],
  },
  log: {
    text: 'log(x) returns the natural logarithm of x (base e). It is not base 10; that is log10.\n\nx must be positive. A negative x is a domain error: errno becomes EDOM and the result is NaN. log(0) is a range error: the result is -HUGE_VAL (printed -inf) and errno is set to ERANGE.\n\nFor a logarithm in another base b, compute log(x) / log(b).',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("log(e) = %f\\n", log(exp(1.0)));
    printf("log2(1024) = %f\\n", log(1024.0) / log(2.0));
    return 0;
}
`,
    see: ['log10', 'exp', 'EDOM', 'ERANGE'],
  },
  log10: {
    text: 'log10(x) returns the base 10 logarithm of x.\n\nFor a positive whole number n, (int)log10(n) + 1 is its number of decimal digits, though floating-point rounding makes that risky right at powers of ten for large values. Counting digits with a loop is safer.\n\nAs with log, a negative x is a domain error (EDOM) and log10(0) gives -HUGE_VAL with ERANGE.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("log10(1000) = %f\\n", log10(1000.0));
    printf("log10(2) = %f\\n", log10(2.0));
    return 0;
}
`,
    see: ['log', 'pow'],
  },
  modf: {
    text: 'modf(value, &ip) splits value into a whole part and a fraction with the same sign. It returns the fraction and stores the whole part, as a double, through ip.\n\nSo modf(-3.75, &ip) returns -0.75 and sets ip to -3. Both parts are exact.\n\nCall it in its own statement before printing ip: inside a single printf call the order the arguments are evaluated in is unspecified, and See will tell you when ip is read before it was given a value.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double ip, frac;

    frac = modf(-3.75, &ip);
    printf("whole %g, fraction %g\\n", ip, frac);
    return 0;
}
`,
    see: ['floor', 'fmod', 'frexp'],
  },
  pow: {
    text: 'pow(x, y) returns x raised to the power y.\n\nThere are traps. A negative x with a y that is not a whole number is a domain error (EDOM, result NaN). pow(0, y) with y negative is an error too. A result that is too big returns HUGE_VAL with errno set to ERANGE.\n\nThe result is a double. For integers, a loop of multiplications is exact; converting pow(10, 2) back to int usually gives 100, but rounding means you should add 0.5 before converting when the result must be exact. In C, ^ is exclusive or, not a power.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("2^10 = %g\\n", pow(2.0, 10.0));
    printf("square root of 2 = %f\\n", pow(2.0, 0.5));
    printf("1000 at 5%% for 10 years = %.2f\\n", 1000.0 * pow(1.05, 10.0));
    return 0;
}
`,
    see: ['exp', 'sqrt', 'log', '^'],
  },
  sqrt: {
    text: 'sqrt(x) returns the non-negative square root of x.\n\nx must not be negative: sqrt(-1.0) is a domain error, errno becomes EDOM and the result is NaN (printed nan).\n\nWithout #include <math.h>, a C89 compiler assumes sqrt returns int, and the result comes back as garbage. Always include the header.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double a = 3.0, b = 4.0;

    printf("hypotenuse of %g and %g is %g\\n", a, b, sqrt(a * a + b * b));
    printf("sqrt(2) = %.12f\\n", sqrt(2.0));
    return 0;
}
`,
    see: ['pow', 'fabs', 'EDOM'],
  },
  ceil: {
    text: 'ceil(x) returns the smallest whole number that is not less than x, as a double. It rounds up, towards positive infinity: ceil(2.1) is 3 and ceil(-2.9) is -2.\n\nThe result is a double; convert it to int yourself if you need an integer, making sure it fits.\n\nA typical use: how many pages of 10 lines does 42 lines need? ceil(42 / 10.0) is 5. With integers the same is (42 + 9) / 10.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    printf("ceil(2.1) = %g, ceil(-2.9) = %g\\n", ceil(2.1), ceil(-2.9));
    printf("pages for 42 lines: %d\\n", (int)ceil(42 / 10.0));
    return 0;
}
`,
    see: ['floor', 'modf', 'fmod'],
  },
  fabs: {
    text: 'fabs(x) returns the absolute value of a double.\n\nabs and labs in <stdlib.h> are for int and long; calling abs on a double converts it to int first and loses the fraction.\n\nA common use is comparing doubles: instead of a == b, test fabs(a - b) < some small tolerance, because rounding rarely leaves two computed values exactly equal.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double a = 0.1 + 0.2, b = 0.3;

    printf("a == b ? %s\\n", a == b ? "yes" : "no");
    printf("close enough ? %s\\n", fabs(a - b) < 1e-9 ? "yes" : "no");
    return 0;
}
`,
    see: ['abs', 'labs', 'DBL_EPSILON'],
  },
  floor: {
    text: 'floor(x) returns the largest whole number not greater than x, as a double. It rounds down, towards negative infinity: floor(2.9) is 2 and floor(-2.1) is -3.\n\nThat differs from converting to int, which truncates towards zero: (int)-2.1 is -2.\n\nC89 has no round function. floor(x + 0.5) rounds to the nearest whole number, with halves going up.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double x = -2.5;

    printf("floor(%g) = %g, (int)%g = %d\\n", x, floor(x), x, (int)x);
    printf("2.5 rounded = %g\\n", floor(2.5 + 0.5));
    return 0;
}
`,
    see: ['ceil', 'modf', 'fmod'],
  },
  fmod: {
    text: 'fmod(x, y) returns the remainder of x / y for doubles: x - n * y where n is x / y truncated towards zero. The result has the same sign as x.\n\nThe % operator only works on integers; fmod is its floating-point cousin. fmod(7.5, 2) is 1.5 and fmod(-7.5, 2) is -1.5.\n\nIf y is 0 the result is implementation-defined: here it is a NaN with errno set to EDOM.',
    example: `#include <stdio.h>
#include <math.h>

int main(void)
{
    double angle = 765.0;

    printf("fmod(7.5, 2) = %g\\n", fmod(7.5, 2.0));
    printf("%g degrees is %g degrees\\n", angle, fmod(angle, 360.0));
    return 0;
}
`,
    see: ['%', 'modf', 'floor'],
  },
});
