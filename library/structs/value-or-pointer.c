/*
 * title: Passing a struct by value or by pointer
 * level: 1
 * about: Tries to level up a game character twice, once through a copy and once through a pointer, to show which change sticks.
 */
#include <stdio.h>

struct hero {
    char name[12];
    int level;
    int health;
};

/* By value: h is a brand-new copy of the caller's struct. Step into this call
   and look at the stack: there are now two heroes, and only the copy changes.
   When the function returns the copy disappears with its frame. */
void level_up_copy(struct hero h)
{
    h.level = h.level + 1;
    h.health = h.health + 10;
    printf("  inside copy: %s level %d health %d\n", h.name, h.level, h.health);
}

/* By pointer: h holds the address of the caller's struct. In the memory
   picture h is a small 4-byte box with an arrow back into main's frame.
   The -> operator follows that arrow and then picks the field. */
void level_up_ptr(struct hero *h)
{
    h->level = h->level + 1;
    h->health = h->health + 10;
    printf("  through ptr: %s level %d health %d\n", h->name, h->level, h->health);
}

/* A pointer to const is the usual way to pass a big struct you only read:
   no copying, and the compiler stops you from changing it by mistake. */
void show(const struct hero *h)
{
    printf("%s is level %d with %d health (struct is %d bytes)\n",
           h->name, h->level, h->health, (int)sizeof *h);
}

int main(void)
{
    /* A brace initialiser fills the fields in order and sets every byte it
       does not mention to zero, so all 12 bytes of name have a value. That
       matters here because passing ada by value copies the whole struct,
       unused tail of name included. */
    struct hero ada = { "Ada", 1, 50 };

    show(&ada);

    printf("level_up_copy(ada):\n");
    level_up_copy(ada);
    show(&ada);

    printf("level_up_ptr(&ada):\n");
    level_up_ptr(&ada);
    show(&ada);
    return 0;
}
