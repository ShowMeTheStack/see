/* storage.c - one line per item: name quantity price. Text files are easy
 * to read by eye and do not depend on struct layout or byte order. */
#include <stdio.h>
#include "storage.h"

int storage_save(const struct inventory *inv, const char *path)
{
    FILE *f = fopen(path, "w");
    int i;

    if (f == NULL) {
        return 0;
    }
    for (i = 0; i < inv->count; i++) {
        fprintf(f, "%s %d %ld\n", inv->items[i].name, inv->items[i].qty, inv->items[i].price);
    }
    fclose(f);
    return 1;
}

/* Loading goes through inv_add, so the rules in inventory.c still apply. */
int storage_load(struct inventory *inv, const char *path)
{
    FILE *f = fopen(path, "r");
    char name[16];
    int qty;
    long price;
    int n = 0;

    if (f == NULL) {
        return -1;
    }
    inv_init(inv);
    while (fscanf(f, "%15s %d %ld", name, &qty, &price) == 3) {
        if (inv_add(inv, name, qty, price)) {
            n++;
        }
    }
    fclose(f);
    return n;
}
