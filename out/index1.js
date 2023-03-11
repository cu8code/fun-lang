"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.token_type = void 0;
const fs_1 = __importDefault(require("fs"));
var token_type;
(function (token_type) {
    token_type[token_type["NUMBER"] = 0] = "NUMBER";
    token_type[token_type["PLUS"] = 1] = "PLUS";
    token_type[token_type["MINUS"] = 2] = "MINUS";
    token_type[token_type["EOF"] = 3] = "EOF";
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
    function has_next() { return cursor <= s.length; }
    function forward() { return ++cursor; }
    function peek() { return s[cursor + 1]; }
    function get_value() { return s[cursor]; }
    while (has_next()) {
        if (cursor === s.length) {
            final.push(create_token("EOF", token_type.EOF, line_number));
            break;
        }
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
    }
    return final;
}
function create_ast_literal(literal) {
    return {
        literal: Number(literal)
    };
}
function create_ast_term(lhs, rhs, toke_of_type) {
    if (toke_of_type === token_type.PLUS) {
        return {
            lhs,
            rhs,
            operator: "+"
        };
    }
    else if (toke_of_type === token_type.MINUS) {
        return {
            lhs,
            rhs,
            operator: "-"
        };
    }
    throw new Error("E");
}
function parser(t) {
    let cursor = 0;
    function forward() { return ++cursor; }
    function get_value() { return t[cursor]; }
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
    function primary() {
        const literal = get_value().literal;
        advance();
        return create_ast_literal(literal);
    }
    function term() {
        let ex = primary();
        while (match([token_type.PLUS, token_type.MINUS])) {
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
function main() {
    const data = fs_1.default.readFileSync("test/test.txt", "utf8");
    console.log(parser(lexer(Array.from(data))));
}
main();
