/*
 * title: Macros never expand into themselves
 * level: 4
 * about: Shows that a macro mentioning its own name is expanded only once, and uses the rule to wrap a function with a same-named macro.
 */
#include <stdio.h>

/*
 * While a macro is being expanded, its own name is "painted blue": if
 * it turns up again inside the result, it is left alone. Without this
 * rule, the definition below would expand forever.
 *
 * Here limit is both a variable and a macro. limit in the code becomes
 * (limit + 10), and the inner limit stays as the variable's name.
 */
static int limit = 5;
#define limit (limit + 10)

/*
 * The rule also covers indirect loops: A mentions B and B mentions A.
 * A expands to B's text, B to A's text, and there it stops, because A
 * is already being expanded. ping and pong are ordinary variables.
 */
static int ping = 1, pong = 2;
#define ping (pong * 100)
#define pong (ping + 1)

/*
 * A useful application: a macro with the same name as a function, to
 * add the caller's line number to every call. Inside the macro, area
 * is not expanded again, so it reaches the real function. The function
 * is defined before the macro, so its own definition is untouched.
 */
static int calls = 0;
static int area(int w, int h, int line)
{
    calls++;
    printf("  area(%d, %d) called from line %d\n", w, h, line);
    return w * h;
}
#define area(w, h) area((w), (h), __LINE__)

int main(void)
{
    int a;

    /* limit -> (limit + 10), and that inner limit is the variable 5 */
    printf("limit = %d\n", limit);

    /* ping -> (pong * 100) -> ((ping + 1) * 100), ping is now blue */
    printf("ping = %d\n", ping);
    /* pong -> (ping + 1) -> ((pong * 100) + 1) */
    printf("pong = %d\n", pong);

    a = area(3, 4);
    a += area(5, 6);
    printf("total area %d from %d calls\n", a, calls);

    /*
     * In See's globals pane the variables are still limit = 5,
     * ping = 1 and pong = 2. Only the text that reads them changed.
     * Step into area (F11): its line parameter holds the caller's line.
     */
    return 0;
}
