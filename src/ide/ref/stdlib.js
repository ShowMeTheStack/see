// Reference texts for <stdlib.h>.
SEE.RefText = Object.assign(SEE.RefText || {}, {
  div_t: {
    header: 'stdlib.h',
    kind: 'type',
    sig: 'typedef struct { int quot; int rem; } div_t;',
    text: `The structure returned by div: quot holds the quotient and rem the remainder of an int division. The order of the two members is not fixed by the standard, so use the names, never a position.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    div_t r;

    r = div(17, 5);
    printf("17 = 5 * %d + %d\\n", r.quot, r.rem);
    return 0;
}
`,
    see: ['div', 'ldiv_t', 'ldiv'],
  },
  ldiv_t: {
    header: 'stdlib.h',
    kind: 'type',
    sig: 'typedef struct { long quot; long rem; } ldiv_t;',
    text: `The structure returned by ldiv: quot holds the quotient and rem the remainder of a long division, just like div_t does for int.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    ldiv_t r;

    r = ldiv(1000000L, 7L);
    printf("quot %ld rem %ld\\n", r.quot, r.rem);
    return 0;
}
`,
    see: ['ldiv', 'div_t'],
  },
  wchar_t: {
    text: `An integer type big enough to hold any character code of the largest character set the system supports. A wide character constant such as L'x' has this type, and a wide string literal L"abc" is an array of it.\n\nHere wchar_t is long (4 bytes). Only the "C" locale exists in See, where every character is one byte, so the multibyte functions (mbtowc, mbstowcs and the rest) simply copy bytes to wchar_t values and back. The type is also defined in stddef.h.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    wchar_t w[8];
    size_t n;

    n = mbstowcs(w, "hey", 8);
    printf("%d wide characters, first %ld, size %d bytes each\\n", (int)n, (long)w[0], (int)sizeof(wchar_t));
    return 0;
}
`,
    see: ['mbtowc', 'mbstowcs', 'MB_CUR_MAX'],
  },
  EXIT_SUCCESS: {
    text: `The status to pass to exit, or return from main, to report that the program succeeded. Here it is 0, and exit(0) means the same thing.\n\nThe shell, a script or a build tool that ran the program sees this status. See shows it in the terminal when the program ends.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    printf("all done\\n");
    return EXIT_SUCCESS;
}
`,
    see: ['EXIT_FAILURE', 'exit'],
  },
  EXIT_FAILURE: {
    text: `The status to pass to exit, or return from main, to report that the program failed. Here it is 1. Any non-zero status means failure to most shells, but EXIT_FAILURE is the portable spelling.\n\nA typical use is giving up when a file cannot be opened or memory cannot be allocated, after printing a message to stderr.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/no/such/file.txt", "r");
    if (fp == NULL) {
        printf("cannot open the file, exiting with %d\\n", EXIT_FAILURE);
        return EXIT_FAILURE;
    }
    fclose(fp);
    return EXIT_SUCCESS;
}
`,
    see: ['EXIT_SUCCESS', 'exit', 'abort'],
  },
  RAND_MAX: {
    text: `The largest value rand can return. The standard only promises at least 32767, which is exactly its value here, so rand gives numbers from 0 to 32767.\n\nTo get a double between 0 and 1, divide: rand() / (RAND_MAX + 1.0). Use 1.0 so the division is done in floating point; rand() / RAND_MAX in int arithmetic is almost always 0.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    double x;

    srand(7);
    x = rand() / (RAND_MAX + 1.0);
    printf("RAND_MAX is %d, x = %f\\n", RAND_MAX, x);
    return 0;
}
`,
    see: ['rand', 'srand'],
  },
  MB_CUR_MAX: {
    text: `The largest number of bytes one multibyte character can take in the current locale. It is an expression, not necessarily a constant, because it can change with setlocale. In See only the "C" locale exists and every character is one byte, so MB_CUR_MAX is 1.\n\nArrays that receive a character from wctomb must have room for MB_CUR_MAX bytes; MB_LEN_MAX in limits.h is the largest value it can have for any locale.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    printf("a character takes at most %d byte(s) here\\n", (int)MB_CUR_MAX);
    return 0;
}
`,
    see: ['mblen', 'wctomb', 'MB_LEN_MAX'],
  },
  atof: {
    text: `Converts the beginning of the string nptr to a double, like strtod(nptr, NULL). Leading white space is skipped, then an optional sign, digits with an optional decimal point, and an optional exponent such as e-3 are read; the rest of the string is ignored.\n\natof gives no way to detect errors: "abc" and "0" both give 0.0, and an out-of-range value is undefined behavior. Use strtod when the input comes from a user or a file.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    printf("%g\\n", atof("  3.75 kg"));
    printf("%g\\n", atof("-1.5e3"));
    printf("%g\\n", atof("abc"));
    return 0;
}
`,
    see: ['strtod', 'atoi', 'sscanf'],
  },
  atoi: {
    text: `Converts the beginning of the string nptr to an int: it skips leading white space, reads an optional + or - and then decimal digits, and stops at the first character that is not a digit. "42abc" gives 42.\n\nIt cannot report failure: "abc" gives 0, the same as "0", and a number too big for an int is undefined behavior (See gives INT_MAX or INT_MIN). For input you do not control, use strtol, which tells you where the number ended and sets errno to ERANGE on overflow.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    printf("%d\\n", atoi("42"));
    printf("%d\\n", atoi("   -17 apples"));
    printf("%d\\n", atoi("apples"));
    return 0;
}
`,
    see: ['strtol', 'atol', 'atof'],
  },
  atol: {
    text: `Converts the beginning of the string nptr to a long, exactly like atoi does for int. Here long and int are both 32 bits, so the results are the same. As with atoi, errors cannot be detected; prefer strtol.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    long n;

    n = atol("2000000000");
    printf("%ld\\n", n);
    return 0;
}
`,
    see: ['atoi', 'strtol'],
  },
  strtod: {
    text: `Converts the beginning of the string nptr to a double. It skips leading white space and reads an optional sign, then digits with an optional decimal point and an optional exponent (e or E, an optional sign and digits). If endptr is not NULL, *endptr is set to point at the first character after the number.\n\nIf no number could be read, it returns 0 and sets *endptr to nptr, which is how you detect "no number here": compare the end pointer with the start. If the value is too large, it returns plus or minus HUGE_VAL and sets errno to ERANGE; if it is too small, it returns 0 and may set ERANGE.\n\nCalling strtod repeatedly, each time from the previous end pointer, reads a whole list of numbers out of one string.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    const char *s = "1.5 -2.25e1 x";
    char *end;
    double v;

    for (;;) {
        v = strtod(s, &end);
        if (end == s)
            break;
        printf("read %g\\n", v);
        s = end;
    }
    printf("stopped at \\"%s\\"\\n", s);
    return 0;
}
`,
    see: ['atof', 'strtol', 'HUGE_VAL', 'errno'],
  },
  strtol: {
    text: `Converts the beginning of the string nptr to a long in the given base and, if endptr is not NULL, stores in *endptr a pointer to the first character it did not use. Leading white space is skipped and an optional sign is read.\n\nbase can be 2 to 36, where the letters a to z (or A to Z) are the digits 10 to 35, and 16 also accepts a leading 0x. With base 0 the number decides: 0x1F is hexadecimal, 017 is octal and 17 is decimal.\n\nTo check the result properly: set errno = 0 before the call; if *endptr equals nptr no digits were found; if errno is ERANGE the value overflowed and LONG_MAX or LONG_MIN was returned; if **endptr is not '\\0' there was text after the number. Use it instead of atoi when the input might not be a number.`,
    example: `#include <stdio.h>
#include <stdlib.h>
#include <errno.h>

int main(void)
{
    const char *inputs[4] = { "123", "0x1F", "12abc", "99999999999" };
    char *end;
    long v;
    int i;

    for (i = 0; i < 4; i++) {
        errno = 0;
        v = strtol(inputs[i], &end, 0);
        if (end == inputs[i])
            printf("%-12s no number\\n", inputs[i]);
        else if (errno == ERANGE)
            printf("%-12s out of range (got %ld)\\n", inputs[i], v);
        else
            printf("%-12s %ld, rest \\"%s\\"\\n", inputs[i], v, end);
    }
    return 0;
}
`,
    see: ['strtoul', 'atoi', 'strtod', 'errno'],
  },
  strtoul: {
    text: `Converts the beginning of the string nptr to an unsigned long, with the same rules for white space, base and endptr as strtol. On overflow it returns ULONG_MAX and sets errno to ERANGE.\n\nA trap: a leading minus sign is accepted, and the value is negated in unsigned arithmetic, so strtoul("-1", NULL, 10) returns ULONG_MAX (4294967295) without any error. Check for a '-' yourself if negative input should be rejected.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    printf("%lu\\n", strtoul("ff", NULL, 16));
    printf("%lu\\n", strtoul("101101", NULL, 2));
    printf("%lu\\n", strtoul("-1", NULL, 10));
    return 0;
}
`,
    see: ['strtol', 'ULONG_MAX'],
  },
  rand: {
    text: `Returns a pseudo-random int from 0 to RAND_MAX (32767). The numbers come from a formula applied to a hidden seed, so the sequence is the same every run unless you call srand first with a different seed; without srand, the seed is 1.\n\nTo get a number from 0 to n - 1, rand() % n is the common idiom; it is slightly uneven when n does not divide RAND_MAX + 1 and fine for games and exercises. For a value from lo to hi: lo + rand() % (hi - lo + 1).\n\nSee uses the sample generator printed in the C standard, a simple linear congruential formula. It is not suitable for anything that needs real unpredictability, such as passwords.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int i;

    srand(2024);
    for (i = 0; i < 5; i++)
        printf("die roll: %d\\n", 1 + rand() % 6);
    return 0;
}
`,
    see: ['srand', 'RAND_MAX', 'time'],
  },
  srand: {
    text: `Sets the seed for rand. The same seed always gives the same sequence, which is useful for testing; a program starts as if srand(1) had been called.\n\nTo get a different sequence on each run, seed with the time once at the start: srand((unsigned)time(NULL)). Call srand only once; calling it before every rand with the time gives the same number again and again within the same second.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int a, b;

    srand(42);
    a = rand();
    srand(42);
    b = rand();
    printf("same seed, same number: %d %d\\n", a, b);
    return 0;
}
`,
    see: ['rand', 'time'],
  },
  calloc: {
    text: `Allocates memory for an array of nmemb elements of size bytes each, sets every byte to zero, and returns a pointer to it, or NULL if there is not enough memory (errno is then ENOMEM). The memory is released with free.\n\nCompared with malloc(nmemb * size), calloc clears the memory and checks that the multiplication does not overflow. All-bits-zero is 0 for integer types; on this machine it is also 0.0 and NULL, although C does not promise that everywhere.\n\nIn See's memory picture a calloc block shows as initialized from the start, while a malloc block shows as uninitialized until you write to it.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *counts;
    int i;

    counts = calloc(5, sizeof *counts);
    if (counts == NULL)
        return EXIT_FAILURE;
    counts[2] = 7;
    for (i = 0; i < 5; i++)
        printf("%d ", counts[i]);
    printf("\\n");
    free(counts);
    return 0;
}
`,
    see: ['malloc', 'free', 'realloc', 'memset'],
  },
  free: {
    text: `Releases a block of memory that came from malloc, calloc or realloc, so it can be used again. free(NULL) is allowed and does nothing.\n\nAfter free, the pointer still holds the old address but must not be used: reading or writing through it, or freeing it a second time, is undefined behavior. See catches all of these: a double free, freeing a pointer into the middle of a block, freeing a stack address, and any use of the freed block, which the memory picture shows as freed. Setting the pointer to NULL right after free makes accidental reuse easier to spot.\n\nEvery block should be freed exactly once when it is no longer needed. Blocks still allocated when the program ends are leaks; See lists them at exit.`,
    example: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(void)
{
    char *s;

    s = malloc(16);
    if (s == NULL)
        return EXIT_FAILURE;
    strcpy(s, "temporary");
    printf("%s\\n", s);
    free(s);
    s = NULL;
    free(s);   /* free(NULL) does nothing */
    printf("freed\\n");
    return 0;
}
`,
    see: ['malloc', 'calloc', 'realloc'],
  },
  malloc: {
    text: `Allocates a block of size bytes and returns a pointer to its first byte, or NULL if the memory cannot be found (errno is then ENOMEM). The block stays allocated until you pass the pointer to free; it does not disappear when the function that called malloc returns.\n\nThe contents are not initialized: they hold whatever was there before. See marks the new bytes as uninitialized and warns when you read one before writing it. Use calloc for zeroed memory.\n\nAsk for bytes, not elements: malloc(n * sizeof *p) for n elements of whatever p points to. Always check the result against NULL. In C there is no need to cast the result, since a void * converts to any object pointer; the cast can hide a missing #include <stdlib.h>.\n\nIn See's memory picture each block sits on the heap with an 8-byte header in front of it holding its size, and guard bytes after it, so writing even one byte past the end is caught at once.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a;
    int n = 5, i;

    a = malloc(n * sizeof *a);
    if (a == NULL) {
        printf("out of memory\\n");
        return EXIT_FAILURE;
    }
    for (i = 0; i < n; i++)
        a[i] = i * i;
    for (i = 0; i < n; i++)
        printf("%d ", a[i]);
    printf("\\n");
    free(a);
    return 0;
}
`,
    see: ['calloc', 'realloc', 'free', 'sizeof'],
  },
  realloc: {
    text: `Changes the size of the block at ptr to size bytes and returns a pointer to the resized block. The old contents are kept up to the smaller of the two sizes; any new bytes are uninitialized. The block may move: if it cannot grow where it is, realloc allocates a new one, copies the data and frees the old one, so all old pointers into it become invalid.\n\nIf it fails, it returns NULL and the old block is untouched and still yours. So never write p = realloc(p, n): on failure that loses the only pointer to the old block. Use a second variable and assign it back only on success.\n\nrealloc(NULL, size) acts like malloc(size). realloc(ptr, 0) frees the block here and returns NULL. Growing an array by doubling its capacity each time keeps the number of copies small.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int *a = NULL, *bigger;
    int cap = 0, n = 0, i;

    for (i = 1; i <= 10; i++) {
        if (n == cap) {
            cap = cap ? cap * 2 : 2;
            bigger = realloc(a, cap * sizeof *a);
            if (bigger == NULL) {
                free(a);
                return EXIT_FAILURE;
            }
            a = bigger;
            printf("capacity now %d\\n", cap);
        }
        a[n++] = i * 10;
    }
    printf("last element %d of %d\\n", a[n - 1], n);
    free(a);
    return 0;
}
`,
    see: ['malloc', 'free', 'calloc'],
  },
  abort: {
    text: `Ends the program abnormally, at once, by raising the signal SIGABRT. Functions registered with atexit do not run, and output still waiting in buffers may be lost; the status reported to the system means failure.\n\nIf a handler for SIGABRT has been installed with signal, it runs first; if it returns, the program still ends. assert calls abort when its condition is false. See shows where abort was called.`,
    example: `#include <stdio.h>
#include <stdlib.h>
#include <signal.h>

static void on_abort(int sig)
{
    printf("caught signal %d, leaving through exit\\n", sig);
    exit(EXIT_FAILURE);
}

int main(void)
{
    signal(SIGABRT, on_abort);
    printf("something went badly wrong\\n");
    abort();
    printf("never printed\\n");
    return 0;
}
`,
    see: ['exit', 'assert', 'raise', 'signal', 'SIGABRT'],
  },
  atexit: {
    text: `Registers the function func to be called when the program ends normally, by exit or by returning from main. It returns 0 on success and non-zero if the function could not be registered; at least 32 registrations are possible (exactly 32 here).\n\nThe functions run in the reverse order of registration, before the open streams are flushed and closed, so they may still print. They do not run after abort or when the program is stopped by a signal. A registered function takes no arguments and returns nothing.`,
    example: `#include <stdio.h>
#include <stdlib.h>

static void first(void) { printf("registered first, runs last\\n"); }
static void second(void) { printf("registered second, runs first\\n"); }

int main(void)
{
    atexit(first);
    atexit(second);
    printf("main is returning\\n");
    return 0;
}
`,
    see: ['exit', 'abort'],
  },
  exit: {
    text: `Ends the program normally with the given status, from anywhere in the program. First the functions registered with atexit run, in reverse order; then all open streams are flushed and closed; then the status goes back to the system. exit never returns.\n\nUse EXIT_SUCCESS (or 0) for success and EXIT_FAILURE for failure. Returning a value from main is the same as calling exit with it.\n\nOutput still in a buffer is written by exit, but not by abort or a crash, which is why a crashing program can seem to lose its last printf lines. Memory from malloc is reclaimed by the system anyway, though See still lists blocks you never freed.`,
    example: `#include <stdio.h>
#include <stdlib.h>

static void check(int ok)
{
    if (!ok) {
        printf("check failed, stopping\\n");
        exit(EXIT_FAILURE);
    }
    printf("check passed\\n");
}

int main(void)
{
    check(1);
    check(0);
    printf("never printed\\n");
    return 0;
}
`,
    see: ['EXIT_SUCCESS', 'EXIT_FAILURE', 'atexit', 'abort'],
  },
  getenv: {
    text: `Looks up the environment variable called name and returns a pointer to its value, or NULL if there is no such variable. The environment is the list of NAME=value strings the program receives when it starts.\n\nThe returned string belongs to the environment: do not modify it, and copy it if you need to keep it, because a later getenv may reuse the space. See gives programs a small environment with HOME, PATH and USER.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    const char *home, *missing;

    home = getenv("HOME");
    missing = getenv("NO_SUCH_VARIABLE");
    printf("HOME = %s\\n", home ? home : "(not set)");
    printf("NO_SUCH_VARIABLE = %s\\n", missing ? missing : "(not set)");
    return 0;
}
`,
    see: ['system'],
  },
  system: {
    text: `Passes the string to the system's command processor (the shell) to run as a command, and returns a value that depends on the system, usually the command's exit status. system(NULL) asks whether a command processor exists: non-zero means yes.\n\nSee has no shell for programs to call, so system(NULL) returns 0 and any command returns -1. Programs that build a command from user input are a classic security hole on real systems, because the input can contain extra commands.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    if (system(NULL))
        printf("a shell is available\\n");
    else
        printf("no shell here; system(\\"ls\\") returns %d\\n", system("ls"));
    return 0;
}
`,
    see: ['getenv', 'exit'],
  },
  bsearch: {
    text: `Searches a sorted array for an element that matches *key. base points at the first of nmemb elements of size bytes each, and compar compares the key (first argument) with an array element (second argument), returning negative, zero or positive like strcmp. bsearch returns a pointer to a matching element, or NULL if there is none.\n\nThe array must be sorted in the order compar describes, usually by qsort with the same comparison; otherwise the answer is meaningless. Binary search halves the range at each step, so a million elements take about 20 comparisons. If several elements match, any one of them may be returned.\n\nThe comparison function receives const void pointers: convert them to the real element type inside it.`,
    example: `#include <stdio.h>
