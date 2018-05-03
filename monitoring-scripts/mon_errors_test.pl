#!/usr/bin/perl -w

use strict;
use warnings;

use lib qw(/usr/share/tbmon2/lib/);
use MonErrors;

MonErrors::Try {

  print "Start program\n";

  my $items_details = {
    prg => {
        num_processes => {
            name => "Total number of processes",
            type => "int",
            value => 0,
            triggers => {
                err => {
                    descr => "is not running",
                    prior => "err",
                    range => [0, 0]
                }
            }
        }
    },
    prc => {
        user_mode_perc => {
            name => "CPU User mode %",
            type => "int",
            units => "%",
            value => "ZBX_NOTSUPPORTED",
            triggers => {
                warn => {
                    descr => "CPU usage in user mode > 90%",
                    prior => "warn",
                    range => [90, 100]
                },
            }
        },
        system_mode_perc => {
            name => "CPU System mode %",
            type => "int",
            units => "%",
            value => "ZBX_NOTSUPPORTED",
            triggers => {
                warn => {
                    descr => "CPU usage in system mode > 90%",
                    prior => "warn",
                    range => [90, 100]
                },
            }
        },
        cpu_perc => {
            name => "CPU %",
            type => "int",
            units => "%",
            value => "ZBX_NOTSUPPORTED",
            triggers => {
                warn => {
                    descr => "CPU total usage > 90%",
                    prior => "warn",
                    range => [90, 100]
                }
            }
        }
    },
    prm => {
        mem_virtual => {
            name => "Memory virtual",
            type => "int",
            units => "B",
            value => "ZBX_NOTSUPPORTED"
        },
        mem_resident => {
            name => "Memory resident",
            type => "int",
            units => "B",
            value => "ZBX_NOTSUPPORTED"
        },
        mem_swap => {
            name => "Memory swap",
            type => "int",
            units => "B",
            value => "ZBX_NOTSUPPORTED"
        },
        mem_shared => {
            name => "Memory shared",
            type => "int",
            units => "B",
            value => "ZBX_NOTSUPPORTED"
        }
    },
    prd => {
        num_disk_reads => {
            name => "IO Number of disk reads per sec",
            type => "int",
            delta => 1,
            value => "ZBX_NOTSUPPORTED"
        },
        num_disk_writes => {
            name => "IO Number or disk writes per sec",
            type => "int",
            delta => 1,
            value => "ZBX_NOTSUPPORTED"
        },
        num_io => {
            name => "IO Number of io operations per sec",
            type => "int",
            delta => 1,
            value => "ZBX_NOTSUPPORTED"
        },
    }
  };

  print $$items_details{'prg'}{'num_processes'}{'name'};

  my %prg = %{$$items_details{'prg'}};

  print $prg{'num_processes'}{'type'};

  my %num_processes = %{$$items_details{'prg'}{'num_processes'}};

  print $num_processes{'triggers'}{'err'}{'descr'};

  my %deref_items_details = %{$items_details};

  print $deref_items_details{'prg'}{'num_processes'}{'name'};

  print $$items_details{'prg'}{'num_processes'}{'type'};

  my $test_trace = "hello there";

  APP_TRACE("test trace", $test_trace);

  TRACE('hello there');

  print "\nEnd program\n";

} MonErrors::Catch {

  my ($err_msg) = @_;

  print STDERR $err_msg;

};