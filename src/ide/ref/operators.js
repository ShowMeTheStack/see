/* The C reference: operators and punctuators */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  precedence: {
    group: 'Operators',
    sig: 'from tightest to loosest binding',
    text: 'Precedence decides how an expression without parentheses is grouped; associativity decides the grouping of operators at the same level. From tightest to loosest:\n\n1. Postfix, left to right: a[i]  f(x)  s.m  p->m  x++  x--\n2. Unary, right to left: ++x  --x  &x  *p  +x  -x  ~x  !x  sizeof  (type)x\n3. Multiplicative, left to right: *  /  %\n4. Additive, left to right: +  -\n5. Shift, left to right: <<  >>\n6. Relational, left to right: <  <=  >  >=\n7. Equality, left to right: ==  !=\n8. Bitwise AND: &\n9. Bitwise exclusive OR: ^\n10. Bitwise OR: |\n11. Logical AND: &&\n12. Logical OR: ||\n13. Conditional, right to left: ?:\n14. Assignment, right to left: =  +=  -=  *=  /=  %=  <<=  >>=  &=  ^=  |=\n15. Comma, left to right: ,\n\nThe surprises are the bitwise operators, which bind more loosely than ==: x & 1 == 0 means x & (1 == 0). Also *p++ is *(p++), not (*p)++, and a << 1 + 1 shifts by 2. When in doubt, add parentheses; they cost nothing.\n\nPrecedence is not order of evaluation. In f() + g() * h() the multiplication is grouped first, but the three calls may happen in any order. Only &&, ||, ?: and the comma operator promise an order (see "sequence point").',
    example: `#include <stdio.h>

int main(void)
{
    int x = 6;
    int a[] = { 10, 20, 30 };
    int *p = a;
    int v;

    printf("2 + 3 * 4 = %d\\n", 2 + 3 * 4);
    printf("x & 1 == 0 -> %d, (x & 1) == 0 -> %d\\n", x & (1 == 0), (x & 1) == 0);
    v = *p++;
    printf("*p++ gave %d and p now points at %d\\n", v, *p);
    printf("1 << 1 + 1 = %d\\n", 1 << (1 + 1));
    return 0;
}
`,
    see: ['sequence point', '?:', ',', '&', '++'],
  },
  '+': {
    group: 'Operators',
    sig: 'a + b',
    text: 'a + b adds two numbers. Both operands first go through the usual arithmetic conversions: char and short become int, and if one side is double the other becomes double too, so 1 + 2.5 is 3.5.\n\nSigned integer overflow (INT_MAX + 1) is undefined behaviour; unsigned addition wraps around.\n\nIt also does pointer arithmetic: p + n, with p pointing into an array, points n elements further on, not n bytes. The result must stay inside the array or one past its end. Two pointers cannot be added.',
    example: `#include <stdio.h>

int main(void)
{
    int a[] = { 10, 20, 30, 40 };
    int *p = a + 2;

    printf("1 + 2.5 = %g\\n", 1 + 2.5);
    printf("'A' + 2 = %d = '%c'\\n", 'A' + 2, 'A' + 2);
    printf("*(a + 2) = %d, *p = %d\\n", *(a + 2), *p);
    return 0;
}
`,
    see: ['-', '+=', '++', 'usual arithmetic conversions', 'pointer'],
  },
  '-': {
    group: 'Operators',
    sig: 'a - b',
    text: 'a - b subtracts. With numbers, the usual arithmetic conversions apply first. With unsigned types the result wraps around instead of going negative: 2u - 3u is 4294967295, a common trap with size_t values such as strlen results.\n\np - n moves a pointer back n elements. p - q, with both pointing into the same array, gives the number of elements between them as a ptrdiff_t.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *s = "hello world";
    const char *space = strchr(s, ' ');

    printf("10 - 3 = %d\\n", 10 - 3);
    printf("the space is %d characters in\\n", (int)(space - s));
    printf("2u - 3u = %u\\n", 2u - 3u);
    return 0;
}
`,
    see: ['+', 'unary -', 'ptrdiff_t', '-='],
  },
  '*': {
    group: 'Operators',
    sig: 'a * b',
    text: 'a * b multiplies two numbers after the usual arithmetic conversions.\n\nThe product of two ints is an int, so it can overflow even when you store it in a wider or floating type: in double d = 100000 * 100000; the multiplication overflows before the conversion. Convert one operand first: 100000.0 * 100000.\n\nThe same symbol in front of a single operand is the dereference operator; see "unary *". In a declaration, int *p, it marks a pointer.',
    example: `#include <stdio.h>

