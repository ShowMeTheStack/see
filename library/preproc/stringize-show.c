/*
 * title: Stringizing with the # operator
 * level: 2
 * about: A SHOW macro prints each expression's source text next to its value, making a self-labelling calculator.
 */
#include <stdio.h>

/*
 * Inside a macro body, #x turns the argument x into a string literal
 * holding the argument's exact spelling. So SHOW(a * b) expands to
 *
 *     printf("%-16s = %d\n", "a * b", (a * b))
 *
 * The same text is used twice: once as words, once as code.
 */
#define SHOW(expr)    printf("%-16s = %d\n", #expr, (expr))
#define SHOWF(expr)   printf("%-16s = %.4f\n", #expr, (expr))

/* Stringizing also gives a cheap way to print a variable's name. */
#define NAMED(var)    printf("%s lives at offset %d in the array\n", #var, (int)(var - grid))

/*
 * Adjacent string literals are joined by the compiler, so "Hello, "
 * #who becomes one literal. This is how you glue a stringized
 * argument into a longer message.
 */
#define GREET(who)    puts("Hello, " #who "!")

static int grid[10];

int main(void)
{
    int a = 7, b = 5;
    int *middle = &grid[4];
    int *last = &grid[9];

    SHOW(a + b);
    SHOW(a * b);
    SHOW(a / b);
    SHOW(a % b);
    SHOW(a << 2);
    SHOW((a + b) * (a - b));
    SHOW(a > b && b > 0);
    SHOWF(a / 2.0);
    SHOWF(1.0 / 3);

    NAMED(middle);
    NAMED(last);

    /* The argument does not have to be valid C, only valid tokens. */
    GREET(world);
    GREET(See users);

    /*
     * In See, open the string literals pane: "a + b", "a * b" and the
     * others are all there as real strings, made by the preprocessor
     * from the source text of the arguments.
     */
    return 0;
}
