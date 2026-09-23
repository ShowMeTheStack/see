/*
 * title: Saving an inventory to a file
 * level: 2
 * about: Builds a shop inventory, sells from it, saves it to /tmp and loads it back into a second copy.
 */

/* inventory.c keeps the rules, storage.c handles the file, and main.c
 * uses both. See compiles each .c file separately, then links them. The
 * saved file is plain text, one item per line: "pencil 35 45". */
#include <stdio.h>
#include "inventory.h"
#include "storage.h"

int main(void)
{
    struct inventory shop, copy;
    const char *path = "/tmp/shop.txt";
    int n;

    inv_init(&shop);
    inv_add(&shop, "pencil", 40, 45);
    inv_add(&shop, "notebook", 12, 250);
    inv_add(&shop, "eraser", 25, 30);
    inv_add(&shop, "pencil", 10, 45);    /* tops up, no new line */
    inv_print("opening stock:", &shop);

    printf("sell 15 pencils: %s\n", inv_sell(&shop, "pencil", 15) ? "ok" : "no");
    printf("sell 20 notebooks: %s\n", inv_sell(&shop, "notebook", 20) ? "ok" : "no");
    printf("sell 1 stapler: %s\n", inv_sell(&shop, "stapler", 1) ? "ok" : "no");

    if (!storage_save(&shop, path)) {
        printf("cannot write %s\n", path);
        return 1;
    }
    n = storage_load(&copy, path);
    printf("loaded %d items back from %s\n", n, path);
    inv_print("copy from file:", &copy);
    printf("same value: %s\n", inv_value(&shop) == inv_value(&copy) ? "yes" : "no");
    return 0;
}