int main(void)
{
    int w = 7, h = 6;
    double big = 100000.0 * 100000;

    printf("area %d\\n", w * h);
    printf("100000 * 100000 = %.0f\\n", big);
    return 0;
}
`,
    see: ['/', '*=', 'unary *', 'usual arithmetic conversions'],
  },
  '/': {
    group: 'Operators',
    sig: 'a / b',
    text: 'a / b divides. If both operands are integers the result is an integer, truncated toward zero: 7 / 2 is 3 and -7 / 2 is -3. If either is floating, the division is in floating point: 7 / 2.0 is 3.5.\n\nThis catches everyone once: double avg = sum / count; with int sum and count throws the fraction away before the assignment. Write (double)sum / count.\n\nInteger division by zero is undefined behaviour; in See it stops the program with "integer division by zero" (SIGFPE). Floating division by zero gives inf or nan.',
    example: `#include <stdio.h>

int main(void)
{
    int sum = 17, count = 4;

    printf("7 / 2 = %d, -7 / 2 = %d, 7 / 2.0 = %g\\n", 7 / 2, -7 / 2, 7 / 2.0);
    printf("int average %d, real average %g\\n", sum / count, (double)sum / count);
    return 0;
}
`,
    see: ['%', '*', '(type)', 'SIGFPE'],
  },
  '%': {
    group: 'Operators',
    sig: 'a % b',
    text: 'a % b is the remainder of the integer division a / b, so that (a / b) * b + a % b == a. Both operands must be integers; for doubles use fmod.\n\nThe sign of the result follows a: 7 % 3 is 1 and -7 % 3 is -1 (C89 allowed either sign for negative operands; every modern compiler truncates toward zero as here). So x % 2 == 1 is false for negative odd numbers; test x % 2 != 0.\n\nCommon uses: n % 10 is the last decimal digit, i % n wraps an index around a circular buffer, and a % b == 0 tests divisibility. b must not be 0.',
    example: `#include <stdio.h>

int main(void)
{
    int n = 1234, sum = 0;

    while (n > 0) {
        sum += n % 10;
        n /= 10;
    }
    printf("digit sum of 1234 = %d\\n", sum);
    printf("7 %% 3 = %d, -7 %% 3 = %d\\n", 7 % 3, -7 % 3);
    return 0;
}
`,
    see: ['/', 'fmod', '%='],
  },
  'unary +': {
    group: 'Operators',
    sig: '+a',
    text: 'Unary + returns the value of its operand after integer promotion. It does nothing else, and exists mostly for symmetry with unary minus, as in +5.\n\nIts one observable effect: +c for a char c has type int.',
    example: `#include <stdio.h>

int main(void)
{
    char c = 'x';

    printf("sizeof c = %d, sizeof +c = %d\\n", (int)sizeof c, (int)sizeof +c);
    return 0;
}
`,
    see: ['unary -', 'integer promotion'],
  },
  'unary -': {
    group: 'Operators',
    sig: '-a',
    text: 'Unary - negates its operand after integer promotion.\n\nNegating INT_MIN overflows, which is undefined behaviour, because there is no positive int that large. Negating an unsigned value gives the wrap-around complement: -1u is UINT_MAX.\n\nA negative number literal such as -5 is really unary minus applied to the constant 5.',
    example: `#include <stdio.h>

int main(void)
{
    int a = 5;
    double d = -2.5;

    printf("-a = %d, -d = %g, -1u = %u\\n", -a, -d, -1u);
    return 0;
}
`,
    see: ['-', 'INT_MIN', "two's complement"],
  },
  '<': {
    group: 'Operators',
    sig: 'a < b',
    text: 'a < b is 1 if a is less than b and 0 otherwise. The result is an int.\n\nThe usual arithmetic conversions apply first, which gives a famous trap: comparing a negative int with an unsigned value converts the int to unsigned, so -1 < 1u is 0 (false). The same happens with sizeof and strlen results, which are unsigned.\n\nComparisons do not chain: 1 < x < 5 means (1 < x) < 5, which is always true since 0 and 1 are both less than 5. Write 1 < x && x < 5. Pointers may be compared only when they point into the same array.',
    example: `#include <stdio.h>

