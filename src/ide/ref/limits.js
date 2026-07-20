/* The C reference: <limits.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  CHAR_BIT: {
    text: 'CHAR_BIT is the number of bits in a byte, that is in a char: 8 here and on nearly every machine today. The standard only promises at least 8.\n\nsizeof measures in chars, so sizeof(x) * CHAR_BIT is the number of bits in x: 32 for an int on this machine.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    printf("a char has %d bits, an int %d, a long %d\\n", CHAR_BIT, (int)(sizeof(int) * CHAR_BIT), (int)(sizeof(long) * CHAR_BIT));
    return 0;
}
`,
    see: ['sizeof operator', 'UCHAR_MAX'],
  },
  SCHAR_MIN: {
    text: 'SCHAR_MIN is the smallest value a signed char can hold: -128 here, with 8-bit two\'s complement bytes. The standard only guarantees -127.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    signed char c = SCHAR_MIN;

    printf("signed char runs from %d to %d\\n", c, SCHAR_MAX);
    return 0;
}
`,
    see: ['SCHAR_MAX', 'CHAR_MIN', "two's complement"],
  },
  SCHAR_MAX: {
    text: 'SCHAR_MAX is the largest value a signed char can hold: 127.\n\nStoring a larger value into a signed char, as in signed char c = 200;, gives an implementation-defined result; here the value wraps to 200 - 256 = -56.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    signed char c = SCHAR_MAX;

    printf("SCHAR_MAX = %d\\n", c);
    return 0;
}
`,
    see: ['SCHAR_MIN', 'CHAR_MAX', 'UCHAR_MAX'],
  },
  UCHAR_MAX: {
    text: 'UCHAR_MAX is the largest value an unsigned char can hold: 255. An unsigned char runs from 0 to 255 and holds any byte value.\n\nThat range, plus EOF, is exactly what the <ctype.h> functions accept, which is why you cast a char to unsigned char before calling them, and why getchar returns an int: it must be able to return all 256 byte values and also EOF.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    unsigned char b = UCHAR_MAX;

    b++;
    printf("UCHAR_MAX = %d; one more wraps to %d\\n", UCHAR_MAX, b);
    return 0;
}
`,
    see: ['CHAR_BIT', 'getchar', 'EOF'],
  },
  CHAR_MIN: {
    text: 'CHAR_MIN is the smallest value a plain char can hold. Whether plain char is signed or unsigned is up to the implementation; here it is signed, so CHAR_MIN equals SCHAR_MIN, -128. On a machine where char is unsigned it is 0.\n\nThis is why a byte above 127 read into a char becomes negative here, and why comparing a char with 255 is never true.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    printf("plain char is %s here: %d to %d\\n", CHAR_MIN < 0 ? "signed" : "unsigned", CHAR_MIN, CHAR_MAX);
    return 0;
}
`,
    see: ['CHAR_MAX', 'SCHAR_MIN', 'char'],
  },
  CHAR_MAX: {
    text: 'CHAR_MAX is the largest value a plain char can hold: 127 here, because plain char is signed. Where char is unsigned it equals UCHAR_MAX, 255.\n\nlocaleconv uses CHAR_MAX in its char fields to mean "this information is not available".',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    char c = CHAR_MAX;

    printf("CHAR_MAX = %d\\n", c);
    return 0;
}
`,
    see: ['CHAR_MIN', 'UCHAR_MAX', 'lconv'],
  },
  MB_LEN_MAX: {
    text: 'MB_LEN_MAX is the largest number of bytes any multibyte character can take, in any locale the implementation supports. Here it is 1, because See only has the "C" locale, where every character is one byte.\n\nIt is a constant, usable for array sizes; MB_CUR_MAX in <stdlib.h> is the limit for the current locale.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    char buf[MB_LEN_MAX + 1];

    printf("a multibyte character needs at most %d byte(s); buf has %d\\n", MB_LEN_MAX, (int)sizeof buf);
    return 0;
}
`,
    see: ['MB_CUR_MAX', 'mblen', 'wchar_t'],
  },
  SHRT_MIN: {
    text: 'SHRT_MIN is the smallest value a short int can hold: -32768 here, where a short is 16 bits.\n\nA short is promoted to int before any arithmetic, so short arithmetic itself cannot overflow here; storing the result back into a short is where values outside the range go wrong.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    short s = SHRT_MIN;

    printf("short: %d to %d, %d bytes\\n", s, SHRT_MAX, (int)sizeof s);
    return 0;
}
`,
    see: ['SHRT_MAX', 'USHRT_MAX', 'integer promotion'],
  },
  SHRT_MAX: {
    text: 'SHRT_MAX is the largest value a short int can hold: 32767. The standard guarantees at least that much, so a short is at least 16 bits everywhere.\n\nConverting a larger int to short, as in short s = 40000;, gives an implementation-defined result; here it wraps to 40000 - 65536 = -25536.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    printf("SHRT_MAX = %d\\n", SHRT_MAX);
    return 0;
}
`,
    see: ['SHRT_MIN', 'USHRT_MAX', 'INT_MAX'],
  },
  USHRT_MAX: {
    text: 'USHRT_MAX is the largest value an unsigned short can hold: 65535. Unsigned types never overflow: arithmetic wraps around modulo USHRT_MAX + 1.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    unsigned short u = USHRT_MAX;

    u = (unsigned short)(u + 1);
    printf("USHRT_MAX = %u; plus one wraps to %u\\n", (unsigned)USHRT_MAX, (unsigned)u);
    return 0;
}
`,
    see: ['SHRT_MAX', 'UINT_MAX'],
  },
  INT_MIN: {
    text: 'INT_MIN is the smallest value an int can hold: -2147483648 on this 32-bit machine.\n\nIt is written (-2147483647 - 1) in the header because 2147483648 on its own does not fit in an int, so -2147483648 would be the negation of a larger type. There is no positive int equal to -INT_MIN: -INT_MIN, abs(INT_MIN) and INT_MIN / -1 all overflow, which is undefined behaviour.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    int x = INT_MIN;

    printf("INT_MIN = %d\\n", x);
    printf("INT_MIN + 1 = %d (its negation is INT_MAX)\\n", x + 1);
    return 0;
}
`,
    see: ['INT_MAX', "two's complement", 'abs'],
  },
  INT_MAX: {
    text: 'INT_MAX is the largest value an int can hold: 2147483647 here, about 2.1 billion. The standard only promises 32767, so code meant to be portable to 16-bit machines uses long for larger numbers.\n\nSigned overflow is undefined behaviour: INT_MAX + 1 is not guaranteed to be anything. To check before adding, test a > INT_MAX - b (for positive b) rather than a + b > INT_MAX, which has already overflowed.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    int a = 2000000000, b = 500000000;

    if (b > 0 && a > INT_MAX - b)
        printf("%d + %d would overflow an int (INT_MAX is %d)\\n", a, b, INT_MAX);
    else
        printf("%d\\n", a + b);
    return 0;
}
`,
    see: ['INT_MIN', 'UINT_MAX', 'LONG_MAX', 'undefined behaviour'],
  },
  UINT_MAX: {
    text: 'UINT_MAX is the largest value an unsigned int can hold: 4294967295 here, 2 to the 32nd minus 1.\n\nUnsigned arithmetic wraps: UINT_MAX + 1 is 0, and 0 - 1 is UINT_MAX. That is well defined, unlike signed overflow. Converting -1 to unsigned gives UINT_MAX.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    unsigned int u = 0;

    u = u - 1;
    printf("0u - 1 = %u, UINT_MAX = %u\\n", u, UINT_MAX);
    return 0;
}
`,
    see: ['INT_MAX', 'ULONG_MAX', 'size_t'],
  },
  LONG_MIN: {
    text: 'LONG_MIN is the smallest value a long int can hold. On this 32-bit machine a long is the same size as an int, so LONG_MIN is -2147483648, the same as INT_MIN. The standard guarantees at least -2147483647.\n\nstrtol returns LONG_MIN, with errno set to ERANGE, when a negative number is too large to fit.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    printf("long: %ld to %ld, %d bytes\\n", LONG_MIN, LONG_MAX, (int)sizeof(long));
    return 0;
}
`,
    see: ['LONG_MAX', 'strtol', 'INT_MIN'],
  },
  LONG_MAX: {
    text: 'LONG_MAX is the largest value a long int can hold: 2147483647 here. long is the widest integer type in C89; the guarantee is at least 32 bits.\n\nstrtol returns LONG_MAX, with errno set to ERANGE, when the number in the string is too big.',
    example: `#include <stdio.h>
#include <stdlib.h>
#include <limits.h>
#include <errno.h>

int main(void)
{
    long v;

    errno = 0;
    v = strtol("3000000000", NULL, 10);
    printf("%ld%s\\n", v, (v == LONG_MAX && errno == ERANGE) ? " (clamped to LONG_MAX)" : "");
    return 0;
}
`,
    see: ['LONG_MIN', 'ULONG_MAX', 'strtol', 'ERANGE'],
  },
  ULONG_MAX: {
    text: 'ULONG_MAX is the largest value an unsigned long can hold: 4294967295 here. It is the largest integer type in C89, so it is what you cast a size_t to for printing with %lu.\n\nstrtoul returns ULONG_MAX with errno set to ERANGE when the number does not fit.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    unsigned long u = ULONG_MAX;

    printf("ULONG_MAX = %lu = 0x%lX\\n", u, u);
    return 0;
}
`,
    see: ['LONG_MAX', 'UINT_MAX', 'strtoul'],
  },
});
