/* The C reference: <ctype.h> */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  isalnum: {
    text: 'isalnum(c) is true (non-zero) when c is a letter or a decimal digit: A to Z, a to z or 0 to 9 in the "C" locale. It returns 0 otherwise.\n\nThe argument is an int that must be either EOF or a value representable as unsigned char. A plain char holding a byte above 127 is negative on this machine (plain char is signed), so passing it straight in is undefined behaviour; cast it first: isalnum((unsigned char)s[i]).\n\nThe result is only "zero or non-zero". Do not compare it with 1.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "R2-D2, ok?";
    int i, n = 0;

    for (i = 0; s[i] != '\\0'; i++)
        if (isalnum((unsigned char)s[i]))
            n++;
    printf("%d of the characters in \\"%s\\" are letters or digits\\n", n, s);
    return 0;
}
`,
    see: ['isalpha', 'isdigit', 'ispunct', 'isspace'],
  },
  isalpha: {
    text: 'isalpha(c) is true when c is a letter, upper or lower case. In the "C" locale that is exactly A to Z and a to z.\n\nLike every <ctype.h> test it takes an int that must be EOF or an unsigned char value, so cast a char before passing it: isalpha((unsigned char)ch). It returns non-zero for yes and 0 for no; the non-zero value is not necessarily 1.\n\nA common use is reading a word: skip characters while !isalpha, then collect while isalpha.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "3 apples and 12 pears";
    int i, words = 0, inword = 0;

    for (i = 0; s[i] != '\\0'; i++) {
        if (isalpha((unsigned char)s[i])) {
            if (!inword)
                words++;
            inword = 1;
        } else {
            inword = 0;
        }
    }
    printf("%d words made of letters\\n", words);
    return 0;
}
`,
    see: ['isalnum', 'isupper', 'islower', 'toupper'],
  },
  iscntrl: {
    text: 'iscntrl(c) is true for the control characters: codes 0 to 31 and 127 (DEL) in ASCII. These include newline, tab, carriage return and the NUL character.\n\nControl characters do not print as visible marks, so iscntrl is handy when dumping data: show them as an escape or a code instead. Every character is exactly one of: control, printing (isprint), or neither (bytes above 127 in the "C" locale).\n\nCast a char to unsigned char before passing it in.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "tab\\there\\n";
    int i;

    for (i = 0; s[i] != '\\0'; i++) {
        if (iscntrl((unsigned char)s[i]))
            printf("[%d]", s[i]);
        else
            putchar(s[i]);
    }
    putchar('\\n');
    return 0;
}
`,
    see: ['isprint', 'isspace', 'isgraph'],
  },
  isdigit: {
    text: 'isdigit(c) is true when c is one of the decimal digits 0 to 9. It is the only <ctype.h> test whose answer does not depend on the locale.\n\nThe digits are consecutive in every C character set, so once isdigit(c) is true, c - \'0\' is the digit\'s value. That is how atoi and strtol build a number.\n\nPass an int that is EOF or an unsigned char value; cast plain chars. For hexadecimal digits use isxdigit.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "Order 4071 shipped";
    int i, value = 0;

    for (i = 0; s[i] != '\\0'; i++)
        if (isdigit((unsigned char)s[i]))
            value = value * 10 + (s[i] - '0');
    printf("number found: %d\\n", value);
    return 0;
}
`,
    see: ['isxdigit', 'isalnum', 'atoi', 'strtol'],
  },
  isgraph: {
    text: 'isgraph(c) is true for printing characters other than space: every character that leaves a visible mark. In ASCII that is codes 33 to 126.\n\nIt is isprint without the space. Use it to find where the visible text in a line starts or ends.\n\nCast plain chars to unsigned char before passing them in.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "  hi there  ";
    int i, n = 0;

    for (i = 0; s[i] != '\\0'; i++)
        if (isgraph((unsigned char)s[i]))
            n++;
    printf("%d visible characters\\n", n);
    return 0;
}
`,
    see: ['isprint', 'isspace', 'ispunct'],
  },
  islower: {
    text: 'islower(c) is true when c is a lower-case letter, a to z in the "C" locale.\n\nIt says nothing about digits or punctuation: islower(\'5\') is 0, and so is isupper(\'5\'). Use toupper to convert; it already leaves characters that are not lower-case letters alone, so you need not test first.\n\nCast plain chars to unsigned char before passing them in.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "Hello World";
    int i, lower = 0, upper = 0;

    for (i = 0; s[i] != '\\0'; i++) {
        if (islower((unsigned char)s[i]))
            lower++;
        else if (isupper((unsigned char)s[i]))
            upper++;
    }
    printf("%d lower, %d upper\\n", lower, upper);
    return 0;
}
`,
    see: ['isupper', 'tolower', 'toupper', 'isalpha'],
  },
  isprint: {
    text: 'isprint(c) is true for printing characters, including the space: codes 32 to 126 in ASCII.\n\nThe opposite of a printing character, for ASCII, is a control character (iscntrl). A hex dump typically prints the byte itself when isprint is true and a dot otherwise.\n\nCast plain chars to unsigned char before passing them in; bytes above 127 are not printing characters in the "C" locale.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char data[] = "A\\001b\\tC";
    int i;

    for (i = 0; i < (int)sizeof data - 1; i++)
        putchar(isprint((unsigned char)data[i]) ? data[i] : '.');
    putchar('\\n');
    return 0;
}
`,
    see: ['isgraph', 'iscntrl'],
  },
  ispunct: {
    text: 'ispunct(c) is true for printing characters that are neither a space nor a letter or digit: ! " # , . ; and so on.\n\nIn other words ispunct(c) is isgraph(c) && !isalnum(c).\n\nCast plain chars to unsigned char before passing them in.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "Wait... what?!";
    int i, n = 0;

    for (i = 0; s[i] != '\\0'; i++)
        if (ispunct((unsigned char)s[i]))
            n++;
    printf("%d punctuation marks\\n", n);
    return 0;
}
`,
    see: ['isalnum', 'isgraph', 'isspace'],
  },
  isspace: {
    text: 'isspace(c) is true for the white-space characters: space, tab \\t, newline \\n, vertical tab \\v, form feed \\f and carriage return \\r.\n\nIt is the test scanf uses for a space in its format, and the one to use when trimming a line or splitting it into words. The newline counts as white space, which is why a %d conversion happily skips over line ends.\n\nCast plain chars to unsigned char before passing them in.',
    example: `#include <stdio.h>
#include <string.h>
#include <ctype.h>

int main(void)
{
    char line[32];
    size_t n;

    strcpy(line, "  padded text \\t\\n");
    n = strlen(line);
    while (n > 0 && isspace((unsigned char)line[n - 1]))
        line[--n] = '\\0';
    printf("[%s]\\n", line);
    return 0;
}
`,
    see: ['isgraph', 'iscntrl', 'strtok'],
  },
  isupper: {
    text: 'isupper(c) is true when c is an upper-case letter, A to Z in the "C" locale.\n\nDigits and punctuation are neither upper nor lower case. To convert, use tolower, which leaves anything that is not an upper-case letter unchanged.\n\nCast plain chars to unsigned char before passing them in.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *name = "John Ronald Reuel Tolkien";
    int i;

    for (i = 0; name[i] != '\\0'; i++)
        if (isupper((unsigned char)name[i]))
            putchar(name[i]);
    putchar('\\n');
    return 0;
}
`,
    see: ['islower', 'tolower', 'toupper'],
  },
  isxdigit: {
    text: 'isxdigit(c) is true for hexadecimal digits: 0 to 9, a to f and A to F.\n\nTo get the value of a hex digit, handle the three ranges yourself: c - \'0\' for digits, then tolower(c) - \'a\' + 10 for letters. strtol with base 16 does the whole job for a number.\n\nCast plain chars to unsigned char before passing them in.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    const char *s = "1F";
    int i, v = 0;

    for (i = 0; isxdigit((unsigned char)s[i]); i++) {
        int c = tolower((unsigned char)s[i]);
        v = v * 16 + (isdigit(c) ? c - '0' : c - 'a' + 10);
    }
    printf("0x%s = %d\\n", s, v);
    return 0;
}
`,
    see: ['isdigit', 'strtol', 'tolower'],
  },
  tolower: {
    text: 'tolower(c) returns the lower-case version of c if c is an upper-case letter, and c unchanged otherwise. It does not change anything in memory: it returns a new value, which you must store.\n\nThe argument must be EOF or an unsigned char value, so cast plain chars: s[i] = (char)tolower((unsigned char)s[i]).\n\nThe return type is int. To lower-case a whole string, loop over it; there is no standard function that does a string at once.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char s[] = "MiXeD CaSe";
    int i;

    for (i = 0; s[i] != '\\0'; i++)
        s[i] = (char)tolower((unsigned char)s[i]);
    printf("%s\\n", s);
    return 0;
}
`,
    see: ['toupper', 'isupper', 'islower'],
  },
  toupper: {
    text: 'toupper(c) returns the upper-case version of c if c is a lower-case letter, and c unchanged otherwise.\n\nThe argument must be EOF or an unsigned char value, so cast plain chars. The result is an int; store it back into a char with a cast if you are changing a string in place.\n\nA string literal cannot be changed, so copy it into a char array before converting it.',
    example: `#include <stdio.h>
#include <ctype.h>

int main(void)
{
    char word[] = "shout";
    int i;

    for (i = 0; word[i] != '\\0'; i++)
        word[i] = (char)toupper((unsigned char)word[i]);
    printf("%s!\\n", word);
    return 0;
}
`,
    see: ['tolower', 'islower', 'isupper'],
  },
});
