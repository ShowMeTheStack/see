/*
 * title: When fopen fails: NULL, errno and perror
 * level: 1
 * about: Tries to open a missing file, a folder and a bad mode, and reports each failure with perror and strerror.
 */
#include <stdio.h>
#include <string.h>
#include <errno.h>

/* Try one open and report what happened. On failure fopen returns NULL
   and leaves a reason code in errno. perror prints your text, a colon,
   and the reason in words. */
static void try_open(const char *path, const char *mode)
{
    FILE *fp;

    errno = 0;
    fp = fopen(path, mode);
    if (fp == NULL) {
        printf("fopen(\"%s\", \"%s\") failed, errno %d\n", path, mode, errno);
        perror("  perror says");
        printf("  strerror says: %s\n", strerror(errno));
        return;
    }
    printf("fopen(\"%s\", \"%s\") worked\n", path, mode);
    fclose(fp);
}

int main(void)
{
    /* Make one file that really exists. */
    FILE *fp = fopen("/tmp/here.txt", "w");

    if (fp == NULL) {
        perror("/tmp/here.txt");
        return 1;
    }
    fputs("hello\n", fp);
    fclose(fp);

    /* Make sure the missing file really is missing, even on a second run
       (the "a" open below creates it). */
    remove("/tmp/not-here.txt");

    try_open("/tmp/here.txt", "r");                 /* fine */
    try_open("/tmp/not-here.txt", "r");             /* reading needs the file */
    try_open("/tmp/not-here.txt", "a");             /* appending creates it */
    try_open("/tmp", "w");                          /* a folder is not a file */
    try_open("/tmp/here.txt", "rw");                /* not a valid mode string */

    /* The classic mistake is to skip the check: fgets(buf, n, NULL)
       would crash. Every fopen in this library is followed by an if. */
    return 0;
}
