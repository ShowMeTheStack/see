/*
 * title: Giving types new names with typedef
 * level: 1
 * about: Uses typedef for a struct, a pointer, an array and a function pointer, and shows that the new names are only aliases.
 */
#include <stdio.h>

/* typedef does not create a new type; it gives an existing type a second
   name. Without it you must write "struct temperature" every time. */
typedef struct temperature {
    char place[12];
    double celsius;
} Temperature;

/* Names for simpler types make intent clear. */
typedef double Celsius;
typedef Temperature *TempPtr;
typedef int Week[7];                     /* Week is "array of 7 int" */
typedef double (*Convert)(Celsius);      /* pointer to a function */

double to_fahrenheit(Celsius c) { return c * 9.0 / 5.0 + 32.0; }
double to_kelvin(Celsius c) { return c + 273.15; }

void report(TempPtr t, Convert f, const char *unit)
{
    printf("%-10s %6.1f C = %7.2f %s\n", t->place, t->celsius, f(t->celsius), unit);
}

int main(void)
{
    Temperature readings[3] = {
        { "Oslo", -4.5 },
        { "Cairo", 31.0 },
        { "Quito", 14.2 }
    };
    /* The alias and the full name are the same type, so this is fine. */
    struct temperature *same = &readings[1];
    Week rain = { 0, 3, 12, 0, 0, 7, 1 };
    int i, total = 0;

    for (i = 0; i < 3; i++)
        report(&readings[i], to_fahrenheit, "F");
    report(same, to_kelvin, "K");

    for (i = 0; i < 7; i++)
        total += rain[i];
    printf("rain this week: %d mm over %d days\n", total, (int)(sizeof rain / sizeof rain[0]));
    printf("sizeof(Temperature) = %d, sizeof(TempPtr) = %d, sizeof(Week) = %d\n",
           (int)sizeof(Temperature), (int)sizeof(TempPtr), (int)sizeof(Week));
    return 0;
}
