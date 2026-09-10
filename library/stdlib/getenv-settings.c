/*
 * title: Reading settings from the environment with getenv
 * level: 1
 * about: Looks up HOME, PATH and a few variables that may not exist, falls back to defaults, and splits PATH into its directories.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * Every program receives a set of NAME=value strings from whoever
 * started it: the environment. getenv(name) returns a pointer to the
 * value, or NULL when the name is not set. The string belongs to the
 * system, so read it but never change or free it.
 */
static const char *setting(const char *name, const char *fallback)
{
    const char *v = getenv(name);
    if (v == NULL || v[0] == '\0') {
        printf("  %-12s not set, using \"%s\"\n", name, fallback);
        return fallback;
    }
    printf("  %-12s \"%s\"\n", name, v);
    return v;
}

int main(void)
{
    const char *home, *path, *editor, *p, *colon;
    int n = 0;

    printf("settings:\n");
    home = setting("HOME", "/");
    path = setting("PATH", "/bin");
    editor = setting("SEE_EDITOR", "ed");
    setting("SEE_COLOURS", "off");

    /*
     * PATH is a list separated by colons. Walk it with strchr without
     * copying: each directory runs from p up to the next colon.
     */
    printf("PATH holds:\n");
    for (p = path; ; p = colon + 1) {
        colon = strchr(p, ':');
        if (colon == NULL) {
            printf("  %d: %s\n", ++n, p);
            break;
        }
        printf("  %d: %.*s\n", ++n, (int)(colon - p), p);
    }

    printf("home is %s, editor is %s\n", home, editor);

    /*
     * C89 has getenv but no setenv: a program can read its environment
     * but not change it. In See, home and path point into memory the
     * system set up before main started.
     */
    return 0;
}
