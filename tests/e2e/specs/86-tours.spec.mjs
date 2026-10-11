// Every guided tour from start to end, with its highlight on screen at each step.
export default function (t) {
  for (const id of ['welcome', 'debugger', 'files', 'memory']) {
    for (const size of [[1400, 900], [1024, 768], [390, 844]]) {
      t.test(`tour ${id} at ${size[0]}x${size[1]}`, async (p) => {
        if (size[0] !== 1400) await p.fresh({ width: size[0], height: size[1], mobile: size[0] < 700, touch: size[0] < 700 });
        await p.ev(`SEE.Tours.start(SEE.app, ${JSON.stringify(id)})`);
        const n = await p.ev(`SEE.Tours.list.find(x => x.id === ${JSON.stringify(id)}).steps.length`);
        for (let i = 0; i < n; i++) {
          await p.wait(`document.getElementById('tourPop') && document.querySelector('#tourPop .count').textContent.startsWith('${i + 1} of')`, 15000);
          const r = await p.rect('#tourPop');
          p.assert.ok(r.x >= 0 && r.y >= 0 && r.right <= size[0] + 1 && r.bottom <= size[1] + 1, 'tour card on screen at step ' + (i + 1) + ': ' + JSON.stringify(r));
          await p.click('#tourNext');
        }
        await p.waitGone('#tourPop', 4000);
      }, { timeout: 90000, fresh: true });
    }
  }
}
