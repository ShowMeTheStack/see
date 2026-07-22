/* The C reference: the 32 keywords of C89 */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  auto: {
    group: 'Keywords', kind: 'keyword',
    sig: 'auto type name;',
    text: 'auto declares a local variable with automatic storage duration: it is created when the block is entered and destroyed when the block is left. That is already the default for every variable declared inside a function, so auto is almost never written.\n\nAn automatic variable is not initialised unless you give it a value; until then it holds whatever bytes were left in that stack memory. See warns when a program reads one before it was given a value, and the memory picture shows it inside the function\'s stack frame.\n\n(In C++11 and later, auto means something completely different: type deduction. Not in C.)',
    example: `#include <stdio.h>

int main(void)
{
    auto int count = 3;
    int same = 3;

    printf("%d and %d are both automatic variables\\n", count, same);
    return 0;
}
`,
    see: ['register', 'static', 'storage duration', 'stack frame'],
  },
  break: {
    group: 'Keywords', kind: 'keyword',
    sig: 'break;',
    text: 'break leaves the innermost enclosing for, while, do or switch immediately, and continues with the statement after it.\n\nIn a switch, break is how a case ends; without it, execution falls through into the next case. In nested loops, break only leaves the inner one; to leave several at once use a flag, a return, or goto.\n\nbreak cannot be used to leave an if block on its own.',
    example: `#include <stdio.h>

int main(void)
{
    int primes[] = { 2, 3, 5, 7, 11, 13 };
    int i;

    for (i = 0; i < 6; i++) {
        if (primes[i] > 6)
            break;
        printf("%d ", primes[i]);
    }
    printf("\\nstopped at index %d\\n", i);
    return 0;
}
`,
    see: ['continue', 'switch', 'for', 'goto'],
  },
  case: {
    group: 'Keywords', kind: 'keyword',
    sig: 'case constant-expression: statements',
    text: 'case marks a place inside a switch to jump to when the controlling value equals the constant. The constant must be an integer constant expression known at compile time: a number, a character such as \'a\', an enum constant or arithmetic on these. Strings and variables are not allowed, and two cases may not have the same value.\n\nA case label is only a label: execution continues straight into the following cases unless a break stops it. Several labels in a row share one piece of code.',
    example: `#include <stdio.h>

int main(void)
{
    const char *s = "a1 b?";
    int i, letters = 0, digits = 0, other = 0;

    for (i = 0; s[i] != '\\0'; i++) {
        switch (s[i]) {
        case 'a': case 'b': case 'c':
            letters++;
            break;
        case '0': case '1': case '2':
            digits++;
            break;
        default:
            other++;
        }
    }
    printf("%d letters, %d digits, %d other\\n", letters, digits, other);
    return 0;
}
`,
    see: ['switch', 'default', 'break'],
  },
  char: {
    group: 'Keywords', kind: 'keyword',
    sig: 'char name;  signed char name;  unsigned char name;',
    text: 'char is the smallest integer type, exactly one byte (CHAR_BIT bits, 8 here). It holds a character code: \'A\' is just the number 65. Arrays of char ending in a NUL byte are C\'s strings.\n\nWhether a plain char is signed or unsigned is up to the implementation; here it is signed, from -128 to 127. signed char and unsigned char spell it out. Use unsigned char for raw bytes, and cast to unsigned char before calling the <ctype.h> functions.\n\nThe result of getchar and fgetc must be kept in an int, not a char, so that EOF can be told apart from a real byte.',
    example: `#include <stdio.h>

int main(void)
{
    char c = 'A';
    char word[] = "hi";

    printf("'%c' is %d; next is '%c'\\n", c, c, c + 1);
    printf("\\"%s\\" takes %d bytes\\n", word, (int)sizeof word);
    return 0;
}
`,
    see: ['CHAR_MIN', 'unsigned', 'string literal', 'NUL terminator', 'getchar'],
  },
  const: {
    group: 'Keywords', kind: 'keyword',
    sig: 'const type name = value;  const type *p;  type *const p;',
    text: 'const says an object must not be changed through this name. The compiler rejects an assignment to it. A const variable must be given its value when it is defined.\n\nWith pointers its position matters. const char *p (or char const *p) is a pointer to characters that may not be changed through p, though p itself can move. char *const p is a pointer that cannot move, to characters that can be changed. Read declarations from the name outwards: p is a const pointer to char.\n\nFunctions use const on pointer parameters to promise they will not modify what they are given, as in size_t strlen(const char *s). Passing a non-const pointer to such a parameter is always fine; the reverse needs a cast and is usually a mistake.\n\nIn C89 a const int is not a constant expression, so it cannot size an array or label a case; use #define or an enum for that.',
    example: `#include <stdio.h>
#include <string.h>

static int count_char(const char *s, char c)
{
    int n = 0;

    for (; *s != '\\0'; s++)
        if (*s == c)
            n++;
    return n;
}

int main(void)
{
    const double rate = 0.2;
    char text[] = "banana";

    printf("%d a's; 20%% of 50 is %g\\n", count_char(text, 'a'), rate * 50);
    return 0;
}
`,
    see: ['volatile', 'pointer', 'enum'],
  },
  continue: {
    group: 'Keywords', kind: 'keyword',
    sig: 'continue;',
    text: 'continue skips the rest of the current iteration of the innermost for, while or do loop and starts the next one.\n\nIn a for loop the increment expression still runs before the condition is tested again. In a while or do loop control goes straight to the condition, so make sure whatever moves the loop forward happens before the continue, or the loop never ends.\n\ncontinue has no meaning in a switch; inside a switch inside a loop, it continues the loop.',
    example: `#include <stdio.h>

int main(void)
{
    int i;

    for (i = 1; i <= 10; i++) {
        if (i % 3 == 0)
            continue;
        printf("%d ", i);
    }
    printf("\\n");
    return 0;
}
`,
    see: ['break', 'for', 'while'],
  },
  default: {
    group: 'Keywords', kind: 'keyword',
    sig: 'default: statements',
    text: 'default labels the code a switch jumps to when no case matches. It is optional; without it, an unmatched value skips the whole switch body. There may be at most one default in a switch.\n\nIt can appear anywhere among the cases, though it is normally written last. Putting a default in every switch, even one that just reports an impossible value, catches bugs early.',
    example: `#include <stdio.h>

static const char *day_name(int d)
{
    switch (d) {
    case 0: return "Sunday";
    case 6: return "Saturday";
    default: return "a weekday";
    }
}

int main(void)
{
    printf("0: %s, 3: %s, 6: %s\\n", day_name(0), day_name(3), day_name(6));
    return 0;
}
`,
    see: ['switch', 'case'],
  },
  do: {
    group: 'Keywords', kind: 'keyword',
    sig: 'do statement while (expression);',
    text: 'do ... while is the loop that tests its condition at the end, so the body always runs at least once. Note the semicolon after the closing parenthesis.\n\nIt suits work that must happen before you can decide whether to repeat: reading input until it is valid, or producing digits of a number (even 0 has one digit).',
    example: `#include <stdio.h>

int main(void)
{
    unsigned n = 0, x;
    int digits = 0;

    x = n;
    do {
        digits++;
        x /= 10;
    } while (x != 0);
    printf("%u has %d digit(s)\\n", n, digits);
    return 0;
}
`,
    see: ['while', 'for', 'break'],
  },
  double: {
    group: 'Keywords', kind: 'keyword',
    sig: 'double name;  long double name;',
    text: 'double is the standard floating-point type: 8 bytes here in IEEE 754 format, with about 15 decimal digits of precision and a range up to about 1.8e308. It is the type of a constant like 3.14, the type the math functions use, and what a float is promoted to when passed to printf.\n\nFloating-point numbers are binary fractions, so most decimal fractions are not exact: 0.1 + 0.2 is not exactly 0.3. Never compare computed doubles with ==; and never use them for money counted in cents, use integers.\n\nprintf prints a double with %f, %e or %g. scanf reads one with %lf; %f there means float, a common bug. long double is the same as double on this machine.',
    example: `#include <stdio.h>

int main(void)
{
    double sum = 0.0;
    int i;

    for (i = 0; i < 10; i++)
        sum += 0.1;
    printf("ten times 0.1 = %.17f\\n", sum);
    printf("equal to 1.0? %s\\n", sum == 1.0 ? "yes" : "no");
    return 0;
}
`,
    see: ['float', 'DBL_EPSILON', 'DBL_MAX', 'printf'],
  },
  else: {
    group: 'Keywords', kind: 'keyword',
    sig: 'if (expression) statement else statement',
    text: 'else gives an if statement the branch to run when its condition is false (zero).\n\nAn else always belongs to the nearest if that does not already have one, regardless of indentation. This "dangling else" trap is why many programmers always use braces for nested ifs.\n\nelse if is not a special keyword: it is an else whose statement happens to be another if, which is how a chain of tests is written.',
    example: `#include <stdio.h>

int main(void)
{
    int marks[] = { 95, 72, 40 };
    int i;

    for (i = 0; i < 3; i++) {
        if (marks[i] >= 90)
            printf("%d: excellent\\n", marks[i]);
        else if (marks[i] >= 50)
            printf("%d: pass\\n", marks[i]);
        else
            printf("%d: fail\\n", marks[i]);
    }
    return 0;
}
`,
    see: ['if', '?:', 'switch'],
  },
  enum: {
    group: 'Keywords', kind: 'keyword',
    sig: 'enum tag { NAME1, NAME2 = value, ... };',
    text: 'enum declares a set of named integer constants. By default the first is 0 and each next one is one more than the previous; you can give any of them an explicit value. The names are constants of type int, usable in case labels and array sizes.\n\nA variable of the enum type is just an integer: C does not stop you storing any other int in it, and printf prints it with %d.\n\nThe constants share one name space with variables and functions, so two enums cannot both have a RED.',
    example: `#include <stdio.h>

enum colour { RED, GREEN = 5, BLUE };

int main(void)
{
    enum colour c = BLUE;
    const char *names[] = { "red", "green", "blue" };

    printf("RED=%d GREEN=%d BLUE=%d\\n", RED, GREEN, BLUE);
    printf("c is %s\\n", names[c == RED ? 0 : c == GREEN ? 1 : 2]);
    return 0;
}
`,
    see: ['typedef', 'switch', 'const'],
  },
  extern: {
    group: 'Keywords', kind: 'keyword',
    sig: 'extern type name;',
    text: 'extern declares a variable or function that is defined somewhere else, usually in another source file. It tells the compiler the name and type without creating the object; the linker connects the uses to the one real definition.\n\nThe classic pattern is a header with extern int counter; included by every file that uses counter, and exactly one .c file with int counter = 0;. Two definitions, or none, are link errors.\n\nFunction declarations are extern by default, so the keyword is normally left off them. At file scope, extern int x = 1; with an initialiser is a definition after all.',
    example: `#include <stdio.h>

extern int total;
extern void add(int n);

int total = 0;

void add(int n)
{
    total += n;
}

int main(void)
{
    add(3);
    add(4);
    printf("total = %d\\n", total);
    return 0;
}
`,
    see: ['static', 'linkage', 'declaration versus definition', 'header file'],
  },
  float: {
    group: 'Keywords', kind: 'keyword',
    sig: 'float name;',
    text: 'float is the single-precision floating-point type: 4 bytes here, about 6 decimal digits of precision and a range up to about 3.4e38. A float constant has an f suffix: 2.5f. Without it, 2.5 is a double.\n\nFloats are promoted to double when passed to printf or other variadic functions, so %f prints both. scanf is different: %f reads a float and %lf a double.\n\nWith so few digits, float accumulates rounding error quickly; prefer double unless memory is tight.',
    example: `#include <stdio.h>

int main(void)
{
    float f = 0.0f;
    double d = 0.0;
    int i;

    for (i = 0; i < 1000000; i++) {
        f += 0.1f;
        d += 0.1;
    }
    printf("float: %f\\ndouble: %f\\n", f, d);
    return 0;
}
`,
    see: ['double', 'FLT_DIG', 'FLT_EPSILON'],
  },
  for: {
    group: 'Keywords', kind: 'keyword',
    sig: 'for (init; condition; step) statement',
    text: 'for is the counting loop. The init expression runs once; then, as long as condition is true, the body runs followed by step. Any of the three parts may be left out; an empty condition means "forever", as in for (;;).\n\nIn C89 the loop variable cannot be declared inside the parentheses: declare int i; at the top of the block. for (int i = 0; ...) is C99.\n\nThe usual way to walk an array of n elements is for (i = 0; i < n; i++). Writing i <= n reads one element past the end, the most common off-by-one error. A stray semicolon after the closing parenthesis makes the loop body empty.',
    example: `#include <stdio.h>

int main(void)
{
    int squares[5];
    int i;

    for (i = 0; i < 5; i++)
        squares[i] = i * i;
    for (i = 4; i >= 0; i--)
        printf("%d ", squares[i]);
    printf("\\n");
    return 0;
}
`,
    see: ['while', 'do', 'break', 'continue', ','],
  },
  goto: {
    group: 'Keywords', kind: 'keyword',
    sig: 'goto label;  ...  label: statement',
    text: 'goto jumps to a label in the same function. A label is a name followed by a colon in front of a statement.\n\nUsed freely, goto makes code hard to follow, and loops and functions are almost always clearer. The accepted uses in C are leaving several nested loops at once and jumping to a single clean-up section at the end of a function that frees what was allocated.\n\nJumping into a block past the initialisation of its variables leaves them uninitialised.',
    example: `#include <stdio.h>

int main(void)
{
    int grid[3][3] = { { 1, 2, 3 }, { 4, 5, 6 }, { 7, 8, 9 } };
    int r, c;

    for (r = 0; r < 3; r++)
        for (c = 0; c < 3; c++)
            if (grid[r][c] == 5)
                goto found;
    printf("not found\\n");
    return 0;
found:
    printf("5 is at row %d, column %d\\n", r, c);
    return 0;
}
`,
    see: ['break', 'return', 'longjmp'],
  },
  if: {
    group: 'Keywords', kind: 'keyword',
    sig: 'if (expression) statement [else statement]',
    text: 'if runs its statement only when the expression is true, which in C means not zero. Any scalar works as a condition: if (p) tests a pointer for NULL, if (n) tests a number for zero.\n\nThe classic trap is if (x = 5), an assignment that is always true, instead of if (x == 5). See warns about it. Another is a semicolon right after the parenthesis, if (x > 0);, which ends the if with an empty statement.\n\nTo run several statements, wrap them in braces.',
    example: `#include <stdio.h>

int main(void)
{
    int n = 7;

    if (n % 2 == 0)
        printf("%d is even\\n", n);
    else
        printf("%d is odd\\n", n);
    if (n)
        printf("%d is not zero\\n", n);
    return 0;
}
`,
    see: ['else', '==', '?:', '&&'],
  },
  int: {
    group: 'Keywords', kind: 'keyword',
    sig: 'int name;  short int, long int, unsigned int',
    text: 'int is the natural integer type of the machine, the one arithmetic is done in. Here it is 4 bytes, from INT_MIN (-2147483648) to INT_MAX (2147483647). The standard only guarantees 16 bits.\n\nint also combines with other keywords: short, long, signed and unsigned may be written with or without int (unsigned is unsigned int). Smaller types such as char and short are promoted to int before arithmetic.\n\nSigned overflow, going past INT_MAX, is undefined behaviour. Integer division truncates toward zero: 7 / 2 is 3 and -7 / 2 is -3.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    int a = 7, b = 2;

    printf("%d / %d = %d, remainder %d\\n", a, b, a / b, a % b);
    printf("an int is %d bytes, up to %d\\n", (int)sizeof(int), INT_MAX);
    return 0;
}
`,
    see: ['INT_MAX', 'long', 'short', 'unsigned', 'integer promotion'],
  },
  long: {
    group: 'Keywords', kind: 'keyword',
    sig: 'long name;  long int name;  unsigned long name;  long double name;',
    text: 'long (long int) is an integer type at least 32 bits wide. On this machine it is 4 bytes, the same as int; on many 64-bit systems it is 8. long long does not exist in C89.\n\nLong constants carry an L suffix (100000L), printf prints longs with %ld (and unsigned long with %lu), and scanf reads them with %ld. Mixing these up prints garbage on machines where long and int differ.\n\nlong double is a separate floating type, here the same as double.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    long big = 123456789L;
    unsigned long u = 4000000000UL;

    printf("%ld and %lu; LONG_MAX = %ld\\n", big, u, LONG_MAX);
    return 0;
}
`,
    see: ['int', 'LONG_MAX', 'short', 'unsigned'],
  },
  register: {
    group: 'Keywords', kind: 'keyword',
    sig: 'register type name;',
    text: 'register asks the compiler to keep a local variable in a processor register for speed. Modern compilers choose registers better themselves and mostly ignore the hint.\n\nOne rule remains: you cannot take the address of a register variable, so &x is an error. It may only be used for local variables and parameters.',
    example: `#include <stdio.h>

int main(void)
{
    register int i;
    long sum = 0;

    for (i = 1; i <= 100; i++)
        sum += i;
    printf("1 + ... + 100 = %ld\\n", sum);
    return 0;
}
`,
    see: ['auto', 'storage duration', 'unary &'],
  },
  return: {
    group: 'Keywords', kind: 'keyword',
    sig: 'return;  return expression;',
    text: 'return ends the current function and hands a value back to the caller, converted to the function\'s return type. A void function uses return; with no value, or simply runs off its end.\n\nA non-void function that ends without returning a value gives the caller garbage if it uses the result. Returning from main ends the program: return 0; means success, the same as exit(0).\n\nNever return the address of a local variable: its stack frame disappears when the function returns, leaving a dangling pointer. In See you can watch the frame vanish from the memory picture.',
    example: `#include <stdio.h>

static int max(int a, int b)
{
    if (a > b)
        return a;
    return b;
}

int main(void)
{
    printf("max(3, 8) = %d\\n", max(3, 8));
    return 0;
}
`,
    see: ['void', 'exit', 'stack frame', 'dangling pointer'],
  },
  short: {
    group: 'Keywords', kind: 'keyword',
    sig: 'short name;  short int name;  unsigned short name;',
    text: 'short (short int) is an integer type at least 16 bits wide; here it is 2 bytes, from -32768 to 32767.\n\nShorts are promoted to int in every expression, so they only save memory, mostly in large arrays or structures. printf prints them with %d (the promotion makes that correct); scanf needs %hd.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    short s = SHRT_MAX;
    unsigned short u = 65535;

    printf("short %d, unsigned short %u, %d bytes each\\n", s, (unsigned)u, (int)sizeof(short));
    return 0;
}
`,
    see: ['int', 'SHRT_MAX', 'integer promotion'],
  },
  signed: {
    group: 'Keywords', kind: 'keyword',
    sig: 'signed char c;  signed int n;',
    text: 'signed makes an integer type able to hold negative values. Every integer type except char is already signed by default, so the keyword matters mainly for signed char: plain char may be either signed or unsigned depending on the implementation.\n\nOn its own, signed means signed int. Signed values here are stored in two\'s complement.',
    example: `#include <stdio.h>

