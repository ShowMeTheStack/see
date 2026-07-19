/* The C reference: <stdarg.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  va_list: {
    text: 'va_list is the type of the cursor that walks through the extra arguments of a function declared with ... such as int sum(int n, ...).\n\nOn this machine the arguments of a call sit one after another on the stack, in order, the first at the lowest address, each rounded up to a multiple of 4 bytes. An int takes 4 bytes, a double 8. So a va_list is simply a char pointer: va_start points it just past the last named argument, and each va_arg reads a value there and moves it on by that value\'s rounded size. Open the function\'s stack frame in See\'s memory picture and you can see the arguments lined up above it.\n\nNothing records how many extra arguments there are or what types they have. The function must find out some other way: a count passed first, a format string like printf\'s, or a sentinel value at the end.\n\nTo pass the list on to another function, such as vprintf, pass the va_list itself.',
    example: `#include <stdio.h>
#include <stdarg.h>

static int sum(int count, ...)
{
    va_list ap;
    int total = 0;

    va_start(ap, count);
    while (count-- > 0)
        total += va_arg(ap, int);
    va_end(ap);
    return total;
}

int main(void)
{
    printf("%d\\n", sum(4, 10, 20, 30, 40));
    return 0;
}
`,
    see: ['va_start', 'va_arg', 'va_end', 'vprintf', 'stack frame'],
  },
  va_start: {
    text: 'va_start(ap, last) gets ap ready to read the unnamed arguments. last must be the name of the last named parameter, the one just before the ... in the declaration.\n\nIt works by taking the address of last on the stack and stepping past it, which is why last must not be declared register and should not be a type that is promoted, such as char, short or float.\n\nEvery va_start must be matched by a va_end in the same function before it returns.',
    example: `#include <stdio.h>
#include <stdarg.h>

static void show(const char *label, ...)
{
    va_list ap;
    const char *s;

    va_start(ap, label);
    printf("%s:", label);
    while ((s = va_arg(ap, const char *)) != NULL)
        printf(" %s", s);
    va_end(ap);
    printf("\\n");
}

int main(void)
{
    show("fruit", "apple", "pear", "plum", (const char *)NULL);
    return 0;
}
`,
    see: ['va_arg', 'va_end', 'va_list'],
  },
  va_arg: {
    text: 'va_arg(ap, type) returns the next unnamed argument, taking it to have the given type, and moves ap past it.\n\nThe type must be the type the argument has after the default argument promotions, because that is what the caller actually put on the stack: char and short arrive as int, float arrives as double. va_arg(ap, char) or va_arg(ap, float) reads the wrong number of bytes.\n\nIf the type does not match what was passed, or you read past the last argument, the behaviour is undefined: you get whatever bytes happen to be on the stack. A classic bug is passing 5 where the function reads a double; pass 5.0.',
    example: `#include <stdio.h>
#include <stdarg.h>

static double average(int n, ...)
{
    va_list ap;
    double total = 0;
    int i;

    va_start(ap, n);
    for (i = 0; i < n; i++)
        total += va_arg(ap, double);
    va_end(ap);
    return total / n;
}

int main(void)
{
    float f = 2.5f;

    printf("%g\\n", average(3, 1.0, 2.0, (double)f));
    return 0;
}
`,
    see: ['va_start', 'va_list', 'integer promotion'],
  },
  va_end: {
    text: 'va_end(ap) finishes using ap. It must be called before the function that called va_start returns.\n\nOn this machine it does nothing, but on others va_start may set up something that va_end has to undo, so portable code always calls it. After va_end, ap may be started again with va_start to walk the arguments a second time.',
    example: `#include <stdio.h>
#include <stdarg.h>

static int largest(int n, ...)
{
    va_list ap;
    int i, best, v;

    va_start(ap, n);
    best = va_arg(ap, int);
    for (i = 1; i < n; i++) {
        v = va_arg(ap, int);
        if (v > best)
            best = v;
    }
    va_end(ap);
    return best;
}

int main(void)
{
    printf("largest: %d\\n", largest(5, 3, 9, -2, 7, 4));
    return 0;
}
`,
    see: ['va_start', 'va_arg'],
  },
});
