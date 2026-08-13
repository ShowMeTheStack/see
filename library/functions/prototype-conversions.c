/*
 * title: What a prototype converts for you
 * level: 3
 * about: Calls functions with arguments of the "wrong" type and shows how the prototype converts each one, and how an old-style definition promotes them instead.
 */
#include <stdio.h>

/* With a prototype in scope, each argument is converted to the
   parameter's type before the call, exactly as if assigned:
     int to double  - widened, exact
     double to int  - the fraction is cut off (towards zero)
     int to char    - only the low 8 bits survive
     long to short  - only the low 16 bits survive */
double half(double x);
int whole(int n);
char low_byte(char c);
short low_half(short s);

double half(double x)       { return x / 2; }
int whole(int n)            { return n; }
char low_byte(char c)       { return c; }
short low_half(short s)     { return s; }

/* An old-style (K&R) definition gives no prototype. Callers then apply
   the "default argument promotions": char and short become int, float
   becomes double. Inside, the parameter is converted back. Prototypes
   were added in C89 precisely so calls could be checked and converted. */
double average_old(a, b)
    float a;
    float b;
{
    return (a + b) / 2;
}

int main(void)
{
    float f1 = 1.5f, f2 = 2.25f;

    /* 7 is an int, but half() receives 7.0: the result is 3.5, not 3.
       Step into half and look at x in the frame: 8 bytes, a double. */
    printf("half(7)            = %g\n", half(7));

    /* The fraction is dropped, not rounded, in both directions. */
    printf("whole(9.99)        = %d\n", whole(9.99));
    printf("whole(-9.99)       = %d\n", whole(-9.99));

    /* 300 does not fit in a char: 300 - 256 = 44, which is ','. With a
       constant like this the compiler would warn that the value changes,
       so the cast says "yes, I mean it". The conversion is the same. */
    printf("low_byte(300)      = %d ('%c')\n", low_byte((char)300), low_byte((char)300));
    /* 70000 - 65536 = 4464. */
    printf("low_half(70000)    = %d\n", low_half((short)70000L));

    /* Two floats travel as doubles to an old-style function. */
    printf("average_old(1.5, 2.25) = %g\n", average_old(f1, f2));
    return 0;
}
