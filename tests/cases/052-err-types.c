struct a { int x; };
int main(void) { struct a s; int i = s; return i; }
/* ERROR: incompatible types */
