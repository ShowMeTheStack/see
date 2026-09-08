/*
 * title: A DEBUG switch for trace output
 * level: 2
 * about: Runs Euclid's gcd algorithm with trace lines that exist only when DEBUG is defined.
 */
#include <stdio.h>

/*
 * Delete or comment out this line and rebuild: the trace lines vanish
 * from the program completely, while the real output stays the same.
 * Many compilers let you set it from outside instead, as -DDEBUG.
 */
#define DEBUG

#ifdef DEBUG
   /* TRACE1 prints a message with one number. C89 has no variadic
      macros, so we write one macro per argument count. */
#  define TRACE0(msg)      printf("  [debug] " msg "\n")
#  define TRACE2(fmt, a, b) printf("  [debug] " fmt "\n", (a), (b))
#else
   /* When DEBUG is off the macros expand to nothing useful. (void)0
      is a harmless expression, so "TRACE0(...);" stays a valid
      statement even in the middle of an if/else. */
#  define TRACE0(msg)       ((void)0)
#  define TRACE2(fmt, a, b) ((void)0)
#endif

static int gcd(int a, int b)
{
    int t;
    TRACE2("gcd(%d, %d) starts", a, b);
    while (b != 0) {
        t = a % b;
        TRACE2("%d mod %d", a, b);
        a = b;
        b = t;
    }
    TRACE0("loop finished");
    return a;
}

int main(void)
{
    int pairs[4][2];
    int i;

    pairs[0][0] = 48;  pairs[0][1] = 18;
    pairs[1][0] = 270; pairs[1][1] = 192;
    pairs[2][0] = 17;  pairs[2][1] = 5;
    pairs[3][0] = 100; pairs[3][1] = 75;

#ifdef DEBUG
    printf("debug build\n");
#else
    printf("release build\n");
#endif

    for (i = 0; i < 4; i++)
        printf("gcd(%d, %d) = %d\n", pairs[i][0], pairs[i][1],
               gcd(pairs[i][0], pairs[i][1]));
    return 0;
}