int main(void)
{
    int x = 10;

    printf("3 < 4 is %d\\n", 3 < 4);
    printf("1 < x < 5 is %d, but 1 < x && x < 5 is %d\\n", (1 < x) < 5, 1 < x && x < 5);
    return 0;
}
`,
    see: ['>', '<=', '>=', 'usual arithmetic conversions', '&&'],
  },
  '>': {
    group: 'Operators',
    sig: 'a > b',
    text: 'a > b is 1 if a is greater than b and 0 otherwise. The same rules as < apply: the usual arithmetic conversions first (watch signed against unsigned), and no chaining.\n\nTo compare strings use strcmp; > on two char pointers compares their addresses.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *a = "pear", *b = "apple";

    printf("5 > 3 is %d\\n", 5 > 3);
    printf("\\"%s\\" sorts after \\"%s\\": %d\\n", a, b, strcmp(a, b) > 0);
    return 0;
}
`,
    see: ['<', '>=', 'strcmp'],
  },
  '<=': {
    group: 'Operators',
    sig: 'a <= b',
    text: 'a <= b is 1 if a is less than or equal to b and 0 otherwise.\n\nIn a loop over an array of n elements, i <= n is almost always a bug: it runs once too many and touches a[n], one past the end. Use i < n.',
    example: `#include <stdio.h>

int main(void)
{
    int i;

    for (i = 1; i <= 5; i++)
        printf("%d ", i);
    printf("\\n");
    return 0;
}
`,
    see: ['<', '>=', 'buffer overflow'],
  },
  '>=': {
    group: 'Operators',
    sig: 'a >= b',
    text: 'a >= b is 1 if a is greater than or equal to b and 0 otherwise.\n\nWith an unsigned left side, a test like u >= 0 is always true; a loop for (u = n - 1; u >= 0; u--) never ends. Many compilers warn about such comparisons; See does not, so watch for them.',
    example: `#include <stdio.h>

int main(void)
{
    int marks = 72;

    printf("%d >= 50: %s\\n", marks, marks >= 50 ? "pass" : "fail");
    return 0;
}
`,
    see: ['<=', '>', 'unsigned'],
  },
  '==': {
    group: 'Operators',
    sig: 'a == b',
    text: 'a == b is 1 if the two values are equal and 0 otherwise.\n\nDo not confuse it with =, which assigns: if (x = 0) sets x to 0 and is always false. See warns about an assignment used as a condition.\n\n== compares values, not contents: on two strings (char pointers) it asks whether they are at the same address, so use strcmp(a, b) == 0. Structures cannot be compared with == at all. And computed floating-point values are rarely exactly equal; compare with a tolerance.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char a[] = "cat", b[] = "cat";

    printf("2 + 2 == 4 is %d\\n", 2 + 2 == 4);
    printf("a == b is %d (different arrays)\\n", a == b);
    printf("strcmp(a, b) == 0 is %d\\n", strcmp(a, b) == 0);
    return 0;
}
`,
    see: ['!=', '=', 'strcmp', 'fabs'],
  },
  '!=': {
    group: 'Operators',
    sig: 'a != b',
    text: 'a != b is 1 if the values differ and 0 if they are equal.\n\nIt is the usual loop test when scanning a string or reading input: while (*s != \'\\0\') and while ((c = getchar()) != EOF). Notice the extra parentheses in the second: != binds more tightly than =, so without them c would get the result of the comparison.',
    example: `#include <stdio.h>

