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

export function parseTmTags(str: string): string {
  const tokens = str.split(
    /(\$[<>]|\$[0-9a-f]{1,3}|\$[oiwnmtsgz]|\$l\[.*?\])/gi
  );

  let stack: Array<{ tag: string; encapsulationLevel: number }> = [];
  let encapsulationLevel = 0;
  let result = "";

  const addTag = (openTag: string, closeTag: string) => {
    result += openTag;
    stack.push({ tag: closeTag, encapsulationLevel });
  };

  const styleHandlers: Record<string, (token: string) => void> = {
    "$<": () => {
      encapsulationLevel++;
      addTag("<span>", "</span>");
    },
    "$>": () => {
      if (encapsulationLevel > 0) {
        while (
          stack.length &&
          stack[stack.length - 1].encapsulationLevel === encapsulationLevel
        ) {
          result += stack.pop()?.tag;
        }
        encapsulationLevel--;
      }
    },
    $o: () => addTag("<span style='font-weight: bold'>", "</span>"),
    $i: () => addTag("<span style='font-style: italic'>", "</span>"),
    $w: () => addTag("<span style='font-stretch: expanded'>", "</span>"),
    $n: () => addTag("<span style='font-stretch: condensed'>", "</span>"),
    $m: () => addTag("<span style='font-stretch: normal'>", "</span>"),
    $t: () => addTag("<span style='text-transform: uppercase'>", "</span>"),
    $s: () => addTag("<span style='text-shadow: 1px 1px 1px #000'>", "</span>"),
    $g: () => addTag("<span class='text-foreground'>", "</span>"),
    $z: () =>
      addTag(
        "<span class='text-foreground' style='font-weight: normal; font-style: normal; font-stretch: normal; text-transform: none; text-shadow: none'>",
        "</span>"
      ),
  };

  for (let token of tokens) {
    if (!token) continue;

    const tokenLower = token.toLowerCase();
    const handler = styleHandlers[tokenLower];
    if (handler) {
      handler(token);
    } else if (tokenLower.match(/^\$[0-9a-f]{1,3}$/i)) {
      // Handle color codes
      const color = token.slice(1);
      addTag(
        `<span style='color: #${color}${"0".repeat(3 - color.length)}'>`,
        "</span>"
      );
    } else if (tokenLower.startsWith("$l[")) {
      // Handle links
      const url = token.slice(3, -1);
      addTag(`<a href='${url}' target='_blank'>`, "</a>");
      continue;
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
