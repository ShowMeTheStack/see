/*
 * title: A little string utilities library
 * level: 2
 * about: Trims, reverses, upper-cases and inspects strings with helpers kept in their own file.
 */

/* See compiles main.c and strutil.c separately and links them together into
 * one program. main.c only knows the helpers through strutil.h. */
#include <stdio.h>
#include <string.h>
#include "strutil.h"

int main(void)
{
    char line[64];
    char word[16];
    char *t;
    const char *tests[3];
    int i;

    tests[0] = "Never odd or even";
    tests[1] = "A man, a plan, a canal: Panama";
    tests[2] = "Not a palindrome";

    /* line is an array on main's stack, so the helpers can change it.
     * A string literal could not be changed: it lives in read-only memory. */
    strcpy(line, "   the quick brown fox   ");
    t = str_trim(line);
    /* After the step, t points a few bytes into line, past the spaces. */
    printf("trimmed: [%s]\n", t);
    printf("words: %d\n", str_count_words(t));

    printf("spaces replaced: %d\n", str_replace_char(t, ' ', '_'));
    printf("now: %s\n", t);

    str_upper(t);
    printf("upper: %s\n", t);

    strcpy(word, "stressed");
    str_reverse(word);
    printf("stressed reversed: %s\n", word);

    for (i = 0; i < 3; i++) {
        printf("\"%s\" %s a palindrome\n", tests[i],
               str_is_palindrome(tests[i]) ? "is" : "is not");
    }
    return 0;
}
