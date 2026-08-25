/*
 * title: Functions have addresses too
 * level: 3
 * about: Builds a small calculator from a table of function pointers and prints where each function's code lives, low in memory next to the other code.
 */
#include <stdio.h>

static long add(long a, long b) { return a + b; }
static long sub(long a, long b) { return a - b; }
static long mul(long a, long b) { return a * b; }
static long pow_(long a, long b)
{
    long r = 1;
    while (b-- > 0)
        r *= a;
    return r;
}

struct op {
    char symbol;
    long (*fn)(long, long);   /* a pointer to a function taking two longs */
};

/*
 * The table itself is data (in the globals); each fn member is an arrow from
 * the data into the code segment.
 */
static const struct op ops[] = {
    { '+', add }, { '-', sub }, { '*', mul }, { '^', pow_ }
};

static const struct op *find(char symbol)
{
    unsigned int i;
    for (i = 0; i < sizeof ops / sizeof ops[0]; i++)
        if (ops[i].symbol == symbol)
            return &ops[i];
    return NULL;
}

int main(void)
{
    const char *program = "+*-^";
    long acc = 3;
    const struct op *o;
    unsigned int i;
    int local = 0;

    for (i = 0; i < sizeof ops / sizeof ops[0]; i++)
        printf("'%c' code at %p\n", ops[i].symbol, (void *)ops[i].fn);
    printf("main code at %p, the table at %p, a local at %p\n\n",
           (void *)main, (void *)ops, (void *)&local);

    /* Apply each operation to acc with 2 as the second operand. */
    for (i = 0; program[i] != '\0'; i++) {
        o = find(program[i]);
        if (o == NULL)
            continue;
        printf("%ld %c 2 = ", acc, o->symbol);
        /* Calling through the pointer: step in with F11 and you land in that function. */
        acc = o->fn(acc, 2);
        printf("%ld\n", acc);
    }
    return 0;
}
