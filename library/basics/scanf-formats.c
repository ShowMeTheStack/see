/*
 * title: scanf with chars, words and scansets
 * level: 3
 * about: Reads a date with separators, a single character, a word, and a whole line with a scanset, showing how scanf treats spaces in each case.
 * input: 2024-03-15\nY\n  Ritchie   rest\nC was born at Bell Labs\n
 */
#include <stdio.h>

int main(void)
{
    int year, month, day;
    char answer;
    char name[20];
    char line[60];
    int n;

    /*
     * Characters in the format other than % must appear in the input. The
     * dashes here are matched and thrown away, so "2024-03-15" fills three
     * ints. The return value says how many were filled.
     */
    n = scanf("%d-%d-%d", &year, &month, &day);
    printf("%d fields: year %d, month %d, day %d\n", n, year, month, day);

    /*
     * %c is the odd one out: it does not skip white space. Right now the
     * next character waiting is the newline after the date. The space in
     * front of %c in the format means "skip any white space first", so
     * answer gets 'Y' and not '\n'. Remove the space and see what happens.
     */
    scanf(" %c", &answer);
    printf("answer: '%c' (code %d)\n", answer, answer);

    /*
     * %s skips leading white space, then reads up to the next space or
     * newline. The 19 is the most characters it will store; name has 20
     * bytes, one is kept for the terminating zero. Never use %s without a
     * width: a long word would run past the end of the array.
     */
    scanf("%19s", name);
    printf("name: \"%s\"\n", name);

    /*
     * The rest of that input line is "   rest". To skip it, a scanset:
     * %*[^\n] reads every character that is not a newline, and the *
     * means read it but do not store it anywhere. Then %*c eats the
     * newline itself.
     */
    scanf("%*[^\n]");
    scanf("%*c");

    /* Now a whole line, spaces included: everything up to the newline. */
    scanf("%59[^\n]", line);
    printf("line: \"%s\"\n", line);

    /* In See, look at name and line on the stack: the characters fill the
       front of each array, followed by a zero byte. */
    return 0;
}
