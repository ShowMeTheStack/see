/*
 * title: Macros versus functions with side effects
 * level: 3
 * about: Counts how often each argument is evaluated by a MAX macro and by a max function, showing why a macro may run an argument twice.
 */
#include <stdio.h>

#define MAX_MACRO(a, b) ((a) > (b) ? (a) : (b))

static int max_function(int a, int b)
{
    return a > b ? a : b;
}

/*
 * next_reading hands out the readings one by one and counts how many
 * times it was called. Calling a function is a safe, well-defined way
 * to watch evaluation happen; writing MAX(i++, j) instead would be
 * just as wrong but much harder to see.
 */
static const int readings[] = { 4, 9, 2, 7, 5, 8, 1, 6, 3, 10, 11, 12 };
static int pos = 0;
static int calls = 0;

static int next_reading(void)
{
    calls++;
    return readings[pos++];
}

int main(void)
{
    int a, b, m;

    /*
     * The function receives two values. Each argument expression runs
     * exactly once, before the call, and the values are copied into the
     * parameters a and b in max_function's stack frame.
     */
    pos = 0;
    calls = 0;
    a = next_reading();
    b = next_reading();
    m = max_function(a, b);
    printf("function, fair:     max(%d, %d) = %d, %d calls\n", a, b, m, calls);

    pos = 0;
    calls = 0;
    m = max_function(next_reading(), next_reading());
    printf("function, inline:   result %d, %d calls\n", m, calls);

    /*
     * The macro receives text. MAX_MACRO(next_reading(), next_reading())
     * becomes
     *   ((next_reading()) > (next_reading()) ? (next_reading()) : (next_reading()))
     * so two readings are compared, and then whichever side won is
     * evaluated AGAIN, which reads a third value. The result is not
     * even one of the two values that were compared.
     */
    pos = 0;
    calls = 0;
    m = MAX_MACRO(next_reading(), next_reading());
    printf("macro, inline:      result %d, %d calls\n", m, calls);

    /*
     * The cure is to evaluate first and pass plain variables, which
     * have no side effects. Then the macro and function agree.
     */
    pos = 0;
    calls = 0;
    a = next_reading();
    b = next_reading();
    m = MAX_MACRO(a, b);
    printf("macro, variables:   max(%d, %d) = %d, %d calls\n", a, b, m, calls);

    /*
     * Why use macros at all? In 1989 a call cost real time, and a macro
     * works for any type. Today, prefer a function unless you need what
     * only a macro can do: #, ##, __LINE__, or code generation.
     * In See, step with F11: the function version enters max_function,
     * the macro version never leaves main.
     */
    return 0;
}
