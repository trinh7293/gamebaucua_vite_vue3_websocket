import type { AnimalItem } from './interfaces/AnimalInterface';
import vueLogo from '@/assets/vue.svg';
import viteLogo from '@/assets/vite.svg';
import vuetifyLogo from '@/assets/vuetify.svg';
import crabLogo from '@/assets/crab.svg';
import fishLogo from '@/assets/fish.svg';
import shrimpLogo from '@/assets/shrimp.svg';
const ANIMAL_LIST: AnimalItem[] = [
  {
    id: '0',
    name: 'vite',
    avaSrc: viteLogo,
    avaAlt: 'Vite Logo',
  },
  {
    id: '1',
    name: 'vue',
    avaSrc: vueLogo,
    avaAlt: 'Vue Logo',
  },
  {
    id: '2',
    name: 'vuetify',
    avaSrc: vuetifyLogo,
    avaAlt: 'Vuetify Logo',
  },
  {
    id: '3',
    name: 'shrimp',
    avaSrc: shrimpLogo,
    avaAlt: 'shrimp Logo',
  },
  {
    id: '4',
    name: 'fish',
    avaSrc: fishLogo,
    avaAlt: 'fish logo',
  },
  {
    id: '5',
    name: 'crab',
    avaSrc: crabLogo,
    avaAlt: 'Crab Logo',
  },
];

const transformAnimal = (aniArr: AnimalItem[]): Record<string, AnimalItem> => {
  const resu: Record<string, AnimalItem> = {};
  aniArr.forEach(ani => {
    resu[ani.id] = ani;
  });
  return resu;
};

export const ANIMAL_DISPLAY = transformAnimal(ANIMAL_LIST);

export const SAMPLE_AVA_SRCS = [
  'https://cdn.vuetifyjs.com/images/lists/1.jpg',
  'https://cdn.vuetifyjs.com/images/lists/2.jpg',
  'https://cdn.vuetifyjs.com/images/lists/3.jpg',
  'https://cdn.vuetifyjs.com/images/lists/4.jpg',
];
