/*
 * title: The macros every C compiler predefines
 * level: 1
 * about: Prints __FILE__, __LINE__ and __STDC__, and checks the shape of __DATE__ and __TIME__ without printing the actual build time.
 */
#include <stdio.h>
#include <string.h>

/*
 * C89 promises five predefined macros:
 *   __FILE__  the source file name, as a string
 *   __LINE__  the current line number, as an int
 *   __DATE__  the build date, as a string like "Mar  1 2024"
 *   __TIME__  the build time, as a string like "14:05:09"
 *   __STDC__  the number 1 when the compiler follows the standard
 * You cannot #define or #undef them yourself.
 */

static void where(const char *file, int line)
{
    printf("called from %s, line %d\n", file, line);
}

int main(void)
{
    const char *date = __DATE__;
    const char *time = __TIME__;

    printf("file: %s\n", __FILE__);
    printf("line: %d\n", __LINE__);
    printf("line: %d (the very next line)\n", __LINE__);

#ifdef __STDC__
    printf("__STDC__ is %d: a standard C compiler\n", __STDC__);
#else
    printf("not a standard C compiler\n");
#endif

    /*
     * The date and time change every build, so printing them would make
     * the output different each time. Check their shape instead:
     * "Mmm dd yyyy" is 11 characters and "hh:mm:ss" is 8.
     */
    printf("__DATE__ has %d characters, __TIME__ has %d\n",
           (int)strlen(date), (int)strlen(time));
    printf("time looks like hh:mm:ss: %s\n",
           time[2] == ':' && time[5] == ':' ? "yes" : "no");

    /* Passing them to a function records where the call was written. */
    where(__FILE__, __LINE__);
    where(__FILE__, __LINE__);
    return 0;
}
