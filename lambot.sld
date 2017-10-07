(define-library (lambot)
                (import (chibi))
                (export help)
                (export display-system)
                (export display)
                (export newline)
                (export import)
                (begin
			(define display-system display)
			(define import '())
			(define (display str) (display-system "$$STRING$$") (display-system str) (display-system "$$STRING$$"))
                        (define (help) (display "**Lambot**\nA REPL for your Discord server _powered by Chibi-Scheme_\n\nTo evaluate expressions, precede your message by `>>` _or_ send your message via DM _or_ send your message in the #repl channel. If `inline code` is used, only the inline code will be evaluated. That's also true for block code.") (newline) (newline))))

