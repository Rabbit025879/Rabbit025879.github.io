/*************************
 * Pixel-art sprites
 * Shared by the hidden terminal (`cat ~/.raccoon`, `rabbit`) and the
 * small rabbit details on the site pages. Each sprite is a list of rows,
 * one character per pixel, looked up in the sprite's palette
 * ('.' = transparent). Rendered as a crisp SVG so it scales cleanly.
 *************************/
export const SPRITES = {
  raccoon: {
    palette: {
      o: '#3b2a3a', // outline
      f: '#b9aaa4', // fur
      s: '#9c8c88', // fur shade (arms, forehead stripe)
      c: '#f6ecdf', // cream face & belly
      m: '#6b5a66', // eye mask
      t: '#6b5a66', // tail stripes
      e: '#2a1c2a', // eyes, nose, paws
      h: '#ffffff', // eye shine
      k: '#4a3446', // inner ear
      p: '#e8a7a7', // blush & tongue
    },
    rows: [
      '....ooo................ooo....',
      '...okkfo..............ofkko...',
      '...okkkfo............ofkkko...',
      '...okkkffooooooooooooffkkko...',
      '...ofkkfffffffssfffffffkkfo...',
      '..offfffffffffssfffffffffffo..',
      '..offffffffffffffffffffffffo..',
      '.offcccccffffffffffffcccccffo.',
      '.occccccccffffffffffcccccccco.',
      'occcmmmmmmccffffffccmmmmmmccco',
      'occmmmmmmmmcffffffcmmmmmmmmcco',
      'ocmmmmeeemmmcffffcmmmeeemmmmco',
      'ocmmmeehemmmcffffcmmmeheemmmco',
      '.ocmmmeeemmccccccccmmeeemmmco.',
      '.occmmmmmccccccccccccmmmmmcco.',
      'occcccccccccceeeecccccccccccco',
      '.occcccccccccceecccccccccccco.',
      '.ocpcccccccceceececcccccccpco.',
      '..ooccccccccccppccccccccccoo..',
      '.....ooooccccccccccccoooo.....',
      '......offccccccccccccffo......',
      '.....offfccccccccccccfffo.....',
      '....offfffccccccccccfffffo....',
      '..oooffffffccccccccffffffo....',
      '.otttoofssffccccccffssfffo....',
      'otccccoffoeecccccceeoffffo....',
      'otffffofffccccccccccfffffo....',
      'otttttoffccccccccccccffffo....',
      'occcccofccccccccccccccffo.....',
      '.ottttommooffffffffoommmo.....',
      '..ooooooo..oooooooo..ooo......',
    ],
  },
  rabbit: {
    palette: {
      o: '#4a3a48', // outline
      w: '#ffffff', // fur
      l: '#e9e3ee', // fur shade
      p: '#f4b3c5', // inner ear
      e: '#2a1c2a', // eyes
      n: '#e8879f', // nose
      b: '#f9cbd8', // blush
    },
    rows: [
      '......oo........oo......',
      '.....owwo......owwo.....',
      '.....owpwo....owpwo.....',
      '.....owpwo....owpwo.....',
      '.....owpwo....owpwo.....',
      '.....owpwo....owpwo.....',
      '.....owpwo....owpwo.....',
      '.....owpwo....owpwo.....',
      '.....owpwo....owpwo.....',
      '...oowwwwoooooowwwwoo...',
      '..owwwwwwwwwwwwwwwwwwo..',
      '.owwwwwwwwwwwwwwwwwwwwo.',
      '.owwwwwwwwwwwwwwwwwwwwo.',
      'owwwwwwwwwwwwwwwwwwwwwwo',
      'owwwwwwwwwwwwwwwwwwwwwwo',
      'owwwwweewwwwwwwweewwwwwo',
      'owbbwweewwwnnwwweewwbbwo',
      '.owbbwwwwwwoowwwwwwbbwo.',
      '..owwwwwwwowwowwwwwwwo..',
      '..oowwwwwwwwwwwwwwwwoo..',
      '....oowwwwwwwwwwwwoo....',
      '...owwwwwwwwwwwwwwwwo...',
      '...owwwwwwwwwwwwwwwwo...',
      '..owwwwwllwwwwllwwwwwo..',
      '..owwwwwoowwwwoowwwwwo..',
      '..olwwwwwwwwwwwwwwwwlo..',
      '..ollwwwwwwwwwwwwwwllo..',
      '..ollllwwwwwwwwwwllllo..',
      '...oooooooooooooooooo...',
    ],
  },
};

/**
 * Build an <svg> for a sprite.
 * @param {string} name   key of SPRITES
 * @param {object} [opts]
 * @param {number} [opts.pixelSize=6]  rendered size of one pixel, in px
 * @param {[number, number]} [opts.rows]  inclusive row range to keep (crop)
 * @param {string} [opts.className]
 */
export function pixelArt(name, { pixelSize = 6, rows: range, className = '' } = {}) {
  const sprite = SPRITES[name];
  const rows = range ? sprite.rows.slice(range[0], range[1] + 1) : sprite.rows;
  const width = Math.max(...rows.map((r) => r.length));
  const svgNS = 'http://www.w3.org/2000/svg';

  const svg = document.createElementNS(svgNS, 'svg');
  if (className) svg.setAttribute('class', className);
  svg.setAttribute('viewBox', `0 0 ${width} ${rows.length}`);
  svg.setAttribute('width', String(width * pixelSize));
  svg.setAttribute('height', String(rows.length * pixelSize));
  svg.setAttribute('shape-rendering', 'crispEdges');
  svg.setAttribute('aria-hidden', 'true');

  rows.forEach((row, y) => [...row].forEach((ch, x) => {
    const fill = sprite.palette[ch];
    if (!fill) return;
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', '1');
    rect.setAttribute('height', '1');
    rect.setAttribute('fill', fill);
    svg.append(rect);
  }));
  return svg;
}

/**
 * Render a sprite into every [data-pixel-art] element on the page.
 * Optional attributes: data-pixel-size="4", data-rows="0-19" (crop).
 */
export function mountPixelArt(root = document) {
  root.querySelectorAll('[data-pixel-art]').forEach((el) => {
    const name = el.dataset.pixelArt;
    if (!SPRITES[name]) return;
    const range = el.dataset.rows ? el.dataset.rows.split('-').map(Number) : undefined;
    el.replaceChildren(pixelArt(name, { pixelSize: Number(el.dataset.pixelSize) || 6, rows: range }));
  });
}
