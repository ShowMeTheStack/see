/*
 * title: Shop inventory with commands
 * level: 3
 * about: Runs a small stock-keeping shell: add items, sell them, restock, list stock and total value, all held in an array of structs.
 * input: add pen 120 0.75\nadd notebook 40 2.50\nadd ruler 25 1.20\nsell pen 30\nsell ruler 40\nrestock ruler 10\nsell eraser 1\nadd pen 10 0.80\nlist\nquit\n
 */
#include <stdio.h>
#include <string.h>

#define MAX_ITEMS 8

typedef struct {
    char name[16];
    int quantity;
    double price;       /* price per unit */
} Item;

/* The whole shop is one struct holding an array and a count. Passing a
   pointer to it gives every function the full picture in one argument. */
typedef struct {
    Item items[MAX_ITEMS];
    int count;
    double takings;
} Shop;

/* Linear search by name. Returning a pointer (or NULL) is a common C idiom:
   the caller can read and change the item it found directly. */
Item *find(Shop *s, const char *name)
{
    int i;
    for (i = 0; i < s->count; i++)
        if (strcmp(s->items[i].name, name) == 0)
            return &s->items[i];
    return NULL;
}

void add(Shop *s, const char *name, int qty, double price)
{
    Item *it = find(s, name);
    if (it != NULL) {
        it->quantity += qty;
        it->price = price;
        printf("updated %s: %d at %.2f\n", name, it->quantity, price);
        return;
    }
    if (s->count == MAX_ITEMS) {
        printf("shop is full\n");
        return;
    }
    it = &s->items[s->count++];
    strcpy(it->name, name);
    it->quantity = qty;
    it->price = price;
    printf("added %s\n", name);
}

void sell(Shop *s, const char *name, int qty)
{
    Item *it = find(s, name);
    if (it == NULL) {
        printf("no such item: %s\n", name);
    } else if (it->quantity < qty) {
        printf("only %d %s left, cannot sell %d\n", it->quantity, name, qty);
    } else {
        it->quantity -= qty;
        s->takings += qty * it->price;
        printf("sold %d %s for %.2f\n", qty, name, qty * it->price);
    }
}

void list(const Shop *s)
{
    int i;
    double value = 0.0;
    for (i = 0; i < s->count; i++) {
        const Item *it = &s->items[i];
        printf("  %-10s %4d x %6.2f = %8.2f\n", it->name, it->quantity,
               it->price, it->quantity * it->price);
        value += it->quantity * it->price;
    }
    printf("  stock value %.2f, takings %.2f\n", value, s->takings);
}

int main(void)
{
    /* = { 0 } zeroes the whole shop: count 0, takings 0, every item blank. */
    Shop shop = { 0 };
    char cmd[16], name[16];
    int qty;
    double price;

    while (scanf("%15s", cmd) == 1) {
        if (strcmp(cmd, "add") == 0 && scanf("%15s %d %lf", name, &qty, &price) == 3)
            add(&shop, name, qty, price);
        else if (strcmp(cmd, "sell") == 0 && scanf("%15s %d", name, &qty) == 2)
            sell(&shop, name, qty);
        else if (strcmp(cmd, "restock") == 0 && scanf("%15s %d", name, &qty) == 2) {
            Item *it = find(&shop, name);
            if (it) {
                it->quantity += qty;
                printf("restocked %s to %d\n", name, it->quantity);
            }
        } else if (strcmp(cmd, "list") == 0)
            list(&shop);
        else if (strcmp(cmd, "quit") == 0)
            break;
        else
            printf("unknown command %s\n", cmd);
    }
    return 0;
}
