/*
 * title: Name badge with a buffer that is too small
 * level: 1
 * about: Copies a guest's name into an eight-character badge buffer with strcpy and overruns it.
 * expect: fault
 */

/*
 * THE PUZZLE
 * The badge array was sized for short names. The first guest fits.
 * The second does not. strcpy has no idea how big the destination is:
 * it copies characters until it has copied the '\0', wherever that
 * leads.
 *
 * HOW TO HUNT IT WITH SEE
 * Run it and read the message: See says which array was overrun and by
 * how much. Then press F8 to step back to the first call and look at
 * badge in the memory picture after "Ada" goes in: three letters, a
 * '\0', and four spare boxes. Count the letters in the second name,
 * add one for the '\0', and compare with 8.
 */
#include <stdio.h>
#include <string.h>

static void print_badge(const char *guest)
{
    char badge[8];

    strcpy(badge, guest);
    printf("+----------+\n");
    printf("| %-8s |\n", badge);
    printf("+----------+\n");
}

int main(void)
{
    print_badge("Ada");
    print_badge("Bartholomew");
    return 0;
}

/*
 * THE FIX
 * Either make the buffer big enough for every name you will ever be
 * given (you rarely know that), or copy at most what fits and end the
 * string yourself:
 *
 *     strncpy(badge, guest, sizeof badge - 1);
 *     badge[sizeof badge - 1] = '\0';
 *
 * strncpy does not add the '\0' when the source is too long, which is
 * why the second line is needed. Here sizeof badge works because badge
 * is a real array in this function, not a pointer parameter.
 */