int main(void)
{
    const char *s = "length";
    int n = 0;

    while (s[n] != '\\0')
        n++;
    printf("\\"%s\\" has %d characters\\n", s, n);
    return 0;
}
`,
    see: ['==', 'NUL terminator', 'EOF'],
  },
  '!': {
    group: 'Operators',
    sig: '!a',
    text: '!a is logical NOT: 1 if a is zero (or a null pointer), and 0 otherwise.\n\nif (!p) is a common way to write if (p == NULL), and !!x turns any non-zero value into exactly 1.\n\nDo not confuse it with ~, the bitwise complement: !5 is 0 but ~5 is -6.',
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *p = malloc(sizeof *p);

    if (!p) {
        printf("out of memory\\n");
        return 1;
    }
    printf("!0 = %d, !7 = %d, !!7 = %d, ~5 = %d\\n", !0, !7, !!7, ~5);
    free(p);
    return 0;
}
`,
    see: ['&&', '||', '~'],
  },
  '&&': {
    group: 'Operators',
    sig: 'a && b',
    text: 'a && b is logical AND: 1 if both operands are non-zero, else 0.\n\nIt short-circuits: a is evaluated first, and if it is 0, b is not evaluated at all. That makes guards like p != NULL && p->count > 0 and i < n && a[i] != 0 safe: the second test only runs when the first makes it valid. There is a sequence point after a.\n\nDo not confuse it with &, the bitwise AND, which evaluates both sides and combines bits.',
    example: `#include <stdio.h>

int main(void)
{
    int a[] = { 4, 8, 0, 3 };
    int n = 4, i = 0;

    while (i < n && a[i] != 0)
        i++;
    printf("first zero at index %d\\n", i);
    printf("2 && 3 = %d, 2 & 1 = %d\\n", 2 && 3, 2 & 1);
    return 0;
}
`,
    see: ['||', '!', '&', 'sequence point'],
  },
  '||': {
    group: 'Operators',
    sig: 'a || b',
    text: 'a || b is logical OR: 1 if either operand is non-zero, else 0.\n\nIt short-circuits: if a is non-zero, b is not evaluated. So in x == 0 || 100 / x > 5 the division never runs when x is 0.\n\n&& binds more tightly than ||, so a || b && c means a || (b && c). Do not confuse || with |, the bitwise OR.',
    example: `#include <stdio.h>

int main(void)
{
    int x = 0;
    char c = 'E';

    if (x == 0 || 100 / x > 5)
        printf("safe: the division was skipped\\n");
    if (c == 'e' || c == 'E')
        printf("'%c' is an e\\n", c);
    return 0;
}
`,
    see: ['&&', '!', '|'],
  },
  '~': {
    group: 'Operators',
    sig: '~a',
    text: '~a flips every bit of an integer (its one\'s complement), after integer promotion. In two\'s complement, ~x equals -x - 1, so ~0 is -1 and ~5 is -6.\n\nIts main use is building masks: x & ~FLAG clears the FLAG bits and keeps the rest. Because of promotion, ~ on an unsigned char gives an int with the high bits set; cast the result back if you want only 8 bits.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned flags = 0x0F;
    unsigned char b = 0x0F;

    printf("~0 = %d, ~5 = %d\\n", ~0, ~5);
    printf("clear bit 1 of 0x%02X: 0x%02X\\n", flags, flags & ~0x02u);
    printf("~b = 0x%X, (unsigned char)~b = 0x%X\\n", (unsigned)~b, (unsigned)(unsigned char)~b);
    return 0;
}
`,
    see: ['&', '|', '^', '!', "two's complement"],
  },
  '&': {
    group: 'Operators',
    sig: 'a & b',
    text: 'a & b is bitwise AND: each bit of the result is 1 only where both operands have a 1. It works on integers only.\n\nIt is used to test and keep bits: x & 1 is 1 for odd x, and flags & MASK keeps only the bits in MASK. Its precedence is lower than ==, so always write (x & MASK) == 0 with parentheses.\n\nThe same symbol in front of a single operand takes an address; see "unary &". Do not confuse it with &&.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned x = 0xB6;
    int i;

    printf("0x%X & 0x0F = 0x%X\\n", x, x & 0x0Fu);
    printf("bits of 0x%X: ", x);
    for (i = 7; i >= 0; i--)
        putchar((x & (1u << i)) ? '1' : '0');
    printf("\\n");
    return 0;
}
`,
    see: ['|', '^', '~', '&=', 'unary &', '&&', 'precedence'],
  },
  '|': {
    group: 'Operators',
    sig: 'a | b',
    text: 'a | b is bitwise OR: each bit of the result is 1 where either operand has a 1.\n\nIt is used to combine flags (READ | WRITE) and to set bits: x | (1u << n) sets bit n. Like &, its precedence is below the comparisons, so add parentheses. Do not confuse it with ||.',
    example: `#include <stdio.h>

#define READ  1u
#define WRITE 2u
#define EXEC  4u

int main(void)
{
    unsigned mode = READ | WRITE;

    printf("mode = %u\\n", mode);
    printf("can write: %s, can exec: %s\\n", (mode & WRITE) ? "yes" : "no", (mode & EXEC) ? "yes" : "no");
    return 0;
}
`,
    see: ['&', '^', '|=', '||'],
  },
  '^': {
    group: 'Operators',
    sig: 'a ^ b',
    text: 'a ^ b is bitwise exclusive OR: each bit of the result is 1 where exactly one of the operands has a 1.\n\nx ^ mask toggles the bits in mask, and x ^ x is 0. It is not exponentiation: 2 ^ 3 is 1, not 8. For powers use pow, or shift for powers of two (1 << 3).',
    example: `#include <stdio.h>

int main(void)
{
    unsigned light = 0;

    light ^= 1u;
    printf("toggled on: %u\\n", light);
    light ^= 1u;
    printf("toggled off: %u\\n", light);
    printf("2 ^ 3 = %d (not 8)\\n", 2 ^ 3);
    return 0;
}
`,
    see: ['&', '|', '~', '^=', 'pow'],
  },
  '<<': {
    group: 'Operators',
    sig: 'a << n',
    text: 'a << n shifts the bits of a left by n places, filling with zeros. For unsigned values that is multiplying by 2 to the n, modulo the type\'s range: 1u << 4 is 16.\n\nn must be at least 0 and less than the width of the promoted left operand (32 here); otherwise the behaviour is undefined. Shifting a 1 into or past the sign bit of a signed int is undefined too, so use unsigned values for bit work.\n\nThe operator binds more loosely than + and -, so 1 << n + 1 shifts by n + 1.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned i;

    for (i = 0; i < 5; i++)
        printf("1u << %u = %u\\n", i, 1u << i);
    return 0;
}
`,
    see: ['>>', '<<=', '&', '|'],
  },
  '>>': {
    group: 'Operators',
    sig: 'a >> n',
    text: 'a >> n shifts the bits of a right by n places. For unsigned values the new high bits are zeros and the result is a / 2 to the n, rounded down.\n\nFor a negative signed value the result is implementation-defined: here, as on most machines, the sign bit is copied in (an arithmetic shift), so -16 >> 2 is -4. Use unsigned types for bit manipulation. As with <<, n must be less than the operand\'s width.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned x = 0xABCDu;

    printf("high byte 0x%X, low byte 0x%X\\n", (x >> 8) & 0xFFu, x & 0xFFu);
    printf("100 >> 2 = %d, -16 >> 2 = %d\\n", 100 >> 2, -16 >> 2);
    return 0;
}
`,
    see: ['<<', '>>=', '&'],
  },
  '=': {
    group: 'Operators',
    sig: 'lvalue = expression',
    text: 'x = e stores the value of e into x, converting it to x\'s type, and the whole expression then has the new value of x. The left side must be a modifiable lvalue: a variable, an array element, a member, or *p. An array name cannot be assigned to; copy arrays with memcpy and strings with strcpy.\n\nBecause assignment is an expression and groups right to left, a = b = 0 sets both, and while ((c = getchar()) != EOF) assigns and tests in one go.\n\nIn a declaration, int x = 5; is an initialisation, not an assignment, though it looks the same. Do not confuse = with ==; see warns when an assignment is used as a condition.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    int a, b;
    char name[16];
    double d;

    a = b = 7;
    d = a / 2;
    strcpy(name, "Ada");
    printf("a = %d, b = %d, d = %g, name = %s\\n", a, b, d, name);
    return 0;
}
`,
    see: ['==', 'lvalue', '+=', 'strcpy'],
  },
  '+=': {
    group: 'Operators',
    sig: 'x += e',
    text: 'x += e adds e to x and stores the result in x. It is the same as x = x + e, except that x is evaluated only once, which matters for something like a[i++] += 1.\n\nOn a pointer, p += n moves it n elements forward.',
    example: `#include <stdio.h>

