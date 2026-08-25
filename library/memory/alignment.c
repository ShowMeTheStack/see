/*
 * title: Alignment of every type
 * level: 3
 * about: Measures how each basic type must be aligned with a char-then-member struct trick, and checks that malloc and arrays respect it.
 */
#include <stdio.h>
#include <stddef.h>
#include <stdlib.h>

/*
 * If a struct starts with a char and then has a T, the compiler must push T
 * forward to the first offset where it is allowed to start. That offset is
 * T's alignment.
 */
struct a_short   { char c; short x; };
struct a_int     { char c; int x; };
struct a_long    { char c; long x; };
struct a_float   { char c; float x; };
struct a_double  { char c; double x; };
struct a_pointer { char c; void *x; };

static void show(const char *name, unsigned size, unsigned align)
{
    printf("%-8s size %u  align %u\n", name, size, align);
}

int main(void)
{
    double values[3];
    char bytes[3];
    double *block;
    int i;

    show("short",   sizeof(short),  (unsigned)offsetof(struct a_short, x));
    show("int",     sizeof(int),    (unsigned)offsetof(struct a_int, x));
    show("long",    sizeof(long),   (unsigned)offsetof(struct a_long, x));
    show("float",   sizeof(float),  (unsigned)offsetof(struct a_float, x));
    show("double",  sizeof(double), (unsigned)offsetof(struct a_double, x));
    show("void *",  sizeof(void *), (unsigned)offsetof(struct a_pointer, x));

    /* Every element of a double array is 8 bytes past the last: all aligned. */
    for (i = 0; i < 3; i++) {
        values[i] = i;
        bytes[i] = (char)i;
    }
    for (i = 0; i < 3; i++)
        printf("&values[%d] = %p  (remainder mod 8: %lu)   &bytes[%d] = %p\n",
               i, (void *)&values[i], (unsigned long)&values[i] % 8,
               i, (void *)&bytes[i]);

    /*
     * malloc does not know what you will store, so it returns memory aligned
     * well enough for anything.
     */
    block = malloc(2 * sizeof *block);
    if (block == NULL)
        return 0;
    printf("malloc gave %p  (remainder mod 8: %lu)\n",
           (void *)block, (unsigned long)block % 8);
    free(block);
    return 0;
}