#include <stdlib.h>

static int cmp_int(const void *a, const void *b)
{
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

int main(void)
{
    int a[8] = { 2, 3, 5, 7, 11, 13, 17, 19 };
    int key = 13, other = 4;
    int *p;

    p = bsearch(&key, a, 8, sizeof a[0], cmp_int);
    if (p != NULL)
        printf("%d found at index %d\\n", key, (int)(p - a));
    p = bsearch(&other, a, 8, sizeof a[0], cmp_int);
    printf("%d %s\\n", other, p ? "found" : "not found");
    return 0;
}
`,
    see: ['qsort', 'strcmp'],
  },
  qsort: {
    text: `Sorts an array in place. base points at the first of nmemb elements, each size bytes, and compar is a function that compares two elements through const void pointers and returns a negative number if the first should come first, 0 if they are equal, and a positive number if the second should come first.\n\nThe comparison function is where mistakes happen. Convert the void pointers to pointers to the element type: for an array of int, *(const int *)a; for an array of char * strings, the elements are pointers, so use strcmp(*(char * const *)a, *(char * const *)b). Avoid return x - y for ints, which overflows for large values; (x > y) - (x < y) is safe.\n\nThe sort is not stable: equal elements may end up in any order. The C standard does not say which algorithm is used; See uses quicksort with insertion sort for small ranges, and the debugger can step through each call of your comparison function.`,
    example: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int by_value(const void *a, const void *b)
{
    int x = *(const int *)a, y = *(const int *)b;
    return (x > y) - (x < y);
}

static int by_name(const void *a, const void *b)
{
    return strcmp(*(char * const *)a, *(char * const *)b);
}

int main(void)
{
    int nums[6] = { 42, -7, 19, 0, 88, 3 };
    char *names[4] = { "dave", "alice", "carol", "bob" };
    int i;

    qsort(nums, 6, sizeof nums[0], by_value);
    qsort(names, 4, sizeof names[0], by_name);
    for (i = 0; i < 6; i++)
        printf("%d ", nums[i]);
    printf("\\n");
    for (i = 0; i < 4; i++)
        printf("%s ", names[i]);
    printf("\\n");
    return 0;
}
`,
    see: ['bsearch', 'strcmp'],
  },
  abs: {
    text: `Returns the absolute value of the int j: j itself if it is zero or positive, -j if it is negative.\n\nThe one trap is INT_MIN: its absolute value does not fit in an int (the range is -2147483648 to 2147483647), so abs(INT_MIN) is undefined; here it gives back INT_MIN. Use labs for long and fabs (in math.h) for double; abs on a double converts it to int first and loses the fraction.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    int a = -42, b = 17;

    printf("abs(%d) = %d\\n", a, abs(a));
    printf("abs(%d) = %d\\n", b, abs(b));
    printf("distance = %d\\n", abs(a - b));
    return 0;
}
`,
    see: ['labs', 'fabs', 'INT_MIN'],
  },
  div: {
    text: `Divides numer by denom and returns both the quotient and the remainder in a div_t structure, in the members quot and rem, so that quot * denom + rem == numer.\n\nIn C89 the direction in which the / operator rounds a negative quotient is up to the implementation, but div always truncates toward zero: div(-7, 2) gives quot -3 and rem -1. That made div the portable choice. Dividing by zero is undefined, as with /.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    div_t r;
    int seconds = 3725;

    r = div(seconds, 60);
    printf("%d s = %d min %d s\\n", seconds, r.quot, r.rem);
    r = div(-7, 2);
    printf("-7 / 2: quot %d rem %d\\n", r.quot, r.rem);
    return 0;
}
`,
    see: ['div_t', 'ldiv'],
  },
  labs: {
    text: `Returns the absolute value of the long j. As with abs, the most negative value, LONG_MIN, has no positive counterpart and labs(LONG_MIN) is undefined. Here long is 32 bits, the same as int.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    long balance = -150000L;

    printf("owes %ld\\n", labs(balance));
    return 0;
}
`,
    see: ['abs', 'fabs'],
  },
  ldiv: {
    text: `Divides numer by denom as longs and returns the quotient and remainder in an ldiv_t structure, members quot and rem. Like div, it always truncates toward zero.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    ldiv_t r;

    r = ldiv(100000L, 24L);
    printf("%ld days and %ld hours\\n", r.quot, r.rem);
    return 0;
}
`,
    see: ['ldiv_t', 'div'],
  },
  mblen: {
    text: `Returns the number of bytes that make up the multibyte character at s, looking at no more than n bytes. It returns 0 if s points at the NUL character, and -1 if the bytes do not form a valid character.\n\nIf s is NULL, it reports whether the encoding has shift states (0 means no). In See's "C" locale every character is one byte, so mblen returns 1 for any character other than NUL.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    const char *s = "ok";

    printf("%d %d %d\\n", mblen(s, MB_CUR_MAX), mblen(s + 1, MB_CUR_MAX), mblen(s + 2, MB_CUR_MAX));
    return 0;
}
`,
    see: ['mbtowc', 'MB_CUR_MAX'],
  },
  mbtowc: {
    text: `Converts the multibyte character at s (looking at no more than n bytes) to a wide character and stores it in *pwc, unless pwc is NULL. It returns the number of bytes used, 0 for the NUL character, or -1 if the bytes are not a valid character.\n\nWith s NULL it reports whether the encoding has shift states. In See's "C" locale each byte is one character, so the wide value is simply the byte value.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    wchar_t w;
    int used;

    used = mbtowc(&w, "A", 1);
    printf("used %d byte, value %ld\\n", used, (long)w);
    return 0;
}
`,
    see: ['wctomb', 'mblen', 'mbstowcs', 'wchar_t'],
  },
  wctomb: {
    text: `Converts the wide character wchar to its multibyte form and stores the bytes in the array s, which must have room for MB_CUR_MAX bytes. It returns the number of bytes stored, or -1 if wchar is not a valid character. No NUL is added.\n\nWith s NULL it reports whether the encoding has shift states. In See's "C" locale a wide character from 0 to 255 becomes one byte, and anything else gives -1.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    char buf[4];
    int n;

    n = wctomb(buf, 'Z');
    buf[n] = '\\0';
    printf("%d byte: %s\\n", n, buf);
    return 0;
}
`,
    see: ['mbtowc', 'wcstombs', 'MB_CUR_MAX'],
  },
  mbstowcs: {
    text: `Converts the multibyte string s into wide characters in the array pwcs, writing no more than n of them. It stops after converting the terminating NUL, which is then included in the array. It returns the number of wide characters written, not counting the NUL, or (size_t)-1 if an invalid character was found.\n\nIf the string has n or more characters, the result is not terminated. In See's "C" locale each byte becomes one wchar_t.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    wchar_t w[10];
    size_t n, i;

    n = mbstowcs(w, "wide", 10);
    for (i = 0; i < n; i++)
        printf("%ld ", (long)w[i]);
    printf("(%d characters)\\n", (int)n);
    return 0;
}
`,
    see: ['wcstombs', 'mbtowc', 'wchar_t'],
  },
  wcstombs: {
    text: `Converts the wide string pwcs into a multibyte string in the array s, storing no more than n bytes. It stops after the terminating NUL, which is stored if there is room. It returns the number of bytes stored, not counting the NUL, or (size_t)-1 if a wide character has no multibyte form.\n\nAs with strncpy, if the result fills all n bytes no NUL is written. In See's "C" locale each wchar_t becomes one byte.`,
    example: `#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    wchar_t w[4];
    char s[8];
    size_t n;

    w[0] = 'h';
    w[1] = 'e';
    w[2] = 'y';
    w[3] = 0;
    n = wcstombs(s, w, sizeof s);
    printf("%d bytes: %s\\n", (int)n, s);
    return 0;
}
`,
    see: ['mbstowcs', 'wctomb', 'wchar_t'],
  },
});
