#include <stdio.h>
#include <string.h>
#include "inventory.h"

void inv_init(struct inventory *inv)
{
    memset(inv, 0, sizeof *inv);    /* every item, every byte, zero */
}

static struct item *find(struct inventory *inv, const char *name)
{
    int i;
    for (i = 0; i < inv->count; i++) {
        if (strcmp(inv->items[i].name, name) == 0) {
            return &inv->items[i];
        }
    }
    return NULL;
}

/* Adding an existing name tops up its quantity instead of duplicating it. */
int inv_add(struct inventory *inv, const char *name, int qty, long price)
{
    struct item *it = find(inv, name);

    if (it == NULL) {
        if (inv->count == INV_MAX || strlen(name) >= sizeof it->name) {
            return 0;
        }
        it = &inv->items[inv->count++];
        strcpy(it->name, name);
        it->price = price;
    }
    it->qty += qty;
    return 1;
}

int inv_sell(struct inventory *inv, const char *name, int qty)
{
    struct item *it = find(inv, name);

    if (it == NULL || it->qty < qty) {
        return 0;
    }
    it->qty -= qty;
    return 1;
}

long inv_value(const struct inventory *inv)
{
    long total = 0;
    int i;
    for (i = 0; i < inv->count; i++) {
        total += inv->items[i].qty * inv->items[i].price;
    }
    return total;
}

void inv_print(const char *title, const struct inventory *inv)
{
    int i;
    long v = inv_value(inv);

    printf("%s\n", title);
    for (i = 0; i < inv->count; i++) {
        printf("  %-10s %3d x %3ld.%02ld\n", inv->items[i].name, inv->items[i].qty,
               inv->items[i].price / 100, inv->items[i].price % 100);
    }
    printf("  stock value %ld.%02ld\n", v / 100, v % 100);
}
