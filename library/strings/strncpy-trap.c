/*
 * title: The strncpy NUL trap
 * level: 2
 * about: Shows that strncpy leaves out the terminating NUL when the source is too long, pads with zeros when it is short, and how to use it safely.
 * expect: runtime
 */
#include <stdio.h>
#include <string.h>

static void bytes(const char *label, const char *p, int n)
{
    int i;
    printf("%-26s", label);
    for (i = 0; i < n; i++) {
        if (p[i] == '\0')
            printf(" \\0");
        else
            printf("  %c", p[i]);
    }
    printf("\n");
}

int main(void)
{
    char box[6];
    char safe[6];

    /* Short source: strncpy copies "hi" and then pads every remaining byte
       with NUL, all the way to n. Wasteful, but the result is a string. */
    memset(box, '#', sizeof box);
    strncpy(box, "hi", sizeof box);
    bytes("strncpy \"hi\", 6:", box, 6);

    /* Long source: strncpy copies exactly 6 bytes and stops. There is no
       room for a NUL, so it simply does not write one. box is now six
       letters and no terminator: not a string at all. Printing it with %s
       would read past the end of the array; See would stop the program
       with an out-of-bounds read. So only print it byte by byte.
       Step over the strncpy (F10): See notices the missing NUL at once
       and shows a warning. That warning is the point of this example. */
    memset(box, '#', sizeof box);
    strncpy(box, "elephant", sizeof box);
    bytes("strncpy \"elephant\", 6:", box, 6);

    /* The fix: copy at most size-1 bytes, then put the NUL in yourself.
       The last byte is written whatever happens, so the result is always
       a string, cut short if it had to be. */
    strncpy(safe, "elephant", sizeof safe - 1);
    safe[sizeof safe - 1] = '\0';
    bytes("strncpy size-1, then NUL:", safe, 6);
    printf("safe as a string: \"%s\"\n", safe);

    /* Another safe idiom, one line and no padding: let sprintf limit the
       length with a precision. %.5s prints at most 5 characters. */
    sprintf(safe, "%.5s", "hippopotamus");
    printf("sprintf %%.5s: \"%s\"\n", safe);
    return 0;
}
