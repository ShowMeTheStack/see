/*
 * title: Circle area with a constant
 * level: 1
 * about: Reads a radius and prints the circumference and area, with pi written once as a named constant.
 * input: 2.5
 */
#include <stdio.h>

/*
 * #define makes the preprocessor replace every PI below with the digits
 * before the compiler sees them. Writing the number once, with a name,
 * means it cannot be mistyped in one place and right in another.
 */
#define PI 3.14159265358979

int main(void)
{
    double radius;
    double circumference;
    double area;

    printf("Radius: ");
    /* For a double, scanf needs %lf ("long float"). printf uses %f for
       both float and double, but scanf must know which size to store. */
    scanf("%lf", &radius);
    printf("%g\n", radius);

    circumference = 2.0 * PI * radius;
    area = PI * radius * radius;

    printf("circumference = %.4f\n", circumference);
    printf("area          = %.4f\n", area);
    return 0;
}
