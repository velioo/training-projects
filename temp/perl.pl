#!/usr/bin/perl

use 5.010;
use strict;
use warnings;
use Encode qw(decode encode);

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
print "2 + 2.5 = ", 2 + 2.5, "\n";
$a = 0b101;
print "Binary 0b101 = ", $a, "\n";
$a = 05;
print "Octal 05 = ", $a, "\n";
$a = 0x5;
print "Hexadecimal 0x5 = ", $a, "\n";
#$a = 1/0; Error
print "1/0 = error\n";
print "-------------Strings-------------\n";
$a = "1";
print "Before test(a) a = $a\n";
sub test {
	my $a = shift;
	#$_[0] = 5;
	unless (ref($a)) {
		print "Before asignment a = $a\n";
		$a = "2";
		print "After asignment a = $a\n";
	} else {
		print "Before asignment a = $$a\n";
		${$a} = "2";
		print "After asignment a = $$a\n";	
	}
}
test($a); # \$a
print "After test(a) a = $a\n";
my $b = $a;
print "b = a = $b\n";
$a = "3";
print "Change: a = $a\n";
print "b = $b\n";
print "中文 español deutsch English हिन्दी العربية português বাংলা русский 日本語 ਪੰਜਾਬੀ 한국어 தமிழ் עברית\n";
print "\u5c07\u63a2\u8a0e HTML5 \u53ca\u5176\u4ed6🐄\n";
my $str1 = "Hello, there";
my $str2 = "Goodbye!";
printf("Printf: %s %s\n", $str1, $str2);
my $s = sprintf("Printf: %s %s", $str1, $str2);
print "sprintf: \$s = $s\n";
$str1 = "there";
print "\$str1 = $str1\n";
print "\$str1: Hello $str1\n";
print "\${str}: Hello ${str1}\n";
print 'qq(The "name" is "$str1"\n) = ', qq(The "name" is "$str1"\n);
print "('$str1' =~ m/There/i): ";
($str1 =~ m/There/i) ? print "Matches\n" : print "Doesn't match\n";
$str2 = "Hello hello there";
print "\$str2 = $str2\n";
print "'$str2' =~ m/(he)/ig\n";
while($str2 =~ m/(he)/ig) {
	print "\$1 = $1\n";
}
$str2 = "Hello, There";
print "\$str2 = $str2\n";
print "'$str2' =~ s/Hello/There/i = ";
$str2 =~ s/Hello/There/i;
print "'$str2'\n";
my @arr = (1, 2, 3);
print "Before test(): \@arr = @arr\n";
sub test2 {
	my @arr = @_;
	print "Before \@arr change: \@arr = @arr\n";
	push @arr, 4; 
	print "After \@arr change: \@arr = @arr\n";
}
test2(@arr);
print "After test(): \@arr = @arr\n";
my @arr2 = @arr;
print "\@arr2 = \@arr = @arr\n";
@arr = (4, 5, 6);
print "\@arr = @arr\n";
print "\@arr2 = @arr2\n";

