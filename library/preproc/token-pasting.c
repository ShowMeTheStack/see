/*
 * title: Token pasting with ## to generate code
 * level: 3
 * about: Uses ## to build variable and function names, generating a getter and setter for each field of a settings record.
 */
#include <stdio.h>

/*
 * a ## b glues two tokens into one. CAT(count, 3) gives the single
 * identifier count3, which the compiler then treats like any name
 * you typed yourself.
 */
#define CAT(a, b)  a ## b

/*
 * A record of settings. Writing get_ and set_ functions by hand for
 * every field is boring and easy to get wrong, so a macro writes them.
 */
struct settings {
    int volume;
    int brightness;
    int timeout;
};

static struct settings current = { 50, 80, 30 };

/*
 * ACCESSORS(volume, 0, 100) produces two complete functions:
 *   int  get_volume(void)
 *   void set_volume(int v)   which also keeps v inside 0..100.
 * # turns the field name into a string for the message as well.
 */
#define ACCESSORS(field, lo, hi)                                  \
    static int get_ ## field(void) { return current.field; }      \
    static void set_ ## field(int v)                              \
    {                                                             \
        if (v < (lo)) v = (lo);                                   \
        if (v > (hi)) v = (hi);                                   \
        printf("  %-10s %3d -> %3d\n", #field, current.field, v); \
        current.field = v;                                        \
    }

ACCESSORS(volume, 0, 100)
ACCESSORS(brightness, 10, 100)
ACCESSORS(timeout, 5, 600)

int main(void)
{
    /* These three variables are named by pasting too. */
    int CAT(level, 1) = 1;
    int CAT(level, 2) = 2;
    int CAT(level, 3) = 3;

    printf("levels: %d %d %d\n", level1, level2, level3);

    printf("changes:\n");
    set_volume(75);
    set_brightness(0);       /* below the minimum, gets clamped to 10 */
    set_timeout(9999);       /* above the maximum, gets clamped to 600 */
    set_volume(get_volume() - 10);

    printf("now: volume %d, brightness %d, timeout %d\n",
           get_volume(), get_brightness(), get_timeout());

    /*
     * Step into set_timeout in See (F11). The call stack shows a real
     * function called set_timeout, even though those letters appear
     * nowhere in the source as one word.
     */
    return 0;
}
