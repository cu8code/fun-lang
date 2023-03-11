import readline from 'readline-sync';

export enum token_type {
  NUMBER,
  PLUS, MINUS,
  EOF
}

type token = {
  literal: string,
  type: token_type,
  line: number
}

function create_token(literal: string, type: token_type, line: number): token {
  return {
    literal,
    type,
    line
  }
};


function is_number(s: string): boolean {
  const get_ascii_val = (s: string): number => s.charCodeAt(0);
  return (get_ascii_val('0') <= get_ascii_val(s) && get_ascii_val(s) <= get_ascii_val('9'))
}

function lexer(s: string[]): token[] {
  const final: token[] = [];

  let cursor: number = 0;
  let line_number: number = 1;

  function has_next(): boolean { return cursor < s.length }
  function forward(): number {
    if (has_next()) { return ++cursor }
    return cursor
  }
  function get_value(): string { return s[cursor]; }

  while (has_next()) {

    switch (get_value()) {

      case ('\n'):
        line_number++;
        forward();
        break;

      case ('+'):
        final.push(create_token("+", token_type.PLUS, line_number));
        forward();
        break;

      case (' '):
        forward();
        break;

      case ('-'):
        final.push(create_token("-", token_type.MINUS, line_number));
        forward();
        break;

      default:
        if (is_number(get_value())) {
          let res: string = "";
          do {
            res += get_value();
            forward();
          } while (has_next() && is_number(get_value()));
          final.push(create_token(res, token_type.NUMBER, line_number));
          break;
        }


        throw new Error("unknow literal " + get_value() + " at line_number : " + line_number);
    }
    if (cursor === s.length) {
      final.push(create_token("EOF", token_type.EOF, line_number));
      break;
    }
  }
  return final;
}

// expression     → literal
//                | unary
//                | binary
//                | grouping ;
//
// literal        → NUMBER | STRING | "true" | "false" | "nil" ;
// grouping       → "(" expression ")" ;
// unary          → ( "-" | "!" ) expression ;
// binary         → expression operator expression ;
// operator       → "==" | "!=" | "<" | "<=" | ">" | ">="
//                | "+"  | "-"  | "*" | "/" ;

// Precedence Associativity

// expression     → equality ;
// equality       → comparison ( ( "!=" | "==" ) comparison )* ;
// comparison     → term ( ( ">" | ">=" | "<" | "<=" ) term )* ;
// term           → factor ( ( "-" | "+" ) factor )* ;
// factor         → unary ( ( "/" | "*" ) unary )* ;
// unary          → ( "!" | "-" ) unary
//                | primary ;
// primary        → NUMBER | STRING | "true" | "false" | "nil"
//                | "(" expression ")" ;
//

type expr = expr_term | expr_literal;

type expr_term = {
  lhs: expr,
  rhs: expr,
  operator: "+" | "-"
  type: "term"
}

type expr_literal = {
  literal: number
  type: "literal"
}

function create_ast_literal(literal: string): expr_literal {
  return {
    literal: Number(literal) as number,
    type: "literal"
  }
}

function create_ast_term(lhs: expr, rhs: expr, toke_of_type: token_type.PLUS | token_type.MINUS): expr_term {
  if (toke_of_type === token_type.PLUS) {
    return {
      lhs,
      rhs,
      operator: "+",
      type: "term"
    }
  }
  else if (toke_of_type === token_type.MINUS) {
    return {
      lhs,
      rhs,
      operator: "-",
      type: "term"
    }
  }
  throw new Error("E");
}

function parser(t: token[]): expr {
  let cursor: number = 0;

  function forward(): number { return ++cursor; }
  function get_value(): token { return t[cursor] }
  function has_next(): boolean { return cursor < t.length }
  function previous(): token { return t[cursor - 1] }
  function advance(): token {
    if (has_next()) forward();
    return previous();
  }
  function peek(): token { return t[cursor] }


  function match(types: token_type[]): boolean {
    for (const i of types) {
      if (i === peek().type) {
        if (!has_next()) return false
        advance();
        return true;
      }
    }
    return false;
  }

  function primary(): expr_literal {
    const literal: string = get_value().literal;
    advance();
    return create_ast_literal(literal);
  }

  function term(): expr {
    let ex: expr = primary();
    while (match([token_type.PLUS, token_type.MINUS])) {
      const current_val: token = previous();
      const right: expr = primary();
      ex = create_ast_term(
        ex,
        right,
        current_val.type as token_type.PLUS | token_type.MINUS
      )
    }
    return ex;
  }

  function expression(): expr {
    return term();
  }

  return expression();

}


function visitor(ast: expr): number {
  function sum(a: number, b: number) {
    return a + b;
  }
  function substract(a: number, b: number) {
    return a - b;
  }
  if (ast.type === "literal") {
    return ast.literal;
  } else if (ast.type === "term") {
    if (ast.operator === "+") {
      return sum(visitor(ast.lhs), visitor(ast.rhs))
    }
    else if (ast.operator === "-") {
      return substract(visitor(ast.lhs), visitor(ast.rhs))
    }
  }
  throw new Error("their was some errro");
}

function main(): void {
  // const data: String = "1";
  // const ast = parser(lexer(Array.from(data)));
  while (true){
    const data = readline.question('REL> ');
    console.log(
      visitor(
        parser(
          lexer(Array.from(data))
        )
      )
    )
  }
}

main();
