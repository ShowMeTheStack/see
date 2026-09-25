/*
 * title: Capitalising a string literal
 * level: 2
 * about: Capitalises the words of two titles, one stored in an array and one that is a pointer to a string literal.
 * expect: fault
 */

/*
 * THE PUZZLE
 * capitalise() works on the first title and crashes on the second.
 * The two declarations look almost the same. One is an array that
 * holds its own copy of the letters; the other is a pointer to
 * letters that live somewhere else. Where?
 *
 * HOW TO HUNT IT WITH SEE
 * Before running, look at the memory picture: book is a 26-byte array
 * in main's frame, but film is a 4-byte pointer whose arrow leads to
 * the string literals area, which See draws separately from the stack
 * and the heap. String literals are read-only (on a real machine they
 * sit in a read-only section of the program). When capitalise() writes
 * through that arrow, See stops with "write to read-only memory".
 */
#include <stdio.h>
#include <ctype.h>

static void capitalise(char *s)
{
    int start = 1;

    for (; *s != '\0'; s++) {
        if (start && islower((unsigned char)*s))
            *s = (char)toupper((unsigned char)*s);
        start = (*s == ' ');
    }
}

int main(void)
{
    char book[] = "the c programming language";
    char *film = "the wizard of oz";

    capitalise(book);
    printf("%s\n", book);

    capitalise(film);
    printf("%s\n", film);
    return 0;
}

/*
 * THE FIX
 *     char film[] = "the wizard of oz";
 * Now film is an array initialised from the literal, a private copy you
 * may change. When you really do want a pointer to a literal, write
 * const char *film = "..."; then the compiler refuses to pass it to a
 * function that takes char *, and the bug cannot be written at all.
 */
