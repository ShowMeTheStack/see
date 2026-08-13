/*
 * title: Functions with a variable number of arguments
 * level: 3
 * about: Writes an average of any count of ints and a tiny printf-like logger using stdarg.h.
 */
#include <stdio.h>
#include <stdarg.h>

/* The "..." means "more arguments may follow". The function must learn
   how many, and of what type, from somewhere: here the first argument
   says how many ints come after it. */
double average(int count, ...)
{
    va_list ap;
    int i;
    long total = 0;

    if (count <= 0)
        return 0.0;
    va_start(ap, count);          /* start just after the last named one */
    for (i = 0; i < count; i++)
        total += va_arg(ap, int); /* fetch the next one as an int */
    va_end(ap);
    return (double)total / count;
}

/* A list ended by a sentinel value instead of a count. */
int largest(int first, ...)
{
    va_list ap;
    int best = first, next;

    va_start(ap, first);
    while ((next = va_arg(ap, int)) != -1)
        if (next > best)
            best = next;
    va_end(ap);
    return best;
}

/* A mini printf that understands only %d, %s and %c. This is how
   printf itself learns the types: by reading the format string. */
void say(const char *fmt, ...)
{
    va_list ap;
    const char *p;

    va_start(ap, fmt);
    printf("[log] ");
    for (p = fmt; *p != '\0'; p++) {
        if (*p != '%') {
            putchar(*p);
            continue;
        }
        p++;
        if (*p == 'd')
            printf("%d", va_arg(ap, int));
        else if (*p == 's')
            printf("%s", va_arg(ap, char *));
        else if (*p == 'c')
            putchar(va_arg(ap, int));   /* a char argument arrives as an int */
        else
            putchar(*p);
    }
    va_end(ap);
    putchar('\n');
}

int main(void)
{
    /* In See, step into average and look at its frame: count is there,
       and the extra arguments sit just above it on the stack, in the
       caller's area. va_arg walks up through them. */
    printf("average(3, 10, 20, 40)   = %.3f\n", average(3, 10, 20, 40));
    printf("average(5, 1, 2, 3, 4, 5) = %.3f\n", average(5, 1, 2, 3, 4, 5));
    printf("largest(4, 9, 2, 7, -1)  = %d\n", largest(4, 9, 2, 7, -1));

    say("player %s scored %d points", "Ivy", 42);
    say("grade %c, attempts %d, done", 'A', 3);
    return 0;
}
