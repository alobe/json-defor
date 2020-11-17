import TF from '../src';

// const log = (label: string, obj: Object) =>
//   console.log(label, JSON.stringify(obj, null, 2));

const strify = (s: any) => JSON.stringify(s);

describe('json defor test!!!', () => {
  const data = {
    name: 'alobe',
    content: [
      {
        name: 'apple',
        count: 8,
        tag: 'fresh',
      },
      {
        name: 'orange',
        count: 890,
        tag: 'now',
      },
    ],
  };
  it('Array>>>>', () => {
    const result = TF(data, [
      '$.content',
      items =>
        TF(items, [
          '$',
          {
            chect: '$.name',
            num: '$.count',
            brand: '$.tag',
          },
        ]),
    ]);
    expect(strify(result)).toEqual(
      strify([
        {
          chect: 'apple',
          num: 8,
          brand: 'fresh',
        },
        {
          chect: 'orange',
          num: 890,
          brand: 'now',
        },
      ])
    );
  });

  it('string>>>>', () => {
    const result2 = TF(data, '$.content[0].name');
    expect(result2).toEqual('apple');
  });
  it('object>>>>', () => {
    const result3 = TF(data, {
      text: '$.name',
      loads: [
        '$.content',
        {
          check: '$.tag',
          num: '$.count',
          label: '$.name',
        },
      ],
    });
    expect(strify(result3)).toEqual(
      strify({
        text: 'alobe',
        loads: [
          {
            check: 'fresh',
            num: 8,
            label: 'apple',
          },
          {
            check: 'now',
            num: 890,
            label: 'orange',
          },
        ],
      })
    );
  });
  it('constant>>>>', () => {
    const constant = { a: 'kdkdid', b: 'adksfjasdlkfjadk' };
    const result4 = TF(data, () => constant);
    expect(strify(result4)).toEqual(strify(constant));
  });
});
