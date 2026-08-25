/*
 * title: Walking from one float to the next
 * level: 4
 * about: Adds one to the bit pattern of a float to find the very next representable number, and shows the gaps growing as numbers get larger.
 */
#include <stdio.h>
#include <float.h>

union pun {
    float f;
    unsigned long bits;
};

/* The smallest float larger than x (for positive, finite x). */
static float next_up(float x)
{
    union pun u;
    u.f = x;
    /*
     * Positive floats are ordered the same way as their bit patterns read as
     * integers, so the next float is simply the next integer.
     */
    u.bits = u.bits + 1;
    return u.f;
}

int main(void)
{
    float starts[5];
    float x, y;
    int i;

    starts[0] = 1.0f;
    starts[1] = 1000.0f;
    starts[2] = 1000000.0f;
    starts[3] = 16777216.0f;   /* 2 to the 24 */
    starts[4] = 1.0e10f;

    printf("%-14s %-16s %s\n", "x", "next float", "gap");
    for (i = 0; i < 5; i++) {
        x = starts[i];
        y = next_up(x);
        printf("%-14.1f %-16.4f %g\n", x, y, (double)y - (double)x);
    }

    /*
     * Floats have 24 bits of precision. Past 2^24 the gap is 2, so adding 1
     * does nothing at all. Step over the loop below and watch big stop
     * changing in the watch panel.
     */
    x = 16777216.0f;
    y = x;
    for (i = 0; i < 10; i++)
        y = y + 1.0f;
    printf("\n16777216 + 1, ten times, gives %.1f\n", y);

    printf("FLT_EPSILON (the gap just above 1) = %g\n", FLT_EPSILON);
    printf("float has %d decimal digits of precision, double has %d\n", FLT_DIG, DBL_DIG);
    return 0;
}
