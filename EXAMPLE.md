### XXA

- `bin/xxa.js spec/x1 tmp/3 --name=test --abc=xyz --state=normal`

### Save

- `bin/xxa.save.js spec/x1.rev tmp/10 --article=name~camel`
- `bin/xxa.save.js spec/x1.rev tmp/11 --{{{byCodeKeyword~camel}}}=name~camel --{{{byCodeKeyword~Camel}}}=name~Camel --{{{byCodeKeyword~snake~upper}}}=name~snake~upper --byCodeKeyword=article`
  - test: `bin/xxa.js tmp/11/ tmp/111 --name=post`
- `bin/xxa.save.js spec/x1.rev/article.html tmp/123 --{{{asKeyword~Camel}}}=name~Camel --{{{asKeyword~camel}}}=name~camel --asKeyword article`
  - test: `bin/xxa.js tmp/123 --name Post-1`
### Copy

- `bin/xxa.copy.js spec/x1.rev tmp/1 --article=toKeyword~camel --toKeyword=post`
- `bin/xxa.copy.js --{{{fromKeyword~camel}}}=toKeyword~camel --{{{fromKeyword~upper}}}=toKeyword~upper --{{{fromKeyword~Camel}}}=toKeyword~Camel  spec/x1.rev tmp/2 --fromKeyword=article --toKeyword=post`
