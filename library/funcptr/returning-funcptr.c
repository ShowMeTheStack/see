/*
 * title: A function that returns a function
 * level: 3
 * about: Picks a conversion function from a unit name and returns a pointer to it, written first without a typedef and then with one.
 * input: c2f 100\nf2c 98.6\nkm2mi 42.195\nmi2km 26.2\nc2k -40\nfoo 1
 */
#include <stdio.h>
#include <string.h>

double c2f(double c)   { return c * 9.0 / 5.0 + 32.0; }
double f2c(double f)   { return (f - 32.0) * 5.0 / 9.0; }
double km2mi(double k) { return k / 1.609344; }
double mi2km(double m) { return m * 1.609344; }

/*
 * The famous unreadable form. Read it from the name outwards:
 *   pick_raw                          pick_raw is
 *   pick_raw(const char *name)        a function taking a name
 *   (*pick_raw(const char *name))     returning a pointer
 *   double (* ...)(double)            to a function taking a double
 *                                     and returning a double.
 * It works, but nobody enjoys reading it.
 */
double (*pick_raw(const char *name))(double)
{
    if (strcmp(name, "c2f") == 0) return c2f;
    if (strcmp(name, "f2c") == 0) return f2c;
    return NULL;
}

/* The same idea with a typedef: the return type now reads plainly. */
typedef double (*converter)(double);

struct unit {
    const char *name;
    converter fn;
};

const struct unit units[] = {
    { "c2f", c2f }, { "f2c", f2c }, { "km2mi", km2mi }, { "mi2km", mi2km }
};

converter pick(const char *name)
{
    int i;
    for (i = 0; i < (int)(sizeof units / sizeof units[0]); i++)
        if (strcmp(units[i].name, name) == 0)
            return units[i].fn;
    return NULL;            /* a null function pointer means "not found" */
}

int main(void)
{
    char name[16];
    double x;
    converter conv;

    /* Call the returned pointer straight away: pick_raw("c2f")(37.0). */
    printf("body temperature 37 C is %.1f F (via pick_raw)\n", pick_raw("c2f")(37.0));

    while (scanf("%15s %lf", name, &x) == 2) {
        conv = pick(name);
        if (conv == NULL) {
            printf("%s: unknown conversion\n", name);
            continue;
        }
        printf("%s(%g) = %.3f\n", name, x, conv(x));
    }
    return 0;
}
