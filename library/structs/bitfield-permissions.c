/*
 * title: File permissions in bit-fields
 * level: 3
 * about: Packs Unix-style read, write and execute flags for owner, group and others into bit-fields and prints them as rwxr-x--- and as octal.
 */
#include <stdio.h>

/* A bit-field gives a struct member a width in bits. Three one-bit flags can
   share a single byte instead of taking an int each. The compiler does the
   shifting and masking for you. */
struct rwx {
    unsigned int read : 1;
    unsigned int write : 1;
    unsigned int exec : 1;
};

struct mode {
    struct rwx owner;
    struct rwx group;
    struct rwx other;
    unsigned int is_dir : 1;
};

struct rwx from_octal_digit(int d)
{
    struct rwx p;
    p.read = (d >> 2) & 1;
    p.write = (d >> 1) & 1;
    p.exec = d & 1;
    return p;
}

int to_octal_digit(struct rwx p)
{
    return (p.read << 2) | (p.write << 1) | p.exec;
}

struct mode from_octal(int dir, int octal)
{
    struct mode m;
    m.is_dir = dir;
    m.owner = from_octal_digit((octal >> 6) & 7);
    m.group = from_octal_digit((octal >> 3) & 7);
    m.other = from_octal_digit(octal & 7);
    return m;
}

void put_rwx(struct rwx p)
{
    putchar(p.read ? 'r' : '-');
    putchar(p.write ? 'w' : '-');
    putchar(p.exec ? 'x' : '-');
}

void show(const char *file, struct mode m)
{
    putchar(m.is_dir ? 'd' : '-');
    put_rwx(m.owner);
    put_rwx(m.group);
    put_rwx(m.other);
    printf("  %o%o%o  %s\n", to_octal_digit(m.owner), to_octal_digit(m.group),
           to_octal_digit(m.other), file);
}

int main(void)
{
    struct mode m;

    show("notes.txt", from_octal(0, 0644));
    show("run.sh", from_octal(0, 0755));
    show("secret", from_octal(0, 0600));
    show("public", from_octal(1, 0775));

    /* Change single flags by name, like chmod g+w,o-r. Each assignment
       touches only its own bit. */
    m = from_octal(0, 0644);
    m.group.write = 1;
    m.other.read = 0;
    show("notes.txt after g+w,o-r", m);

    /* A one-bit unsigned field can only hold 0 or 1, so assigning 1 again is
       harmless; there is nowhere for a bigger number to go. */
    m.owner.exec = 1;
    show("notes.txt after u+x", m);

    printf("sizeof(struct rwx) = %d, sizeof(struct mode) = %d\n",
           (int)sizeof(struct rwx), (int)sizeof(struct mode));
    return 0;
}
