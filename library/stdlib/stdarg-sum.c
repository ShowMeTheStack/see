/*
 * title: Counted and sentinel-ended argument lists with stdarg.h
 * level: 2
 * about: Writes sum_ints, which takes a count and then that many ints, an average of doubles ended by a negative sentinel, and a max over any number of values.
 */
#include <stdio.h>
#include <stdarg.h>

/*
 * The ... in a prototype means "any number of further arguments". The
 * function cannot know how many there are, or their types, so it needs
 * a rule. Two common rules:
 *   - a count passed first, as in sum_ints(3, a, b, c)
 *   - a special last value, a sentinel, as in average(a, b, -1.0)
 * There must be at least one named parameter before the ... .
 */
static int sum_ints(int count, ...)
{
    va_list ap;
    int i, total = 0;

    va_start(ap, count);          /* start just after the parameter count */
    for (i = 0; i < count; i++)
        total += va_arg(ap, int); /* fetch the next one, as an int */
    va_end(ap);                   /* always pair va_start with va_end */
    return total;
}

/*
 * Arguments passed through ... are "promoted": a float arrives as a
 * double and a char or short as an int. So va_arg must ask for double
 * here, never float.
 */
static double average(double first, ...)
{
    va_list ap;
    double x, total = 0.0;
    int n = 0;

    va_start(ap, first);
    for (x = first; x >= 0.0; x = va_arg(ap, double)) {
        total += x;
        n++;
    }
    va_end(ap);
    return n ? total / n : 0.0;
}

static int max_of(int count, int first, ...)
{
    va_list ap;
    int best = first, v, i;

    va_start(ap, first);
    for (i = 1; i < count; i++) {
        v = va_arg(ap, int);
        if (v > best)
            best = v;
    }
    va_end(ap);
    return best;
}

int main(void)
{
    char c = 'A';

    printf("sum of nothing: %d\n", sum_ints(0));
    printf("sum of 3 numbers: %d\n", sum_ints(3, 10, 20, 30));
    printf("sum of 6 numbers: %d\n", sum_ints(6, 1, 2, 3, 4, 5, 6));
    /* The char c is promoted to int on the way in, so reading it as an
       int is correct. */
    printf("sum with a char: %d\n", sum_ints(2, c, 1));

    printf("average: %.3f\n", average(2.5, 3.5, 9.0, -1.0));
    printf("average: %.3f\n", average(4.0, -1.0));

    printf("max: %d\n", max_of(5, 17, -3, 42, 8, 41));

    /*
     * Nothing checks the count. sum_ints(4, 1, 2, 3) would read a fourth
     * int that was never passed: undefined behaviour. That is the price
     * of variadic functions, and why printf formats must match exactly.
     *
     * In See, step into sum_ints and look at its frame: the extra
     * arguments sit just above count on the stack, and ap is a pointer
     * that walks up through them, 4 bytes per int.
     */
    return 0;
}
