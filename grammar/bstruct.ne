@builtin "number.ne"
@builtin "whitespace.ne"
@builtin "string.ne"

# @{%

# const moo = require('moo')

# let lexer = moo.compile({
#     space: {match: /\s+/, lineBreaks: true},
#     number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
#     string: /"(?:\\["bfnrt\/\\]|\\u[a-fA-F0-9]{4}|[^"\\])*"/,
#     '{': '{',
#     '}': '}',
#     '[': '[',
#     ']': ']',
#     ',': ',',
#     ':': ':',
#     true: 'true',
#     false: 'false',
#     null: 'null',
# })

# %}

# @lexer lexer

main -> statement:*

statement -> (struct_decl)

struct_decl -> "struct" __ identifier _ "{" _ (
    size_decl:?
    struct_member:*
) _ "}"

size_decl -> "size" __ templatable_int

struct_member -> type __ identifier __ templatable_int

type -> pointer_indicator:* templatable_identifier template_values:? array_size:?

pointer_indicator -> "*" _

array_size -> "[" _ templatable_int _ "]"

template_values -> "<" _ templatable_identifier _ ("," _ templatable_identifier _):* ">"

# this needs to be converted to a lexer-level thing
identifier -> [a-zA-Z_] [a-zA-Z0-9_]:*

templatable_identifier -> "identifier" | templated_identifier

templated_identifier -> "%" identifier

templatable_int -> unsigned_int | templated_identifier