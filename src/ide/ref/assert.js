/* The C reference: <assert.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  assert: {
    text: 'assert(expression) checks something the programmer believes must be true at that point. If the expression is true (non-zero) nothing happens. If it is false, the program writes a message naming the expression, the source file and the line number to stderr, and then calls abort, which ends the program.\n\nIt is for catching bugs, not for handling errors that can really happen: a missing file or bad user input deserve a proper message, not an assert. Typical uses are checking a function\'s preconditions (assert(p != NULL)) and loop invariants.\n\nWhen NDEBUG is defined before <assert.h> is included, assert expands to nothing and its expression is not evaluated at all. So never put work with side effects inside it: assert(fclose(f) == 0) would stop closing the file in a release build.\n\nIn See a failed assertion stops the program on the assert line, so you can look at the variables that made it false.',
    example: `#include <stdio.h>
#include <assert.h>

static int average(const int *a, int n)
{
    int i, sum = 0;

    assert(a != NULL);
    assert(n > 0);
    for (i = 0; i < n; i++)
        sum += a[i];
    return sum / n;
}

int main(void)
{
    int marks[] = { 70, 85, 90 };

    printf("average %d\\n", average(marks, 3));
    return 0;
}
`,
    see: ['NDEBUG', 'abort', 'SIGABRT'],
  },
  NDEBUG: {
    header: 'assert.h',
    kind: 'macro',
    sig: '#define NDEBUG',
    text: 'NDEBUG is not defined by any header: you define it, either with #define NDEBUG before #include <assert.h> or with -DNDEBUG on the compiler\'s command line. When it is defined, every assert becomes ((void)0) and checks nothing.\n\n<assert.h> is unusual: it may be included several times, and each time it redefines assert according to whether NDEBUG is defined at that moment.',
    example: `#define NDEBUG
#include <stdio.h>
#include <assert.h>

int main(void)
{
    int calls = 0;

    assert(++calls > 100);
    printf("with NDEBUG the assert was skipped; calls = %d\\n", calls);
    return 0;
}
`,
    see: ['assert', 'abort'],
  },
});
