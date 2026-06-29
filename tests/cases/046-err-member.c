struct p { int x; };
int main(void) { struct p a; return a.y; }
/* ERROR: has no member named 'y' */
