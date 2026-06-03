import { ControlGuide } from '../controlGuideData';

export const elenaControlGuide: ControlGuide = {
  characterId: 'elena',
  characterName: 'エレナ',
  
  unavailableInModern: {
    normals: [
      {
        name: '立ち弱パンチ',
        notation: '5LP',
        type: 'normal',
        description: '立ち弱パンチはモダン操作では使用できません。アシストボタンで弱攻撃を選択する必要があります。'
      },
      {
        name: '立ち強キック',
        notation: '5HK',
        type: 'normal',
        description: '立ち強キックはモダン操作では使用できません。立ち強パンチで代用可能です。'
      }
    ],
    specials: [
      {
        name: 'スライディング（強）',
        notation: '強K',
        type: 'special',
        description: '特殊技のスライディングは、強版のみモダン操作では使用できません。弱版・中版は使用可能です。'
      }
    ]
  },
  
  limitedInModern: [
    {
      name: 'ムーングライド',
      notation: '214LP/MP/HP~6P',
      type: 'special',
      classicVersions: ['弱', '中', '強'],
      modernVersions: ['弱'],
      limitation: 'モダン操作では弱版のみ使用可能。中版・強版は使用できません。',
      description: '後ろに下がる移動技。クラシックでは3強度すべてが使用可能ですが、モダンでは弱版のみに制限されます。'
    }
  ],
  
  fullySupportedSpecials: [
    {
      name: 'ライノホーン',
      notation: '236LK/MK/HK',
      type: 'special',
      description: '前方に突進する必殺技。弱・中・強すべてがモダン操作で使用可能です。'
    },
    {
      name: 'スクラッチホイール',
      notation: '623LK/MK/HK',
      type: 'special',
      description: '回転しながら攻撃する技。弱・中・強すべてがモダン操作で使用可能です。'
    },
    {
      name: 'スピンサイズ',
      notation: '214LK/MK/HK',
      type: 'special',
      description: 'サイズを変化させながら攻撃する技。弱・中・強すべてがモダン操作で使用可能です。'
    },
    {
      name: 'リンクシング',
      notation: '236LP/MP/HP',
      type: 'special',
      description: 'リング状の攻撃を放つ技。弱・中・強すべてがモダン操作で使用可能です。'
    },
    {
      name: 'リンクスワール',
      notation: '6P',
      type: 'special',
      description: 'リンクシング中またはスピンサイズ中に出せる派生攻撃。モダン操作でも使用可能です。'
    },
    {
      name: 'レオパードスナップ',
      notation: '6LK',
      type: 'special',
      description: 'リンクシング中に出せる弱派生攻撃。モダン操作でも使用可能です。'
    },
    {
      name: 'ハーベストサークル',
      notation: '6MK',
      type: 'special',
      description: 'リンクシング中に出せる中派生攻撃。モダン操作でも使用可能です。'
    },
    {
      name: 'マレットスマッシュ',
      notation: '6HK',
      type: 'special',
      description: 'リンクシング中に出せる強派生攻撃。モダン操作でも使用可能です。'
    },
    {
      name: 'ミーティアボレー（SA1）',
      notation: '236236K',
      type: 'super',
      description: '地上ヒット後の追撃価値が高いスーパーアーツ。モダン操作でも使用可能です。'
    },
    {
      name: 'リヴァイブダンス（SA2）',
      notation: '236236P',
      type: 'super',
      description: 'ホールドで性質が変化するスーパーアーツ。モダン操作でも使用可能です。'
    },
    {
      name: 'グラスランドソング（SA3/CA）',
      notation: '214214K',
      type: 'super',
      description: '体力25%以下で性能が上がるスーパーアーツ。モダン操作でも使用可能です。'
    }
  ],
  
  modernSuitability: {
    rating: 'very_high',
    summary: 'エレナはモダン操作での適性が非常に高いキャラクターです。ムーングライドは弱版のみという制限がありますが、リンクシングを含む他のほとんどの必殺技が全強度使用可能なため、戦略の幅が大きく制限されることはありません。',
    concerns: [
      'ムーングライドが弱版のみ：中版・強版を使った距離調整の選択肢が限定される',
      '立ち強キックが使用不可：立ち強パンチで代用可能だが、若干の調整が必要'
    ]
  },
  
  notes: [
    'モダン操作でも全ジャンプ攻撃が使用可能（アシストボタン+攻撃ボタンで弱・中・強を選択）',
    '通常投げ（レッグスタック、レッグリフトスルー）は両操作で同じ',
    'スーパーアーツ（SA1・SA2・SA3）は両操作で同じ',
    'ドライブシステム（ドライブインパクト、ドライブリバーサル等）は両操作で同じ'
  ]
};
