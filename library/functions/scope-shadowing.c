/*
 * title: Same name, three different variables
 * level: 2
 * about: Uses one name for a global, a function local and an inner-block local, showing which one each line sees.
 */
#include <stdio.h>

int level = 1;   /* global: visible in every function below */

void show_global(void)
{
    /* No local called level here, so this reads the global. */
    printf("show_global sees level = %d\n", level);
}

void bump_global(void)
{
    level = level + 10;   /* changes the one shared global */
}

int main(void)
{
    printf("main, before any local: level = %d\n", level);
    {
        /* This local hides (shadows) the global for the rest of this
           block. In See, two variables called level are now on screen:
           one in the globals box, one in main's frame. */
        int level = 2;

        printf("outer block:            level = %d\n", level);
        {
            int level = 3;   /* hides the outer local in turn */

            printf("inner block:            level = %d\n", level);
            level = level * 100;   /* only the innermost one changes */
            printf("inner block after *100: level = %d\n", level);
        }
        /* The inner block has ended, so its level is gone. */
        printf("outer block again:      level = %d\n", level);

        /* Functions do not see main's locals, only the global. */
        show_global();
        bump_global();
        printf("outer block after bump: level = %d\n", level);
    }
    printf("main, after the blocks: level = %d\n", level);
    return 0;
}
