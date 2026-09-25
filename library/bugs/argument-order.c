/*
 * title: Which argument is read first
 * level: 3
 * about: Builds a point from two numbers read by calls inside the argument list, and gets x and y swapped.
 * input: 3 4\n10 20
 */

/*
 * THE PUZZLE
 * The input says x = 3 and y = 4, then x = 10 and y = 20. The program
 * prints the points the other way round. Nothing crashes and See does
 * not complain: every line here is legal C.
 *
 *   expected:  (3, 4)  then (10, 20)
 *   actual:    (4, 3)  then (20, 10)
 *
 * C does not say in which order the arguments of a function call are
 * evaluated. See, like gcc on 32-bit x86, evaluates them right to
 * left, so the second read_int() call runs first and swallows the 3.
 *
 * HOW TO HUNT IT WITH SEE
 * Stop on the make_point line and press F11 to step into the first
 * call: you land in read_int, and the call stack shows which one it
 * is. Step out, step in again. The order you see is See's choice;
 * another compiler may choose differently, which is precisely why you
 * must not depend on it.
 */
#include <stdio.h>

struct point {
    int x, y;
};

static int read_int(void)
{
    int v = 0;

    if (scanf("%d", &v) != 1)
        v = 0;
    return v;
}

static struct point make_point(int x, int y)
{
    struct point p;

    p.x = x;
    p.y = y;
    return p;
}

int main(void)
{
    struct point a, b;

    a = make_point(read_int(), read_int());
    b = make_point(read_int(), read_int());
    printf("a = (%d, %d)\n", a.x, a.y);
    printf("b = (%d, %d)\n", b.x, b.y);
    return 0;
}

/*
 * THE FIX
 * Give each read its own statement; a semicolon is a sequence point,
 * so the order is then fixed:
 *
 *     int x = read_int();
 *     int y = read_int();
 *     a = make_point(x, y);
 *
 * The same trap appears with printf("%d %d\n", next(), next()) and
 * with f(i++, i++), which is worse still: undefined behaviour.
 */
