/*
 * title: Saving structs with fwrite and fread
 * level: 2
 * about: Writes an array of product structs to a binary file in one fwrite, reads them back with fread and compares.
 */
#include <stdio.h>
#include <string.h>

struct product {
    int id;
    char name[12];
    double price;
};

int main(void)
{
    struct product stock[3];
    struct product back[3];
    FILE *fp;
    size_t n;
    int i;

    /* Fill the array field by field (C89 has no designated initialisers
       for this kind of thing, and memset first zeroes the padding bytes so
       nothing uninitialised lands in the file). */
    memset(stock, 0, sizeof stock);
    stock[0].id = 101; strcpy(stock[0].name, "pencil");  stock[0].price = 0.45;
    stock[1].id = 102; strcpy(stock[1].name, "notebook"); stock[1].price = 2.99;
    stock[2].id = 103; strcpy(stock[2].name, "ruler");   stock[2].price = 1.25;

    printf("one struct is %d bytes (id 4, name 12, price 8)\n", (int)sizeof(struct product));

    /* "wb": the b means binary. The bytes of the structs go to the file
       exactly as they sit in memory: no digits, no spaces. */
    fp = fopen("/tmp/stock.bin", "wb");
    if (fp == NULL) {
        perror("/tmp/stock.bin");
        return 1;
    }
    n = fwrite(stock, sizeof stock[0], 3, fp);
    printf("fwrite wrote %d records\n", (int)n);
    fclose(fp);

    /* Read them into a different array. Before this fread, back is full
       of garbage; step over it and watch all three structs appear at once. */
    fp = fopen("/tmp/stock.bin", "rb");
    if (fp == NULL) {
        perror("/tmp/stock.bin");
        return 1;
    }
    n = fread(back, sizeof back[0], 3, fp);
    printf("fread read %d records\n", (int)n);

    /* A fourth fread finds nothing: it returns 0, which is how you know
       the file is used up. */
    n = fread(back, sizeof back[0], 1, fp);
    printf("one more fread returns %d\n", (int)n);
    fclose(fp);

    for (i = 0; i < 3; i++)
        printf("%d %-9s %6.2f\n", back[i].id, back[i].name, back[i].price);

    /* Same bytes in, same bytes out. */
    printf("identical: %s\n", memcmp(stock, back, sizeof stock) == 0 ? "yes" : "no");
    return 0;
}
