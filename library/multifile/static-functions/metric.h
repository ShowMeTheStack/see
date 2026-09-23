/* metric.h and imperial.h each offer one public function. Both .c files
 * have a private helper called round_to; because each is static, the two
 * never collide. */
#ifndef METRIC_H
#define METRIC_H
void print_metric(double metres);
#endif
