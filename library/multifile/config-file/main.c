/*
 * title: A config file reader module
 * level: 3
 * about: Writes a settings file to /tmp, loads it through a config module and reads typed values with defaults.
 */

/* See compiles main.c and config.c separately and links them into one
 * program. main.c writes the file first, so the program always has
 * something to read. */
#include <stdio.h>
#include "config.h"

static int write_sample(const char *path)
{
    FILE *f = fopen(path, "w");

    if (f == NULL) {
        return 0;
    }
    fprintf(f, "# game settings\n");
    fprintf(f, "player   = Ada\n");
    fprintf(f, "  width = 640  \n");
    fprintf(f, "height=480\n");
    fprintf(f, "\n");
    fprintf(f, "sound = yes\n");
    fprintf(f, "volume = loud\n");
    fprintf(f, "this line is broken\n");
    fprintf(f, "width = 800\n");
    fclose(f);
    return 1;
}

int main(void)
{
    const char *path = "/tmp/game.conf";

    if (!write_sample(path) || !config_load(path)) {
        printf("could not use %s\n", path);
        return 1;
    }

    /* Every key and value is a separate heap block, pointed to from the
     * static table in config.c. Look at the globals panel for table. */
    printf("loaded:\n");
    config_dump();

    printf("player %s\n", config_get("player", "nobody"));
    printf("screen %dx%d\n", config_get_int("width", 320), config_get_int("height", 200));
    printf("sound %s\n", config_get_bool("sound", 0) ? "on" : "off");
    /* "loud" is not a number, so the default is used. */
    printf("volume %d\n", config_get_int("volume", 5));
    printf("difficulty %s\n", config_get("difficulty", "normal"));

    config_unload();
    return 0;
}
