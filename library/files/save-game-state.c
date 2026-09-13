/*
 * title: Save and load a game with a checked header
 * level: 3
 * about: Saves a game state struct behind a magic number, version and checksum, loads it back, and rejects a file that was tampered with.
 */
#include <stdio.h>
#include <string.h>

#define MAGIC   0x53415645L     /* the bytes 'S' 'A' 'V' 'E' */
#define VERSION 2

struct header {
    long magic;
    int version;
    unsigned long checksum;     /* of the state bytes that follow */
};

struct state {
    char player[12];
    int level;
    int hp;
    int x, y;
    int inventory[4];
};

/* A simple rolling checksum: every byte changes it, and position
   matters, so swapped bytes are caught too. */
static unsigned long checksum(const void *data, size_t n)
{
    const unsigned char *p = data;
    unsigned long sum = 0;

    while (n-- > 0)
        sum = sum * 31 + *p++;
    return sum;
}

static int save_game(const char *path, const struct state *s)
{
    struct header h;
    FILE *fp = fopen(path, "wb");

    if (fp == NULL) {
        perror(path);
        return 0;
    }
    h.magic = MAGIC;
    h.version = VERSION;
    h.checksum = checksum(s, sizeof *s);
    fwrite(&h, sizeof h, 1, fp);
    fwrite(s, sizeof *s, 1, fp);
    return fclose(fp) == 0;
}

/* Returns 1 and fills *s only if every check passes. */
static int load_game(const char *path, struct state *s)
{
    struct header h;
    struct state tmp;
    FILE *fp = fopen(path, "rb");

    if (fp == NULL) {
        perror(path);
        return 0;
    }
    if (fread(&h, sizeof h, 1, fp) != 1 || fread(&tmp, sizeof tmp, 1, fp) != 1) {
        printf("  file too short\n");
        fclose(fp);
        return 0;
    }
    fclose(fp);
    if (h.magic != MAGIC) {
        printf("  not a save file\n");
        return 0;
    }
    if (h.version != VERSION) {
        printf("  saved by version %d, we are %d\n", h.version, VERSION);
        return 0;
    }
    if (h.checksum != checksum(&tmp, sizeof tmp)) {
        printf("  checksum mismatch: file is damaged or edited\n");
        return 0;
    }
    *s = tmp;       /* only now touch the caller's state */
    return 1;
}

static void show(const struct state *s)
{
    printf("  %s: level %d, hp %d, at (%d,%d), items %d %d %d %d\n",
           s->player, s->level, s->hp, s->x, s->y,
           s->inventory[0], s->inventory[1], s->inventory[2], s->inventory[3]);
}

int main(void)
{
    struct state game, loaded;
    FILE *fp;
    int cheat = 9999;

    memset(&game, 0, sizeof game);
    strcpy(game.player, "Robin");
    game.level = 4;
    game.hp = 37;
    game.x = 12;
    game.y = 5;
    game.inventory[0] = 3;
    game.inventory[2] = 1;

    memset(&loaded, 0, sizeof loaded);
    printf("saving:\n");
    show(&game);
    save_game("/tmp/slot1.sav", &game);

    printf("loading:\n");
    if (load_game("/tmp/slot1.sav", &loaded))
        show(&loaded);

    /* Now cheat: overwrite hp inside the file. hp sits after the header
       and after player[12] and level, so its offset is computed from the
       struct layout. */
    fp = fopen("/tmp/slot1.sav", "r+b");
    if (fp == NULL) {
        perror("/tmp/slot1.sav");
        return 1;
    }
    fseek(fp, (long)(sizeof(struct header) + 12 + sizeof(int)), SEEK_SET);
    fwrite(&cheat, sizeof cheat, 1, fp);
    fclose(fp);

    printf("loading the edited file:\n");
    if (load_game("/tmp/slot1.sav", &loaded))
        show(&loaded);

    printf("loading a file that is not a save:\n");
    fp = fopen("/tmp/notes.txt", "w");
    if (fp != NULL) {
        fputs("shopping list: milk, bread, apples, a sword, a shield, rope\n", fp);
        fclose(fp);
    }
    load_game("/tmp/notes.txt", &loaded);
    return 0;
}
