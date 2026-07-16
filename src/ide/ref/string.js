// Reference texts for <string.h>.
SEE.RefText = Object.assign(SEE.RefText || {}, {
  memcpy: {
    text: `Copies exactly n bytes from the object at s2 to the object at s1 and returns s1. It does not look for a NUL byte and does not stop early: it copies n bytes, whatever they are, so it works for structs, arrays of int and any other data, not only strings.\n\nThe two areas must not overlap. If they might (shifting part of an array along itself, for example), use memmove instead. See warns when it sees memcpy called with overlapping areas, because the result is undefined.\n\nThe destination must have room for n bytes. Pass the size in bytes, which for an array of int is count * sizeof(int), not the count of elements. If the destination is too small, See stops the program at the first byte that falls outside it, and the memory picture shows which object was overrun.`,
    example: `#include <stdio.h>
#include <string.h>

struct point { int x; int y; };

int main(void)
{
    int a[5] = { 1, 2, 3, 4, 5 };
    int b[5];
    struct point p = { 3, 4 }, q;
    int i;

    memcpy(b, a, sizeof a);
    memcpy(&q, &p, sizeof q);
    for (i = 0; i < 5; i++)
        printf("%d ", b[i]);
    printf("\\nq = (%d, %d)\\n", q.x, q.y);
    return 0;
}
`,
    see: ['memmove', 'strcpy', 'memset'],
  },
  memmove: {
    text: `Copies n bytes from s2 to s1 and returns s1, exactly like memcpy, except that the two areas may overlap. The result is as if the n bytes were first copied to a temporary buffer and then to the destination, so nothing is overwritten before it has been read.\n\nUse it to slide elements along inside one array, for example to open a gap for an insertion or to close one after a deletion. When you know the areas are separate, memcpy does the same job.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char s[16] = "abcdef";

    /* open a gap at index 2 by sliding "cdef" and its NUL one place right */
    memmove(s + 3, s + 2, strlen(s + 2) + 1);
    s[2] = 'X';
    printf("%s\\n", s);

    /* close the gap again */
    memmove(s + 2, s + 3, strlen(s + 3) + 1);
    printf("%s\\n", s);
    return 0;
}
`,
    see: ['memcpy', 'strcpy'],
  },
  strcpy: {
    text: `Copies the string s2, including its terminating NUL, into the array s1, and returns s1. It copies until it reaches the NUL, so it has no idea how big s1 is: the destination must have room for strlen(s2) + 1 characters.\n\nThis is the classic buffer overflow. char name[8]; strcpy(name, "Christopher"); writes 12 bytes into an 8-byte array. In See the program stops at the first byte past the end of name, and the memory picture shows the overflow; on a real machine the extra bytes silently overwrite whatever lives next to the array.\n\nThe areas must not overlap. To copy at most a limited number of characters, see strncpy, which has traps of its own; a common safe pattern is to check strlen(s2) < sizeof dest before calling strcpy.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char dest[16];
    const char *src = "hello";

    if (strlen(src) < sizeof dest) {
        strcpy(dest, src);
        printf("copied \\"%s\\" (%d bytes with the NUL)\\n", dest, (int)strlen(dest) + 1);
    }
    return 0;
}
`,
    see: ['strncpy', 'strcat', 'memcpy', 'strlen'],
  },
  strncpy: {
    text: `Copies at most n characters from s2 into s1 and returns s1. If s2 is shorter than n, the rest of s1 up to n characters is filled with NUL bytes. If s2 has n or more characters, exactly n are copied and no NUL is written.\n\nThat last case is the trap: after strncpy(buf, src, sizeof buf) with a long src, buf is not a string, and printing it or calling strlen on it reads past the end. See warns when strncpy leaves the destination without a NUL. The usual fix is to copy one less and terminate by hand: strncpy(buf, src, sizeof buf - 1); buf[sizeof buf - 1] = '\\0';\n\nstrncpy was designed for fixed-width fields in old file formats, not as a safe strcpy. It also always writes all n bytes, which is wasteful for a large buffer and a short source.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char buf[6];
    const char *src = "a long string";

    strncpy(buf, src, sizeof buf - 1);
    buf[sizeof buf - 1] = '\\0';
    printf("[%s]\\n", buf);

    strncpy(buf, "hi", sizeof buf);   /* pads the rest with NUL bytes */
    printf("[%s]\\n", buf);
    return 0;
}
`,
    see: ['strcpy', 'strncat', 'memcpy'],
  },
  strcat: {
    text: `Appends the string s2 to the end of the string s1: the first character of s2 overwrites the NUL at the end of s1, and a new NUL is written after the copy. It returns s1.\n\ns1 must already hold a string (an uninitialized array is not one: start with buf[0] = '\\0' or strcpy), and it must have room for strlen(s1) + strlen(s2) + 1 characters. Like strcpy, strcat cannot know the size of the destination; an overflow is caught by See at the first byte outside the array.\n\nEach call walks s1 from the start to find its end, so building a long string with many strcat calls is slow. Keeping a pointer to the current end, or using sprintf, avoids that.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char path[32];

    strcpy(path, "/home");
    strcat(path, "/");
    strcat(path, "user");
    printf("%s (%d characters)\\n", path, (int)strlen(path));
    return 0;
}
`,
    see: ['strncat', 'strcpy', 'sprintf'],
  },
  strncat: {
    text: `Appends at most n characters of s2 to the string s1 and then always writes a terminating NUL. It returns s1.\n\nUnlike strncpy, the result is always a string. But n limits only the characters taken from s2, not the total size of s1, so the destination needs room for strlen(s1) + n + 1 characters. To fill a buffer safely, pass the space that is left: strncat(buf, s, sizeof buf - strlen(buf) - 1).`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char buf[10] = "abc";

    strncat(buf, "defghijklmnop", sizeof buf - strlen(buf) - 1);
    printf("[%s] fits in %d bytes\\n", buf, (int)sizeof buf);
    return 0;
}
`,
    see: ['strcat', 'strncpy'],
  },
  memcmp: {
    text: `Compares the first n bytes of the objects at s1 and s2, byte by byte as unsigned char values. It returns 0 if they are all equal, a negative number if the first differing byte is smaller in s1, and a positive number if it is larger.\n\nIt does not stop at a NUL, so it is for raw data. Avoid using it to compare structs: the padding bytes between members can hold anything, so two structs with equal members may still compare unequal. Compare the members one by one instead.\n\nOnly the sign of the result is meaningful; do not test for -1 or 1.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    unsigned char a[4] = { 1, 2, 3, 4 };
    unsigned char b[4] = { 1, 2, 9, 4 };

    printf("first 2 bytes: %d\\n", memcmp(a, b, 2));
    printf("all 4 bytes: %s\\n", memcmp(a, b, 4) < 0 ? "a < b" : "a >= b");
    return 0;
}
`,
    see: ['strcmp', 'strncmp', 'memchr'],
  },
  strcmp: {
    text: `Compares the strings s1 and s2 character by character, as unsigned char values, until they differ or both end. It returns 0 when the strings are equal, a negative number when s1 sorts before s2, and a positive number when it sorts after.\n\nUse it to compare strings: s1 == s2 compares the pointers (are they the same array?), not the text. Test the result against 0, as in strcmp(a, b) == 0 or strcmp(a, b) < 0, never against 1 or -1.\n\nThe order is by character code, so "Zebra" comes before "apple" (uppercase letters have smaller codes in ASCII) and "10" comes before "9". Both arguments must be NUL-terminated.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char word[8] = "apple";

    if (strcmp(word, "apple") == 0)
        printf("equal\\n");
    printf("apple vs banana: %s\\n", strcmp("apple", "banana") < 0 ? "before" : "after");
    printf("Zebra vs apple: %s\\n", strcmp("Zebra", "apple") < 0 ? "before" : "after");
    return 0;
}
`,
    see: ['strncmp', 'memcmp', 'strcoll', 'qsort'],
  },
  strcoll: {
    text: `Compares two strings like strcmp, but using the collating order of the current locale (the LC_COLLATE category set with setlocale). It returns 0 when equal, negative when s1 comes first and positive when s2 comes first.\n\nOnly the "C" locale exists in See, where the collating order is simply character code order, so strcoll gives the same answers as strcmp. In other locales on other systems it can sort accented letters or ignore case the way a dictionary does.`,
    example: `#include <stdio.h>
