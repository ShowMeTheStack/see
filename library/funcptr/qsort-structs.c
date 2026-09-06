/*
 * title: qsort on structs by different keys
 * level: 2
 * about: Sorts a class list by name, by mark and by age simply by handing qsort a different comparison function each time.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct student {
    char name[12];
    int mark;
    int age;
};

/*
 * qsort knows nothing about students. It moves blocks of bytes around
 * and asks a callback which of two blocks comes first. The callback gets
 * two const void pointers, turns them back into the real type, and
 * returns negative, zero or positive, like strcmp.
 */
int by_name(const void *a, const void *b)
{
    const struct student *x = a;
    const struct student *y = b;
    return strcmp(x->name, y->name);
}

int by_mark_desc(const void *a, const void *b)
{
    const struct student *x = a, *y = b;
    /*
     * (y->mark > x->mark) - (y->mark < x->mark) gives -1, 0 or 1 and,
     * unlike y->mark - x->mark, can never overflow.
     */
    return (y->mark > x->mark) - (y->mark < x->mark);
}

int by_age_then_name(const void *a, const void *b)
{
    const struct student *x = a, *y = b;
    if (x->age != y->age)
        return x->age < y->age ? -1 : 1;
    return strcmp(x->name, y->name);    /* tie-break so the order is fully defined */
}

void print_class(const char *title, const struct student s[], int n)
{
    int i;
    printf("%s\n", title);
    for (i = 0; i < n; i++)
        printf("  %-8s mark %3d  age %d\n", s[i].name, s[i].mark, s[i].age);
}

int main(void)
{
    struct student cls[] = {
        { "Oliver", 72, 15 }, { "Amara", 91, 14 }, { "Kenji", 65, 15 },
        { "Sofia", 91, 16 },  { "Ravi", 58, 14 },  { "Elena", 77, 15 }
    };
    int n = sizeof cls / sizeof cls[0];

    qsort(cls, n, sizeof cls[0], by_name);
    print_class("by name:", cls, n);

    qsort(cls, n, sizeof cls[0], by_mark_desc);
    print_class("by mark, best first:", cls, n);

    qsort(cls, n, sizeof cls[0], by_age_then_name);
    print_class("by age, then name:", cls, n);
    return 0;
}
