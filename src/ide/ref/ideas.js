/* The C reference: the ideas behind C */
SEE.RefText = Object.assign(SEE.RefText || {}, {
  'stack frame': {
    group: 'Ideas',
    text: 'Every time a function is called, it gets a stack frame: a block of memory on the stack holding its parameters, its local variables, and the bookkeeping needed to go back: the return address (where in the caller to continue) and the caller\'s saved frame pointer. When the function returns, its frame is popped and that memory is reused by the next call.\n\nThe stack grows downward on this machine, from high addresses to low. In See\'s memory picture the stack is on the left, with main\'s frame at the top and the function running now at the bottom. Each frame shows its variables at their real addresses, plus the "return to" and saved frame pointer cells. Click a frame to look at the variables of a caller.\n\nThis explains several rules of C. Local variables start with garbage because the frame reuses old memory. A pointer to a local variable becomes invalid when the function returns. Recursion works because each call has its own frame with its own copies of the variables, and recursion that never stops runs out of stack: a stack overflow.',
    example: `#include <stdio.h>

static int factorial(int n)
{
    int result;

    if (n <= 1)
        result = 1;
    else
        result = n * factorial(n - 1);
    printf("frame for n = %d returns %d\\n", n, result);
    return result;
}

int main(void)
{
    printf("4! = %d\\n", factorial(4));
    return 0;
}
`,
    see: ['heap', 'storage duration', 'dangling pointer', '()', 'return'],
  },
  heap: {
    group: 'Ideas',
    text: 'The heap is the area of memory that malloc, calloc and realloc hand out and free gives back. Unlike a local variable, a heap block lives until you free it, no matter which function created it, and its size can be decided while the program runs.\n\nIn See\'s memory picture each heap block is a numbered box showing its size, which function allocated it and on which line, and its contents. A pointer to the block is drawn as an arrow. Freed blocks are shown greyed out, and blocks still allocated when the program ends are marked as leaks.\n\nThe responsibilities are all yours: check that malloc did not return NULL, never use more bytes than you asked for, free each block exactly once, and do not touch it after freeing it. Breaking these rules gives buffer overflows, memory leaks, double frees and dangling pointers, all of which See detects and reports.',
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int n = 5, i;
    int *squares = malloc(n * sizeof *squares);

    if (squares == NULL)
        return 1;
    for (i = 0; i < n; i++)
        squares[i] = i * i;
    for (i = 0; i < n; i++)
        printf("%d ", squares[i]);
    printf("\\n");
    free(squares);
    return 0;
}
`,
    see: ['malloc', 'free', 'stack frame', 'memory leak', 'dangling pointer'],
  },
  pointer: {
    group: 'Ideas',
    text: 'A pointer is a variable that holds the address of another object. int *p declares p as a pointer to int; p = &x makes it point at x; *p then is x, for reading and writing. On this machine every pointer is 4 bytes.\n\nPointers let a function change its caller\'s variables (pass &x), let programs build linked structures, and give access to heap memory, which has no name of its own. They also walk through arrays: p + 1 points to the next element, however big an element is.\n\nA pointer that points nowhere should hold NULL. One that was never set holds garbage, and one whose object has gone (freed, or a local whose function returned) is dangling; using either is undefined behaviour. In See\'s memory picture every pointer is drawn as an arrow to the box it points into, which makes all of this visible.',
    example: `#include <stdio.h>

static void double_it(int *p)
{
    *p = *p * 2;
}

int main(void)
{
    int x = 21;
    int *p = &x;
    int a[3] = { 10, 20, 30 };
    int *q = a;

    double_it(p);
    printf("x = %d, *p = %d\\n", x, *p);
    q++;
    printf("q now points at %d, %d elements into a\\n", *q, (int)(q - a));
    return 0;
}
`,
    see: ['unary &', 'unary *', 'NULL', 'array decay', 'dangling pointer', '->'],
  },
  'array decay': {
    group: 'Ideas',
    text: 'In almost every expression, the name of an array is converted to a pointer to its first element. That conversion is called decay. So a, used as a value, means &a[0], and a[i] is really *(a + i).\n\nThe three exceptions are sizeof a (the size of the whole array), &a (a pointer to the whole array) and a string literal initialising a char array.\n\nDecay is why you cannot pass an array to a function: the function receives only a pointer, and a parameter written int a[] is really int *a. The function cannot know the length, so sizeof inside it gives the size of a pointer; pass the length as another argument. It is also why an array cannot be assigned or returned, and why changing a[i] inside a function changes the caller\'s array.',
    example: `#include <stdio.h>

static int sum(const int a[], int n)
{
    int i, s = 0;

    for (i = 0; i < n; i++)
        s += a[i];
    return s;
}

int main(void)
{
    int v[4] = { 1, 2, 3, 4 };
    int *p = v;

    printf("sizeof v = %d, sizeof p = %d\\n", (int)sizeof v, (int)sizeof p);
    printf("v == &v[0]: %d\\n", v == &v[0]);
    printf("sum = %d\\n", sum(v, (int)(sizeof v / sizeof v[0])));
    return 0;
}
`,
    see: ['pointer', '[]', 'sizeof operator'],
  },
  'string literal': {
    group: 'Ideas',
    text: 'A string literal, "like this", is an array of characters with a NUL byte added at the end, stored for the whole life of the program. "abc" occupies 4 bytes.\n\nModifying a string literal is undefined behaviour. In See literals live in read-only memory (shown in the read-only data area of the memory picture), so char *s = "abc"; s[0] = \'X\'; stops the program. To get a string you can change, copy it into an array: char s[] = "abc"; makes a 4-byte array initialised from the literal. Declaring literal pointers as const char * lets the compiler catch mistakes.\n\nAdjacent literals are joined at compile time: "ab" "cd" is "abcd", useful for splitting long strings across lines. Escape sequences such as \\n, \\t, \\" and \\\\ write characters that cannot be typed directly.',
    example: `#include <stdio.h>

int main(void)
{
    const char *p = "read-only";
    char a[] = "changeable";

    a[0] = 'C';
    printf("%s / %s\\n", p, a);
    printf("sizeof \\"abc\\" = %d\\n", (int)sizeof "abc");
    printf("joined: %s\\n", "con" "cat" "enated");
    return 0;
}
`,
    see: ['NUL terminator', 'const', 'char', 'array decay'],
  },
  'NUL terminator': {
    group: 'Ideas',
    text: 'C strings have no stored length. A string is a sequence of characters ending with the NUL character, \'\\0\', the byte with value 0. Every string function relies on it: strlen counts up to it, printf("%s") prints up to it, strcpy copies up to and including it.\n\nSo a string of n characters needs an array of n + 1 bytes. Forgetting the extra byte, or building a string by hand without adding the \'\\0\', makes the functions run past the end of the array, reading or writing memory that belongs to something else. strncpy is a known trap: if the source is too long it does not add the terminator.\n\nNUL (the character) is not NULL (the null pointer), although both are zero. In See\'s memory picture a char array shows each byte, and the terminator appears as \\0.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char word[6];

    word[0] = 'h';
    word[1] = 'e';
    word[2] = 'l';
    word[3] = 'l';
    word[4] = 'o';
    word[5] = '\\0';
    printf("%s has length %d and needs %d bytes\\n", word, (int)strlen(word), (int)sizeof word);
    word[2] = '\\0';
    printf("cut short: %s\\n", word);
    return 0;
}
`,
    see: ['string literal', 'strlen', 'strncpy', 'buffer overflow', 'NULL'],
  },
  'undefined behaviour': {
    group: 'Ideas',
    text: 'Undefined behaviour is what the C standard calls a program that breaks one of its rules in a way the compiler is not required to catch. The standard then places no requirements at all: the program may crash, print nonsense, appear to work, or work today and fail after a small change.\n\nThe common causes: reading or writing outside an array, dereferencing NULL or a dangling pointer, using an uninitialised variable, signed integer overflow, dividing by zero, modifying a string literal, modifying a variable twice between sequence points (i = i++), and passing printf a value that does not match its format.\n\nOn a real machine many of these go unnoticed and cause bugs far away from their origin. See checks for most of them while the program runs and stops at the line responsible, explaining what went wrong, which is much easier to learn from. A program that runs correctly in See has passed those checks, but the habit to build is to never rely on what an undefined operation happened to do.',
    example: `#include <stdio.h>
#include <limits.h>

int main(void)
{
    int a[4] = { 1, 2, 3, 4 };
    int i = 4, x = INT_MAX;

    if (i >= 0 && i < 4)
        printf("a[%d] = %d\\n", i, a[i]);
    else
        printf("index %d is outside a[4]; reading it would be undefined\\n", i);
    if (x < INT_MAX)
        x = x + 1;
    else
        printf("x + 1 would overflow; that would be undefined too\\n");
    return 0;
}
`,
    see: ['buffer overflow', 'dangling pointer', 'sequence point', 'INT_MAX'],
  },
  'integer promotion': {
    group: 'Ideas',
    text: 'Before arithmetic, C converts small integer types to int: char, signed char, unsigned char, short and unsigned short (and bit-fields and enums) all become int, because int can hold all their values here. This is the integer promotion.\n\nSo c + 1 with a char c is an int, \'a\' * 2 does not overflow a char, and sizeof(c + c) is 4. The result is converted back only when you store it into a smaller variable.\n\nThe same promotion happens to arguments of a function declared with ..., such as printf: a char or short arrives as int and a float as double. That is why %d prints a char and why va_arg must ask for int, never char.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned char a = 200, b = 100;
    unsigned char c;
    int sum;

    sum = a + b;
    c = (unsigned char)(a + b);
    printf("a + b = %d as int, %d stored back in a char\\n", sum, c);
    printf("sizeof a = %d, sizeof(a + b) = %d\\n", (int)sizeof a, (int)sizeof(a + b));
    return 0;
}
`,
    see: ['usual arithmetic conversions', 'char', 'va_arg'],
  },
  'usual arithmetic conversions': {
    group: 'Ideas',
    text: 'When a binary operator such as +, <, or == has operands of different types, C converts them to a common type first. The rules, in order: if either is long double, both become long double; else if either is double, both become double; else if either is float, both become float. Otherwise both get the integer promotions, and then the "smaller" is converted to the "larger" of int, unsigned int, long and unsigned long.\n\nThe floating cases are what you would expect: 7 / 2.0 is done in double. The trap is signed against unsigned of the same size: the signed value is converted to unsigned. -1 becomes 4294967295, so -1 < 1u is false, and if (i < strlen(s)) misbehaves for negative i.\n\nThe conversion happens on the values, before the operation, and only for that expression.',
    example: `#include <stdio.h>

int main(void)
{
    int i = -1;
    unsigned u = 1;
    double d = 7 / 2;
    double e = 7 / 2.0;

    printf("7 / 2 = %g, 7 / 2.0 = %g\\n", d, e);
    printf("i < u is %d, because i becomes %u\\n", (unsigned)i < u, (unsigned)i);
    return 0;
}
`,
    see: ['integer promotion', 'unsigned', '(type)', '<'],
  },
  'sequence point': {
    group: 'Ideas',
    text: 'A sequence point is a moment in the execution of a program at which all side effects of earlier evaluations (assignments, increments, writes through pointers, output) are complete. There is one at the end of every full expression (each statement, each if or while condition), after the left operand of &&, || and the comma operator, after the condition of ?:, and just before a function is called, once its arguments are evaluated.\n\nBetween two sequence points, a variable may be modified at most once, and if it is modified, it may be read only to compute its new value. i = i++, a[i] = i++ and i++ + i++ break the rule and are undefined behaviour.\n\nThe order in which operands and function arguments are evaluated between sequence points is unspecified. printf("%d %d", f(), g()) may call g first. If the order matters, use separate statements.',
    example: `#include <stdio.h>

static int counter = 0;

static int next(void)
{
    return ++counter;
}

int main(void)
{
    int a, b, i = 0;

    a = next();
    b = next();
    printf("in order: %d %d\\n", a, b);
    i++;
    i = i * 10;
    printf("i = %d\\n", i);
    if (i > 5 && ++i > 10)
        printf("&& has a sequence point: i = %d\\n", i);
    return 0;
}
`,
    see: ['++', '&&', ',', '?:', 'undefined behaviour'],
  },
  lvalue: {
    group: 'Ideas',
    text: 'An lvalue is an expression that designates an object in memory, something that has an address: a variable name, a[i], *p, s.member, p->member. The name comes from being allowed on the left of an assignment.\n\nAssignment, ++, -- and the address-of operator & need an lvalue. 5 = x, (a + b) = 3, f() = 1 and &(x + 1) are all errors, because those expressions are just values with no storage.\n\nSome lvalues cannot be modified: a const variable, and an array name (you cannot assign to a whole array). The compiler reports these as an attempt to assign to a read-only or non-modifiable lvalue.',
    example: `#include <stdio.h>

struct pair {
    int a, b;
};

int main(void)
{
    int x = 1, arr[3] = { 0, 0, 0 };
    int *p = &arr[1];
    struct pair s;

    x = 2;
    arr[0] = 3;
    *p = 4;
    s.a = 5;
    s.b = x + arr[0];
    printf("%d %d %d %d %d\\n", x, arr[0], arr[1], s.a, s.b);
    return 0;
}
`,
    see: ['=', 'unary &', 'const'],
  },
  scope: {
    group: 'Ideas',
    text: 'The scope of a name is the part of the program text where it can be used. A name declared inside a block, between { and }, has block scope: it is visible from its declaration to the closing brace. A name declared outside all functions has file scope: it is visible from there to the end of the file. Function parameters have the scope of the function body, and labels (for goto) have function scope.\n\nAn inner declaration hides (shadows) an outer one with the same name until its block ends. That is legal but confusing; prefer different names.\n\nScope is about where a name is visible, not how long the object lives. A static local variable has block scope but lives for the whole program; see storage duration. Whether the same name in another file refers to the same object is linkage.',
    example: `#include <stdio.h>

int count = 100;

int main(void)
{
    int count = 1;

    printf("inner count: %d\\n", count);
    {
        int count = 2;

        printf("innermost count: %d\\n", count);
    }
    printf("back to: %d\\n", count);
    return 0;
}
`,
    see: ['linkage', 'storage duration', 'static', 'extern'],
  },
  linkage: {
    group: 'Ideas',
    text: 'Linkage decides whether the same name declared in different places, possibly in different source files, refers to the same object or function.\n\nExternal linkage: the name is shared across the whole program. Functions and file-scope variables have it by default, and extern declarations refer to it. Internal linkage: the name is private to one source file. static at file scope gives it, so two files can each have their own static int count without a clash. No linkage: local variables and parameters, which are unique to their block.\n\nThe linker joins external names after compiling each file. Two files defining the same external name give a "multiple definition" error, and a name declared but never defined gives "undefined reference".',
    example: `#include <stdio.h>

static int calls = 0;
int shared_total = 0;

static void helper(int n)
{
    calls++;
    shared_total += n;
}

int main(void)
{
    helper(5);
    helper(7);
    printf("calls %d (private to this file), total %d (visible to other files)\\n", calls, shared_total);
    return 0;
}
`,
    see: ['extern', 'static', 'scope', 'translation unit'],
  },
  'storage duration': {
    group: 'Ideas',
    text: 'The storage duration of an object is how long it exists. C89 has three kinds.\n\nAutomatic: local variables (without static) exist from entry to their block until it is left, in the function\'s stack frame. They start uninitialised. Static: global variables and static locals exist for the whole run of the program; they are initialised before main starts, to zero unless given another value. Allocated: blocks from malloc, calloc and realloc exist until free.\n\nIn See\'s memory picture these are three separate areas: the stack on the left, and on the right the heap and the "data and bss" area of globals and static locals. A pointer that outlives the object it points to (a returned address of a local, a freed block) is dangling.',
    example: `#include <stdio.h>
#include <stdlib.h>

int global_count;

static int *make(int v)
{
    int *p = malloc(sizeof *p);

    if (p != NULL)
        *p = v;
    return p;
}

int main(void)
{
    static int calls;
    int local = 5;
    int *h = make(42);

    if (h == NULL)
        return 1;
    printf("global %d, static local %d (both start at 0), local %d, heap %d\\n", global_count, calls, local, *h);
    free(h);
    return 0;
}
`,
    see: ['static', 'auto', 'heap', 'stack frame', 'scope'],
  },
  'translation unit': {
    group: 'Ideas',
    text: 'A translation unit is what the compiler actually compiles: one .c source file after the preprocessor has pasted in every #include and expanded every macro. Each translation unit is compiled separately into an object file, and the linker then combines them into one program.\n\nThat is why each .c file must include the headers it needs itself, why static names are private to one translation unit, and why a function used in another file must be declared there, usually through a shared header.\n\nIn See, a project with several .c files in a folder is built this way: each file compiled on its own, then linked together with the C library.',
    example: `#include <stdio.h>

static int helper(int x)
{
    return x * 3;
}

int main(void)
{
    printf("this file is one translation unit; helper(4) = %d\\n", helper(4));
    return 0;
}
`,
    see: ['header file', 'linkage', 'declaration versus definition'],
  },
  'header file': {
    group: 'Ideas',
    text: 'A header file (.h) holds declarations that several source files need to share: function prototypes, extern variable declarations, type definitions, struct declarations and macros. #include "file.h" pastes its text into the source file at that point; #include <file.h> does the same for system headers, which are found in /usr/include. In See you can open /usr/include/stdio.h and read it.\n\nA header should declare, not define: put int count; or a function body in a header that two .c files include, and the program gets two definitions. The usual guard against including the same header twice in one file is #ifndef NAME_H / #define NAME_H / ... / #endif around the contents.\n\nForgetting a standard header is a classic C89 bug: calling sqrt without <math.h> makes the compiler assume it returns int.',
    example: `#include <stdio.h>
#include <string.h>
#include <math.h>

int main(void)
{
    printf("strlen and sqrt are declared in <string.h> and <math.h>: %d %g\\n", (int)strlen("abc"), sqrt(16.0));
    return 0;
}
`,
    see: ['translation unit', 'declaration versus definition', 'extern'],
  },
  'declaration versus definition': {
    group: 'Ideas',
    text: 'A declaration tells the compiler that a name exists and what its type is. A definition also creates the thing: it allocates storage for a variable or provides the body of a function. Every definition is a declaration, but not the other way round.\n\nint square(int x); is a declaration (a prototype); int square(int x) { return x * x; } is a definition. extern int count; is a declaration; int count = 0; is a definition. struct point { int x, y; }; declares a type and creates no object.\n\nA name may be declared as many times as you like, consistently, but defined only once in the whole program (the one-definition rule). That is why declarations go in header files and definitions in exactly one .c file. A name used but never defined gives a link error.',
    example: `#include <stdio.h>

int square(int x);
extern int calls;

int main(void)
{
    printf("square(9) = %d\\n", square(9));
    printf("calls = %d\\n", calls);
    return 0;
}

int calls = 0;

int square(int x)
{
    calls++;
    return x * x;
}
`,
    see: ['header file', 'extern', 'linkage', 'translation unit'],
  },
  endianness: {
    group: 'Ideas',
    text: 'A value wider than one byte is stored in several consecutive bytes, and endianness is the order they go in. A little-endian machine stores the least significant byte at the lowest address; a big-endian machine stores the most significant byte first. The machine See simulates is little-endian, like x86 and most ARM systems: the int 0x11223344 sits in memory as 44 33 22 11.\n\nIt does not matter for arithmetic, only when the same memory is looked at as bytes: writing an int to a file with fwrite and reading it on a machine of the other kind, sending numbers over a network, or inspecting memory through an unsigned char pointer. Portable code builds multi-byte values from bytes with shifts.\n\nIn See, the bytes panel shows the raw bytes of memory while a program is paused, lowest address first, so an int appears there in little-endian order.',
    example: `#include <stdio.h>

int main(void)
{
    unsigned int x = 0x11223344u;
    unsigned char *b = (unsigned char *)&x;
    int i;

    printf("0x%X in memory, lowest address first:", x);
    for (i = 0; i < (int)sizeof x; i++)
        printf(" %02X", b[i]);
    printf("\\n%s-endian\\n", b[0] == 0x44 ? "little" : "big");
    return 0;
}
`,
    see: ['union', '<<', 'fwrite'],
  },
  'alignment and padding': {
    group: 'Ideas',
    text: 'Most types must be stored at an address that is a multiple of some number, their alignment: here an int or pointer at a multiple of 4, a double at a multiple of 8, a char anywhere. Accessing misaligned data is slow or impossible on many processors.\n\nTo keep every member of a structure aligned, the compiler inserts unused padding bytes between members, and at the end so that arrays of the structure stay aligned too. struct { char c; double d; } takes 16 bytes, not 9: 7 padding bytes follow c.\n\nSo sizeof a structure can be larger than the sum of its members, offsetof gives the true positions, and ordering members from largest to smallest often saves space. Never compare structures with memcmp: the padding bytes hold garbage. In See\'s memory picture the padding shows as gaps between the fields of a structure, and the bytes panel shows every byte of it, padding included.',
    example: `#include <stdio.h>
#include <stddef.h>

struct loose {
    char a;
    double d;
    char b;
};

struct tight {
    double d;
    char a;
    char b;
};

int main(void)
{
    printf("loose: %d bytes (d at offset %d)\\n", (int)sizeof(struct loose), (int)offsetof(struct loose, d));
    printf("tight: %d bytes\\n", (int)sizeof(struct tight));
    return 0;
}
`,
    see: ['offsetof', 'struct', 'sizeof operator'],
  },
  "two's complement": {
    group: 'Ideas',
    text: 'Two\'s complement is the way virtually every machine, including the one See simulates, stores signed integers. The top bit has a negative weight: in 8 bits, 10000000 is -128 and 11111111 is -1. To negate a number, invert all its bits and add 1, which is why ~x == -x - 1.\n\nThe range is lopsided: an n-bit signed type runs from -2 to the n-1 up to 2 to the n-1 minus 1, so a 32-bit int goes from -2147483648 to 2147483647, and -INT_MIN does not fit.\n\nThe same bit pattern means different numbers as signed and as unsigned: 0xFFFFFFFF is -1 as an int and 4294967295 as an unsigned int. Conversions between them keep the bits, which is why -1 converted to unsigned is UINT_MAX. C89 itself also allowed one\'s complement and sign-magnitude machines, but they are long gone.',
    example: `#include <stdio.h>

int main(void)
{
    signed char values[] = { 0, 1, 127, -1, -128 };
    int i, bit;

    for (i = 0; i < 5; i++) {
        printf("%5d = ", values[i]);
        for (bit = 7; bit >= 0; bit--)
            putchar(((unsigned char)values[i] >> bit) & 1 ? '1' : '0');
        printf("\\n");
    }
    printf("~5 = %d, -1 as unsigned = %u\\n", ~5, (unsigned)-1);
    return 0;
}
`,
    see: ['INT_MIN', '~', 'unsigned', 'signed'],
  },
  'buffer overflow': {
    group: 'Ideas',
    text: 'A buffer overflow is writing (or reading) past the end of an array: a[10] in an array of 10, copying a 20-character string into char name[16], or a loop that runs with i <= n. C does not check array bounds, so on a real machine the bytes land in whatever comes next in memory: other variables, the saved return address in the stack frame, or the heap\'s own bookkeeping.\n\nThe effects range from wrong values far from the bug to crashes, and overflows of the stack are a classic security hole, because overwriting the return address can redirect the program.\n\nThe defences: always know the size of the destination and pass it along (fgets(buf, sizeof buf, stdin) rather than gets, strncpy or a length check rather than a blind strcpy, sprintf only with formats whose output you have measured). See checks every access and stops at the first one outside its array, naming the array and its valid range.',
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char name[8];
    const char *input = "Bartholomew";

    if (strlen(input) < sizeof name) {
        strcpy(name, input);
    } else {
        strncpy(name, input, sizeof name - 1);
        name[sizeof name - 1] = '\\0';
    }
    printf("stored safely: \\"%s\\" (the input had %d characters)\\n", name, (int)strlen(input));
    return 0;
}
`,
    see: ['NUL terminator', 'strcpy', 'strncpy', 'fgets', 'gets', '[]'],
  },
  'memory leak': {
    group: 'Ideas',
    text: 'A memory leak is heap memory that is never freed after the program has finished with it. Usually the last pointer to the block is overwritten or goes out of scope, so the block can no longer even be freed.\n\nOne leak in a short program does no harm, since the operating system reclaims everything at exit. But a leak inside a loop or a long-running program grows until memory runs out. Typical causes: an early return or error path that skips the free, p = realloc(p, n) losing the old block when it fails, and freeing a structure without first freeing the blocks it points to.\n\nWhen a program ends, See lists every block that was never freed, with its size and the line that allocated it, and marks them in the heap area of the memory picture.',
    example: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static char *copy_of(const char *s)
{
    char *p = malloc(strlen(s) + 1);

    if (p != NULL)
        strcpy(p, s);
    return p;
}

int main(void)
{
    int i;
    char *s;

    for (i = 0; i < 3; i++) {
        s = copy_of("temporary");
        if (s == NULL)
            return 1;
        printf("%d: %s\\n", i, s);
        free(s);
    }
    printf("every block freed: no leak\\n");
    return 0;
}
`,
    see: ['heap', 'malloc', 'free', 'realloc', 'dangling pointer'],
  },
  'dangling pointer': {
    group: 'Ideas',
    text: 'A dangling pointer is one that still holds the address of an object that no longer exists. The two usual ways to get one: freeing a heap block and then using a pointer to it (use after free, or freeing it twice), and returning the address of a local variable from a function, whose stack frame is gone once it returns.\n\nThe pointer itself looks perfectly normal, and on a real machine the old memory often still holds the old values for a while, so the bug can hide until that memory is reused. Then a write through the pointer corrupts a different object.\n\nSetting a pointer to NULL right after free(p) turns later mistakes into an obvious NULL dereference. See tracks every block and frame, and stops with "use after free" or a similar message the moment a dangling pointer is used.',
    example: `#include <stdio.h>
#include <stdlib.h>

static int *make_counter(void)
{
    int *p = malloc(sizeof *p);

    if (p != NULL)
        *p = 0;
    return p;
}

int main(void)
{
    int *c = make_counter();

    if (c == NULL)
        return 1;
    (*c)++;
    printf("counter = %d\\n", *c);
    free(c);
    c = NULL;
    if (c == NULL)
        printf("freed, and the pointer cleared so it cannot dangle\\n");
    return 0;
}
`,
    see: ['free', 'stack frame', 'heap', 'NULL', 'pointer'],
  },
});
