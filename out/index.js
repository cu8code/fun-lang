"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token_type = void 0;
const readline_sync_1 = __importDefault(require("readline-sync"));
var token_type;
(function (token_type) {
    token_type[token_type["NUMBER"] = 0] = "NUMBER";
    token_type[token_type["PLUS"] = 1] = "PLUS";
    token_type[token_type["MINUS"] = 2] = "MINUS";
    token_type[token_type["DIV"] = 3] = "DIV";
    token_type[token_type["MULTIPLY"] = 4] = "MULTIPLY";
    token_type[token_type["LEFT_PAREN"] = 5] = "LEFT_PAREN";
    token_type[token_type["RIGHT_PAREN"] = 6] = "RIGHT_PAREN";
    token_type[token_type["EOF"] = 7] = "EOF";
})(token_type = exports.token_type || (exports.token_type = {}));
function create_token(literal, type, line) {
    return {
        literal,
        type,
        line
    };
}
;
function is_number(s) {
    const get_ascii_val = (s) => s.charCodeAt(0);
    return (get_ascii_val('0') <= get_ascii_val(s) && get_ascii_val(s) <= get_ascii_val('9'));
}
function lexer(s) {
    const final = [];
    let cursor = 0;
    let line_number = 1;
    function has_next() { return cursor < s.length; }
    function forward() {
        if (has_next()) {
            return ++cursor;
        }
        return cursor;
    }
    function get_value() { return s[cursor]; }
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
            case ('*'):
                final.push(create_token("*", token_type.MULTIPLY, line_number));
                forward();
                break;
            case ('/'):
                final.push(create_token("/", token_type.DIV, line_number));
                forward();
                break;
            case ('('):
                final.push(create_token("(", token_type.LEFT_PAREN, line_number));
                forward();
                break;
            case (')'):
                final.push(create_token(")", token_type.RIGHT_PAREN, line_number));
                forward();
                break;
            default:
                if (is_number(get_value())) {
                    let res = "";
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
function create_ast_literal(literal) {
    return {
        literal: Number(literal),
        type: "literal"
    };
}
function create_ast_paren(exp) {
    return {
        type: "paren",
        start: "(",
        end: ")",
        exp: exp
    };
}
function create_ast_term(lhs, rhs, toke_of_type) {
    if (toke_of_type === token_type.PLUS) {
        return {
            lhs,
            rhs,
            operator: "+",
            type: "term"
        };
    }
    else if (toke_of_type === token_type.MINUS) {
        return {
            lhs,
            rhs,
            operator: "-",
            type: "term"
        };
    }
    else if (toke_of_type === token_type.DIV) {
        return {
            lhs,
            rhs,
            operator: "/",
            type: "term"
        };
    }
    else if (toke_of_type === token_type.MULTIPLY) {
        return {
            lhs,
            rhs,
            operator: "*",
            type: "term"
        };
    }
    throw new Error("E");
}
function parser(t) {
    let cursor = 0;
    function forward() { return ++cursor; }
    function has_next() { return cursor < t.length; }
    function previous() { return t[cursor - 1]; }
    function advance() {
        if (has_next())
            forward();
        return previous();
    }
    function peek() { return t[cursor]; }
    function match(types) {
        for (const i of types) {
            if (i === peek().type) {
                if (!has_next())
                    return false;
                advance();
                return true;
            }
        }
        return false;
    }
    function consume(t, mess) {
        if (has_next()) {
            if (t === peek().type) {
                advance();
            }
        }
        return;
    }
    function primary() {
        if (match([token_type.NUMBER])) {
            return create_ast_literal(previous().literal);
        }
        while (match([token_type.LEFT_PAREN])) {
            const exp = expression();
            consume(token_type.RIGHT_PAREN, "expect ')' after expression");
            return create_ast_paren(exp);
        }
        throw new Error("something went worong");
    }
    function term() {
        let ex = primary();
        while (match([token_type.PLUS, token_type.MINUS, token_type.DIV, token_type.MULTIPLY])) {
            const current_val = previous();
            const right = primary();
            ex = create_ast_term(ex, right, current_val.type);
        }
        return ex;
    }
    function expression() {
        return term();
    }
    return expression();
}
function evall(ast) {
    function sum(a, b) {
        return a + b;
    }
    function substract(a, b) {
        return a - b;
    }
    function multiply(a, b) {
        return a * b;
    }
    function div(a, b) {
        return a / b;
    }
    if (ast.type === "literal") {
        return ast.literal;
    }
    else if (ast.type === "term") {
        if (ast.operator === "+") {
            return sum(evall(ast.lhs), evall(ast.rhs));
        }
        else if (ast.operator === "-") {
            return substract(evall(ast.lhs), evall(ast.rhs));
        }
        else if (ast.operator === "/") {
            return div(evall(ast.lhs), evall(ast.rhs));
        }
        else if (ast.operator === "*") {
            return multiply(evall(ast.lhs), evall(ast.rhs));
        }
    }
    if (ast.type === "paren") {
        return evall(ast.exp);
    }
    throw new Error("man yout fucked-up");
}
function main() {
    // const data: String = "1";
    // const ast = parser(lexer(Array.from(data)));
    while (true) {
        const data = readline_sync_1.default.question('REL> ');
        console.log(evall(parser(lexer(Array.from(data)))));
    }
}
main();
