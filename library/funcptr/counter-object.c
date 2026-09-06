/*
 * title: A counter object with methods
 * level: 3
 * about: Builds "objects" on the heap whose structs carry function pointers as methods, and gives two counters different behaviour.
 */
#include <stdio.h>
#include <stdlib.h>

/*
 * The struct holds data and also pointers to the functions that work
 * on it. Each method takes the object itself as its first argument,
 * which is what C++ quietly does with "this".
 */
struct counter {
    const char *name;
    int value;
    int step;
    void (*tick)(struct counter *self);
    void (*reset)(struct counter *self);
    void (*show)(const struct counter *self);
};

void tick_up(struct counter *self)   { self->value += self->step; }
void tick_wrap(struct counter *self) { self->value = (self->value + self->step) % 10; }
void reset_zero(struct counter *self) { self->value = 0; }
void show_plain(const struct counter *self)
{
    printf("  %-8s = %d\n", self->name, self->value);
}
void show_bar(const struct counter *self)
{
    int i;
    printf("  %-8s |", self->name);
    for (i = 0; i < self->value; i++)
        putchar('*');
    printf("\n");
}

/*
 * A "constructor": allocate, fill in data, and plug in the methods.
 * In See, each new counter is a heap block whose last three fields
 * are arrows into the code.
 */
struct counter *counter_new(const char *name, int step,
                            void (*tick)(struct counter *),
                            void (*show)(const struct counter *))
{
    struct counter *c = malloc(sizeof *c);
    if (c == NULL)
        return NULL;
    c->name = name;
    c->value = 0;
    c->step = step;
    c->tick = tick;
    c->reset = reset_zero;
    c->show = show;
    return c;
}

int main(void)
{
    struct counter *odo, *dial;
    int i;

    odo = counter_new("odometer", 3, tick_up, show_plain);
    dial = counter_new("dial", 4, tick_wrap, show_bar);
    if (odo == NULL || dial == NULL) {
        free(odo);
        free(dial);
        return 0;
    }

    for (i = 1; i <= 4; i++) {
        printf("tick %d:\n", i);
        /* The same call shape, different behaviour: chosen by the object. */
        odo->tick(odo);
        dial->tick(dial);
        odo->show(odo);
        dial->show(dial);
    }

    /* Methods can be swapped at run time, one object at a time. */
    printf("the dial switches to plain display and is reset:\n");
    dial->show = show_plain;
    dial->reset(dial);
    dial->show(dial);
    odo->show(odo);

    free(odo);
    free(dial);
    return 0;
}
