/*
 * title: Elements side by side
 * level: 1
 * about: Prints the address of each element of a char, a short, an int and a double array to show that elements sit next to each other, sizeof apart.
 */
#include <stdio.h>

int main(void)
{
    char   c[4];
    short  s[4];
    int    n[4];
    double d[4];
    int i;

    for (i = 0; i < 4; i++) {
        c[i] = (char)('a' + i);
        s[i] = (short)(i * 10);
        n[i] = i * 100;
        d[i] = i * 0.5;
    }

    /*
     * Arrays are one solid run of memory with no gaps. The address of
     * element i is the start of the array plus i times the element size.
     * Look at the stack panel: four little boxes, then four twice as wide,
     * and so on.
     */
    printf("i  &c[i]       &s[i]       &n[i]       &d[i]\n");
    for (i = 0; i < 4; i++)
        printf("%d  %p  %p  %p  %p\n", i,
               (void *)&c[i], (void *)&s[i], (void *)&n[i], (void *)&d[i]);

    printf("\nsteps: char %u, short %u, int %u, double %u bytes\n",
           (unsigned)((char *)&c[1] - (char *)&c[0]),
           (unsigned)((char *)&s[1] - (char *)&s[0]),
           (unsigned)((char *)&n[1] - (char *)&n[0]),
           (unsigned)((char *)&d[1] - (char *)&d[0]));

    /* Pointer arithmetic counts in elements, not bytes: n + 3 is &n[3]. */
    printf("n + 3 == &n[3]: %s, and *(n + 3) = %d\n", n + 3 == &n[3] ? "yes" : "no", *(n + 3));
    printf("last values: %c %d %d %.1f\n", c[3], s[3], n[3], d[3]);
    return 0;
}
