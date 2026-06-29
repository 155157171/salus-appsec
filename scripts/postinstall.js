const red = '\x1b[31m';
const green = '\x1b[32m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

// Skip in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.BUILD_ID) {
  process.exit(0);
}

const skull = `
                  .ed"""" """$$$$be.
                -"           ^""**$$$e.
              ."                   '$$$c
             /                      "4$$b
            d  3                      $$$$
            $  * .$$$$$$
           .$  ^c           $$$$$e$$$$$$$$.
           d$L  4.         4$$$$$$$$$$$$$$b
           $$$$b ^ceeeee.  4$$Ecl.F*$$$$$$$
  e$""=.   $$$$P d$$$$F $ $$$$$$$$$- $$$$$$
 z$$b. ^c  3$$$F "$$$$b   $"$$$$$$$  $$$$*"      .=""$c
4$$$$L        $$P""^$$b   .$ $$$$$...e$$        .=  e$$$.
^*$$$$$c  %..   *c    ..    $$ 3$$$$$$$$$$eF     zP  d$$$$$
  "**$$$ec   "   %ce""    $$$  $$$$$$$$$$* .r" =$$$$P""
        "*$b.  "c  *$e.    *** d$$$$$"L$$    .d"  e$$***"
          ^*$$c ^$c $$$      4J$$$$$% $$$ .e*".eeP"
             "$$$$$$"'$=e....$*$$**$cz$$" "..d$*"
               "*$$$  *=%4.$ L L$ P3$$$F $$$P"
                  "$   "%*ebJLzb$e$$$$$b $P"
                    %..      4$$$$$$$$$$ "
                     $$$e   z$$$$$$$$$$%
                      "*$c  "$$$$$$$P"
                       ."""*$$$$$$$$bc
                    .-"    .$***$$$"""*e.
                 .-"    .e$"     "*$c  ^*b.
          .=*""""    .e$*"          "*bc  "*$e..
        .$"        .z*"               ^*$e.   "*****e.
        $$ee$c   .d"                     "*$.        3.
        ^*$E")$..$"                         * .ee==d%
           $.d$$$* * J$$$e*
`;

console.log('\n' + red + bold + skull + reset);
console.log(green + bold + '  >>> WELCOME TO SALUS APPSEC <<<' + reset);
console.log('  The AI-Powered Security Specialist in your terminal.\n');
console.log('  To get started, run: ' + bold + 'salus config' + reset + '\n');
