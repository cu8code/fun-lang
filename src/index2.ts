type token = {
  type: string
  line_number: number
  literal: string | string[]
}

function create_token({ type, line_number, literal }: { type: string; line_number: number; literal: string | string[] }): token {
  return {
    type,
    line_number,
    literal
  }
}

function tokenizer({ t }: { t: string[] }): token[] {

  let cursor = 0;
  let line_number = 0;
  const final: token[] = []

  function has_next(): boolean { return cursor < t.length }
  function peek(): string { return t[cursor] }
  function previous(): string { return t[cursor - 1] }
  function is_at_end(): boolean { return cursor === (t.length - 1) }
  function advance(): string {
    if (has_next()) {
      cursor++;
    }
    return previous()
  }

  function push(e: token): void {
    final.push(e);
  }

  function match(f: string): boolean {
    let count = -1;
    function next(): string {
      if (is_at_end()) {
        return f[count];
      }
      count++;
      return f[count];
    }
    function is_at_end() {
      return count < f.length;
    }
    while (true) {
      if (is_at_end()) {
        break
      }
      if (peek() === next()) {
        advance();
      } else {
        return false;
      }
    }
    return true;
  }

  while (has_next()) {
    switch (peek()) {
      case " ": {
        advance();
        break;
      }
      case "\n": {
        ++line_number;
        advance();
        break;
      }
      case "{": {
        push(create_token({ type: "symbol", line_number, literal: "{" }))
        advance();
        break;
      }
      case "}": {
        push(create_token({ type: "symbol", line_number, literal: "}" }))
        advance();
        break;
      }
      case "(": {
        push(create_token({ type: "symbol", line_number, literal: ")" }))
        advance();
        break;
      }
      case "=": {
        push(create_token({ type: "symbol", line_number, literal: "=" }))
        advance();
        break
      }
      case ";": {
        push(create_token({ type: "symbol", line_number, literal: ";" }))
        advance();
        break
      }
      default: {
        if (match("let")) {
          push(create_token({ type: "token", line_number, literal: "let" }))
          break
        }

        else if (match("const")) {
          push(create_token({ type: "token", line_number, literal: "const" }))
          break
        }

        else if (match("var")) {
          push(create_token({ type: "token", line_number, literal: "var" }))
          break
        }

        else if (match("function")) {
          push(create_token({ type: "function", line_number, literal: "var" }))
          break
        }

        else if (match("class")) {
          push(create_token({ type: "class", line_number, literal: "var" }))
          break
        }
      }
    }

    if (is_at_end()) {
      push(create_token({ type: "EOF", line_number, literal: Array.from("EOF") }));
    }
    advance();
  }
  return final
}

type ast = {
  lhs: ast,
  rhs: ast,
  literal: string[]
}

// function parser(t: token[]): ast {
//   return {
//     
//   }
// }
//
(function main() {
  const a: string = `
const a = "ankan roy";
console.log(a);
  `
  console.log(tokenizer({ t: Array.from(a) }));


})()
