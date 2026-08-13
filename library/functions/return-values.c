/*
 * title: Functions that hand back an answer
 * level: 1
 * about: Computes areas and perimeters with small functions, each returning one value to its caller.
 */
#include <stdio.h>

/* A prototype tells the compiler a function's name, the types of its
   parameters and the type of value it returns, before the body is seen. */
double circle_area(double r);
double rectangle_area(double w, double h);
int    square(int n);
int    max_of(int a, int b);

int main(void)
{
    double total;
    int big;

    /* A call is an expression: its value is whatever the function
       returns, so it can sit inside printf's argument list. */
    printf("circle of radius 2   : %.3f\n", circle_area(2.0));
    printf("rectangle 3 by 4.5   : %.2f\n", rectangle_area(3.0, 4.5));

    /* Return values can be stored, added, or passed on to another call. */
    total = circle_area(1.0) + rectangle_area(2.0, 2.0);
    printf("sum of two areas     : %.3f\n", total);

    /* square() runs first, then its result becomes max_of's argument.
       Step into (F11) and watch two short-lived frames come and go. */
    big = max_of(square(5), square(4) + 10);
    printf("max(25, 26)          : %d\n", big);
    return 0;
}

double circle_area(double r)
{
    /* The value after return travels back to the caller; this frame
       then disappears. */
    return 3.14159265358979 * r * r;
}

double rectangle_area(double w, double h)
{
    return w * h;
}

int square(int n)
{
    return n * n;
}

int max_of(int a, int b)
{
    /* A function may have several return statements; the first one
       reached ends the call. */
    if (a > b)
        return a;
    return b;
}
