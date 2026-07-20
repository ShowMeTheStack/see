/* The C reference: <float.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  FLT_RADIX: {
    text: 'FLT_RADIX is the base in which floating-point numbers are stored: 2 here, as on every machine using IEEE 754. A float or double holds a sign, a significand (the digits) and an exponent, and the value is significand * FLT_RADIX to the power exponent.\n\nBecause the base is 2, decimal fractions like 0.1 cannot be stored exactly, in the same way that 1/3 cannot be written exactly in decimal. That is why 0.1 + 0.2 == 0.3 is false.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("floating point uses base %d\\n", FLT_RADIX);
    printf("0.1 is really stored as %.20f\\n", 0.1);
    return 0;
}
`,
    see: ['FLT_MANT_DIG', 'DBL_EPSILON'],
  },
  FLT_ROUNDS: {
    text: 'FLT_ROUNDS tells how floating-point addition rounds: -1 undetermined, 0 toward zero, 1 to nearest, 2 toward positive infinity, 3 toward negative infinity. Here it is 1, round to nearest (ties go to the even neighbour), the IEEE 754 default.\n\nRounding is distinct from converting to an integer: (int)2.7 always truncates to 2, whatever FLT_ROUNDS says.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("FLT_ROUNDS = %d (%s)\\n", FLT_ROUNDS, FLT_ROUNDS == 1 ? "round to nearest" : "other");
    printf("(int)2.7 = %d\\n", (int)2.7);
    return 0;
}
`,
    see: ['FLT_RADIX', 'floor'],
  },
  FLT_MANT_DIG: {
    text: 'FLT_MANT_DIG is the number of base-2 digits in the significand of a float: 24 here (23 stored bits plus an implied leading 1).\n\nSo a float represents every integer exactly only up to 2 to the 24th, 16777216. Beyond that, consecutive integers start to be skipped: 16777217 cannot be stored in a float.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    float f = 16777216.0f;

    f = f + 1.0f;
    printf("a float has %d significand bits; 16777216 + 1 = %.1f\\n", FLT_MANT_DIG, f);
    return 0;
}
`,
    see: ['DBL_MANT_DIG', 'FLT_DIG'],
  },
  FLT_DIG: {
    text: 'FLT_DIG is the number of decimal digits that survive a round trip through a float: 6 here. Any decimal number with 6 significant digits can be stored in a float and printed back unchanged.\n\nThat is not much. A float cannot tell 1234567.8 from 1234567.9, which is why double is the usual choice for floating-point work in C.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    float f = 1234567.89f;

    printf("FLT_DIG = %d; 1234567.89 as a float is %.2f\\n", FLT_DIG, f);
    return 0;
}
`,
    see: ['DBL_DIG', 'FLT_MANT_DIG'],
  },
  FLT_EPSILON: {
    text: 'FLT_EPSILON is the gap between 1.0 and the next larger float: about 1.19e-07 (2 to the -23rd).\n\nIt measures the relative precision of a float: adding anything much smaller than FLT_EPSILON to 1.0f leaves 1.0f unchanged. When comparing floats, use a tolerance scaled to the size of the numbers, such as fabs(a - b) <= FLT_EPSILON * fabs(a) times a small factor.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    float one = 1.0f, tiny = FLT_EPSILON / 4;

    printf("FLT_EPSILON = %g\\n", FLT_EPSILON);
    printf("1 + epsilon/4 == 1 ? %s\\n", (float)(one + tiny) == one ? "yes" : "no");
    return 0;
}
`,
    see: ['DBL_EPSILON', 'fabs'],
  },
  FLT_MIN_EXP: {
    text: 'FLT_MIN_EXP is the smallest exponent e such that FLT_RADIX to the power e - 1 is a normalised float: -125 here. It describes the lower end of the float range in powers of two; FLT_MIN is the matching value.',
    example: `#include <stdio.h>
#include <float.h>
#include <math.h>

int main(void)
{
    printf("FLT_MIN_EXP = %d, 2^(%d) = %g = FLT_MIN\\n", FLT_MIN_EXP, FLT_MIN_EXP - 1, ldexp(1.0, FLT_MIN_EXP - 1));
    return 0;
}
`,
    see: ['FLT_MIN', 'FLT_MAX_EXP'],
  },
  FLT_MIN: {
    text: 'FLT_MIN is the smallest positive normalised float: about 1.18e-38. It is not the most negative float; that is -FLT_MAX.\n\nIEEE 754 allows even smaller "subnormal" values below FLT_MIN, with fewer digits of precision, before reaching 0.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("smallest positive float %g, most negative float %g\\n", FLT_MIN, -FLT_MAX);
    return 0;
}
`,
    see: ['FLT_MAX', 'DBL_MIN'],
  },
  FLT_MIN_10_EXP: {
    text: 'FLT_MIN_10_EXP is the smallest negative power of ten that is a normalised float: -37 here, so 1e-37 fits in a float but 1e-38 is below FLT_MIN.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("FLT_MIN_10_EXP = %d, FLT_MAX_10_EXP = %d\\n", FLT_MIN_10_EXP, FLT_MAX_10_EXP);
    return 0;
}
`,
    see: ['FLT_MAX_10_EXP', 'FLT_MIN'],
  },
  FLT_MAX_EXP: {
    text: 'FLT_MAX_EXP is the largest exponent e such that FLT_RADIX to the power e - 1 is a finite float: 128 here. Values at or beyond 2 to the 128th overflow to infinity.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("FLT_MAX_EXP = %d: a float stays below 2^%d\\n", FLT_MAX_EXP, FLT_MAX_EXP);
    return 0;
}
`,
    see: ['FLT_MAX', 'FLT_MIN_EXP'],
  },
  FLT_MAX: {
    text: 'FLT_MAX is the largest finite float: about 3.40e+38.\n\nA double larger than that converted to float gives undefined behaviour in C89; in practice it becomes infinity. Doing arithmetic in float that goes past FLT_MAX gives infinity, printed inf.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    float big = FLT_MAX;

    printf("FLT_MAX = %g\\n", big);
    printf("FLT_MAX * 2 = %g\\n", (double)(float)(big * 2.0f));
    return 0;
}
`,
    see: ['FLT_MIN', 'DBL_MAX', 'HUGE_VAL'],
  },
  FLT_MAX_10_EXP: {
    text: 'FLT_MAX_10_EXP is the largest power of ten that is a finite float: 38 here. 1e38 fits; 1e39 does not.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("floats reach 1e%d\\n", FLT_MAX_10_EXP);
    return 0;
}
`,
    see: ['FLT_MAX', 'FLT_MIN_10_EXP'],
  },
  DBL_MANT_DIG: {
    text: 'DBL_MANT_DIG is the number of base-2 digits in the significand of a double: 53 here.\n\nSo every integer up to 2 to the 53rd (9007199254740992) is exact in a double, far more than a 32-bit int can hold. That makes double a safe place to hold any int value.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    double d = 9007199254740992.0;

    printf("DBL_MANT_DIG = %d\\n", DBL_MANT_DIG);
    printf("2^53 + 1 as a double = %.0f\\n", d + 1.0);
    return 0;
}
`,
    see: ['FLT_MANT_DIG', 'DBL_DIG'],
  },
  DBL_DIG: {
    text: 'DBL_DIG is the number of decimal digits that survive a round trip through a double: 15 here.\n\nPrinting a double with %.15g shows those digits; printing more (%.17g) shows the binary value exactly enough to read it back, including the rounding noise.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    double x = 0.1;

    printf("DBL_DIG = %d\\n", DBL_DIG);
    printf("%%.15g: %.15g   %%.17g: %.17g\\n", x, x);
    return 0;
}
`,
    see: ['FLT_DIG', 'DBL_EPSILON'],
  },
  DBL_EPSILON: {
    text: 'DBL_EPSILON is the gap between 1.0 and the next larger double: about 2.22e-16 (2 to the -52nd). It is the relative precision of a double.\n\nComparing two computed doubles with == is fragile. A common test is fabs(a - b) <= DBL_EPSILON * fabs(a) * some small factor, which scales with the size of the values; a fixed tolerance like 1e-9 only makes sense when you know their size.',
    example: `#include <stdio.h>
#include <float.h>
#include <math.h>

int main(void)
{
    double a = 0.1 + 0.2, b = 0.3;

    printf("DBL_EPSILON = %g\\n", DBL_EPSILON);
    printf("a == b: %d, nearly equal: %d\\n", a == b, fabs(a - b) <= 4 * DBL_EPSILON * fabs(b));
    return 0;
}
`,
    see: ['FLT_EPSILON', 'fabs', 'DBL_DIG'],
  },
  DBL_MIN_EXP: {
    text: 'DBL_MIN_EXP is the smallest exponent e such that 2 to the power e - 1 is a normalised double: -1021 here, giving DBL_MIN = 2 to the -1022nd.',
    example: `#include <stdio.h>
#include <float.h>
#include <math.h>

int main(void)
{
    printf("2^(%d) = %g, DBL_MIN = %g\\n", DBL_MIN_EXP - 1, ldexp(1.0, DBL_MIN_EXP - 1), DBL_MIN);
    return 0;
}
`,
    see: ['DBL_MIN', 'DBL_MAX_EXP'],
  },
  DBL_MIN: {
    text: 'DBL_MIN is the smallest positive normalised double: about 2.23e-308. The most negative double is -DBL_MAX, not DBL_MIN.\n\nA product of many small probabilities can sink below DBL_MIN and eventually to 0; working with logarithms avoids that.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("DBL_MIN = %g, DBL_MIN / 2 = %g (subnormal, still not zero)\\n", DBL_MIN, DBL_MIN / 2);
    return 0;
}
`,
    see: ['DBL_MAX', 'FLT_MIN', 'log'],
  },
  DBL_MIN_10_EXP: {
    text: 'DBL_MIN_10_EXP is the smallest negative power of ten that is a normalised double: -307 here.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("doubles reach down to 1e%d and up to 1e%d\\n", DBL_MIN_10_EXP, DBL_MAX_10_EXP);
    return 0;
}
`,
    see: ['DBL_MAX_10_EXP', 'DBL_MIN'],
  },
  DBL_MAX_EXP: {
    text: 'DBL_MAX_EXP is the largest exponent e such that 2 to the power e - 1 is a finite double: 1024 here. Results at or beyond 2 to the 1024th overflow to infinity.',
    example: `#include <stdio.h>
#include <float.h>
#include <math.h>

int main(void)
{
    printf("2^%d = %g, 2^%d = %g\\n", DBL_MAX_EXP - 1, ldexp(1.0, DBL_MAX_EXP - 1), DBL_MAX_EXP, ldexp(1.0, DBL_MAX_EXP));
    return 0;
}
`,
    see: ['DBL_MAX', 'DBL_MIN_EXP', 'HUGE_VAL'],
  },
  DBL_MAX: {
    text: 'DBL_MAX is the largest finite double: about 1.80e+308.\n\nIt is a handy starting value when searching for a minimum: set best = DBL_MAX and every real value is smaller. Arithmetic that goes beyond it gives infinity, which here is the same as HUGE_VAL.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    double v[] = { 3.5, -1.25, 8.0 };
    double low = DBL_MAX;
    int i;

    for (i = 0; i < 3; i++)
        if (v[i] < low)
            low = v[i];
    printf("smallest %g; DBL_MAX = %g; DBL_MAX * 10 = %g\\n", low, DBL_MAX, DBL_MAX * 10);
    return 0;
}
`,
    see: ['DBL_MIN', 'HUGE_VAL', 'FLT_MAX'],
  },
  DBL_MAX_10_EXP: {
    text: 'DBL_MAX_10_EXP is the largest power of ten that is a finite double: 308 here. 1e308 fits; 1e309 overflows.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("1e%d = %g\\n", DBL_MAX_10_EXP, 1e308);
    return 0;
}
`,
    see: ['DBL_MAX', 'DBL_MIN_10_EXP'],
  },
  LDBL_MANT_DIG: {
    text: 'LDBL_MANT_DIG is the number of base-2 significand digits in a long double. On this machine long double is the same as double, so it is 53, the same as DBL_MANT_DIG. On many PCs it is 64.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("long double: %d bits of significand, %d bytes\\n", LDBL_MANT_DIG, (int)sizeof(long double));
    return 0;
}
`,
    see: ['DBL_MANT_DIG'],
  },
  LDBL_DIG: {
    text: 'LDBL_DIG is the number of decimal digits a long double keeps: 15 here, the same as DBL_DIG, because long double is the same as double on this machine.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_DIG = %d, DBL_DIG = %d\\n", LDBL_DIG, DBL_DIG);
    return 0;
}
`,
    see: ['DBL_DIG'],
  },
  LDBL_EPSILON: {
    text: 'LDBL_EPSILON is the gap between 1.0 and the next larger long double: about 2.22e-16 here, the same as DBL_EPSILON. Print long doubles with %Lg or %Lf; the L is required.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_EPSILON = %Lg\\n", LDBL_EPSILON);
    return 0;
}
`,
    see: ['DBL_EPSILON'],
  },
  LDBL_MIN_EXP: {
    text: 'LDBL_MIN_EXP is the smallest binary exponent of a normalised long double: -1021 here, the same as DBL_MIN_EXP.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_MIN_EXP = %d\\n", LDBL_MIN_EXP);
    return 0;
}
`,
    see: ['DBL_MIN_EXP'],
  },
  LDBL_MIN: {
    text: 'LDBL_MIN is the smallest positive normalised long double: about 2.23e-308 here, the same as DBL_MIN.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_MIN = %Lg\\n", LDBL_MIN);
    return 0;
}
`,
    see: ['DBL_MIN'],
  },
  LDBL_MIN_10_EXP: {
    text: 'LDBL_MIN_10_EXP is the smallest negative power of ten that is a normalised long double: -307 here, the same as for double.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_MIN_10_EXP = %d\\n", LDBL_MIN_10_EXP);
    return 0;
}
`,
    see: ['DBL_MIN_10_EXP'],
  },
  LDBL_MAX_EXP: {
    text: 'LDBL_MAX_EXP is the largest binary exponent of a finite long double: 1024 here, the same as DBL_MAX_EXP.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_MAX_EXP = %d\\n", LDBL_MAX_EXP);
    return 0;
}
`,
    see: ['DBL_MAX_EXP'],
  },
  LDBL_MAX: {
    text: 'LDBL_MAX is the largest finite long double: about 1.80e+308 here, the same as DBL_MAX. A long double constant carries an L suffix, as in 1.5L.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    long double x = LDBL_MAX;

    printf("LDBL_MAX = %Lg\\n", x);
    return 0;
}
`,
    see: ['DBL_MAX'],
  },
  LDBL_MAX_10_EXP: {
    text: 'LDBL_MAX_10_EXP is the largest power of ten that is a finite long double: 308 here, the same as for double.',
    example: `#include <stdio.h>
#include <float.h>

int main(void)
{
    printf("LDBL_MAX_10_EXP = %d\\n", LDBL_MAX_10_EXP);
    return 0;
}
`,
    see: ['DBL_MAX_10_EXP'],
  },
});
