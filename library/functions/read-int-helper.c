/*
 * title: A read_int helper that will not take no for an answer
 * level: 2
 * about: Wraps scanf in a helper that rejects words and out-of-range numbers and asks again, then uses it to fill in an order form.
 * input: three\n3\n0\n250\n2\n
 */
#include <stdio.h>

/* Reading input safely is fiddly, so it belongs in one function that
   every question can reuse. It returns 1 with *out set, or 0 when the
   input has run out. */
int read_int(const char *prompt, int lo, int hi, int *out)
{
    int value, got, c;

    for (;;) {
        printf("%s (%d-%d): ", prompt, lo, hi);
        got = scanf("%d", &value);
        if (got == EOF) {
            printf("\n");
            return 0;
        }
        if (got == 0) {
            /* Not a number: throw away the rest of the line, then ask
               again. Without this, scanf would fail on the same word
               forever. */
            printf("that is not a number\n");
            while ((c = getchar()) != '\n' && c != EOF)
                ;
            continue;
        }
        printf("%d\n", value);   /* echo, since stdin is not on screen */
        if (value < lo || value > hi) {
            printf("please give a number from %d to %d\n", lo, hi);
            continue;
        }
        *out = value;
        return 1;
    }
}

int main(void)
{
    int pizzas, drinks, table;

    /* Each question is one call. In See, step over read_int and watch
       the variable in main's frame receive its value only when a good
       answer has arrived. */
    if (!read_int("how many pizzas", 1, 20, &pizzas))
        return 0;
    if (!read_int("how many drinks", 0, 40, &drinks))
        return 0;
    if (!read_int("table number", 1, 30, &table))
        return 0;

    printf("order: %d pizza%s and %d drink%s for table %d, total %d.%02d\n",
           pizzas, pizzas == 1 ? "" : "s", drinks, drinks == 1 ? "" : "s", table,
           (pizzas * 1150 + drinks * 275) / 100, (pizzas * 1150 + drinks * 275) % 100);
    return 0;
}
