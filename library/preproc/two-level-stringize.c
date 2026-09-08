/*
 * title: Stringizing a macro's value, not its name
 * level: 3
 * about: Explains why STR(VERSION_MAJOR) gives the name while XSTR(VERSION_MAJOR) gives the number, and builds a version string at compile time.
 */
#include <stdio.h>
#include <string.h>

#define VERSION_MAJOR 2
#define VERSION_MINOR 14
#define BUILD_NAME    lighthouse

/*
 * # stringizes its argument exactly as written, BEFORE any macros in
 * the argument are expanded. So STR(VERSION_MAJOR) is "VERSION_MAJOR".
 */
#define STR(x)  #x

/*
 * XSTR passes its argument through one more macro. An argument that is
 * not next to # or ## is fully expanded before it is substituted, so by
 * the time STR sees it, VERSION_MAJOR has already become 2.
 */
#define XSTR(x) STR(x)

/*
 * Adjacent string literals join into one, so this whole version string
 * is a single literal made by the preprocessor and compiler. No
 * sprintf runs at all.
 */
#define VERSION_STRING  XSTR(VERSION_MAJOR) "." XSTR(VERSION_MINOR)
#define BANNER          "build " XSTR(BUILD_NAME) " v" VERSION_STRING

/* The same trick works for __LINE__, which is a number, not a string. */
#define WHERE  __FILE__ ":" XSTR(__LINE__)

int main(void)
{
    printf("STR(VERSION_MAJOR)  gives \"%s\"\n", STR(VERSION_MAJOR));
    printf("XSTR(VERSION_MAJOR) gives \"%s\"\n", XSTR(VERSION_MAJOR));
    printf("STR(__LINE__)  gives \"%s\"\n", STR(__LINE__));
    printf("XSTR(__LINE__) gives \"%s\"\n", XSTR(__LINE__));

    printf("%s\n", BANNER);
    printf("the banner is %d characters long, known at compile time: %d\n",
           (int)strlen(BANNER), (int)sizeof(BANNER) - 1);
    printf("this line is %s\n", WHERE);

    /*
     * Look in See's string literals pane: "build lighthouse v2.14" sits
     * there as one finished string, and so does "/prog.c:47" or
     * whatever line WHERE was used on.
     */
    return 0;
}
