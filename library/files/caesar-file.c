/*
 * title: Encrypting a file with a Caesar shift
 * level: 2
 * about: Reads a message file, writes a shifted copy to a second file, then decrypts that copy into a third and checks it matches.
 */
#include <stdio.h>
#include <ctype.h>

/* Shift letters by key places around the alphabet, leave the rest. */
static int shift(int c, int key)
{
    if (isupper(c))
        return 'A' + (c - 'A' + key) % 26;
    if (islower(c))
        return 'a' + (c - 'a' + key) % 26;
    return c;
}

/* Stream filter: read from one FILE, write to another. Returns the number
   of characters, or -1 if a file will not open. */
static long transform(const char *from, const char *to, int key)
{
    FILE *in, *out;
    int c;
    long n = 0;

    in = fopen(from, "r");
    if (in == NULL) {
        perror(from);
        return -1;
    }
    out = fopen(to, "w");
    if (out == NULL) {
        perror(to);
        fclose(in);
        return -1;
    }
    while ((c = fgetc(in)) != EOF) {
        fputc(shift(c, key), out);
        n++;
    }
    fclose(in);
    fclose(out);
    return n;
}

static void show(const char *label, const char *path)
{
    FILE *fp = fopen(path, "r");
    int c;

    printf("%s: ", label);
    if (fp == NULL) {
        printf("(cannot open)\n");
        return;
    }
    while ((c = fgetc(fp)) != EOF)
        putchar(c);
    fclose(fp);
}

int main(void)
{
    FILE *fp;
    int key = 3;

    fp = fopen("/tmp/plain.txt", "w");
    if (fp == NULL) {
        perror("/tmp/plain.txt");
        return 1;
    }
    fputs("Meet me at the Old Bridge, 9pm. Bring Zoe.\n", fp);
    fclose(fp);

    transform("/tmp/plain.txt", "/tmp/secret.txt", key);
    /* Decrypting is shifting forward by 26 - key: the long way round. */
    transform("/tmp/secret.txt", "/tmp/again.txt", 26 - key);

    show("plain ", "/tmp/plain.txt");
    show("secret", "/tmp/secret.txt");
    show("again ", "/tmp/again.txt");
    return 0;
}
