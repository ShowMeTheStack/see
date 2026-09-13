/*
 * title: Safe save with rename and remove
 * level: 2
 * about: Saves a settings file safely by writing a new version beside it, keeping a backup with rename, and cleaning up with remove.
 */
#include <stdio.h>

static int exists(const char *path)
{
    FILE *fp = fopen(path, "r");

    if (fp == NULL)
        return 0;
    fclose(fp);
    return 1;
}

static void show(const char *path)
{
    FILE *fp = fopen(path, "r");
    char line[64];

    printf("%-22s ", path);
    if (fp == NULL) {
        printf("(missing)\n");
        return;
    }
    if (fgets(line, sizeof line, fp) != NULL)
        printf("%s", line);
    else
        printf("(empty)\n");
    fclose(fp);
}

static int write_text(const char *path, const char *text)
{
    FILE *fp = fopen(path, "w");

    if (fp == NULL) {
        perror(path);
        return 0;
    }
    fputs(text, fp);
    /* fclose can fail too (for example a full disk while flushing). A
       safe save checks it before trusting the new file. */
    return fclose(fp) == 0;
}

int main(void)
{
    const char *cfg = "/tmp/settings.cfg";
    const char *tmp = "/tmp/settings.cfg.new";
    const char *bak = "/tmp/settings.cfg.bak";

    remove(bak);    /* tidy up anything left from an earlier run */
    write_text(cfg, "volume=3\n");
    printf("start:\n");
    show(cfg); show(tmp); show(bak);

    /* 1. Write the new version under a different name. If the program
          died half-way here, the old settings would still be intact. */
    if (!write_text(tmp, "volume=7\n"))
        return 1;

    /* 2. Keep the old one as a backup. rename returns 0 on success. */
    if (rename(cfg, bak) != 0)
        perror("rename to backup");

    /* 3. Move the new one into place. */
    if (rename(tmp, cfg) != 0)
        perror("rename into place");

    printf("after the safe save:\n");
    show(cfg); show(tmp); show(bak);

    /* remove deletes a file; on a missing file it fails and sets errno. */
    if (remove(bak) == 0)
        printf("backup removed\n");
    if (remove(bak) != 0)
        perror("removing it twice");
    printf("backup exists now? %s\n", exists(bak) ? "yes" : "no");
    return 0;
}