int main(void)
{
    int total = 0, i;

    for (i = 1; i <= 4; i++)
        total += i * 10;
    printf("total = %d\\n", total);
    return 0;
}
`,
    see: ['+', '=', '++', '-='],
  },
  '-=': {
    group: 'Operators',
    sig: 'x -= e',
    text: 'x -= e subtracts e from x and stores the result in x, like x = x - e with x evaluated once.\n\nWith an unsigned x, going below zero wraps around to a very large number.',
    example: `#include <stdio.h>

int main(void)
{
    int balance = 100;

    balance -= 30;
    balance -= 45;
    printf("balance %d\\n", balance);
    return 0;
}
`,
    see: ['-', '+=', '--'],
  },
  '*=': {
    group: 'Operators',
    sig: 'x *= e',
    text: 'x *= e multiplies x by e and stores the result in x. x *= a + b means x = x * (a + b): the right side is evaluated as a whole first.',
    example: `#include <stdio.h>

int main(void)
{
    long fact = 1;
    int i;

    for (i = 2; i <= 10; i++)
        fact *= i;
    printf("10! = %ld\\n", fact);
    return 0;
}
`,
    see: ['*', '/=', '='],
  },
  '/=': {
    group: 'Operators',
    sig: 'x /= e',
    text: 'x /= e divides x by e and stores the result in x. With integer x the division truncates, just like /. e must not be 0 for integers.',
    example: `#include <stdio.h>

int main(void)
{
    int n = 1000, halvings = 0;

    while (n > 1) {
        n /= 2;
        halvings++;
    }
    printf("1000 halves to 1 in %d steps\\n", halvings);
    return 0;
}
`,
    see: ['/', '*=', '%='],
  },
  '%=': {
    group: 'Operators',
    sig: 'x %= e',
    text: 'x %= e replaces x with the remainder of x / e. Both must be integers and e must not be 0. It is handy for keeping an index inside a circular buffer.',
    example: `#include <stdio.h>

