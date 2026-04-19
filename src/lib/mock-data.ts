export const MOCK_USER = {
  name: 'Mariana',
  goalWeight: 65,
  currentWeight: 72.5,
  startWeight: 85,
  bmi: 26.6,
  daysInProgram: 45,
}

export const MOCK_WEIGHT_HISTORY = [
  { date: 'Sem 1', weight: 85 },
  { date: 'Sem 2', weight: 83.2 },
  { date: 'Sem 3', weight: 81.5 },
  { date: 'Sem 4', weight: 79.8 },
  { date: 'Sem 5', weight: 77.0 },
  { date: 'Sem 6', weight: 75.5 },
  { date: 'Sem 7', weight: 73.8 },
  { date: 'Sem 8', weight: 72.5 },
]

export const MOCK_ACTIVITY = [
  { day: 'Seg', min: 45 },
  { day: 'Ter', min: 30 },
  { day: 'Qua', min: 60 },
  { day: 'Qui', min: 0 },
  { day: 'Sex', min: 45 },
  { day: 'Sáb', min: 90 },
  { day: 'Dom', min: 30 },
]

export const MOCK_MEALS = [
  {
    id: 'cafe',
    title: 'Café da Manhã',
    time: '08:00',
    items: [
      '2 Ovos mexidos (preparados com 1 fio de azeite)',
      '1 fatia de pão integral',
      '1 xícara de café sem açúcar',
      '1/2 Mamão papaia',
    ],
  },
  {
    id: 'lanche_manha',
    title: 'Lanche da Manhã',
    time: '10:30',
    items: ['1 Maçã', '1 colher de sopa de aveia'],
  },
  {
    id: 'almoco',
    title: 'Almoço',
    time: '13:00',
    items: [
      '150g de Peito de frango grelhado',
      '3 colheres de sopa de arroz integral',
      '1 concha pequena de feijão',
      'Salada de folhas verdes à vontade',
    ],
  },
  {
    id: 'lanche_tarde',
    title: 'Lanche da Tarde',
    time: '16:00',
    items: ['1 Iogurte natural desnatado', '3 castanhas-do-pará'],
  },
  {
    id: 'jantar',
    title: 'Jantar',
    time: '19:30',
    items: ['150g de Filé de peixe assado', 'Legumes cozidos (brócolis, cenoura, abobrinha)'],
  },
]

export const MOCK_LIBRARY = [
  {
    id: 1,
    type: 'video',
    title: 'Treino Hiit 15 min',
    category: 'Treinos em Casa',
    img: 'https://img.usecurling.com/p/400/200?q=fitness%20workout&color=gray',
  },
  {
    id: 2,
    type: 'article',
    title: 'Como ler rótulos nutricionais',
    category: 'Mentalidade/Mindset',
    img: 'https://img.usecurling.com/p/400/200?q=nutrition%20label',
  },
  {
    id: 3,
    type: 'video',
    title: 'Receita: Panqueca Fit',
    category: 'Receitas Fit',
    img: 'https://img.usecurling.com/p/400/200?q=pancakes&color=yellow',
  },
  {
    id: 4,
    type: 'article',
    title: 'A importância do sono no emagrecimento',
    category: 'Saúde',
    img: 'https://img.usecurling.com/p/400/200?q=sleeping',
  },
]

export const MOCK_APPOINTMENTS = [
  {
    id: 1,
    doctor: 'Dra. Ana Costa',
    type: 'Nutricionista',
    date: '25/04/2026',
    time: '14:30',
    status: 'Confirmado',
    mode: 'Online',
  },
  {
    id: 2,
    doctor: 'Dr. Roberto Alves',
    type: 'Endocrinologista',
    date: '10/05/2026',
    time: '09:00',
    status: 'Agendado',
    mode: 'Presencial',
  },
]
