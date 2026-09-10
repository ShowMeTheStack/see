/*
 * title: A calculator that recovers from errors with longjmp
 * level: 4
 * about: Evaluates arithmetic expressions with a recursive descent parser, and on a syntax error or division by zero jumps straight out of the recursion to report it and read the next line.
 * input: 2 + 3 * 4\n(2 + 3) * 4\n10 / (5 - 5)\n7 * (1 + 2\n-(8 - 3) * -2\n2 ^ 3\n((((1))))+1\n100 / 7 % 4\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <setjmp.h>

/*
 * The grammar, one function per line:
 *   expr   = term { ('+' | '-') term }
 *   term   = factor { ('*' | '/' | '%') factor }
 *   factor = number | '(' expr ')' | '-' factor
 * An error can happen several calls deep. Instead of passing an error
 * code back up through every function, fail() longjmps to the point
 * in main that is ready to handle it.
 */
static jmp_buf recover;
static const char *pos;          /* the parser's place in the line */
static const char *error_msg;
static int depth, max_depth;     /* how deep the recursion went */

static void fail(const char *msg)
{
    error_msg = msg;
    longjmp(recover, 1);
}

static void skip_spaces(void)
{
    while (*pos == ' ')
        pos++;
}

static long expr(void);

static long factor(void)
{
    long v;
    char *end;

    if (++depth > max_depth)
        max_depth = depth;
    skip_spaces();
    if (*pos == '(') {
        pos++;
        v = expr();
        skip_spaces();
        if (*pos != ')')
            fail("missing )");
        pos++;
    } else if (*pos == '-') {
        pos++;
        v = -factor();
    } else if (isdigit((unsigned char)*pos)) {
        v = strtol(pos, &end, 10);
        pos = end;
    } else {
        fail("expected a number or (");
        v = 0;   /* not reached; keeps the compiler content */
    }
    depth--;
    return v;
}

static long term(void)
{
    long v = factor(), r;
    char op;
    for (;;) {
        skip_spaces();
        op = *pos;
        if (op != '*' && op != '/' && op != '%')
            return v;
        pos++;
        r = factor();
        if (op != '*' && r == 0)
            fail("division by zero");
        if (op == '*')
            v *= r;
        else if (op == '/')
            v /= r;
        else
            v %= r;
    }
}

static long expr(void)
{
    long v = term();
    char op;
    for (;;) {
        skip_spaces();
        op = *pos;
        if (op != '+' && op != '-')
            return v;
        pos++;
        if (op == '+')
            v += term();
        else
            v -= term();
    }
}

int main(void)
{
    char line[80];
    long result;
    int i;

    while (fgets(line, sizeof line, stdin) != NULL) {
        for (i = 0; line[i] != '\0' && line[i] != '\n'; i++)
            ;
        line[i] = '\0';
        pos = line;
        depth = max_depth = 0;

        /*
         * setjmp returns 0 now, so we parse. If fail() is called, we
         * land here again with 1, however deep the parser was.
         */
        if (setjmp(recover) == 0) {
            result = expr();
            skip_spaces();
            if (*pos != '\0')
                fail("unexpected character");
            printf("%-16s = %ld   (nesting depth %d)\n", line, result, max_depth);
        } else {
            printf("%-16s error at column %d: %s\n", line, (int)(pos - line) + 1, error_msg);
        }
    }

    /*
     * Put a breakpoint in fail() in See and look at the call stack for
     * the line "7 * (1 + 2": main, expr, term, factor, expr, term,
     * factor, fail. One longjmp unwinds all of them.
     */
    return 0;
}
