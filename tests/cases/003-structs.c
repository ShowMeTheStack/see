#include <stdio.h>
#include <string.h>
struct date { int d, m, y; };
struct person { char name[20]; int age; struct date born; struct person *next; };
typedef struct { double x, y; } vec;
vec add(vec a, vec b) { vec r; r.x = a.x + b.x; r.y = a.y + b.y; return r; }
union u { int i; unsigned char b[4]; float f; };
struct bits { unsigned a : 3; unsigned b : 5; int c : 4; };
int main(void)
{
    struct person p, q;
    struct person *pp = &p;
    vec v1 = { 1.5, 2 }, v2 = { 3, 4 }, v3;
    union u x;
    struct bits bf;
    strcpy(p.name, "Ada");
    p.age = 36;
    p.born.d = 10; p.born.m = 12; p.born.y = 1815;
    p.next = NULL;
    q = p;
    q.age++;
    printf("%s %d %d/%d/%d %d\n", pp->name, pp->age, pp->born.d, p.born.m, (*pp).born.y, q.age);
    v3 = add(v1, v2);
    printf("%.1f %.1f\n", v3.x, v3.y);
    printf("%.1f\n", add(v1, v1).y);
    x.i = 0x01020304;
    printf("%d %d %d %d\n", x.b[0], x.b[1], x.b[2], x.b[3]);
    bf.a = 9; bf.b = 31; bf.c = -3;
    printf("%u %u %d %d\n", bf.a, bf.b, bf.c, (int)sizeof(bf));
    bf.c++;
    printf("%d\n", bf.c);
    printf("%d %d\n", (int)sizeof(struct person), (int)sizeof(union u));
    return 0;
}
/* OUTPUT
Ada 36 10/12/1815 37
4.5 6.0
4.0
4 3 2 1
1 31 -3 4
-2
40 4
*/
