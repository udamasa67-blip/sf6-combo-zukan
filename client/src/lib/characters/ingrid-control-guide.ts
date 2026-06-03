import { ControlGuide } from '../controlGuideData';

export const ingridControlGuide: ControlGuide = {
  characterId: 'ingrid',
  characterName: 'イングリッド',
  
  unavailableInModern: {
    normals: [
      {
        name: 'しゃがみ弱パンチ',
        notation: '2LP',
        type: 'normal',
        description: 'しゃがみ弱パンチはモダン操作では使用できません。アシストボタンで弱攻撃を選択する必要があります。'
      },
      {
        name: '立ち強パンチ',
        notation: '5HP',
        type: 'normal',
        description: '立ち強パンチはモダン操作では使用できません。リーチが長く、パニッシュカウンター時にコンボになる強力な技です。立ち強キックで代用可能ですが、やや痛い可能性があります。'
      }
    ],
    specials: []
  },
  
  limitedInModern: [
    {
      name: 'サンシュート',
      notation: '236LP/MP/HP',
      type: 'special',
      classicVersions: ['弱', '弱（長押し）', '中', '中（長押し）', '強', '強（長押し）'],
      modernVersions: ['弱', '中', '強', '強（長押し）'],
      limitation: 'モダン操作では手動操作ができず、必ずワンボタンで使用することになるため、ダメージが常に80%に減衰します。また、弱・中の長押し版が使用不可です。',
      description: '前方に光弾を放つ飛び道具。軌道や位置を選べるのが特徴です。'
    }
  ],
  
  fullySupportedSpecials: [
    {
      name: 'サンフレア',
      notation: '214LP/MP/HP',
      type: 'special',
      description: '前方に光のビームを放つ技。弱版でサンシンボルストック+1。弱・中・強すべてがモダン操作で使用可能です。'
    },
    {
      name: 'ソーラーフレア',
      notation: '垂直/前ジャンプ後 214LP/MP/HP',
      type: 'special',
      description: '空中から地上に光線を放つ技。垂直ジャンプ後、前ジャンプ後の両方で使用可能です。'
    },
    {
      name: 'サンライズ',
      notation: '623LP/MP/HP',
      type: 'special',
      description: '回転しながら攻撃する技。弱版は対空技、中版はコンボパーツ、強版は発生は遅いがヒット後に追撃可能。弱・中・強すべてがモダン操作で使用可能です。'
    },
    {
      name: 'サンヴェール',
      notation: '22LK/MK/HK',
      type: 'special',
      description: '相手の攻撃に対する当身技。モダン操作でも手動入力で使用可能です。OD版は手動コマンドのみで、ワンボタンでは出せません。'
    },
    {
      name: 'サンバニッシュ',
      notation: '4KKK/2KKK/6KKK',
      type: 'special',
      description: '方向キーで移動先を使い分けるワープ技。後方移動、頭上からの攻撃、前方攻撃をモダン操作でも手動入力で使用可能です。'
    },
    {
      name: 'サンシャイン（SA1）',
      notation: '236236K',
      type: 'super',
      description: '相手の打撃に対する無敵がある切り返し技。サンシンボルのストックに応じて3段階の強さがあります。'
    },
    {
      name: 'サンオーダー（SA2）',
      notation: '214214P',
      type: 'super',
      description: '上空から3発の光の弾を降らせる設置系の技。弱中強で弾が落下する位置とタイミングが変わります。'
    },
    {
      name: 'コズミックレイ（SA3/CA）',
      notation: '236236P',
      type: 'super',
      description: '相手がいる位置に飛び道具を出現させる技。技の発生は遅いが、切り返しにもコンボにも使えます。'
    }
  ],
  
  modernSuitability: {
    rating: 'moderate',
    summary: 'イングリッドのモダン操作適性は中程度です。立ち強パンチの喪失とサンシュートの制限が気になりますが、その他のほとんどの必殺技が全強度使用可能なため、工夫次第で対応可能です。',
    concerns: [
      '立ち強パンチが使用不可：リーチが長く、パニッシュカウンター時にコンボになる強力な技が失われます',
      'サンシュートが制限：ワンボタンのみで常にダメージが80%に減衰。弱・中の長押し版が使用不可',
      'OD当身（サンヴェール）がワンボタンでない：モダン操作の強みである「ワンボタン無敵」がサンヴェール（OD版）では使えません'
    ]
  },
  
  notes: [
    'モダン操作でも全ジャンプ攻撃が使用可能（アシストボタン+攻撃ボタンで弱・中・強を選択）',
    '通常投げ（ストレンジナックル、グラビティードロップ）は両操作で同じ',
    'スーパーアーツ（SA1・SA2・SA3）は両操作で同じ',
    'ドライブシステム（ドライブインパクト、ドライブリバーサル等）は両操作で同じ'
  ]
};
