/* inventory.h - a shop's stock list. */
#ifndef INVENTORY_H
#define INVENTORY_H

#define INV_MAX 10

struct item {
    char name[16];
    int qty;
    long price;         /* in cents */
};

struct inventory {
    struct item items[INV_MAX];
    int count;
};

void inv_init(struct inventory *inv);
int inv_add(struct inventory *inv, const char *name, int qty, long price);
int inv_sell(struct inventory *inv, const char *name, int qty);
long inv_value(const struct inventory *inv);
void inv_print(const char *title, const struct inventory *inv);

#endif
