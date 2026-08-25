/*
 * title: Inside a float with a union
 * level: 3
 * about: Overlays a float and an unsigned long in a union, then splits the bits into sign, exponent and mantissa and rebuilds the value by hand.
 */
#include <stdio.h>
#include <math.h>

/*
 * Both members start at the same address and share the same four bytes.
 * Writing f and reading bits shows exactly how the float is encoded.
 */
union pun {
    float f;
    unsigned long bits;
};

static void print_binary(unsigned long v, int width)
{
    int i;
    for (i = width - 1; i >= 0; i--)
        putchar((v >> i) & 1UL ? '1' : '0');
}

static void explain(float x)
{
    union pun u;
    unsigned long sign, exponent, mantissa;
    double rebuilt;

    u.f = x;
    sign = u.bits >> 31;
    exponent = (u.bits >> 23) & 0xFFUL;
    mantissa = u.bits & 0x7FFFFFUL;

    printf("%-10g 0x%08lx  ", x, u.bits);
    print_binary(sign, 1);
    putchar(' ');
    print_binary(exponent, 8);
    putchar(' ');
    print_binary(mantissa, 23);

    /*
     * For normal numbers: value = (-1)^sign * 1.mantissa * 2^(exponent - 127).
     * The leading 1 is not stored; it is implied, which buys one free bit.
     */
    if (exponent == 0) {
        printf("  zero or tiny\n");
        return;
    }
    rebuilt = ldexp(1.0 + mantissa / 8388608.0, (int)exponent - 127);
    if (sign)
        rebuilt = -rebuilt;
    printf("  = %.9g\n", rebuilt);
}

int main(void)
{
    printf("value      bits        s exponent mantissa\n");
    explain(1.0f);
    explain(2.0f);
    explain(0.5f);
    explain(-3.0f);
    explain(0.1f);
    explain(100.0f);
    explain(0.0f);

    /*
     * 0.1 has a mantissa that repeats 1100 1100 1100 ... and is cut off, so
     * a float can only get close to one tenth. That is the root of every
     * "0.1 + 0.2 is not 0.3" surprise.
     */
    return 0;
}