int main(void)
{
    signed char c = -5;
    signed n = -100;

    printf("%d %d\\n", c, n);
    return 0;
}
`,
    see: ['unsigned', 'char', "two's complement"],
  },
  sizeof: {
    group: 'Keywords', kind: 'keyword',
    sig: 'sizeof expression  sizeof(type)',
    text: 'sizeof is the keyword for the operator that gives the size in bytes of a type or object, as a size_t, computed at compile time. With a type name the parentheses are required: sizeof(int). With an expression they are optional: sizeof x.\n\nSee the entry "sizeof operator" for the details and the classic trap with arrays passed to functions.',
    example: `#include <stdio.h>

int main(void)
{
    double values[10];

    printf("sizeof(double) = %lu, sizeof values = %lu\\n", (unsigned long)sizeof(double), (unsigned long)sizeof values);
    return 0;
}
`,
    see: ['sizeof operator', 'size_t'],
  },
  static: {
    group: 'Keywords', kind: 'keyword',
    sig: 'static type name;  static type function(...)',
    text: 'static has two meanings depending on where it is used.\n\nInside a function, it gives a local variable static storage duration: it is created once, before the program starts, keeps its value between calls, and is initialised to zero unless given another value. Its name is still only visible inside the function. In See\'s memory picture it lives with the globals, not in the stack frame.\n\nOutside any function, on a variable or function, static gives internal linkage: the name is private to this source file, invisible to the linker and to other files. Making every helper function static that is not needed elsewhere is good practice.\n\nA function returning a pointer to a static local array (as asctime does) is safe, but the next call overwrites the contents.',
    example: `#include <stdio.h>

