/*
 * title: Updating one record in place
 * level: 3
 * about: Keeps bank accounts as fixed-size records in a binary file and changes one balance by seeking straight to it in r+b mode.
 */
#include <stdio.h>
#include <string.h>

struct account {
    int number;
    char owner[12];
    long balance;       /* in cents, so no rounding surprises */
};

/* Record k starts at byte k * sizeof(struct account). That one
   multiplication is the whole trick of fixed-size records. */
static long offset_of(int k)
{
    return (long)k * (long)sizeof(struct account);
}

static void list_all(const char *path)
{
    FILE *fp;
    struct account a;

    fp = fopen(path, "rb");
    if (fp == NULL) {
        perror(path);
        return;
    }
    /* Loop on fread's return value, not on feof. */
    while (fread(&a, sizeof a, 1, fp) == 1)
        printf("  #%d %-8s %7ld.%02ld\n", a.number, a.owner, a.balance / 100, a.balance % 100);
    fclose(fp);
}

int main(void)
{
    const char *path = "/tmp/bank.dat";
    struct account a;
    FILE *fp;
    int k;
    const char *names[4];

    names[0] = "Ines"; names[1] = "Kofi"; names[2] = "Lena"; names[3] = "Marek";

    fp = fopen(path, "wb");
    if (fp == NULL) {
        perror(path);
        return 1;
    }
    for (k = 0; k < 4; k++) {
        memset(&a, 0, sizeof a);
        a.number = 1000 + k;
        strcpy(a.owner, names[k]);
        a.balance = 5000L * (k + 1);
        fwrite(&a, sizeof a, 1, fp);
    }
    fclose(fp);
    printf("before:\n");
    list_all(path);

    /* "r+b" opens for reading AND writing without emptying the file
       ("w+b" would wipe it). */
    fp = fopen(path, "r+b");
    if (fp == NULL) {
        perror(path);
        return 1;
    }

    /* Jump straight to record 2 (Lena) - no need to read 0 and 1. */
    k = 2;
    fseek(fp, offset_of(k), SEEK_SET);
    printf("seeked to byte %ld\n", ftell(fp));
    fread(&a, sizeof a, 1, fp);
    printf("read %s with %ld cents\n", a.owner, a.balance);

    a.balance += 1234;          /* a deposit of 12.34 */

    /* Reading moved the position past the record, so seek back before
       writing. The C standard also demands a seek between a read and a
       write on the same stream. */
    fseek(fp, offset_of(k), SEEK_SET);
    fwrite(&a, sizeof a, 1, fp);
    fclose(fp);

    printf("after:\n");
    list_all(path);
    return 0;
}
