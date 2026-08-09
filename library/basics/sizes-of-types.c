/*
 * title: How big is each type?
 * level: 1
 * about: Uses sizeof to print how many bytes each basic type and a few arrays take on See's 32-bit machine.
 */
#include <stdio.h>

int main(void)
{
    char c = 'x';
    short s = 1;
    int i = 2;
    long l = 3L;
    float f = 4.0f;
    double d = 5.0;
    int numbers[10];
    char word[] = "hello";

    /*
     * sizeof gives a size in bytes. It is worked out by the compiler, so
     * it costs nothing when the program runs. Its result has the unsigned
     * type size_t; casting it to unsigned long and printing with %lu is
     * the portable C89 way to print it.
     *
     * Open the stack panel in See: each variable below is drawn as a box
     * whose width matches the size printed here.
     */
    printf("char        %lu byte\n",  (unsigned long)sizeof c);
    printf("short       %lu bytes\n", (unsigned long)sizeof s);
    printf("int         %lu bytes\n", (unsigned long)sizeof i);
    printf("long        %lu bytes\n", (unsigned long)sizeof l);
    printf("float       %lu bytes\n", (unsigned long)sizeof f);
    printf("double      %lu bytes\n", (unsigned long)sizeof d);
    printf("long double %lu bytes\n", (unsigned long)sizeof(long double));
    printf("char *      %lu bytes (any pointer)\n", (unsigned long)sizeof(char *));

    /*
     * For an array, sizeof gives the size of the whole array. Dividing by
     * the size of one element gives the number of elements, a trick used
     * all over real C code.
     */
    numbers[0] = 0;
    printf("int[10]     %lu bytes, %lu elements\n",
           (unsigned long)sizeof numbers,
           (unsigned long)(sizeof numbers / sizeof numbers[0]));

    /* "hello" has five letters, but the array also holds the zero byte that
       marks the end of the string, so it is six bytes. */
    printf("\"%s\"     %lu bytes\n", word, (unsigned long)sizeof word);

    /* The variables are used so the compiler does not warn about them. */
    printf("values: %c %d %d %ld %.1f %.1f %d\n", c, s, i, l, f, d, numbers[0]);
    return 0;
}
