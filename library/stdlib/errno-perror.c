/*
 * title: Reporting failures with errno, perror and strerror
 * level: 2
 * about: Triggers real failures from fopen, remove and strtol, reports each one with perror and strerror, and shows the right way to use errno.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <errno.h>

/*
 * Many library functions report WHAT went wrong by storing a number in
 * the global errno. Three rules:
 *   1. Check the function's own return value first (NULL, -1, EOF...).
 *      errno is only meaningful once you know the call failed.
 *   2. Successful calls may leave errno alone OR change it, so a
 *      leftover value means nothing. Set errno = 0 first when the
 *      return value alone cannot show failure, as with strtol.
 *   3. Read it straight away: the next call may overwrite it.
 */
static void try_open(const char *path, const char *mode)
{
    FILE *f;
    int saved;

    errno = 0;
    f = fopen(path, mode);
    if (f == NULL) {
        saved = errno;                 /* rule 3: copy it now */
        printf("fopen(\"%s\", \"%s\") failed, errno %d\n", path, mode, saved);
        printf("  strerror says: %s\n", strerror(saved));
        /* perror prints your text, a colon, and the message, on stderr */
        perror("  perror says");
        return;
    }
    printf("fopen(\"%s\", \"%s\") worked\n", path, mode);
    fclose(f);
}

int main(void)
{
    long v;
    char *end;
    int e, i;
    int codes[7];

    try_open("/tmp/errno-demo.txt", "w");     /* fine: /tmp is writable */
    try_open("/no/such/folder/file.txt", "r");
    try_open("/tmp/not-there-yet.txt", "r");
    try_open("/tmp", "w");                     /* a directory, not a file */

    codes[0] = 2; codes[1] = 12; codes[2] = 13; codes[3] = 21;
    codes[4] = 22; codes[5] = EDOM; codes[6] = ERANGE;

    /* remove returns nonzero on failure. Removing a file twice fails
       the second time. */
    if (remove("/tmp/errno-demo.txt") == 0)
        printf("removed /tmp/errno-demo.txt\n");
    errno = 0;
    if (remove("/tmp/errno-demo.txt") != 0)
        perror("second remove");

    /* strtol can return LONG_MAX legitimately, so only errno tells. */
    errno = 0;
    v = strtol("123456789012345", &end, 10);
    e = errno;
    printf("strtol of a huge number gave %ld, errno %s\n", v,
           e == ERANGE ? "ERANGE" : "0");
    printf("  that is: %s\n", strerror(e));

    /*
     * strerror works for any error number. C89 itself names only EDOM
     * and ERANGE; the other numbers come from the system, which is why
     * portable programs print the message rather than test the number.
     */
    printf("some messages:\n");
    for (i = 0; i < 7; i++)
        printf("  %2d %s\n", codes[i], strerror(codes[i]));

    /*
     * In See, errno appears among the globals. Watch it change on the
     * failing calls, and see that nothing resets it after a success.
     */
    return 0;
}