int main(void)
{
    int pos = 0, i;

    for (i = 0; i < 7; i++) {
        printf("%d ", pos);
        pos += 1;
        pos %= 3;
    }
    printf("\\n");
    return 0;
}
`,
    see: ['%', '/='],
  },
  '<<=': {
    group: 'Operators',
    sig: 'x <<= n',
    text: 'x <<= n shifts x left by n bits and stores the result in x. The same limits as << apply: n below the width of the type, and use unsigned values.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned bit = 1u;
    int i;

    for (i = 0; i < 4; i++) {
        printf("%u ", bit);
        bit <<= 1;
    }
    printf("\\n");
    return 0;
}
`,
    see: ['<<', '>>='],
  },
  '>>=': {
    group: 'Operators',
    sig: 'x >>= n',
    text: 'x >>= n shifts x right by n bits and stores the result in x. Repeated x >>= 1 walks through the bits of an unsigned value from the lowest.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned x = 0xF0u;
    int ones = 0;

    while (x != 0) {
        ones += x & 1u;
        x >>= 1;
    }
    printf("0xF0 has %d bits set\\n", ones);
    return 0;
}
`,
    see: ['>>', '<<='],
  },
  '&=': {
    group: 'Operators',
    sig: 'x &= e',
    text: 'x &= e keeps only the bits of x that are also set in e. Combined with ~ it clears flags: flags &= ~WRITE.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned flags = 7u;

    flags &= ~2u;
    printf("after clearing bit 1: %u\\n", flags);
    return 0;
}
`,
    see: ['&', '|=', '~'],
  },
  '^=': {
    group: 'Operators',
    sig: 'x ^= e',
    text: 'x ^= e toggles the bits of x that are set in e: applying the same ^= twice restores x. It is the basis of simple checksums and the XOR swap trick.',
    example: `#include <stdio.h>

int main(void)
{
    char msg[] = "secret";
    int i;

    for (i = 0; msg[i] != '\\0'; i++)
        msg[i] ^= 0x20;
    printf("%s\\n", msg);
    for (i = 0; msg[i] != '\\0'; i++)
        msg[i] ^= 0x20;
    printf("%s\\n", msg);
    return 0;
}
`,
    see: ['^', '&=', '|='],
  },
  '|=': {
    group: 'Operators',
    sig: 'x |= e',
    text: 'x |= e sets in x every bit that is set in e and leaves the others alone. It is the usual way to switch flags on: flags |= READ.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned flags = 0;

    flags |= 1u;
    flags |= 4u;
    printf("flags = %u\\n", flags);
    return 0;
}
`,
    see: ['|', '&=', '^='],
  },
  '++': {
    group: 'Operators',
    sig: '++x  x++',
    text: '++ adds 1 to a variable (or moves a pointer to the next element). The operand must be a modifiable lvalue.\n\nPrefix ++x increments first, and the expression\'s value is the new value. Postfix x++ gives the old value, and the increment happens some time before the next sequence point. On its own as a statement, i++; and ++i; do the same thing.\n\nThe difference shows when the value is used: with i = 5, a = i++ sets a to 5, while a = ++i sets a to 6. *p++ reads the element p points at and then moves p on; it is (*p)++ that increments the element.\n\nModifying a variable twice, or modifying and reading it, without a sequence point in between is undefined behaviour: i = i++ and printf("%d %d", i, i++) have no defined result.',
    example: `#include <stdio.h>

int main(void)
{
    int i = 5, a, b;
    char s[] = "abc";
    char *p = s;

    a = i++;
    b = ++i;
    printf("a = %d, b = %d, i = %d\\n", a, b, i);
    while (*p)
        putchar(*p++);
    putchar('\\n');
    return 0;
}
`,
    see: ['--', '+=', 'sequence point', 'undefined behaviour'],
  },
  '--': {
    group: 'Operators',
    sig: '--x  x--',
    text: '-- subtracts 1 from a variable (or moves a pointer back one element). Prefix --x gives the new value; postfix x-- gives the old value and decrements afterwards.\n\nwhile (n-- > 0) runs the body exactly n times, with n going from n - 1 down to 0 inside it. Careful with unsigned counters: decrementing 0 wraps to the largest value instead of becoming negative.',
    example: `#include <stdio.h>

int main(void)
{
    int n = 3;

    while (n-- > 0)
        printf("n inside the loop: %d\\n", n);
    printf("n after the loop: %d\\n", n);
    return 0;
}
`,
    see: ['++', '-=', 'sequence point'],
  },
  'unary &': {
    group: 'Operators',
    sig: '&lvalue',
    text: '&x is the address-of operator: it gives a pointer to x. If x has type int, &x has type int *.\n\nIt is how a function gets to change a caller\'s variable: scanf("%d", &n) and swap(&a, &b) pass addresses so the function can write through them. In See\'s memory picture a pointer value is drawn as an arrow to the box it addresses.\n\nThe operand must be an object in memory: not a constant, not an expression like a + 1, and not a register variable. For an array, a and &a[0] are the same address (the array decays), while &a points to the whole array. Do not confuse it with the bitwise & between two operands.',
    example: `#include <stdio.h>

static void swap(int *x, int *y)
{
    int t = *x;

    *x = *y;
    *y = t;
}

int main(void)
{
    int a = 1, b = 2;

    swap(&a, &b);
    printf("a = %d, b = %d\\n", a, b);
    printf("&a and &b are %s\\n", &a != &b ? "different addresses" : "the same");
    return 0;
}
`,
    see: ['unary *', 'pointer', '&', 'scanf'],
  },
  'unary *': {
    group: 'Operators',
    sig: '*pointer',
    text: '*p is the dereference (indirection) operator: it gives the object p points to. If p has type int *, *p is an int, and it is an lvalue, so *p = 5 writes through the pointer.\n\nThe pointer must point to a valid object. Dereferencing NULL, an uninitialised pointer, or a pointer to memory that was freed or to a local variable whose function has returned is undefined behaviour; in See it usually stops the program with a segmentation fault and the memory picture shows where the arrow points.\n\n*(a + i) is exactly a[i]. A void * cannot be dereferenced; convert it to a real pointer type first. In a declaration, int *p, the star means "pointer to", not dereference.',
    example: `#include <stdio.h>

