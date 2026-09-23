/* storage.h - saving and loading an inventory as a text file. Kept apart
 * from inventory.c, so the file format can change without touching it. */
#ifndef STORAGE_H
#define STORAGE_H
#include "inventory.h"
int storage_save(const struct inventory *inv, const char *path);
int storage_load(struct inventory *inv, const char *path);
#endif
