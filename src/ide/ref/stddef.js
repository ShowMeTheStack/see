/* The C reference: <stddef.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  ptrdiff_t: {
    header: 'stddef.h',
    text: 'ptrdiff_t is the signed integer type of the result of subtracting two pointers. Here it is int.\n\nSubtracting pointers counts elements, not bytes: if p points at a[7] and q at a[2], p - q is 5 whatever the element type. Both pointers must point into the same array (or one past its end); subtracting unrelated pointers is undefined behaviour.\n\nC89 has no printf conversion for ptrdiff_t; convert it to long and use %ld.',
    example: `#include <stdio.h>
#include <stddef.h>
#include <string.h>

int main(void)
{
    const char *s = "key=value";
    const char *eq = strchr(s, '=');
    ptrdiff_t pos = eq - s;

    printf("'=' is at index %ld\\n", (long)pos);
    return 0;
}
`,
    see: ['size_t', 'pointer', '-'],
  },
  size_t: {
    header: 'stddef.h',
    text: 'size_t is the unsigned integer type that sizeof gives, and that the library uses for sizes and counts: strlen returns one, malloc and memcpy take one. Here it is unsigned int, 4 bytes. It is defined in <stddef.h>, <stdio.h>, <stdlib.h>, <string.h> and <time.h>.\n\nBecause it is unsigned it can never be negative, which leads to two classic traps. A loop counting down, for (i = n - 1; i >= 0; i--), never ends since i >= 0 is always true. And strlen(a) - strlen(b) is a huge positive number when b is longer, never a negative one.\n\nC89 has no printf conversion for size_t (%zu came in C99); cast to unsigned long and use %lu.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *word = "hello";
    size_t i, n = strlen(word);

    for (i = n; i > 0; i--)
        putchar(word[i - 1]);
    printf("\\n%lu characters, sizeof(size_t) = %lu\\n", (unsigned long)n, (unsigned long)sizeof(size_t));
    return 0;
}
`,
    see: ['sizeof operator', 'strlen', 'malloc', 'ptrdiff_t'],
  },
  wchar_t: {
    header: 'stddef.h',
    text: 'wchar_t is an integer type wide enough to hold any character of the largest character set the implementation supports. Here it is long. A wide character constant is written L\'x\' and a wide string L"text".\n\nC89 has very little to do with wide characters: mbtowc, wctomb, mbstowcs and wcstombs in <stdlib.h> convert between multibyte strings and wide ones. In See\'s "C" locale every character is a single byte, so those conversions just copy. See accepts wide character constants such as L\'x\' but not wide string literals; build wide strings with mbstowcs.',
    example: `#include <stdio.h>
#include <stdlib.h>
#include <stddef.h>

int main(void)
{
    wchar_t w[8];
    wchar_t x = L'x';
    size_t i, n;

    n = mbstowcs(w, "wide", 8);
    for (i = 0; i < n; i++)
        printf("%ld ", (long)w[i]);
    printf("\\nL'x' is %ld; a wchar_t has %d bytes\\n", (long)x, (int)sizeof(wchar_t));
    return 0;
}
`,
    see: ['mbtowc', 'mbstowcs', 'MB_LEN_MAX'],
  },
  NULL: {
    header: 'stddef.h',
    text: 'NULL is the null pointer constant: a pointer value that points at nothing. Here it is ((void *)0). It is defined in <stddef.h>, <stdio.h>, <stdlib.h>, <string.h>, <time.h> and <locale.h>.\n\nFunctions return NULL to say "no result" or "failed": fopen when a file cannot be opened, malloc when memory runs out, strchr when the character is absent. Always test for it before using the pointer. Dereferencing NULL is undefined behaviour; in See it stops the program with a segmentation fault at the offending line.\n\nNULL is for pointers only. Do not use it for the NUL character \'\\0\' that ends a string, even though both are zero. When passing NULL to a function with variable arguments, such as a terminator for a va_arg loop, cast it to the pointer type expected.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *s = "hello";
    const char *p = strchr(s, 'z');

    if (p == NULL)
        printf("no 'z' in \\"%s\\"\\n", s);
    p = strchr(s, 'l');
    if (p != NULL)
        printf("first 'l' at index %d\\n", (int)(p - s));
    return 0;
}
`,
    see: ['pointer', 'NUL terminator', 'malloc', 'fopen', 'SIGSEGV'],
  },
  offsetof: {
    header: 'stddef.h',
    text: 'offsetof(type, member) gives the offset in bytes of member from the start of the structure type, as a size_t.\n\nThe compiler may put padding between members so that each one is properly aligned, so the offset is not simply the sum of the sizes of the earlier members. In See\'s memory picture you can see the gaps: in struct { char c; double d; } the double starts at offset 8, not 1.\n\nThe member must not be a bit-field. The definition used here, ((size_t)&((type *)0)->member), pretends there is a structure at address 0; that trick is only allowed inside the implementation, so use the macro rather than writing it out.',
    example: `#include <stdio.h>
#include <stddef.h>

struct record {
    char tag;
    double value;
    int count;
};

int main(void)
{
    printf("tag at %lu, value at %lu, count at %lu, size %lu\\n",
           (unsigned long)offsetof(struct record, tag),
           (unsigned long)offsetof(struct record, value),
           (unsigned long)offsetof(struct record, count),
           (unsigned long)sizeof(struct record));
    return 0;
}
`,
    see: ['alignment and padding', 'sizeof operator', 'struct'],
  },
});
