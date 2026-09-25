/*
 * title: Five letters in five boxes
 * level: 1
 * about: Initialises char word[5] with "hello", which leaves no room for the '\0', then prints it.
 * expect: fault
 */

/*
 * THE PUZZLE
 * "hello" has five letters and word has five boxes. It fits, and C
 * even allows it: when the array is exactly as long as the letters,
 * the '\0' is quietly dropped. So word is five chars, but is it a
 * string?
 *
 * HOW TO HUNT IT WITH SEE
 * Look at word in the memory picture before printf runs: h e l l o,
 * and then the edge of the array. Compare with greeting, which got a
 * sixth box holding \0. printf("%s") prints characters until it meets
 * a '\0'. In word it never does, so it reads past the end, and See
 * stops it right there. On a real machine you would see "hello"
 * followed by a few random characters, or by the contents of the next
 * variable.
 */
#include <stdio.h>

int main(void)
{
    char greeting[] = "hi";
    char word[5] = "hello";

    printf("%s\n", greeting);
    printf("%s\n", word);
    return 0;
}

/*
 * THE FIX
 *     char word[6] = "hello";
 * or let the compiler count:  char word[] = "hello";  which gives 6.
 * In C++ the original line is an error; in C it is legal and a trap.
 */