static int next_id(void)
{
    static int id = 0;

    id++;
    return id;
}

int main(void)
{
    int a = next_id();
    int b = next_id();
    int c = next_id();

    printf("%d %d %d\\n", a, b, c);
    return 0;
}
`,
    see: ['extern', 'storage duration', 'linkage', 'scope'],
  },
  struct: {
    group: 'Keywords', kind: 'keyword',
    sig: 'struct tag { type member; ... };  struct tag name;',
    text: 'struct groups several values of possibly different types into one object, like a record. Each member has its own name and its own place in memory, in the order declared, with possible padding between them for alignment.\n\nMembers are reached with the dot operator on a structure (p.x) and with the arrow operator through a pointer (ptr->x). Structures can be assigned with = and passed to and returned from functions by value, which copies every byte; large ones are usually passed by pointer instead. They cannot be compared with ==.\n\nThe tag name lives in its own name space, so the type is written struct point. typedef struct point Point; gives it a one-word name. In See\'s memory picture a structure is shown as one box with its members inside.',
    example: `#include <stdio.h>

struct point {
    int x;
    int y;
};

static void move(struct point *p, int dx, int dy)
{
    p->x += dx;
    p->y += dy;
}

int main(void)
{
    struct point a = { 1, 2 };
    struct point b;

    b = a;
    move(&b, 10, 10);
    printf("a = (%d, %d), b = (%d, %d), %d bytes each\\n", a.x, a.y, b.x, b.y, (int)sizeof a);
    return 0;
}
`,
    see: ['union', 'typedef', '.', '->', 'alignment and padding', 'offsetof'],
  },
  switch: {
    group: 'Keywords', kind: 'keyword',
    sig: 'switch (integer-expression) { case constant: ... default: ... }',
    text: 'switch evaluates an integer expression and jumps to the case label with the same value, or to default if none matches. The expression must have an integer type (char and enums count); strings and doubles are not allowed.\n\nAfter the jump, execution carries on through the following cases until a break or the end of the switch. Forgetting a break is the classic switch bug; when falling through is intended, a comment saying so helps the reader.\n\nA switch is often clearer than a chain of else if when one value is compared against many constants.',
    example: `#include <stdio.h>

