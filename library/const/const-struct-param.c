/*
 * title: Passing big structs by const pointer
 * level: 2
 * about: Prints and measures a large student record through a const pointer instead of copying all of it onto the stack.
 */
#include <stdio.h>
#include <string.h>

struct record {
    char name[32];
    int marks[20];
    double average;
};

/*
 * By value: the whole 120 byte struct is copied into the new stack frame.
 * Step into this call and compare the size of its frame with the next.
 */
double best_by_value(struct record r)
{
    int i, best = r.marks[0];
    for (i = 1; i < 20; i++)
        if (r.marks[i] > best) best = r.marks[i];
    return best;
}

/*
 * By const pointer: only 4 bytes are passed, and const still promises the
 * caller what passing by value promised, that the record will not change.
 */
double best_by_pointer(const struct record *r)
{
    int i, best = r->marks[0];
    for (i = 1; i < 20; i++)
        if (r->marks[i] > best) best = r->marks[i];
    /* r->average = 0;   error: assignment of read-only member 'average' */
    return best;
}

/* This one must change the record, so it takes a plain pointer: the type tells you. */
void compute_average(struct record *r)
{
    int i;
    long sum = 0;
    for (i = 0; i < 20; i++)
        sum += r->marks[i];
    r->average = sum / 20.0;
}

void print_record(const struct record *r)
{
    printf("%s: average %.2f\n", r->name, r->average);
}

int main(void)
{
    struct record s;
    int i;

    strcpy(s.name, "Katherine");
    for (i = 0; i < 20; i++)
        s.marks[i] = 50 + (i * 37) % 47;
    s.average = 0.0;

    compute_average(&s);
    print_record(&s);
    printf("best (copy):    %.0f\n", best_by_value(s));
    printf("best (pointer): %.0f\n", best_by_pointer(&s));
    printf("a copy costs %lu bytes, a pointer %lu\n",
           (unsigned long)sizeof s, (unsigned long)sizeof &s);
    return 0;
}
