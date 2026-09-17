/*
 * title: Pi by throwing darts
 * level: 2
 * about: Throws random points at a square with rand() and a fixed seed, and estimates pi from how many land inside the quarter circle.
 */
#include <stdio.h>
#include <stdlib.h>

/* A random double in [0, 1). RAND_MAX is 32767 here, so there are only
   32768 different values; fine for darts, too coarse for serious work. */
double random_unit(void)
{
    return rand() / (RAND_MAX + 1.0);
}

int main(void)
{
    long throws, inside = 0;
    double x, y;

    /* A fixed seed makes the "random" darts land in the same places on
       every run, so the output can be checked. Change 2024 to another
       number and the estimates change a little. */
    srand(2024);

    /* The quarter circle x*x + y*y < 1 covers pi/4 of the unit square.
       So the fraction of darts inside, times 4, estimates pi. */
    for (throws = 1; throws <= 200000; throws++) {
        x = random_unit();
        y = random_unit();
        if (x * x + y * y < 1.0)
            inside++;
        if (throws == 10 || throws == 100 || throws == 1000 ||
            throws == 10000 || throws == 100000 || throws == 200000)
            printf("%7ld darts, %7ld inside: pi is about %.5f\n",
                   throws, inside, 4.0 * inside / throws);
    }

    /* The error only shrinks like 1 / sqrt(darts): a hundred times more
       darts buys just one more correct digit. Compare that with the
       series in "Pi from three infinite series". */
    return 0;
}
