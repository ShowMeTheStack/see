/*
 * title: strtok on a string literal
 * level: 3
 * about: Splits a comma-separated list of colours with strtok, passing it a pointer to a string literal.
 * expect: fault
 */

/*
 * THE PUZZLE
 * strtok looks like a reading function, but it is not: to end each
 * token it overwrites the separator with a '\0' in the string you gave
 * it. So the string must be writable. Where does the text that list
 * points to live?
 *
 * HOW TO HUNT IT WITH SEE
 * Look at the memory picture before running: list is a pointer whose
 * arrow leads to the string literals area. Step into the first strtok
 * call. It finds the first comma and tries to write '\0' over it, and
 * See stops with a write to read-only memory. To see strtok working
 * properly, change the declaration as described below, then step
 * through the loop and watch each comma in the array turn into \0
 * while tok jumps from word to word.
 */
#include <stdio.h>
#include <string.h>

int main(void)
{
    char *list = "red,green,blue,orange";
    char *tok;
    int n = 0;

    tok = strtok(list, ",");
    while (tok != NULL) {
        n++;
        printf("%d: %s\n", n, tok);
        tok = strtok(NULL, ",");
    }
    printf("%d colours\n", n);
    return 0;
}

/*
 * THE FIX
 *     char list[] = "red,green,blue,orange";
 * Now list is an array on the stack with its own copy of the letters,
 * which strtok may change. If the original must stay intact, copy it
 * into a buffer first and split the copy.
 */