int main(void)
{
    int x = 10;
    int *p = &x;
    int a[] = { 1, 2, 3 };

    *p = 20;
    printf("x = %d, *p = %d\\n", x, *p);
    printf("*(a + 2) = %d, a[2] = %d\\n", *(a + 2), a[2]);
    return 0;
}
`,
    see: ['unary &', '->', '[]', 'pointer', 'dangling pointer', 'NULL'],
  },
  '.': {
    group: 'Operators',
    sig: 'structure.member',
    text: 's.m selects member m of the structure or union s. The left side must be a structure itself, not a pointer to one; for a pointer use p->m, which is (*p).m.\n\nThe result is an lvalue when s is, so s.x = 3 assigns to the member. In See\'s memory picture, each member is a field inside the structure\'s box.',
    example: `#include <stdio.h>

struct date {
    int day, month, year;
};

int main(void)
{
    struct date d;

    d.day = 14;
    d.month = 7;
    d.year = 1789;
    printf("%02d/%02d/%d\\n", d.day, d.month, d.year);
    return 0;
}
`,
    see: ['->', 'struct', 'union'],
  },
  '->': {
    group: 'Operators',
    sig: 'pointer->member',
    text: 'p->m selects member m of the structure that p points to. It is shorthand for (*p).m; the parentheses are needed there because . binds more tightly than *.\n\nIt is everywhere in code with linked lists, trees and structures allocated with malloc, as in node->next->value. p must point to a valid structure: p->m with p NULL is a segmentation fault, so test the pointer first.',
    example: `#include <stdio.h>
#include <stdlib.h>

struct node {
    int value;
    struct node *next;
};

int main(void)
{
    struct node b = { 2, NULL };
    struct node a = { 1, NULL };
    struct node *p;

    a.next = &b;
    for (p = &a; p != NULL; p = p->next)
        printf("%d ", p->value);
    printf("\\n");
    return 0;
}
`,
    see: ['.', 'unary *', 'struct', 'pointer'],
  },
  '[]': {
    group: 'Operators',
    sig: 'array[index]',
    text: 'a[i] is the element at index i. Indexes start at 0, so an array of n elements has indexes 0 to n - 1.\n\nIt is defined as *(a + i): the array name decays to a pointer to its first element and i elements are added. So it works on pointers too, and the strange-looking i[a] means the same thing.\n\nC never checks the index. Reading or writing a[n] or a[-1] is undefined behaviour that may silently corrupt other variables; See stops the program at such an access and names the array and its last valid index.',
    example: `#include <stdio.h>

int main(void)
{
    int a[5] = { 2, 3, 5, 7, 11 };
    int grid[2][3] = { { 1, 2, 3 }, { 4, 5, 6 } };
    int *p = a + 1;

    printf("a[0] = %d, a[4] = %d\\n", a[0], a[4]);
    printf("p[1] = %d, 2[a] = %d\\n", p[1], 2[a]);
    printf("grid[1][2] = %d\\n", grid[1][2]);
    return 0;
}
`,
    see: ['unary *', 'array decay', 'buffer overflow', 'pointer'],
  },
  '()': {
    group: 'Operators',
    sig: 'function(arguments)',
    text: 'f(a, b) calls a function. Each argument is evaluated and copied into the parameter (C always passes by value; to let a function change your variable, pass its address). The value of the call is the function\'s return value.\n\nThe order in which the arguments are evaluated is unspecified, so f(i++, i) is undefined. The commas between arguments are separators, not the comma operator.\n\nThe function must be declared before the call. In C89 calling an undeclared function makes the compiler assume it returns int, which breaks functions such as sqrt that return double. The left side can also be a function pointer: fp(x) and (*fp)(x) are the same. In See, each call adds a stack frame to the memory picture.',
    example: `#include <stdio.h>

static int square(int x)
{
    return x * x;
}

static void try_to_change(int x)
{
    x = 99;
}

int main(void)
{
    int n = 4;
    int (*fp)(int) = square;

    try_to_change(n);
    printf("square(%d) = %d, via pointer %d\\n", n, square(n), fp(n + 1));
    return 0;
}
`,
    see: ['stack frame', 'return', 'sequence point', 'va_list'],
  },
  '(type)': {
    group: 'Operators',
    sig: '(type) expression',
    text: 'A cast, (type)e, converts the value of e to the named type. (double)7 / 2 is 3.5; (int)3.99 is 3 (truncated toward zero); (unsigned char)c turns a negative char into 0 to 255.\n\nA cast only converts the value; it does not change the variable. Converting a floating value too large for the integer type is undefined behaviour, and converting to a narrower integer type keeps the low bits.\n\nCasts between pointer types make the compiler accept code it would otherwise reject, so they can hide real mistakes. In C there is no need to cast the void * that malloc returns; doing so can hide a missing #include <stdlib.h>.',
    example: `#include <stdio.h>

