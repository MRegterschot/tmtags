
export function stripTmTags(str: string): string {
  str = str.replace(/\$</g, '')
  str = str.replace(/\$>/g, '')
  str = str.replace(/\$([0-9a-fA-F]{1,3})/gi, '')
  str = str.replace(/\$o/gi, '')
  str = str.replace(/\$i/gi, '')
  str = str.replace(/\$w/gi, '')
  str = str.replace(/\$n/gi, '')
  str = str.replace(/\$t/gi, '')
  str = str.replace(/\$s/gi, '')
  str = str.replace(/\$L\[(.*?)\]/gi, '')
  str = str.replace(/\$g/gi, '')
  str = str.replace(/\$z/gi, '')
  return str
}

export function parseTmTags (str: string): string {
  // Encapsulation
  str = str.replace(/\$</g, '<span>')
  str = str.replace(/\$>/g, '</span>')

  str = str.replace(
    /\$([0-9a-fA-F]{1,3})/gi,
    (_, color) =>
      `<span style='color: #${color}${'0'.repeat(3 - color.length)}'>`
  )
  str = str.replace(/\$o/gi, "<span style='font-weight: bold'>")
  str = str.replace(/\$i/gi, "<span style='font-style: italic'>")
  str = str.replace(/\$w/gi, "<span style='font-stretch: wider'>")
  str = str.replace(/\$n/gi, "<span style='font-stretch: narrower'>")
  str = str.replace(/\$t/gi, "<span style='text-transform: uppercase'>")
  str = str.replace(/\$s/gi, "<span style='text-shadow: 1px 1px 1px #000'>")
  str = str.replace(/\$L\[(.*?)\]/gi, "<a href='$1'>")
  str = str.replace(/\$g/gi, "<span style='color: #fff'>")
  str = str.replace(
    /\$z/gi,
    "<span style='color: #fff; font-weight: normal; font-style: normal; font-stretch: normal; text-transform: none; text-shadow: none'>"
  )

  // Closing spans
  str += '</span>'.repeat((str.match(/<span/g) || []).length)
  str = str.replace(/<span[^>]*><\/span>/g, '')
  return stripTmTags(str);
}