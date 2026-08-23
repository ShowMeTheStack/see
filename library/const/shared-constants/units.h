/*
 * units.h: what other files may know about the conversion table.
 *
 * "extern" declares without defining: it says the object exists in some
 * other file. The const in the declaration must match the definition in
 * units.c exactly.
 */
#ifndef UNITS_H
#define UNITS_H

struct unit {
    const char *name;
    double metres;            /* how many metres one of this unit is */
};

extern const struct unit units[];
extern const int unit_count;
extern const char * const version;

const struct unit *find_unit(const char *name);
double convert(double amount, const struct unit *from, const struct unit *to);

#endif
