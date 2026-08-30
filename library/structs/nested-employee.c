/*
 * title: Nested structs for an employee record
 * level: 2
 * about: Builds employee records that contain a date and an address struct, and reaches inner fields with chains of dots and arrows.
 */
#include <stdio.h>
#include <string.h>

struct date {
    int day, month, year;
};

struct address {
    char street[24];
    char city[16];
    char postcode[8];
};

/* An employee contains two whole structs, not pointers to them. Open one
   employee in the memory picture: hired and home are drawn nested inside it,
   because their bytes really are part of the employee's bytes. */
struct employee {
    char name[16];
    struct date hired;
    struct address home;
    double salary;
};

void print_employee(const struct employee *e)
{
    /* Read the chain left to right: e is a pointer, e->home is a struct,
       e->home.city is an array of char inside that struct. */
    printf("%s, hired %02d/%02d/%d, lives at %s, %s %s, earns %.0f\n",
           e->name, e->hired.day, e->hired.month, e->hired.year,
           e->home.street, e->home.city, e->home.postcode, e->salary);
}

int years_of_service(const struct employee *e, int this_year)
{
    return this_year - e->hired.year;
}

int main(void)
{
    /* Nested braces mirror the nested structs. */
    struct employee staff[3] = {
        { "Grace", { 9, 12, 1996 }, { "1 Harbour Row", "Arlington", "22201" }, 72000.0 },
        { "Alan",  { 23, 6, 2012 }, { "7 Bletchley Ln", "Milton", "MK3" }, 64000.0 },
        { "Edsger", { 11, 5, 2003 }, { "30 Canal St", "Nuenen", "5671" }, 69000.0 }
    };
    struct address moved = { "4 Park Ave", "Austin", "78701" };
    int i;

    for (i = 0; i < 3; i++)
        print_employee(&staff[i]);

    /* A whole inner struct can be replaced in one assignment. */
    staff[2].home = moved;
    staff[1].salary *= 1.05;
    strcpy(staff[0].home.postcode, "22202");

    printf("-- after a move, a raise and a new postcode --\n");
    for (i = 0; i < 3; i++) {
        print_employee(&staff[i]);
        printf("   %d years of service\n", years_of_service(&staff[i], 2024));
    }

    printf("sizeof(struct date) = %d, sizeof(struct address) = %d, sizeof(struct employee) = %d\n",
           (int)sizeof(struct date), (int)sizeof(struct address), (int)sizeof(struct employee));
    return 0;
}
