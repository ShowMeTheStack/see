/*
 * title: X-macros that describe a struct's fields
 * level: 4
 * about: Lists a record's fields once and generates the struct, a printer, a field-by-field comparison and a CSV header from that single list.
 */
#include <stdio.h>
#include <string.h>

/*
 * Each field: its type, its name, and the printf format for it.
 * Add a field here and every function below picks it up.
 */
#define PLANET_FIELDS                         \
    F(int,    id,        "%d")                \
    F(double, radius_km, "%.0f")              \
    F(double, mass_e,    "%.3f")              \
    F(int,    moons,     "%d")                \
    F(double, day_hours, "%.1f")

/* 1. The struct itself. */
struct planet {
    const char *name;
#define F(type, field, fmt) type field;
    PLANET_FIELDS
#undef F
};

/* 2. A CSV header line built from the field names. */
static void print_header(void)
{
    printf("name");
#define F(type, field, fmt) printf("," #field);
    PLANET_FIELDS
#undef F
    printf("\n");
}

/* 3. One CSV row: each field printed with its own format. */
static void print_row(const struct planet *p)
{
    printf("%s", p->name);
#define F(type, field, fmt) printf("," fmt, p->field);
    PLANET_FIELDS
#undef F
    printf("\n");
}

/* 4. A diff: list every field where two records disagree. */
static int diff(const struct planet *a, const struct planet *b)
{
    int n = 0;
#define F(type, field, fmt)                                       \
    if (a->field != b->field) {                                   \
        printf("  %-10s " fmt " vs " fmt "\n", #field, a->field, b->field); \
        n++;                                                      \
    }
    PLANET_FIELDS
#undef F
    return n;
}

/* 5. How many fields? Each F adds 1 to a sum. */
#define F(type, field, fmt) + 1
static const int field_count = 0 PLANET_FIELDS;
#undef F

int main(void)
{
    struct planet sys[4];
    int i, n;

    sys[0].name = "Mercury"; sys[0].id = 1; sys[0].radius_km = 2440;
    sys[0].mass_e = 0.055; sys[0].moons = 0; sys[0].day_hours = 4222.6;
    sys[1].name = "Venus"; sys[1].id = 2; sys[1].radius_km = 6052;
    sys[1].mass_e = 0.815; sys[1].moons = 0; sys[1].day_hours = 2802.0;
    sys[2].name = "Earth"; sys[2].id = 3; sys[2].radius_km = 6371;
    sys[2].mass_e = 1.0; sys[2].moons = 1; sys[2].day_hours = 24.0;
    sys[3].name = "Mars"; sys[3].id = 4; sys[3].radius_km = 3390;
    sys[3].mass_e = 0.107; sys[3].moons = 2; sys[3].day_hours = 24.7;

    printf("%d fields besides the name\n", field_count);
    print_header();
    for (i = 0; i < 4; i++)
        print_row(&sys[i]);

    printf("Earth vs Mars:\n");
    n = diff(&sys[2], &sys[3]);
    printf("  %d fields differ\n", n);
    printf("Mercury vs Venus:\n");
    n = diff(&sys[0], &sys[1]);
    printf("  %d fields differ\n", n);

    /*
     * In See, sys is an array of four structs on main's stack. Each one
     * has 4 bytes of padding after moons, because the next field is a
     * double and doubles are aligned to 8 bytes.
     */
    return 0;
}
