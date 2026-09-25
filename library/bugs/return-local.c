/*
 * title: Returning the address of a local array
 * level: 2
 * about: Formats a temperature into a local buffer and returns a pointer to it after the function has ended.
 * expect: warning, fault
 */

/*
 * THE PUZZLE
 * format_temp() builds a nice string in buf and returns buf. The
 * compiler already complains about this line. Why? Where does buf
 * live, and how long does it live there?
 *
 * HOW TO HUNT IT WITH SEE
 * Read the warning in the build panel first. Then step into
 * format_temp with F11 and watch its frame appear on the stack with
 * buf inside it. Step out with Shift+F11: the frame is gone, but the
 * variable label in main still holds an arrow pointing down into the
 * space where the frame used to be. When printf follows that arrow,
 * See stops it: the memory belongs to a function that has returned.
 * On a real machine the text might even print correctly once, and then
 * be overwritten by the next call. That is why this bug survives
 * testing.
 */
#include <stdio.h>

static char *format_temp(int tenths)
{
    char buf[32];

    sprintf(buf, "%d.%d degrees", tenths / 10, tenths % 10);
    return buf;
}

int main(void)
{
    char *label = format_temp(215);

    printf("Today: %s\n", label);
    return 0;
}

/*
 * THE FIX
 * Give the buffer a lifetime longer than the function. Three common
 * ways: let the caller pass in the buffer (the usual C style),
 *
 *     static void format_temp(char *buf, int tenths)
 *
 * or malloc the buffer and make the caller free it, or make buf
 * static (one shared buffer, overwritten by each call, which is how
 * some old library functions such as asctime work).
 */
