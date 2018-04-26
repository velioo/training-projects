#!/usr/bin/perl
use strict;
use warnings;

use DBI;

my $dbname = 'postgres';
my $host = 'localhost';
my $port = 5432;
my $username = 'postgres';
my $password = '12345678';

my $view = $ARGV[0];
my $column = $ARGV[1];

my $dbh = DBI -> connect("dbi:Pg:dbname=$dbname;host=$host;port=$port",
  $username,
  $password,
  {AutoCommit => 0, RaiseError => 1}
) or die $DBI::errstr;

#$dbh -> trace(1, 'tracelog.txt');

my $query = <<"QUERY";
SELECT
  tb.constraint_type
FROM
  information_schema.key_column_usage kcu
JOIN
  information_schema.table_constraints tb
    ON tb.constraint_name = kcu.constraint_name
WHERE
  (kcu.table_name, kcu.column_name) IN
    (
      SELECT
        vcu.table_name,
        vcu.column_name
      FROM
        information_schema.view_column_usage vcu
      WHERE
        vcu.view_name = ?
        AND vcu.column_name = ?
    );
QUERY

my $statement = $dbh->prepare($query);
$statement -> execute($ARGV[0], $ARGV[1]);

my @row = $statement->fetchrow_array;

(scalar @row)
  ? print "$row[0]\n"
  : print "NONE\n";

$statement->finish();

$dbh-> disconnect;