/* table.h - a hash table from words to counts, with separate chaining. */
#ifndef TABLE_H
#define TABLE_H

typedef struct table Table;

struct entry {
    char *word;
    int count;
    struct entry *next;     /* the next entry in the same bucket */
};

Table *table_new(int nbuckets);
void table_free(Table *t);
void table_add(Table *t, const char *word);
int table_size(const Table *t);
/* Copies pointers to every entry into out (room for table_size), for sorting. */
void table_entries(const Table *t, struct entry **out);
void table_show_buckets(const Table *t);

#endif
