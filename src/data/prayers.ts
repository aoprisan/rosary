import type { Prayer } from '../types';

/**
 * The prayers that can be said on each bead. Texts are given as display lines
 * (one short clause per line) so they set well inside the prayer card without
 * manual line-wrapping. English and Romanian forms follow Orthodox usage,
 * with the Latin "Our Father" and Marian forms in their common rendering.
 */
export const PRAYERS: Prayer[] = [
  {
    id: 'jesus-prayer',
    name: { en: 'The Jesus Prayer', ro: 'Rugăciunea lui Iisus' },
    kind: { en: 'Prayer of the heart', ro: 'Rugăciunea inimii' },
    lines: {
      en: ['Lord Jesus Christ, Son of God,', 'have mercy on me, a sinner.'],
      ro: [
        'Doamne Iisuse Hristoase, Fiul lui Dumnezeu,',
        'miluiește-mă pe mine, păcătosul.',
      ],
    },
  },
  {
    id: 'our-father',
    name: { en: "The Lord's Prayer", ro: 'Tatăl nostru' },
    kind: { en: 'Our Father', ro: 'Rugăciunea domnească' },
    lines: {
      en: [
        'Our Father, who art in heaven,',
        'hallowed be Thy name.',
        'Thy kingdom come, Thy will be done,',
        'on earth as it is in heaven.',
        'Give us this day our daily bread,',
        'and forgive us our trespasses,',
        'as we forgive those who trespass against us.',
        'And lead us not into temptation,',
        'but deliver us from evil. Amen.',
      ],
      ro: [
        'Tatăl nostru, Care ești în ceruri,',
        'sfințească-se numele Tău,',
        'vie Împărăția Ta, facă-se voia Ta,',
        'precum în cer așa și pe pământ.',
        'Pâinea noastră cea de toate zilele',
        'dă-ne-o nouă astăzi',
        'și ne iartă nouă greșelile noastre,',
        'precum și noi iertăm greșiților noștri.',
        'Și nu ne duce pe noi în ispită,',
        'ci ne izbăvește de cel rău. Amin.',
      ],
    },
  },
  {
    id: 'theotokos',
    name: { en: 'Rejoice, O Theotokos', ro: 'Născătoare de Dumnezeu' },
    kind: { en: 'To the Mother of God', ro: 'Către Maica Domnului' },
    lines: {
      en: [
        'Rejoice, O Virgin Theotokos,',
        'Mary full of grace, the Lord is with thee.',
        'Blessed art thou among women,',
        'and blessed is the fruit of thy womb,',
        'for thou hast borne the Savior of our souls.',
      ],
      ro: [
        'Născătoare de Dumnezeu Fecioară, bucură-te,',
        'ceea ce ești plină de har, Marie,',
        'Domnul este cu tine.',
        'Binecuvântată ești tu între femei',
        'și binecuvântat este rodul pântecelui tău,',
        'că ai născut pe Mântuitorul sufletelor noastre.',
      ],
    },
  },
  {
    id: 'trisagion',
    name: { en: 'The Trisagion', ro: 'Sfinte Dumnezeule' },
    kind: { en: 'Thrice-Holy hymn', ro: 'Imnul întreit-sfânt' },
    lines: {
      en: ['Holy God, Holy Mighty,', 'Holy Immortal,', 'have mercy on us.'],
      ro: [
        'Sfinte Dumnezeule, Sfinte tare,',
        'Sfinte fără de moarte,',
        'miluiește-ne pe noi.',
      ],
    },
  },
  {
    id: 'glory-be',
    name: { en: 'Glory Be', ro: 'Slavă Tatălui' },
    kind: { en: 'The Doxology', ro: 'Doxologia mică' },
    lines: {
      en: [
        'Glory to the Father, and to the Son,',
        'and to the Holy Spirit;',
        'now and ever, and unto ages of ages. Amen.',
      ],
      ro: [
        'Slavă Tatălui și Fiului',
        'și Sfântului Duh,',
        'acum și pururea și în vecii vecilor. Amin.',
      ],
    },
  },
];

export const DEFAULT_PRAYER_ID = 'jesus-prayer';

export function getPrayer(id: string): Prayer {
  return PRAYERS.find((p) => p.id === id) ?? PRAYERS[0];
}
