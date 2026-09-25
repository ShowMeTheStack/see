/*
 * title: strncpy that leaves no terminator
 * level: 3
 * about: Shortens city names to six characters with strncpy, which does not add a '\0' when the name is too long.
 * expect: fault
 */

/*
 * THE PUZZLE
 * strncpy(dst, src, n) is often thought of as "the safe strcpy". It
 * does stop after n characters. But read its rule carefully: it writes
 * a '\0' only if src ends before n characters have been copied. For
 * "Oslo" that happens. For "Barcelona" it does not.
 *
 * HOW TO HUNT IT WITH SEE
 * Step over the strncpy line for each city (F10) and look at code in
 * the memory picture. After "Oslo": O s l o \0 \0. After "Barcelona":
 * B a r c e l, six letters and no '\0' anywhere. printf("%s") keeps
 * reading until it finds a '\0', so it walks off the end of the array,
 * and See stops it on the first byte past code[5]. See also leaves a
 * warning at the strncpy itself, the moment the unterminated copy was
 * made, which is the line you actually need to change.
 */
#include <stdio.h>
#include <string.h>

#define CODE_LEN 6

static void show_code(const char *city)
{
    char code[CODE_LEN];

    strncpy(code, city, sizeof code);
    printf("%-10s -> %s\n", city, code);
}

int main(void)
{
    show_code("Oslo");
    show_code("Lima");
    show_code("Barcelona");
    return 0;
}

/*
 * THE FIX
 * Leave room for the terminator and put it there yourself:
 *
 *     char code[CODE_LEN + 1];
 *     strncpy(code, city, CODE_LEN);
 *     code[CODE_LEN] = '\0';
 *
 * strncpy was designed for fixed-width fields in old file formats
 * (such as directory entries), where a full-width name had no
 * terminator. It was never meant as a general safe string copy.
 */
