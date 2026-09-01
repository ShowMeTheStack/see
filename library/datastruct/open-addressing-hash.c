/*
 * title: Hash table with open addressing
 * level: 3
 * about: Stores country codes in a single array using linear probing, shows the clusters that form, and deletes entries with tombstones so later lookups still work.
 */
#include <stdio.h>
#include <string.h>

#define SIZE 11

enum state { EMPTY, USED, DELETED };

/* No linked lists here: every entry lives in the table array itself. When a
   slot is taken, try the next one, and the next, wrapping round (linear
   probing). The whole table is one block in the globals, easy to watch. */
struct slot {
    enum state state;
    char code[3];
    char name[13];
};

struct slot table[SIZE];

unsigned hash(const char *code)
{
    return ((unsigned char)code[0] * 31u + (unsigned char)code[1]) % SIZE;
}

/* Returns the slot holding code, or -1. A lookup may stop at an EMPTY slot
   (the key would have been put there), but must step OVER a DELETED one:
   the key may have been placed beyond it before the deletion. */
int find(const char *code, int *probes)
{
    unsigned i = hash(code);
    int n;
    for (n = 0; n < SIZE; n++, i = (i + 1) % SIZE) {
        *probes = n + 1;
        if (table[i].state == EMPTY)
            return -1;
        if (table[i].state == USED && strcmp(table[i].code, code) == 0)
            return (int)i;
    }
    return -1;
}

int insert(const char *code, const char *name)
{
    unsigned i = hash(code);
    int n, probes;
    if (find(code, &probes) >= 0)
        return 0;
    for (n = 0; n < SIZE; n++, i = (i + 1) % SIZE)
        if (table[i].state != USED) {          /* EMPTY or a reusable tombstone */
            table[i].state = USED;
            strcpy(table[i].code, code);
            strcpy(table[i].name, name);
            printf("put %s (hash %u) in slot %u after %d probe%s\n", code, hash(code), i,
                   n + 1, n ? "s" : "");
            return 1;
        }
    printf("table full\n");
    return 0;
}

void erase(const char *code)
{
    int probes, i = find(code, &probes);
    if (i >= 0) {
        table[i].state = DELETED;               /* a tombstone, not EMPTY */
        printf("deleted %s from slot %d\n", code, i);
    }
}

void dump(void)
{
    int i;
    for (i = 0; i < SIZE; i++) {
        printf("  [%2d] ", i);
        if (table[i].state == USED)
            printf("%s %-12s (home %u)\n", table[i].code, table[i].name, hash(table[i].code));
        else
            printf("%s\n", table[i].state == DELETED ? "<tombstone>" : "-");
    }
}

void lookup(const char *code)
{
    int probes, i = find(code, &probes);
    if (i >= 0)
        printf("lookup %s: %s, %d probe%s\n", code, table[i].name, probes, probes == 1 ? "" : "s");
    else
        printf("lookup %s: not found, %d probe%s\n", code, probes, probes == 1 ? "" : "s");
}

int main(void)
{
    /* Globals start zeroed, so every slot begins EMPTY (which is 0). */
    insert("FR", "France");
    insert("DE", "Germany");
    insert("JP", "Japan");
    insert("BR", "Brazil");
    insert("IN", "India");
    insert("KE", "Kenya");
    insert("NZ", "New Zealand");
    insert("CA", "Canada");
    dump();

    lookup("NZ");
    lookup("US");

    erase("DE");
    dump();
    /* Anything that probed past DE's slot must still be found. */
    lookup("KE");
    lookup("CA");
    insert("ID", "Indonesia");  /* hash 10: lands on the tombstone and reuses it */
    dump();
    return 0;
}
