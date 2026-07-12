/* calc.c: a calculator driven by a table of function pointers.
   Each entry pairs an operator character with the function that does the work. */
#include <stdio.h>

double add(double a, double b) { return a + b; }
double sub(double a, double b) { return a - b; }
double mul(double a, double b) { return a * b; }
double divide(double a, double b) { return b != 0 ? a / b : 0; }

struct op {
    char symbol;
    double (*fn)(double, double);    /* a pointer to a function taking two doubles */
};

static const struct op ops[] = {
    { '+', add }, { '-', sub }, { '*', mul }, { '/', divide },
};

int main(void)
{
    double a, b;
    char c;
    unsigned i;

    printf("type a sum like 6 * 7\n");
    while (scanf("%lf %c %lf", &a, &c, &b) == 3) {
        for (i = 0; i < sizeof ops / sizeof ops[0]; i++)
            if (ops[i].symbol == c)
                printf("%g %c %g = %g\n", a, c, b, ops[i].fn(a, b));
    }
    return 0;
}