int main(void)
{
    const char *ops = "+-*/";
    int i, a = 12, b = 4, r;

    for (i = 0; ops[i] != '\\0'; i++) {
        switch (ops[i]) {
        case '+': r = a + b; break;
        case '-': r = a - b; break;
        case '*': r = a * b; break;
        case '/': r = a / b; break;
        default: r = 0;
        }
        printf("%d %c %d = %d\\n", a, ops[i], b, r);
    }
    return 0;
}
`,
    see: ['case', 'default', 'break', 'if'],
  },
  typedef: {
    group: 'Keywords', kind: 'keyword',
    sig: 'typedef existing-type new_name;',
    text: 'typedef gives a new name to an existing type. It does not create a new type: the new name and the old one are interchangeable.\n\nIt is written like a variable declaration with typedef in front, and the name being declared becomes the type name: typedef unsigned char byte; typedef int (*compare_fn)(const void *, const void *);. That makes it the easiest way to tame function pointer types.\n\nThe library uses it for size_t, time_t, FILE and others, so the real type can differ between machines without changing programs.',
    example: `#include <stdio.h>

typedef struct {
    double re;
    double im;
} Complex;

typedef int (*BinaryOp)(int, int);

static int add(int a, int b) { return a + b; }

int main(void)
{
    Complex z = { 1.5, -2.0 };
    BinaryOp op = add;

    printf("z = %g%+gi, op(2, 3) = %d\\n", z.re, z.im, op(2, 3));
    return 0;
}
`,
    see: ['struct', 'size_t', 'enum'],
  },
  union: {
    group: 'Keywords', kind: 'keyword',
    sig: 'union tag { type member; ... };',
    text: 'union is declared like a struct, but all its members share the same memory, starting at the same address. Its size is that of its largest member (plus any padding). Storing into one member overwrites the others.\n\nA union can hold one of several kinds of value at a time; programs usually pair it with a separate field that records which member is in use. Reading a member other than the one last written is implementation-defined; in practice it shows the same bytes reinterpreted, which is a way to look at how a float or int is stored.',
    example: `#include <stdio.h>

