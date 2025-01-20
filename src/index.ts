export function stripTmTags(str: string): string {
  str = str.replace(/\$</g, "");
  str = str.replace(/\$>/g, "");
  str = str.replace(/\$([0-9a-fA-F]{1,3})/gi, "");
  str = str.replace(/\$o/gi, "");
  str = str.replace(/\$i/gi, "");
  str = str.replace(/\$w/gi, "");
  str = str.replace(/\$n/gi, "");
  str = str.replace(/\$t/gi, "");
  str = str.replace(/\$s/gi, "");
  str = str.replace(/\$L\[(.*?)\]/gi, "");
  str = str.replace(/\$g/gi, "");
  str = str.replace(/\$z/gi, "");
  return str;
}

export function parseTmTags(str: string) {
  const tokens = str.split(
    /(\$[<>]|\$[0-9a-f]{1,3}|\$[oiwnmtsgz]|\$l\[.*?\])/gi
  );

  let stack: Array<{ tag: string; encapsulationLevel: number }> = [];
  let encapsulationLevel = 0;
  let result = "";

  for (let token of tokens) {
    if (!token) {
      continue;
    }

    const tokenLower = token.toLowerCase();
    if (token === "$<") {
      encapsulationLevel++;
      result += "<span>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (token === "$>") {
      if (encapsulationLevel > 0) {
        // Close all tags from the current encapsulation level
        while (
          stack.length &&
          stack[stack.length - 1].encapsulationLevel === encapsulationLevel
        ) {
          result += stack.pop()?.tag;
        }
        encapsulationLevel--;
      }
    } else if (tokenLower.startsWith("$l[")) {
      const url = token.slice(3, -1);
      result += `<a href='${url}' target='_blank'>`;
      stack.push({ tag: "</a>", encapsulationLevel });
    } else if (token.match(/^\$[0-9a-fA-F]{1,3}$/i)) {
      const color = token.slice(1);
      result += `<span style='color: #${color}${"0".repeat(
        3 - color.length
      )}'>`;
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$o") {
      result += "<span style='font-weight: bold'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$i") {
      result += "<span style='font-style: italic'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$w") {
      result += "<span style='font-stretch: expanded'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$n") {
      result += "<span style='font-stretch: condensed'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$m") {
      result += "<span style='font-stretch: normal'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$t") {
      result += "<span style='text-transform: uppercase'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$s") {
      result += "<span style='text-shadow: 1px 1px 1px #000'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$g") {
      result += "<span class='text-foreground'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else if (tokenLower === "$z") {
      result +=
        "<span class='text-foreground' style='font-weight: normal; font-style: normal; font-stretch: normal; text-transform: none; text-shadow: none'>";
      stack.push({ tag: "</span>", encapsulationLevel });
    } else {
      result += token;
    }
  }

  // Close any remaining tags from innermost to outermost
  stack.sort((a, b) => b.encapsulationLevel - a.encapsulationLevel);
  while (stack.length) {
    result += stack.pop()?.tag;
  }

  return result;
}