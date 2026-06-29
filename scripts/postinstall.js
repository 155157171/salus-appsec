const red = '\x1b[31m';
const green = '\x1b[32m';
const bold = '\x1b[1m';
const reset = '\x1b[0m';

// Skip in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION || process.env.BUILD_ID) {
  process.exit(0);
}

const skull = `
:::!~!!!!!:.
                  .xUHWH!! !!?M88WHX:.
                .X*#M@$!!  !X!M$$$$$$WWx:.
               :!!!!!!?H! :!$!$$$$$$$$$$8X:
              !!~  ~:~!! :~!$!#$$$$$$$$$$8X:
             :!~::!H!<   ~.U$X!?R$$$$$$$$MM!
             ~!~!!!!~~ .:XW$$$U!!?$$$$$$RMM!
               !:~~~ .:!M"T#$$$$WX??#MRRMMM!
               ~?WuxiW*\`   \`"#$$$$8!!!!??!!!
             :X- M$$$$       \`"T#$T~!8$WUXU~
            :%\`  ~#$$$m:        ~!~ ?$$$$$$
          :!\`.-   ~T$$$$8xx.  .xWW- ~""##*"
.....   -~~:<\` !    ~?T#$$@@W@*?$$      /\`
W$@@M!!! .!~~ !!     .:XUW$W!~ \`"~:    :
#"~~\`.:x%\`!!  !H:   !WM$$$$Ti.: .!WUn+!\`
:::~:!!\`:X~ .: ?H.!u "$$$B$$$!W:U!T$$M~
.~~   :X@!.-~   ?@WTWo("*$$$W$TH$! \`
Wi.~!X$?!-~    : ?$$$B$Wu("**$RM!
$R@i.~~ !     :   ~$$$$$B$$en:\`\`
?MXT@Wx.~    :     ~"##*$$$$M~
`;

console.log('\n' + red + bold + skull + reset);
console.log(green + bold + '  >>> WELCOME TO SALUS APPSEC <<<' + reset);
console.log('  The AI-Powered Security Specialist in your terminal.\n');
console.log('  To get started, run: ' + bold + 'salus config' + reset + '\n');
