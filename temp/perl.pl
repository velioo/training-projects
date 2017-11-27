#!/usr/bin/perl

use 5.010;
use strict;
use warnings;

my $a = 2**53;
print "Max safe range for positive integers is 2**53 = ", $a, "\n";
$a = -2**53;
print "Max safe range for negative integers is -2**53 = ", $a, "\n";
$a = (2 ** 53 + 1)  - (2**53 + 1);
print "(2 ** 53 + 1)  - (2 ** 53 + 1) = ", $a, "\n";
$a = (2 ** 53 + 2)  - (2**53 + 1);
print "(2 ** 53 + 2)  - (2 ** 53 + 1) = ", $a, "\n";
$a = (-2 ** 53 - 1)  - (-2**53 - 1);
print "(-2 ** 53 - 1)  + (-2 ** 53 - 1) = ", $a, "\n";
$a = (-2 ** 53 - 2)  - (-2**53 - 1);
print "(-2 ** 53 - 2)  + (-2 ** 53 - 1) = ", $a, "\n";
$a = 2**9999;
print "2*9999 = ", $a, "\n";
$a = 2**9999/ 2**9999;
print "2*9999 / 2**9999 = ", $a, "\n";
$a = "String" + 1;
print "'string' + 1 = ", $a, "\n";
$a = "NaN" + 1;
print "'NaN' + 1 = ", $a, "\n";
print "1 * 'inf' = ", 1 * "inf", "\n";
#print "'inf' / 'inf' = ", "inf" / "inf", "\n";
$a = int((0.1 + 0.7) * 10);
print "int((0.1 + 0.7) * 10) = ", $a, "\n";
$a = "1.5" + "3.6" + 1 + "2a";
print "'1.5' + '3.6' + 1 + '2a' = ", $a, "\n";
$a = "1.5" - "3.6" + 1 - "2a";
print "'1.5' - '3.6' + 1 - '2a' = ", $a, "\n";
$a = 0b101;
print "Binary 0b101 = ", $a, "\n";
$a = 05;
print "Octal 05 = ", $a, "\n";
$a = 0x5;
print "Hexadecimal 0x5 = ", $a, "\n";
#$a = 1/0; Error
#print "1/0 = "$a;