#include <string.h>
#include <locale.h>

int main(void)
{
    setlocale(LC_COLLATE, "C");
    printf("strcoll: %d, strcmp: %d\\n",
           strcoll("cat", "dog") < 0, strcmp("cat", "dog") < 0);
    return 0;
}
`,
    see: ['strcmp', 'strxfrm', 'setlocale'],
  },
  strncmp: {
    text: `Compares at most n characters of s1 and s2, stopping early at a difference or at the end of either string. It returns 0, a negative or a positive number exactly like strcmp.\n\nIt is the usual way to test whether a string starts with a prefix: strncmp(line, "GET ", 4) == 0. With n == 0 it always returns 0.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *cmds[3] = { "print 42", "quit", "printx" };
    int i;

    for (i = 0; i < 3; i++)
        printf("%-9s %s\\n", cmds[i], strncmp(cmds[i], "print ", 6) == 0 ? "starts with print" : "-");
    return 0;
}
`,
    see: ['strcmp', 'memcmp'],
  },
  strxfrm: {
    text: `Transforms the string s2 into s1 so that comparing two transformed strings with strcmp gives the same result as comparing the originals with strcoll. At most n characters, including the NUL, are written. It returns the length of the transformed string, not counting the NUL; if that is n or more, the contents of s1 are not usable and you need a bigger array.\n\nIt pays off when the same strings are compared many times, such as when sorting. In the "C" locale, the only one in See, the transformation is a plain copy, and when the result does not fit See writes nothing. Calling strxfrm(NULL, s, 0) is a way to ask how big the array must be.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char key[32];
    size_t need;

    need = strxfrm(NULL, "banana", 0);
    printf("needs %d characters plus the NUL\\n", (int)need);
    if (need < sizeof key) {
        strxfrm(key, "banana", sizeof key);
        printf("key: %s\\n", key);
    }
    return 0;
}
`,
    see: ['strcoll', 'strcmp'],
  },
  memchr: {
    text: `Looks for the first byte equal to (unsigned char)c among the first n bytes at s. It returns a pointer to that byte, or NULL if none of the n bytes matches.\n\nUnlike strchr it does not stop at a NUL, so it works on raw buffers, such as the bytes returned by fread, and on arrays that are not strings. The pointer it returns is a void *; assign it to a char * or unsigned char * to use it, and subtract the start pointer to get an index.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char data[6] = { 'a', '\\0', 'b', 'c', 'd', 'e' };
    char *p;

    p = memchr(data, 'c', sizeof data);
    if (p != NULL)
        printf("found 'c' at index %d\\n", (int)(p - data));
    return 0;
}
`,
    see: ['strchr', 'memcmp'],
  },
  strchr: {
    text: `Returns a pointer to the first occurrence of the character c (converted to char) in the string s, or NULL if it does not occur. The terminating NUL counts as part of the string, so strchr(s, '\\0') returns a pointer to the end of s.\n\nAlways check for NULL before using the result. Subtracting s from the result gives the index. To find the last occurrence, use strrchr; to find any of several characters, use strpbrk.\n\nThe return type is char * even though s is const char *, a hole in the C type system: do not write through the result if the string is a string literal.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[] = "name=value";
    char *eq;

    eq = strchr(line, '=');
    if (eq != NULL) {
        *eq = '\\0';
        printf("key [%s] value [%s] at index %d\\n", line, eq + 1, (int)(eq - line));
    }
    return 0;
}
`,
    see: ['strrchr', 'strpbrk', 'memchr', 'strstr'],
  },
  strcspn: {
    text: `Returns the length of the initial part of s1 that contains no character from s2 (the "complement span"). Put the other way: it is the index of the first character of s1 that is in s2, or strlen(s1) if there is none.\n\nA handy use is removing the newline that fgets leaves in a line: line[strcspn(line, "\\n")] = '\\0'; works whether or not a newline is there.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[] = "hello world\\n";

    printf("letters before a space: %d\\n", (int)strcspn(line, " "));
    line[strcspn(line, "\\n")] = '\\0';
    printf("[%s]\\n", line);
    return 0;
}
`,
    see: ['strspn', 'strpbrk', 'fgets'],
  },
  strpbrk: {
    text: `Returns a pointer to the first character in s1 that is any of the characters in s2, or NULL if s1 contains none of them. The name means "pointer to break".\n\nIt is like strchr for a set of characters, and like strcspn but giving a pointer instead of a length.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *s = "price: 42 euros";
    const char *p;

    p = strpbrk(s, "0123456789");
    if (p != NULL)
        printf("first digit at index %d: %s\\n", (int)(p - s), p);
    return 0;
}
`,
    see: ['strchr', 'strcspn', 'strtok'],
  },
  strrchr: {
    text: `Returns a pointer to the last occurrence of the character c in the string s, or NULL if it does not occur. Like strchr, the terminating NUL counts as part of the string.\n\nA typical use is finding the file name in a path (the part after the last '/') or the extension of a file name (the part after the last '.').`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *path = "/home/user/notes.backup.txt";
    const char *slash, *dot;

    slash = strrchr(path, '/');
    dot = strrchr(path, '.');
    printf("file: %s\\n", slash ? slash + 1 : path);
    printf("extension: %s\\n", dot ? dot + 1 : "(none)");
    return 0;
}
`,
    see: ['strchr', 'strstr'],
  },
  strspn: {
    text: `Returns the length of the initial part of s1 made up only of characters from s2. In other words, it is the index of the first character of s1 that is not in s2.\n\nUse it to skip over leading characters of a known kind, such as spaces or digits: s + strspn(s, " \\t") points at the first character that is not a blank.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *s = "   12345abc";
    const char *p;
    size_t digits;

    p = s + strspn(s, " ");
    digits = strspn(p, "0123456789");
    printf("%d digits, then \\"%s\\"\\n", (int)digits, p + digits);
    return 0;
}
`,
    see: ['strcspn', 'strpbrk'],
  },
  strstr: {
    text: `Finds the first occurrence of the string s2 (without its NUL) inside the string s1. It returns a pointer to where it starts in s1, or NULL if s2 does not occur. If s2 is the empty string, it returns s1.\n\nTo count or find every occurrence, call it again starting just after the previous match. The search is case-sensitive.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    const char *text = "the cat sat on the mat with the hat";
    const char *p = text;
    int count = 0;

    while ((p = strstr(p, "the")) != NULL) {
        printf("\\"the\\" at index %d\\n", (int)(p - text));
        count++;
        p++;
    }
    printf("%d times\\n", count);
    return 0;
}
`,
    see: ['strchr', 'strpbrk', 'strncmp'],
  },
  strtok: {
    text: `Splits a string into tokens separated by any of the characters in s2. The first call passes the string in s1; each later call passes NULL to continue where the previous one stopped. Each call returns a pointer to the next token, or NULL when there are no more.\n\nstrtok changes the string: it overwrites each separator that ends a token with a NUL. So the string must be modifiable, an array and not a string literal (strtok("a,b", ",") writes into read-only memory), and the original text is gone afterwards. In See's memory picture you can watch the separators turn into NUL bytes.\n\nIt remembers its position in a hidden static variable, so you cannot interleave two tokenizing loops, and runs of separators are skipped, so empty fields such as the middle of "a,,b" are lost. The separator set may change from one call to the next.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char line[] = "red, green,,blue";
    char *tok;
    int n = 0;

    tok = strtok(line, ", ");
    while (tok != NULL) {
        printf("token %d: %s\\n", ++n, tok);
        tok = strtok(NULL, ", ");
    }
    return 0;
}
`,
    see: ['strchr', 'strpbrk', 'strspn', 'strcspn'],
  },
  memset: {
    text: `Sets each of the first n bytes at s to the value (unsigned char)c and returns s. It is the quick way to zero an array or a struct: memset(&x, 0, sizeof x).\n\nIt works byte by byte, so memset(a, 1, sizeof a) on an array of int does not make each element 1: each 4-byte int becomes 0x01010101, which is 16843009. Only 0 (and -1, all bits set) mean the same thing in every byte. To set ints to another value, use a loop.\n\nAll-bits-zero is 0 for integers and, on this machine, 0.0 for doubles and NULL for pointers, but the C standard does not promise the last two everywhere. Remember the size in bytes: memset(a, 0, n) clears n bytes, not n elements.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    int a[3];
    char line[8];

    memset(a, 0, sizeof a);
    printf("%d %d %d\\n", a[0], a[1], a[2]);
    memset(a, 1, sizeof a);
    printf("%d (not 1)\\n", a[0]);
    memset(line, '-', sizeof line - 1);
    line[sizeof line - 1] = '\\0';
    printf("%s\\n", line);
    return 0;
}
`,
    see: ['memcpy', 'calloc'],
  },
  strerror: {
    text: `Returns a pointer to a message describing the error number errnum, usually a value of errno, such as "No such file or directory" for ENOENT. Unknown numbers give "Unknown error".\n\nThe string belongs to the library: do not modify or free it. Save errno right after the failing call, because any later library call may change it. perror is a shorter way to print the message for errno to stderr.`,
    example: `#include <stdio.h>
#include <string.h>
#include <errno.h>

int main(void)
{
    FILE *fp;

    fp = fopen("/no/such/file.txt", "r");
    if (fp == NULL)
        printf("fopen failed: %s (errno %d)\\n", strerror(errno), errno);
    else
        fclose(fp);
    printf("ERANGE means: %s\\n", strerror(ERANGE));
    return 0;
}
`,
    see: ['perror', 'errno'],
  },
  strlen: {
    text: `Returns the number of characters in the string s, not counting the terminating NUL. strlen("hi") is 2, while the array that holds "hi" needs 3 bytes.\n\nIt counts by walking from s until it finds a NUL byte, so it takes time proportional to the length; calling it in a loop condition such as for (i = 0; i < strlen(s); i++) repeats that walk every time. If there is no NUL, it keeps reading past the end of the array: See stops it at the first byte outside the object.\n\nstrlen is not sizeof. For char buf[100] = "hi", sizeof buf is 100 (the array) and strlen(buf) is 2 (the text). For a char * pointer, sizeof gives the size of the pointer, 4 here. The result has type size_t, which is unsigned: strlen(a) - strlen(b) is never negative, so compare the lengths instead of subtracting them.`,
    example: `#include <stdio.h>
#include <string.h>

int main(void)
{
    char buf[100] = "hello";
    const char *p = buf;

    printf("strlen(buf) = %d\\n", (int)strlen(buf));
    printf("sizeof buf  = %d\\n", (int)sizeof buf);
    printf("sizeof p    = %d\\n", (int)sizeof p);
    return 0;
}
`,
    see: ['sizeof', 'strcpy', 'size_t'],
  },
});
