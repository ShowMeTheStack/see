/*
 * title: A tiny database of fixed-size records
 * level: 4
 * about: Runs commands from stdin against a file of fixed-size contact records: add, find, update, delete (by tombstone), list and compact.
 * input: add Ada 5551234\nadd Brian 5550001\nadd Grace 5559876\nadd Linus 5554242\nadd Edsger 5550101\nlist\nfind Grace\nset Brian 5550002\ndel Ada\ndel Linus\nlist\nadd Ken 5557777\nlist\ncompact\nlist\nfind Ada\nquit\n
 */
#include <stdio.h>
#include <string.h>

#define DB   "/tmp/contacts.db"
#define TMP  "/tmp/contacts.tmp"

/* Every record is the same size, so record k lives at k * sizeof(struct
   rec) and can be reached with one fseek. Deleting just clears the used
   flag (a "tombstone"); compact later rewrites the file without the dead
   records. */
struct rec {
    int used;
    char name[16];
    long phone;
};

static FILE *db;

/* Find the record index for a name, or -1. Reads the file from the top. */
static int find(const char *name, struct rec *out)
{
    struct rec r;
    int k = 0;

    rewind(db);
    while (fread(&r, sizeof r, 1, db) == 1) {
        if (r.used && strcmp(r.name, name) == 0) {
            if (out)
                *out = r;
            return k;
        }
        k++;
    }
    return -1;
}

static void put(int k, const struct rec *r)
{
    fseek(db, (long)k * (long)sizeof *r, SEEK_SET);
    fwrite(r, sizeof *r, 1, db);
    fflush(db);
}

/* Reuse the first tombstone if there is one, so deleted space is recycled. */
static int free_slot(void)
{
    struct rec r;
    int k = 0;

    rewind(db);
    while (fread(&r, sizeof r, 1, db) == 1) {
        if (!r.used)
            return k;
        k++;
    }
    return k;       /* one past the end: the file grows */
}

static void list(void)
{
    struct rec r;
    int k = 0;

    rewind(db);
    while (fread(&r, sizeof r, 1, db) == 1) {
        if (r.used)
            printf("  %2d  %-10s %ld\n", k, r.name, r.phone);
        else
            printf("  %2d  (deleted)\n", k);
        k++;
    }
}

/* Copy live records to a new file, then swap it in with remove + rename. */
static void compact(void)
{
    FILE *out;
    struct rec r;
    int kept = 0, dropped = 0;

    out = fopen(TMP, "wb");
    if (out == NULL) {
        perror(TMP);
        return;
    }
    rewind(db);
    while (fread(&r, sizeof r, 1, db) == 1) {
        if (r.used) {
            fwrite(&r, sizeof r, 1, out);
            kept++;
        } else {
            dropped++;
        }
    }
    fclose(out);
    fclose(db);
    remove(DB);
    rename(TMP, DB);
    db = fopen(DB, "r+b");
    printf("compacted: kept %d, dropped %d\n", kept, dropped);
}

int main(void)
{
    char cmd[16], name[16];
    long phone;
    struct rec r;
    int k;

    db = fopen(DB, "w+b");      /* start with an empty database */
    if (db == NULL) {
        perror(DB);
        return 1;
    }

    while (scanf("%15s", cmd) == 1 && db != NULL) {
        if (strcmp(cmd, "quit") == 0)
            break;
        if (strcmp(cmd, "add") == 0 && scanf("%15s %ld", name, &phone) == 2) {
            memset(&r, 0, sizeof r);
            r.used = 1;
            strcpy(r.name, name);
            r.phone = phone;
            k = free_slot();
            put(k, &r);
            printf("added %s at slot %d\n", name, k);
        } else if (strcmp(cmd, "find") == 0 && scanf("%15s", name) == 1) {
            k = find(name, &r);
            if (k < 0)
                printf("%s: not found\n", name);
            else
                printf("%s: %ld (slot %d)\n", r.name, r.phone, k);
        } else if (strcmp(cmd, "set") == 0 && scanf("%15s %ld", name, &phone) == 2) {
            k = find(name, &r);
            if (k >= 0) {
                r.phone = phone;
                put(k, &r);
                printf("updated %s\n", name);
            }
        } else if (strcmp(cmd, "del") == 0 && scanf("%15s", name) == 1) {
            k = find(name, &r);
            if (k >= 0) {
                r.used = 0;     /* the bytes stay, only the flag changes */
                put(k, &r);
                printf("deleted %s\n", name);
            }
        } else if (strcmp(cmd, "list") == 0) {
            list();
        } else if (strcmp(cmd, "compact") == 0) {
            compact();
        } else {
            printf("? %s\n", cmd);
        }
    }
    if (db != NULL)
        fclose(db);
    return 0;
}