union word {
    unsigned int whole;
    unsigned char bytes[4];
};

int main(void)
{
    union word w;

    w.whole = 0x11223344u;
    printf("size %d; bytes in memory: %02x %02x %02x %02x\\n", (int)sizeof w, w.bytes[0], w.bytes[1], w.bytes[2], w.bytes[3]);
    return 0;
}
`,
    see: ['struct', 'endianness'],
  },
  unsigned: {
    group: 'Keywords', kind: 'keyword',
    sig: 'unsigned int n;  unsigned char c;  unsigned long u;',
    text: 'unsigned makes an integer type hold only non-negative values, using the sign bit for magnitude instead: an unsigned int here runs from 0 to 4294967295. On its own, unsigned means unsigned int. Unsigned constants carry a U suffix.\n\nUnsigned arithmetic never overflows; it wraps around: 0u - 1 is UINT_MAX. That is well defined and useful for hashing and bit manipulation, but a trap in loops that count down, and in comparisons: when an int meets an unsigned int, the int is converted to unsigned, so -1 < 1u is false.\n\nprintf prints unsigned values with %u, %lu, %x or %o.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned int u = 0;
    int i = -1;

    u = u - 1;
    printf("0 - 1 as unsigned = %u\\n", u);
    printf("-1 < 1u is %s\\n", (unsigned)i < 1u ? "true" : "false");
    return 0;
}
`,
    see: ['signed', 'UINT_MAX', 'usual arithmetic conversions', 'size_t'],
  },
  void: {
    group: 'Keywords', kind: 'keyword',
    sig: 'void f(void);  void *p;  (void)expression;',
    text: 'void means "no type" and has three uses.\n\nAs a return type, the function returns nothing. As a parameter list, f(void), the function takes no arguments; in C89 an empty list f() means "arguments not specified", which turns off argument checking, so write void.\n\nvoid * is the generic pointer type: any object pointer converts to and from it without a cast. malloc returns one, and qsort and memcpy take them. A void * cannot be dereferenced or used in pointer arithmetic until it is converted to a real pointer type. Finally, casting an expression to (void) discards its value on purpose.',
    example: `#include <stdio.h>
#include <string.h>

static void greet(void)
{
    printf("hello\\n");
}

int main(void)
{
    int a[3] = { 1, 2, 3 }, b[3];
    void *p = b;

    greet();
    memcpy(p, a, sizeof a);
    (void)printf("b[2] = %d\\n", b[2]);
    return 0;
}
`,
    see: ['pointer', 'malloc', 'return', '(type)'],
  },
  volatile: {
    group: 'Keywords', kind: 'keyword',
    sig: 'volatile type name;',
    text: 'volatile tells the compiler that a variable can change in ways it cannot see, so every read must really read memory and every write must really write it, in the order written. Without it, an optimiser may keep the value in a register and never notice the change.\n\nIn standard C it matters for variables changed by a signal handler (volatile sig_atomic_t), for local variables changed between setjmp and longjmp, and for memory-mapped hardware registers. It does not make anything thread-safe.',
    example: `#include <stdio.h>
#include <signal.h>

static volatile sig_atomic_t flag = 0;

static void handler(int sig)
{
    (void)sig;
    flag = 1;
}

int main(void)
{
    signal(SIGINT, handler);
    raise(SIGINT);
    printf("flag = %d\\n", (int)flag);
    return 0;
}
`,
    see: ['const', 'sig_atomic_t', 'setjmp'],
  },
  while: {
    group: 'Keywords', kind: 'keyword',
    sig: 'while (expression) statement',
    text: 'while repeats its statement as long as the expression is true, testing before each pass; if it is false at the start, the body never runs.\n\nSomething in the body must eventually make the condition false, or the loop never ends; in See the Stop button halts a runaway program. A semicolon straight after the parenthesis, while (x > 0);, is an empty loop body and often an infinite loop.\n\nThe idiom for reading input is while ((c = getchar()) != EOF), with c an int.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned n = 27;
    int steps = 0;

    while (n != 1) {
        n = (n % 2 == 0) ? n / 2 : 3 * n + 1;
        steps++;
    }
    printf("27 reaches 1 after %d steps\\n", steps);
    return 0;
}
`,
    see: ['do', 'for', 'break', 'continue'],
  },
});
