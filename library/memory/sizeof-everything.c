/*
 * title: sizeof everything
 * level: 1
 * about: Prints the size in bytes of every basic type, some pointers, an array, a struct and a string literal on See's 32-bit machine.
 */
#include <stdio.h>

struct point {
    int x;
    int y;
};

/* sizeof gives a size_t; casting to unsigned keeps printf's %u honest. */
#define SHOW(what) printf("%-22s %2u\n", #what, (unsigned)sizeof(what))

int main(void)
{
    int numbers[10];
    struct point p;

    numbers[0] = 0;
    p.x = p.y = 0;

    printf("%-22s %s\n", "expression", "bytes");
    SHOW(char);
    SHOW(short);
    SHOW(int);
    SHOW(long);
    SHOW(float);
    SHOW(double);
    SHOW(long double);
    SHOW(char *);
    SHOW(double *);
    SHOW(void (*)(void));
    SHOW(numbers);
    SHOW(numbers[0]);
    SHOW(struct point);
    SHOW(p.x);
    SHOW("hello");
    SHOW('A');

    /*
     * A few things worth noticing:
     *  - every pointer is 4 bytes, whatever it points to;
     *  - sizeof numbers is the whole array (40), not a pointer;
     *  - "hello" is 6 because of the '\0' at the end;
     *  - 'A' is an int in C, so sizeof 'A' is 4, not 1.
     * sizeof is worked out by the compiler: nothing is evaluated at run time.
     */
    printf("\nelements in numbers: %u\n", (unsigned)(sizeof numbers / sizeof numbers[0]));
    printf("numbers[0] = %d, p = (%d, %d)\n", numbers[0], p.x, p.y);
    return 0;
}
