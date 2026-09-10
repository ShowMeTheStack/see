/*
 * title: What atoi cannot tell you
 * level: 2
 * about: Feeds tricky strings to atoi and atof and shows that "0", "abc" and "0junk" all look the same, then repeats the test with strtol.
 */
#include <stdio.h>
#include <stdlib.h>

int main(void)
{
    const char *tests[8];
    char *end;
    long v;
    int i;

    tests[0] = "42";
    tests[1] = "  -17";
    tests[2] = "0";
    tests[3] = "abc";
    tests[4] = "12abc";
    tests[5] = "3.99";
    tests[6] = "";
    tests[7] = "0x1A";

    /*
     * atoi returns 0 both for "0" and for text with no number at all,
     * and silently ignores anything after the digits. Worse, a value too
     * big for an int is undefined behaviour, so atoi("99999999999")
     * might return anything; that one is not tried here.
     */
    printf("%-8s %6s %8s   %s\n", "text", "atoi", "strtol", "what strtol adds");
    for (i = 0; i < 8; i++) {
        v = strtol(tests[i], &end, 10);
        printf("%-8s %6d %8ld   ", tests[i], atoi(tests[i]), v);
        if (end == tests[i])
            printf("no number at all\n");
        else if (*end != '\0')
            printf("stopped at \"%s\"\n", end);
        else
            printf("clean\n");
    }

    /* atof has the same weakness for doubles. */
    printf("atof(\"2.5e3\") = %.1f, atof(\"e3\") = %.1f\n", atof("2.5e3"), atof("e3"));

    /*
     * The lesson: atoi is fine for quick experiments with input you
     * control. For anything a user types, use strtol and check end.
     */
    return 0;
}