int main(void)
{
    int sum = 7, n = 2;
    char c = (char)200;

    printf("%d / %d = %d, as double %g\\n", sum, n, sum / n, (double)sum / n);
    printf("(int)3.99 = %d, (int)-3.99 = %d\\n", (int)3.99, (int)-3.99);
    printf("c = %d, (unsigned char)c = %d\\n", c, (unsigned char)c);
    return 0;
}
`,
    see: ['usual arithmetic conversions', 'void', '/'],
  },
  'sizeof operator': {
    group: 'Operators',
    sig: 'sizeof expression  sizeof(type)',
    text: 'sizeof gives the size in bytes of a type or of the type of an expression, as a size_t. It is computed at compile time and does not evaluate its operand: sizeof(i++) leaves i unchanged. sizeof(char) is always 1.\n\nsizeof on an array gives the whole array\'s size, so sizeof a / sizeof a[0] is the number of elements. But an array parameter is really a pointer, so inside a function that takes int a[], sizeof a is the size of a pointer (4 here), not the array. Pass the length separately.\n\nsizeof a structure includes any padding, so it can be more than the sum of its members. The idiom p = malloc(n * sizeof *p) gets the size right even if p\'s type changes. Print the result with %lu after a cast to unsigned long.',
    example: `#include <stdio.h>

struct mixed {
    char c;
    int i;
};

static void f(int a[])
{
    printf("inside f, sizeof a = %lu (a pointer)\\n", (unsigned long)sizeof a);
}

int main(void)
{
    int a[10];

    printf("sizeof a = %lu, elements = %lu\\n", (unsigned long)sizeof a, (unsigned long)(sizeof a / sizeof a[0]));
    printf("sizeof(struct mixed) = %lu\\n", (unsigned long)sizeof(struct mixed));
    f(a);
    return 0;
}
`,
    see: ['sizeof', 'size_t', 'array decay', 'alignment and padding'],
  },
  '?:': {
    group: 'Operators',
    sig: 'condition ? a : b',
    text: 'c ? a : b evaluates c; if it is non-zero the result is a, otherwise b. Only the chosen one of a and b is evaluated, and there is a sequence point after c.\n\nIt is an expression, so it can be used where an if statement cannot: inside a printf argument, an initialiser or a return. a and b are converted to a common type, so x ? 1 : 2.5 is a double either way.\n\nIt groups right to left, so a chain like n < 0 ? "negative" : n == 0 ? "zero" : "positive" reads naturally. Deeply nested ones are better written as if statements.',
    example: `#include <stdio.h>

int main(void)
{
    int n;

    for (n = -1; n <= 1; n++)
        printf("%d is %s\\n", n, n < 0 ? "negative" : n == 0 ? "zero" : "positive");
    printf("%d item%s\\n", 1, 1 == 1 ? "" : "s");
    return 0;
}
`,
    see: ['if', 'else', 'sequence point'],
  },
  ',': {
    group: 'Operators',
    sig: 'a, b',
    text: 'The comma operator evaluates a, throws its value away, then evaluates b; the result is b. There is a sequence point between them, so a is finished before b starts.\n\nIts main use is in for loops that update two variables: for (i = 0, j = n - 1; i < j; i++, j--).\n\nNot every comma is the comma operator. The commas between function arguments, in declarations (int a, b;) and in initialisers are separators, with no ordering guarantee. Comma has the lowest precedence of all, so x = 1, 2 sets x to 1.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[] = "drawer";
    int i, j;
    char t;

    for (i = 0, j = (int)strlen(s) - 1; i < j; i++, j--) {
        t = s[i];
        s[i] = s[j];
        s[j] = t;
    }
    printf("%s\\n", s);
    return 0;
}
`,
    see: ['for', 'sequence point', 'precedence'],
  },
  '#': {
    group: 'Operators',
    sig: '#define NAME(x) #x',
    text: 'Inside a function-like macro definition, #x turns the macro argument x into a string literal, exactly as written in the call. This "stringizing" is how assert can print the failing expression.\n\nAt the start of a line, # introduces a preprocessor directive such as #include or #define; that is a different use of the same character.',
    example: `#include <stdio.h>

#define SHOW(expr) printf("%s = %d\\n", #expr, (expr))

int main(void)
{
    int x = 6;

    SHOW(x * 7);
    SHOW(x % 4 + 1);
    return 0;
}
`,
    see: ['##', 'assert'],
  },
  '##': {
    group: 'Operators',
    sig: '#define NAME(a, b) a ## b',
    text: 'Inside a macro definition, a ## b pastes two tokens together into one, before the result is scanned again. It lets a macro build identifiers, such as declaring a set of similarly named variables or functions.\n\nThe pasted result must be a valid single token.',
    example: `#include <stdio.h>

#define VAR(n) value_ ## n

int main(void)
{
    int VAR(1) = 10, VAR(2) = 20;

    printf("value_1 = %d, value_2 = %d\\n", value_1, value_2);
    return 0;
}
`,
    see: ['#'],
  },
});
