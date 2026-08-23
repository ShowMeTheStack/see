/*
 * title: String literals are read-only, const or not
 * level: 2
 * about: Contrasts a char array initialised from a literal (a private, writable copy) with a char pointer aimed at the literal itself.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    /*
     * Two declarations that look alike and are not:
     *   word is an array of 6 chars on the stack; the literal's letters
     *   are COPIED into it when main starts. word belongs to us.
     *   lit is a 4 byte pointer on the stack aimed at the literal itself,
     *   which lives in the read-only string literal area.
     * In See, word shows the letters in main's frame; lit shows an arrow
     * out to the literals.
     */
    char word[] = "hello";
    char *lit = "hello";
    const char *safe = "hello";      /* the honest way to write the pointer */

    word[0] = 'j';                   /* fine: our own copy */
    printf("word: %s\n", word);

    /*
     * For historical reasons C gives literals the type char[], not
     * const char[], so the compiler accepts this line without a word:
     *     lit[0] = 'j';
     * At run time it is a write into read-only memory. See stops the
     * program with "write to read-only memory (a string literal or other
     * constant data)"; many real systems crash with a segmentation fault.
     * Writing const char * as in safe turns the mistake into a compile
     * error instead:  error: assignment of read-only location '*safe'
     */

    printf("lit:  %s (sizeof lit = %lu, the size of a pointer)\n", lit, (unsigned long)sizeof lit);
    printf("word: sizeof word = %lu, room for 5 letters and the '\\0'\n", (unsigned long)sizeof word);
    printf("safe: %s\n", safe);

    /* To change the text, copy it somewhere writable first. */
    {
        char buf[16];
        strcpy(buf, safe);
        buf[0] = 'c';
        strcat(buf, "!");
        printf("buf:  %s\n", buf);
    }

    /* Identical literals may share one copy, so writing to one could change "another". */
    printf("lit and safe point at %s place\n", lit == safe ? "the same" : "different");
    return 0;
}
