/*
 * title: Macros follow the file, not the braces
 * level: 2
 * about: Shows that a #define stays in force from its line to the end of the file, ignoring functions and blocks, and how #undef ends it.
 */
#include <stdio.h>

static void first(void);
static void second(void);
static void third(void);

int main(void)
{
    /*
     * A macro defined inside a function body is NOT local to it. The
     * preprocessor does not know what a function is; it reads the file
     * from top to bottom and only cares which line it is on.
     */
#define GREETING "hello from main's #define"
    printf("main:   %s\n", GREETING);

    first();
    second();
    third();
    return 0;
}

static void first(void)
{
    /* Still defined here, although it was written inside main. */
    printf("first:  %s\n", GREETING);
}

/*
 * #undef ends the definition. Redefining a macro with a different body
 * without #undef first is an error (or a warning, on many compilers),
 * so changing a macro is always #undef then #define.
 */
#undef GREETING
#define GREETING "hello again, redefined"

static void second(void)
{
    printf("second: %s\n", GREETING);
}

#undef GREETING

static void third(void)
{
#ifdef GREETING
    printf("third:  %s\n", GREETING);
#else
    /*
     * After #undef, GREETING is just an ordinary identifier again. It
     * could even name a variable now.
     */
    int GREETING = 42;
    printf("third:  GREETING is now a plain int variable holding %d\n", GREETING);
#endif
}
