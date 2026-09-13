/*
 * title: Copying a file two ways
 * level: 2
 * about: Copies a file byte by byte with fgetc/fputc and again in blocks with fread/fwrite, then checks both copies match.
 */
#include <stdio.h>
#include <string.h>

/* The simple way: one byte at a time. Easy to get right. */
static long copy_bytes(const char *from, const char *to)
{
    FILE *in, *out;
    int c;
    long n = 0;

    in = fopen(from, "rb");
    if (in == NULL) {
        perror(from);
        return -1;
    }
    out = fopen(to, "wb");
    if (out == NULL) {
        perror(to);
        fclose(in);         /* do not leak the one that did open */
        return -1;
    }
    while ((c = fgetc(in)) != EOF) {
        fputc(c, out);
        n++;
    }
    fclose(in);
    fclose(out);
    return n;
}

/* The faster way: a buffer at a time. fread returns how many bytes it
   really got; the last block is usually short, so write exactly that many,
   never sizeof buf. Watch got shrink on the last pass. */
static long copy_blocks(const char *from, const char *to)
{
    FILE *in, *out;
    char buf[16];       /* tiny on purpose, so you see several passes */
    size_t got;
    long n = 0;

    in = fopen(from, "rb");
    if (in == NULL) {
        perror(from);
        return -1;
    }
    out = fopen(to, "wb");
    if (out == NULL) {
        perror(to);
        fclose(in);
        return -1;
    }
    while ((got = fread(buf, 1, sizeof buf, in)) > 0) {
        fwrite(buf, 1, got, out);
        n += (long)got;
        printf("  block of %2d bytes\n", (int)got);
    }
    fclose(in);
    fclose(out);
    return n;
}

/* Compare two files byte by byte. */
static int same_file(const char *a, const char *b)
{
    FILE *fa = fopen(a, "rb");
    FILE *fb = fopen(b, "rb");
    int ca, cb, same = 1;

    if (fa == NULL || fb == NULL) {
        if (fa) fclose(fa);
        if (fb) fclose(fb);
        return 0;
    }
    do {
        ca = fgetc(fa);
        cb = fgetc(fb);
        if (ca != cb)
            same = 0;
    } while (same && ca != EOF);
    fclose(fa);
    fclose(fb);
    return same;
}

int main(void)
{
    FILE *fp;

    fp = fopen("/tmp/original.txt", "w");
    if (fp == NULL) {
        perror("/tmp/original.txt");
        return 1;
    }
    fputs("Copying is just reading and writing\nin a loop until the input runs out.\n", fp);
    fclose(fp);

    printf("byte copy: %ld bytes\n", copy_bytes("/tmp/original.txt", "/tmp/copy1.txt"));
    printf("block copy:\n");
    printf("block copy: %ld bytes\n", copy_blocks("/tmp/original.txt", "/tmp/copy2.txt"));
    printf("copy1 matches: %s\n", same_file("/tmp/original.txt", "/tmp/copy1.txt") ? "yes" : "no");
    printf("copy2 matches: %s\n", same_file("/tmp/original.txt", "/tmp/copy2.txt") ? "yes" : "no");

    /* Copying from a file that is not there fails cleanly. */
    printf("missing: %ld\n", copy_bytes("/tmp/no-such-file.txt", "/tmp/copy3.txt"));
    return 0;
}
