/*
 * title: Escaping deep calls with longjmp
 * level: 4
 * about: Evaluates arithmetic in a chain of parsing functions and uses setjmp/longjmp to abandon every frame at once on an error.
 * input: 2+3*4\n(1+2)*(3+4)\n8/(3-3)\n7*(2+\n10-4-3\n
 */
#include <stdio.h>
#include <setjmp.h>
#include <ctype.h>

/* setjmp saves "where we are" in a jmp_buf. A later longjmp anywhere
   below jumps straight back to that setjmp, which then returns a
   second time with a non-zero value. Every frame in between is thrown
   away without returning: watch them vanish together in See. */
static jmp_buf on_error;
static const char *pos;          /* the next character to read */
static const char *problem;      /* why we bailed out */

static void fail(const char *why)
{
    problem = why;
    longjmp(on_error, 1);        /* never returns */
}

static long expr(void);

/* factor := number | '(' expr ')' */
static long factor(void)
{
    long v = 0;

    if (*pos == '(') {
        pos++;
        v = expr();
        if (*pos != ')')
            fail("missing )");
        pos++;
        return v;
    }
    if (!isdigit((unsigned char)*pos))
        fail("expected a number");
    while (isdigit((unsigned char)*pos))
        v = v * 10 + (*pos++ - '0');
    return v;
}

/* term := factor (('*' | '/') factor)* */
static long term(void)
{
    long v = factor(), d;

    while (*pos == '*' || *pos == '/') {
        char op = *pos++;

        d = factor();
        if (op == '*')
            v *= d;
        else if (d == 0)
            fail("division by zero");   /* raised from four frames down */
        else
            v /= d;
    }
    return v;
}

/* expr := term (('+' | '-') term)* */
static long expr(void)
{
    long v = term();

    while (*pos == '+' || *pos == '-') {
        char op = *pos++;
        long t = term();

        v = op == '+' ? v + t : v - t;
    }
    return v;
}

/* Returns 1 and stores the value, or 0 after an error. */
static int evaluate(const char *text, long *out)
{
    pos = text;
    if (setjmp(on_error) != 0)
        return 0;                 /* we arrive here from fail() */
    *out = expr();
    if (*pos != '\0')
        fail("unexpected character");
    return 1;
}

/* Reads one line without its newline; returns 0 at end of input. */
static int read_line(char *buf, int size)
{
    int c, n = 0;

    while ((c = getchar()) != EOF && c != '\n')
        if (n < size - 1)
            buf[n++] = (char)c;
    buf[n] = '\0';
    return c != EOF || n > 0;
}

int main(void)
{
    char line[80];
    long value;

    while (read_line(line, (int)sizeof line)) {
        if (evaluate(line, &value))
            printf("%-14s = %ld\n", line, value);
        else
            printf("%-14s : error, %s at column %d\n",
                   line, problem, (int)(pos - line) + 1);
    }
    return 0;
}
