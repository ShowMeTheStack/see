/*
 * title: Calculator with a dispatch table
 * level: 2
 * about: Reads lines like "12 * 4" and finds the operation in a table indexed by the operator character, with no switch statement.
 * input: 12 * 4\n7 - 10\n100 / 7\n100 % 7\n2 ^ 10\n9 / 0\n5 ? 3
 */
#include <stdio.h>

typedef long (*binop)(long, long);

long add(long a, long b) { return a + b; }
long sub(long a, long b) { return a - b; }
long mul(long a, long b) { return a * b; }
long dvd(long a, long b) { return a / b; }
long mod(long a, long b) { return a % b; }
long pw(long a, long b)
{
    long r = 1;
    while (b-- > 0)
        r *= a;
    return r;
}

/*
 * One slot for every possible char value (0..127 is enough for the
 * operators we care about). Most slots are null pointers; a non-null
 * slot means "this character is an operator, and here is its code".
 * The table lives in the globals: in See it is 128 pointers, almost
 * all zero, with six arrows into the code.
 */
binop table[128];

int main(void)
{
    long a, b;
    char op;

    table['+'] = add;
    table['-'] = sub;
    table['*'] = mul;
    table['/'] = dvd;
    table['%'] = mod;
    table['^'] = pw;

    /* The space before %c skips blanks so op gets the operator itself. */
    while (scanf("%ld %c %ld", &a, &op, &b) == 3) {
        if (op < 0 || table[(int)op] == NULL) {
            printf("%ld %c %ld: unknown operator\n", a, op, b);
            continue;
        }
        if ((op == '/' || op == '%') && b == 0) {
            printf("%ld %c %ld: cannot divide by zero\n", a, op, b);
            continue;
        }
        /* The whole "switch" is this one indexed call. */
        printf("%ld %c %ld = %ld\n", a, op, b, table[(int)op](a, b));
    }
    return 0;
}
