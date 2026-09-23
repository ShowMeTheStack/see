/* config.c - keeps the settings in a static table of heap strings.
 * Blank lines and lines starting with # are skipped; spaces around keys
 * and values are trimmed; a later line overrides an earlier one. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "config.h"

struct entry {
    char *key;
    char *value;
};

static struct entry table[CFG_MAX];
static int count = 0;

static char *dup_string(const char *s)
{
    char *p = malloc(strlen(s) + 1);   /* + 1 for the '\0' */
    if (p != NULL) {
        strcpy(p, s);
    }
    return p;
}

static char *trim(char *s)
{
    char *end;

    while (isspace((unsigned char)*s)) {
        s++;
    }
    end = s + strlen(s);
    while (end > s && isspace((unsigned char)end[-1])) {
        *--end = '\0';
    }
    return s;
}

static struct entry *find(const char *key)
{
    int i;
    for (i = 0; i < count; i++) {
        if (strcmp(table[i].key, key) == 0) {
            return &table[i];
        }
    }
    return NULL;
}

static void set(const char *key, const char *value)
{
    struct entry *e = find(key);

    if (e != NULL) {
        free(e->value);
        e->value = dup_string(value);
        return;
    }
    if (count == CFG_MAX) {
        return;
    }
    table[count].key = dup_string(key);
    table[count].value = dup_string(value);
    count++;
}

int config_load(const char *path)
{
    FILE *f = fopen(path, "r");
    char line[128];
    char *eq, *key, *value, *s;
    int lineno = 0;

    if (f == NULL) {
        return 0;
    }
    while (fgets(line, sizeof line, f) != NULL) {
        lineno++;
        s = trim(line);
        if (*s == '\0' || *s == '#') {
            continue;
        }
        eq = strchr(s, '=');
        if (eq == NULL) {
            printf("line %d: no '=', ignored: %s\n", lineno, s);
            continue;
        }
        *eq = '\0';         /* split the line in two, in place */
        key = trim(s);
        value = trim(eq + 1);
        set(key, value);
    }
    fclose(f);
    return 1;
}

const char *config_get(const char *key, const char *fallback)
{
    struct entry *e = find(key);
    return e != NULL ? e->value : fallback;
}

int config_get_int(const char *key, int fallback)
{
    const char *v = config_get(key, NULL);
    char *end;
    long n;

    if (v == NULL) {
        return fallback;
    }
    n = strtol(v, &end, 10);
    return (*end == '\0' && end != v) ? (int)n : fallback;
}

int config_get_bool(const char *key, int fallback)
{
    const char *v = config_get(key, NULL);

    if (v == NULL) {
        return fallback;
    }
    if (strcmp(v, "yes") == 0 || strcmp(v, "true") == 0 || strcmp(v, "1") == 0) {
        return 1;
    }
    if (strcmp(v, "no") == 0 || strcmp(v, "false") == 0 || strcmp(v, "0") == 0) {
        return 0;
    }
    return fallback;
}

void config_dump(void)
{
    int i;
    for (i = 0; i < count; i++) {
        printf("  %-10s = \"%s\"\n", table[i].key, table[i].value);
    }
}

void config_unload(void)
{
    int i;
    for (i = 0; i < count; i++) {
        free(table[i].key);
        free(table[i].value);
    }
    count = 0;
}
