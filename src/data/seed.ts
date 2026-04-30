export type CommunicativeFunction =
  | 'agreeing'
  | 'disagreeing'
  | 'buying-time'
  | 'softening'
  | 'storytelling'
  | 'clarifying'
  | 'reacting'
  | 'transitioning'
  | 'emphasizing';

export const COMMUNICATIVE_FUNCTIONS: { id: CommunicativeFunction; lbl: string; emoji: string }[] = [
  { id: 'agreeing',     lbl: 'Concordar',     emoji: '👍' },
  { id: 'disagreeing',  lbl: 'Discordar',     emoji: '🤔' },
  { id: 'buying-time',  lbl: 'Ganhar tempo',  emoji: '⏳' },
  { id: 'softening',    lbl: 'Suavizar',      emoji: '🫧' },
  { id: 'storytelling', lbl: 'Narrar',        emoji: '📖' },
  { id: 'clarifying',   lbl: 'Esclarecer',   emoji: '🔍' },
  { id: 'reacting',     lbl: 'Reagir',        emoji: '⚡' },
  { id: 'transitioning',lbl: 'Transitar',     emoji: '↪️' },
  { id: 'emphasizing',  lbl: 'Enfatizar',     emoji: '🎯' },
];

export type ConnectedSpeechPhenomenon = 'linking' | 'assimilation' | 'elision' | 'intrusion';

export type ConnectedSpeechItem = {
  phenomenon: ConnectedSpeechPhenomenon;
  full: string;
  connected: string;
  phon: string;
  example: string;
  tip: string;
  tier: 'basic' | 'intermediate' | 'advanced';
};

export type VaultItem = {
  id: number;
  term: string;
  type: 'phrase' | 'phonetic' | 'reduction' | 'collocation' | 'idiom' | 'gap-filler' | 'word' | 'chunk';
  lang: string;
  gloss: string;
  source: string;
  date: string;
  example: string;
  srs: 'due' | 'learning' | 'mature' | 'new';
  strength: number;
  tags: string[];
  function?: CommunicativeFunction;
  level?: string;          // nível CEFR: A1 | A2 | B1 | B2 | C1 | C2
  bookmarked?: boolean;
  // FSRS
  stability: number;      // dias até 90% retenção (0 = nunca revisado)
  difficulty: number;     // dificuldade 1-10 (padrão 5)
  lapses: number;         // vezes que esqueceu
  lastReviewAt: number;   // timestamp ms (0 = nunca revisado)
  nextReviewAt: number;   // timestamp ms (0 = vence agora)
};
export type ContentItem = {
  id: string;
  kind: 'podcast' | 'book' | 'video' | 'article';
  title: string;
  author: string;
  minutes: number | string;
  level: string;
  match: number;
  art: string;
  why: string;
  tags: string[];
  vocabulary?: VocabSuggestion[];
  chapters?: { title: string; body: string }[];
};

export type VocabSuggestion = {
  term: string;
  type: VaultItem['type'];
  gloss: string;
  example?: string;
  source: string;
  level?: string;
  function?: CommunicativeFunction;
};

export type NewsArticle = {
  id: string;
  title: string;
  level: 1 | 2 | 3 | 4;
  topic: string;
  date: string;
  text: string;
  vocabulary: VocabSuggestion[];
  source?: string;
};

export type TranscriptToken = {
  w: string;
  t: number;
  flag?: 'schwa' | 'reduce' | 'link' | 'stress';
  punct?: boolean;
};

export type SRSCard = {
  id: number;
  front: string;
  back: string;
  example: string;
  phon: string;
  level: 'learning' | 'mature' | 'due' | 'new';
};

export type ZipfWord = {
  rank: number;
  word: string;
  type: VaultItem['type'];
  gloss: string;
  example: string;
};

export type SchwaWord = {
  word: string;
  ipa: string;
  schwas: number[];
  tier: 'basic' | 'intermediate' | 'advanced';
};

export type GrammarLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type GrammarTopic = {
  id: string;
  level: GrammarLevel;
  title: string;
  description: string;
  url: string;
  lessonNumber: number;
  minWords: number;
  difficultyTags: string[];
  content?: { title: string; body: string; examples: string[] };
  };

export type Reduction = {
  full: string;
  reduced: string;
  phon: string;
  tier: 'basic' | 'intermediate' | 'advanced';
};

export const VAULT: VaultItem[] = [
  { id:1, term:'to come up with', type:'phrase', lang:'en→pt', gloss:'inventar, bolar, ter uma ideia', source:'Lex Fridman #418', date:'hoje · 14:22', example:'She came up with a brilliant solution.', srs:'due', strength:0.2, tags:['business','conversation'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:2, term:'schwa', type:'phonetic', lang:'en', gloss:'som vocálico neutro /ə/, o mais frequente do inglês', source:'Pronunciation Lesson 03', date:'hoje · 11:08', example:'banana → /bəˈnænə/', srs:'learning', strength:0.6, tags:['pronunciation'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:3, term:'gonna', type:'reduction', lang:'en', gloss:"forma reduzida de 'going to'", source:'Friends S03E14', date:'ontem · 21:50', example:"I'm gonna grab a coffee.", srs:'due', strength:0.4, tags:['reductions','casual'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:4, term:'to look forward to', type:'collocation', lang:'en→pt', gloss:'estar ansioso por, aguardar com expectativa', source:'Email do Diego', date:'ontem · 17:31', example:'I look forward to hearing from you.', srs:'mature', strength:0.92, tags:['business','email'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:5, term:'you know what I mean?', type:'gap-filler', lang:'en', gloss:'tipo, sabe? — usado para enfatizar ou pedir confirmação', source:'Huberman Podcast', date:'2 dias atrás', example:"It's tricky, you know what I mean?", srs:'learning', strength:0.55, tags:['conversation','filler'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:6, term:'on the fence', type:'idiom', lang:'en→pt', gloss:'em cima do muro, indeciso', source:'NYT artigo', date:'3 dias atrás', example:"I'm still on the fence about the offer.", srs:'due', strength:0.3, tags:['idioms'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:7, term:'heads up', type:'phrase', lang:'en→pt', gloss:'aviso, alerta antecipado', source:'Slack — work', date:'3 dias atrás', example:'Just a heads up — the meeting moved.', srs:'mature', strength:0.88, tags:['business','slack'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:8, term:'wanna', type:'reduction', lang:'en', gloss:"forma reduzida de 'want to'", source:'The Office', date:'4 dias atrás', example:'Do you wanna grab lunch?', srs:'mature', strength:0.95, tags:['reductions','casual'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:9, term:'tackle a problem', type:'collocation', lang:'en→pt', gloss:'enfrentar / lidar com um problema', source:'HBR article', date:'5 dias atrás', example:"Let's tackle this problem head-on.", srs:'learning', strength:0.5, tags:['business'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:10, term:'reckon', type:'word', lang:'en→pt', gloss:"achar, supor (BrE informal)", source:'BBC podcast', date:'5 dias atrás', example:"I reckon it's gonna rain.", srs:'learning', strength:0.45, tags:['british'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:11, term:'to be on top of things', type:'phrase', lang:'en→pt', gloss:'estar com tudo sob controle', source:'meeting notes', date:'6 dias atrás', example:"She's really on top of things this week.", srs:'due', strength:0.35, tags:['business'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
  { id:12, term:'actually', type:'gap-filler', lang:'en', gloss:'na verdade — também usado como suavizador', source:'podcast', date:'1 sem atrás', example:'Actually, I disagree.', srs:'mature', strength:0.9, tags:['filler'], stability:0, difficulty:5, lapses:0, lastReviewAt:0, nextReviewAt:0 },
];

export const CONTENT: ContentItem[] = [
  {
    id: 'c1',
    kind: 'podcast',
    title: 'How to Learn Anything Faster',
    author: 'Andrew Huberman',
    minutes: 42,
    level: 'B2',
    match: 96,
    art: '#3D7B8C',
    why: 'Vocabulário 92% conhecido · 3 collocations novas',
    tags: ['neuroscience', 'self-improvement'],
    vocabulary: [
      { term: 'fascinating', type: 'word', gloss: 'fascinante / muito interessante', example: 'That\'s a fascinating perspective.', source: 'How to Learn Anything Faster' },
      { term: 'break it down', type: 'chunk', gloss: 'explicar passo a passo / detalhar', example: 'Let me break it down for you.', source: 'How to Learn Anything Faster', function: 'clarifying' },
      { term: 'at the end of the day', type: 'chunk', gloss: 'no fim das contas / em última análise', example: 'At the end of the day, it\'s about results.', source: 'How to Learn Anything Faster', function: 'emphasizing' },
      { term: 'dive deep into', type: 'chunk', gloss: 'mergulhar fundo em / explorar a fundo', example: 'We\'re going to dive deep into AI today.', source: 'How to Learn Anything Faster', function: 'storytelling' },
      { term: 'compelling', type: 'word', gloss: 'convincente / irresistível / muito bom', example: 'That\'s a compelling argument.', source: 'How to Learn Anything Faster' },
      { term: 'nuanced', type: 'word', gloss: 'cheio de nuances / sutil / não simplista', example: 'This is a very nuanced topic.', source: 'How to Learn Anything Faster' },
      { term: 'ground-breaking', type: 'collocation', gloss: 'revolucionário / pioneiro', example: 'Ground-breaking research in the field.', source: 'How to Learn Anything Faster' },
      { term: 'in terms of', type: 'chunk', gloss: 'em termos de / no que diz respeito a', example: 'In terms of impact, it\'s huge.', source: 'How to Learn Anything Faster', function: 'clarifying' },
    ],
  },
  {
    id: 'c2',
    kind: 'book',
    title: 'The Pragmatic Thinker',
    author: 'Margaret Yu',
    minutes: '186 pp',
    level: 'B2',
    match: 91,
    art: '#2D5A3D',
    why: 'Construído sobre 200 palavras Zipf que você já domina',
    tags: ['non-fiction', 'essays'],
    vocabulary: [
      { term: 'pragmatic', type: 'word', gloss: 'pragmático / focado em resultados práticos', example: 'We need a pragmatic approach.', source: 'The Pragmatic Thinker' },
      { term: 'mental models', type: 'collocation', gloss: 'modelos mentais', example: 'Build better mental models.', source: 'The Pragmatic Thinker' },
      { term: 'trade-off', type: 'word', gloss: 'compensação / escolha difícil entre duas opções', example: 'There is always a trade-off.', source: 'The Pragmatic Thinker' },
      { term: 'framework', type: 'word', gloss: 'estrutura / arcabouço / sistema de trabalho', example: 'A new framework for thinking.', source: 'The Pragmatic Thinker' },
      { term: 'bottleneck', type: 'word', gloss: 'gargalo / ponto de obstrução', example: 'Identify the bottleneck in your process.', source: 'The Pragmatic Thinker' },
    ],
  },
  {
    id: 'c3',
    kind: 'video',
    title: 'A Walk Through Edinburgh',
    author: 'Easy English',
    minutes: 18,
    level: 'B1+',
    match: 89,
    art: '#D4A24C',
    why: 'Sotaque escocês — exposição que falta no seu perfil',
    tags: ['immersion', 'travel'],
    vocabulary: [
      { term: 'stunning', type: 'word', gloss: 'maravilhoso / deslumbrante', example: 'The view from the castle is stunning.', source: 'A Walk Through Edinburgh' },
      { term: 'cobbled streets', type: 'collocation', gloss: 'ruas de paralelepípedo', example: 'Walking through the cobbled streets.', source: 'A Walk Through Edinburgh' },
      { term: 'landmark', type: 'word', gloss: 'marco / ponto turístico importante', example: 'The monument is a famous landmark.', source: 'A Walk Through Edinburgh' },
      { term: 'vibrant', type: 'word', gloss: 'vibrante / cheio de vida', example: 'The city has a vibrant atmosphere.', source: 'A Walk Through Edinburgh' },
      { term: 'steep', type: 'word', gloss: 'íngreme / acentuado', example: 'The hill is very steep.', source: 'A Walk Through Edinburgh' },
    ],
  },
  {
    id: 'c4',
    kind: 'article',
    title: 'Why we yawn — and why it spreads',
    author: 'The Atlantic',
    minutes: 7,
    level: 'B2',
    match: 94,
    art: '#E8704C',
    why: 'Tópico de ciência popular · linguagem natural',
    tags: ['science', 'short-read'],
    vocabulary: [
      { term: 'contagious', type: 'word', gloss: 'contagioso', example: 'Yawning is highly contagious.', source: 'Why we yawn' },
      { term: 'empathy', type: 'word', gloss: 'empatia', example: 'Empathy plays a role in yawning.', source: 'Why we yawn' },
      { term: 'evolutionary', type: 'word', gloss: 'evolucionário', example: 'An evolutionary perspective on behavior.', source: 'Why we yawn' },
      { term: 'physiological', type: 'word', gloss: 'fisiológico', example: 'A physiological response to tiredness.', source: 'Why we yawn' },
      { term: 'trigger', type: 'word', gloss: 'desencadear / gatilho', example: 'What triggers a yawn?', source: 'Why we yawn' },
    ],
  },
  {
    id: 'c5',
    kind: 'podcast',
    title: 'Conversations with Tyler #201',
    author: 'Tyler Cowen',
    minutes: 64,
    level: 'C1',
    match: 78,
    art: '#6A4E3C',
    why: 'Push level — 14% palavras novas (zona ideal)',
    tags: ['economics', 'interview'],
    vocabulary: [
      { term: 'incentives', type: 'word', gloss: 'incentivos', example: 'Economic incentives drive behavior.', source: 'Conversations with Tyler' },
      { term: 'status quo', type: 'phrase', gloss: 'o estado atual das coisas', example: 'Challenging the status quo.', source: 'Conversations with Tyler' },
      { term: 'innovation', type: 'word', gloss: 'inovação', example: 'A culture of innovation.', source: 'Conversations with Tyler' },
      { term: 'disruption', type: 'word', gloss: 'disrupção / interrupção brusca', example: 'Technological disruption in markets.', source: 'Conversations with Tyler' },
      { term: 'paradigm shift', type: 'collocation', gloss: 'mudança de paradigma', example: 'We are seeing a paradigm shift.', source: 'Conversations with Tyler' },
    ],
  },
  {
    id: 'c6',
    kind: 'video',
    title: 'Cooking Risotto · slow English',
    author: 'Spoon Fork Bacon',
    minutes: 11,
    level: 'B1',
    match: 92,
    art: '#A86B3C',
    why: 'Imperativo + culinária = vocabulário do dia a dia',
    tags: ['food', 'immersion'],
    vocabulary: [
      { term: 'simmer', type: 'word', gloss: 'cozinhar em fogo baixo / fervilhar', example: 'Let it simmer for 20 minutes.', source: 'Cooking Risotto' },
      { term: 'stir', type: 'word', gloss: 'mexer / misturar', example: 'Stir the risotto constantly.', source: 'Cooking Risotto' },
      { term: 'broth', type: 'word', gloss: 'caldo', example: 'Add the chicken broth slowly.', source: 'Cooking Risotto' },
      { term: 'clove of garlic', type: 'collocation', gloss: 'dente de alho', example: 'Finely mince one clove of garlic.', source: 'Cooking Risotto' },
      { term: 'tender', type: 'word', gloss: 'macio / tenro', example: 'Cook until the rice is tender.', source: 'Cooking Risotto' },
    ],
  },
  {
    id: 'c7',
    kind: 'book',
    title: 'The Little Prince (Level 1)',
    author: 'Antoine de Saint-Exupéry',
    minutes: '45 pp',
    level: 'A1',
    match: 98,
    art: '#6A4E3C',
    why: 'Vocabulário básico e frases curtas. Ideal para iniciantes.',
    tags: ['classic', 'graded-reader'],
    vocabulary: [],
    chapters: [
      { title: 'Chapter 1: The Drawing', body: 'When I was six years old, I saw a very beautiful picture. It was a picture of a boa constrictor eating an animal. The book said: "Boa constrictors swallow their prey whole, without chewing it." I thought about this for a long time.\n\nThen I drew a picture. It was my drawing Number One. I showed it to grown-ups. I asked, "Does my drawing frighten you?" They answered: "Why should a hat frighten us?"\n\nMy drawing was not a picture of a hat. It was a picture of a boa constrictor digesting an elephant. Then I made another drawing. I drew the inside. I had to make it very clear. Grown-ups always need explanations.' },
      { title: 'Chapter 2: The Little Prince Arrives', body: 'Six years ago, my plane had a problem. I was in the desert, very far from any people. I had to fix my plane alone.\n\nOn the first night, I slept on the sand. Then I heard a small voice. "Please... draw me a sheep!" I woke up quickly. There was a small boy in front of me. He was not like any other boy. He was very small. He had golden hair.\n\nI was very surprised. "Draw me a sheep!" he said again. So I drew a sheep. But he said it was not right. I drew again. And again. Finally, I drew a box. "The sheep is inside the box," I said. He smiled. "This is exactly what I wanted!"' },
      { title: 'Chapter 3: Planet B-612', body: 'I learned about the little prince slowly, day by day. He came from a very small planet — Planet B-612.\n\nOn his planet, he had a rose. She was a beautiful flower. She was also very proud. She said: "I am the only flower like me in the whole universe." The little prince loved her very much. He watered her every day. He put a glass cover over her at night.\n\nBut the rose was sometimes difficult. She asked for many things. The little prince was sad. He decided to go away. He wanted to learn about the world and about other people. So one day, he left his planet.' },
    ],
  },
  {
    id: 'c8',
    kind: 'book',
    title: 'The Little Prince (Level 2)',
    author: 'Antoine de Saint-Exupéry',
    minutes: '52 pp',
    level: 'A2/B1',
    match: 92,
    art: '#6A4E3C',
    why: 'Estruturas mais complexas e nuances filosóficas.',
    tags: ['classic', 'graded-reader'],
    vocabulary: [],
    chapters: [
      { title: 'Chapter 1: The Aviator and the Drawing', body: 'I was six years old when I saw a magnificent picture in a book about the rainforest. It was a boa constrictor swallowing a wild animal whole. After much thought, I made my first drawing — a boa constrictor digesting an elephant. But every adult who saw it thought it was a hat.\n\nGrown-ups never understand anything on their own, and it is exhausting for children to always have to explain things to them. So I chose another career. I learned to fly aeroplanes. I flew all over the world, and that was true enough. But I was always a little lonely.' },
      { title: 'Chapter 2: A Strange Visitor in the Desert', body: 'Six years ago, something went wrong with my plane engine. I landed in the Sahara Desert, a thousand miles from any town. I had very little water — perhaps eight days\'s worth — and I had to make repairs alone.\n\nOn the very first night in the desert, I fell asleep on the sand far from human society. I was more isolated than a shipwrecked sailor on a raft in the middle of the ocean. So you can imagine my surprise when a small, extraordinary voice woke me at dawn. The voice said: "If you please — draw me a sheep!"\n\nI looked up and saw a very remarkable small person, standing there looking at me with great seriousness.' },
      { title: 'Chapter 3: The Rose', body: 'The little prince\'s planet was just big enough for a house, a street lamp, and three small volcanoes. One day, a mysterious seed appeared. When it grew, it became a rose — a beautiful flower with four thorns.\n\nThe rose was proud and demanding. She asked the little prince to protect her from draughts and to put a glass globe over her at night. She told him she was unique in all the world. The little prince, who loved her deeply, believed her.\n\nBut her vanity and complaints made him feel uncertain. "I should not have listened to her," he thought. "One should never listen to flowers. One should just admire them and breathe their perfume." But he was too young to understand this.' },
      { title: 'Chapter 4: The Journey Begins', body: 'One morning, the little prince cleaned out his three volcanoes — two active and one extinct. He also pulled up the last baobab shoots. He knew he would not return for a long time. Then he stood and looked at his rose for the last time. She was putting on her thorny display, trying to seem confident.\n\n"Goodbye," said the rose.\n"Goodbye," said the little prince. He did not feel happy.\n\nThe rose coughed. "I have been silly," she said at last. "Forgive me. Try to be happy." He was surprised she was not complaining or being proud. He felt a great tenderness, but he did not know how to express it. Then he left, travelling through the stars, not quite sure why he felt so sad.' },
    ],
  },
  {
    id: 'c9',
    kind: 'book',
    title: 'The Little Prince (Level 3)',
    author: 'Antoine de Saint-Exupéry',
    minutes: '60 pp',
    level: 'B2',
    match: 85,
    art: '#6A4E3C',
    why: 'Versão mais próxima do original com vocabulário rico.',
    tags: ['classic', 'graded-reader'],
    vocabulary: [],
    chapters: [
      { title: 'Chapter 1: The Pilot and His Childhood Drawing', body: 'Once when I was six years old, I saw a magnificent picture in a book about the primeval forest. It was a picture of a boa constrictor in the act of swallowing an animal. In the book it said: "Boa constrictors swallow their prey whole, without chewing it. After that they are not able to move, and they sleep through the six months that they need for digestion."\n\nI pondered deeply over the adventures of the jungle. And after some work with coloured pencil I succeeded in making my first drawing. My Drawing Number One. But the grown-ups said it looked like a hat. I had to make Drawing Number Two — a transparent version showing the elephant inside. Grown-ups always need to have things explained.' },
      { title: 'Chapter 2: The Meeting in the Desert', body: 'So I lived my life alone, without anyone that I could really talk to, until I had an accident with my plane in the Sahara Desert six years ago. Something was broken in my engine. I had very little drinking water, and the first night I went to sleep on the sand, a thousand miles from any human habitation.\n\nThen, at daybreak, I was awakened by a odd little voice. It said: "If you please — draw me a sheep!" I jumped to my feet. I looked about me in all directions with great surprise. And I saw a most extraordinary small person, who stood there examining me with great seriousness.\n\n"Draw me a sheep," he repeated, as if it were the most natural thing in the world.' },
      { title: 'Chapter 3: The Rose and Her Thorns', body: 'The rose, who had appeared one morning from a seed blown from no one knew where, had begun by taking the little prince\'s careful attentions for granted. On the morning of the fifth day her petals had fallen, and she had revealed four thorns.\n\n"I am not at all afraid of tigers," she answered. "But I have a horror of draughts. I suppose you wouldn\'t have a screen for me?" "A horror of draughts — that is not good luck, for a plant," remarked the little prince. "How complicated plants are..."\n\nThe little prince had soon learned to doubt her. He had taken seriously words that were of no importance, and it had made him very miserable. He should have judged her by her actions, not her words. She perfumed all his planet and lit it with joy. He should never have run away!' },
      { title: 'Chapter 4: The Fox and the Secret', body: '"Come and play with me," proposed the little prince. "I am so unhappy."\n"I cannot play with you," the fox said. "I am not tamed."\n"What does that mean — tame?"\n"It means to establish ties. To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys. I have no need of you. But if you tame me, then we shall need each other. To me, you will be unique in all the world."\n\nSo the little prince tamed the fox. And on the hour of his departure, the fox said:\n"And now here is my secret, a very simple secret: It is only with the heart that one can see rightly; what is essential is invisible to the eye."\n\n"What is essential is invisible to the eye," the little prince repeated, so that he would be sure to remember.' },
      { title: 'Chapter 5: The Well in the Desert', body: 'It was now the eighth day since I had my accident in the desert, and I had listened to the story of the merchant as I was drinking the last drop of my water supply. "Ah," I said to the little prince, "these memories of yours are very pretty, but I have not yet succeeded in repairing my plane, I have nothing more to drink, and I, too, shall be very happy if I can find a well!"\n\n"My friend the fox..." the little prince began.\n"My dear little fellow, this is no longer a matter that has anything to do with the fox!"\n\nHe looked at me, and we walked for many hours. Then he said: "It is the time you have wasted for your rose that makes your rose so important." His words startled me. I understood at last that I had been thinking about the wrong things.' },
    ],
  },
  {
    id: 'c10',
    kind: 'book',
    title: 'Robinson Crusoe (Level 1)',
    author: 'Daniel Defoe',
    minutes: '50 pp',
    level: 'A1',
    match: 97,
    art: '#2D5A3D',
    why: 'Aventura clássica simplificada para nível iniciante.',
    tags: ['adventure', 'graded-reader'],
    vocabulary: [],
    chapters: [
      { title: 'Chapter 1: The Storm', body: 'My name is Robinson Crusoe. I love the sea. One day, I got on a ship. The ship was big. We sailed away from England.\n\nAfter some days, a big storm came. The wind was very strong. The rain was heavy. The waves were very big. The ship hit some rocks.\n\nI fell into the water. I swam and swam. I was very tired. Then I found some land. I walked out of the water. I was safe, but I was alone. I looked around. I could not see any people.' },
      { title: 'Chapter 2: Alone on the Island', body: 'I was on an island. The island was big and green. There were many trees and plants. There were birds and animals too.\n\nI went back to the ship. The ship was broken, but some things were still there. I took food, water, tools, and wood. I made a small boat to carry them to the island.\n\nI needed a home. I found a good place near some rocks. I made a tent with sticks and cloth. I put a fence around it to be safe. I worked every day. I was tired but happy with my little home.' },
      { title: 'Chapter 3: Life on the Island', body: 'Every day, I worked hard. I found fruit on the island — bananas, oranges, and coconuts. They were good to eat. I also found some grain. I planted it in the ground. After some months, I had bread to eat.\n\nI made a calendar on a piece of wood. Every day, I made a cut. I did not want to forget the days.\n\nI also made things from wood. I made a table and a chair. I made plates and cups from clay. I was alone, but my life was better every day. I thought: "I am alive. That is the most important thing."' },
    ],
  },
  {
    id: 'c11',
    kind: 'book',
    title: 'Robinson Crusoe (Level 2)',
    author: 'Daniel Defoe',
    minutes: '58 pp',
    level: 'A2/B1',
    match: 90,
    art: '#2D5A3D',
    why: 'Mais detalhes da narrativa com gramática intermediária.',
    tags: ['adventure', 'graded-reader'],
    vocabulary: [],
    chapters: [
      { title: 'Chapter 1: Swept Ashore', body: 'My name is Robinson Crusoe and I was born in England in 1632. My father wanted me to study law, but I had only one desire — to go to sea. Against my family\'s wishes, I sailed away on my first voyage when I was nineteen years old.\n\nMany years later, in September 1659, I was on a ship crossing the Atlantic when a violent storm struck us. The waves were enormous, crashing over the deck. The sailors cried out in terror. The ship struck a sandbar and broke apart. I grabbed a wooden plank and held on.\n\nWhen I opened my eyes, I was lying on a beach. All my companions were dead. I was the only survivor, exhausted and confused. But I was alive.' },
      { title: 'Chapter 2: Building a Life', body: 'My first concern was shelter. The nights were warm, but wild animals frightened me, so I climbed a tree to sleep. The next morning I swam back to the wreck. Over several trips, I salvaged tools, food, gunpowder, weapons, rope, and timber.\n\nI chose a flat piece of ground on a hillside with a view of the sea. I pitched a tent and built a strong fence of wooden stakes around it. Inside, I dug a small cave for storage. It took many weeks of hard work, but finally I had a safe place to live.\n\nI kept a journal, marking the days with cuts in a wooden post. I organised my time: mornings for hunting or fishing, afternoons for building, evenings for reading the Bible I had saved from the ship.' },
      { title: 'Chapter 3: Farming and Making', body: 'One day I found some old grain bags that still had seeds inside. I planted them carefully and waited. After the rainy season, green shoots appeared! I was overjoyed. I protected the plants from birds and, months later, harvested enough grain to make flour and then bread.\n\nI also learned to make clay pots for cooking. My first attempts broke when I put them in the fire, but eventually I learned the right technique. I made baskets, furniture, and even a primitive mortar and pestle.\n\nI tamed a group of goats, keeping them in a fenced area. They gave me milk and meat. "I am like a king," I wrote in my journal, "with my own country, my own subjects — the goats and the parrots — and no one to dispute my authority."' },
      { title: 'Chapter 4: The Footprint', body: 'I had been on the island for fifteen years when something happened that changed everything. One afternoon I found a single human footprint in the sand. I froze. My heart hammered in my chest. The print was large — not my own.\n\nI ran back to my fortress in a panic. For days I barely slept, listening for sounds, convinced I was being watched. Were there cannibals on the island? I strengthened my defences, adding extra fences and hiding my cattle.\n\nSome time later, I found the remains of a fire on the far side of the island — and bones. I understood now that groups of mainland peoples came here occasionally for their terrible ceremonies. I watched from a distance, too frightened to act, but determined to defend myself if they ever came near.' },
    ],
  },
  {
    id: 'c12',
    kind: 'book',
    title: 'Robinson Crusoe (Level 3)',
    author: 'Daniel Defoe',
    minutes: '65 pp',
    level: 'B2',
    match: 82,
    art: '#2D5A3D',
    why: 'Linguagem descritiva e estruturas avançadas.',
    tags: ['adventure', 'graded-reader'],
    vocabulary: [],
    chapters: [
      { title: 'Chapter 1: Shipwreck and Survival', body: 'I was born in the year 1632, in the city of York. My father, a German merchant, had settled in England and done well for himself. He wished me to study law, but I had an incurable wanderlust — a burning desire to go to sea that no parental argument could extinguish.\n\nMy third voyage proved fatal to my former life. A tremendous storm came upon us in September 1659, three weeks off the coast of Africa. The mainmast was split, the sails torn to rags. With a great shuddering crack, we struck a sandbar. The waves overwhelmed the ship entirely.\n\nI was thrown into the sea and, after what seemed like hours of desperate struggling, was cast upon the shore, more dead than alive, utterly astonished to find myself breathing.' },
      { title: 'Chapter 2: The Wreck and What I Salvaged', body: 'The morning after the wreck revealed a grim tableau. Twelve souls had sailed with me; I alone remained. The ship had settled into the sand about a quarter mile offshore, broken but not wholly submerged.\n\nFor ten days I made repeated trips by raft, hauling away everything of value: three chests of provisions, tools, two saws, an axe, two pistols, three muskets, gunpowder, canvas, ropes, timber, and fortuitously, several bags of coins — useless here, but hoarded out of old habit.\n\nI established my fortified habitation on a hillside, constructing a double fence of stakes driven into the earth, reinforced with cable from the ship. Behind this palisade I pitched my tent and excavated a cave. I was secure, but the silence of the island pressed upon me with a weight I had not anticipated.' },
      { title: 'Chapter 3: Industry and Philosophy', body: 'Solitude is a crucible. In its heat, a man either refines himself or dissolves. I chose, or perhaps was forced by circumstance, to refine.\n\nI discovered grains of barley and rice in an old sack — the remnant of some earlier provision — and planted them with great care, learning through failure the rhythms of the island\'s seasons. My pottery began in disaster, pots cracking and crumbling in the kiln, until patience and observation taught me the correct clay, the correct temperature, the correct drying time.\n\nI tamed goats. I cultivated a second plantation inland. I built two habitations — my main castle and a pleasant country retreat on the gentler side of the island. I read my Bible each morning and evening, and in those pages found a philosophy that helped me bear my condition: to compare my situation not with what I had lost, but with what I had retained.' },
      { title: 'Chapter 4: Friday', body: 'In the twenty-third year of my captivity — for so I had come to think of it — I rescued a young native man from a group of cannibals who had come to the island for one of their terrible ceremonies.\n\nHe was a fine figure of a man — about twenty-six years of age, with a strong, well-shaped face and an expression of both intelligence and gentleness. I named him Friday, for the day of his deliverance. He became my servant and, in time, my friend — perhaps my only true friend in those long years of isolation.\n\nFriday learned English with remarkable speed. He was curious, quick, and fearless. Together we explored every corner of the island. He taught me methods of hunting and fishing I had never thought of; I taught him to read and to shoot. We were, in the truest sense, different men made more complete by each other\'s company.' },
      { title: 'Chapter 5: Rescue and Return', body: 'After twenty-eight years, two months, and nineteen days, a ship appeared off the island — an English vessel. Through a series of complicated events, I helped the captain recover control of his ship from mutineers, and in return he offered me passage home.\n\nI stood on the deck and watched the island recede into the blue distance. I felt, unexpectedly, a pang of grief — for the goats, for the parrots, for the years of solitary industry and philosophical reflection that had, in some ways, been the fullest of my life.\n\nI returned to England a wealthy man. The merchants in Brazil, where I had held a plantation before my final voyage, had preserved and managed my interests faithfully, and I returned to find myself prosperous. I married, had children, and lived to a comfortable old age. But I never ceased to dream of the island, and I recorded these memoirs so that others might understand what a man alone is capable of — given time, necessity, and the stubborn refusal to give up.' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Famous Public Domain Books
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Alice's Adventures in Wonderland ──────────────────────────────────────
  {
    id: 'c13',
    kind: 'book',
    title: 'Alice\'s Adventures in Wonderland (Level 1)',
    author: 'Lewis Carroll',
    minutes: '55 pp',
    level: 'A2',
    match: 93,
    art: '#8B6F9E',
    why: 'Clássico infantil universal. Vocabulário concreto e narrativa visual.',
    tags: ['classic', 'fantasy', 'graded-reader'],
    vocabulary: [
      { term: 'rabbit hole', type: 'collocation', gloss: 'buraco do coelho / algo que leva a uma situação estranha', example: 'She fell down the rabbit hole.', source: 'Alice in Wonderland' },
      { term: 'curious', type: 'word', gloss: 'curioso / com vontade de saber', example: 'Alice was very curious about everything.', source: 'Alice in Wonderland' },
      { term: 'disappear', type: 'word', gloss: 'desaparecer', example: 'The cat disappeared slowly.', source: 'Alice in Wonderland' },
      { term: 'grin', type: 'word', gloss: 'sorriso largo / dar um sorrisão', example: 'The cat had a wide grin.', source: 'Alice in Wonderland' },
    ],
    chapters: [
      { title: 'Chapter 1: Down the Rabbit Hole', body: 'Alice was sitting with her sister by the river. She was very tired — she had nothing to do. Suddenly, a White Rabbit with pink eyes ran past her. It said: "Oh dear! I shall be too late!"\n\nAlice was very curious. She ran after the rabbit. She saw it jump into a big hole under a tree. Without thinking, Alice jumped too. The hole was very deep. She fell and fell and fell. She thought: "I wonder how many miles I have fallen by this time?"\n\nAt last, she landed on a pile of leaves. She was not hurt. She saw the White Rabbit running away. She followed it into a long hall with many locked doors.' },
      { title: 'Chapter 2: The Pool of Tears', body: 'In the hall, Alice found a small golden key. It opened a tiny door. Behind the door was a beautiful garden. But Alice was too big to go through the door.\n\nShe found a bottle with the label "DRINK ME". She drank some. She became very small — only ten inches tall! But now she could not reach the key on the table. Then she found a cake marked "EAT ME". She ate it and grew very tall — bigger than the house!\n\nAlice began to cry. Her tears made a big pool. A Mouse passed by. It tried to help her, but Alice talked about her cat Dinah, and the Mouse ran away angrily.' },
      { title: 'Chapter 3: The Mad Tea Party', body: 'Alice walked through the forest and found a house. At the house, the March Hare and the Hatter were having tea. They were sitting at a very long table. "No room! No room!" they shouted when Alice came near.\n\n"There is plenty of room," said Alice angrily, and she sat down.\n\nThe Hatter asked her riddles: "Why is a raven like a writing desk?" Alice tried to answer, but the riddles made no sense. The Dormouse told a story about three sisters who lived in a treacle well.\n\nAlice became very cross. "This is the stupidest tea party I have ever been to!" she said. She left and walked into the forest. She saw a tree with a door in it. She went through the door and found herself back in the long hall.' },
    ],
  },
  {
    id: 'c14',
    kind: 'book',
    title: 'Alice\'s Adventures in Wonderland (Level 2)',
    author: 'Lewis Carroll',
    minutes: '68 pp',
    level: 'B1',
    match: 88,
    art: '#8B6F9E',
    why: 'Narrativa completa com estruturas mais elaboradas.',
    tags: ['classic', 'fantasy', 'graded-reader'],
    vocabulary: [
      { term: 'nonsense', type: 'word', gloss: 'absurdo / sem sentido', example: 'The poem was complete nonsense.', source: 'Alice in Wonderland' },
      { term: 'to vanish', type: 'word', gloss: 'desaparecer / sumir (formal)', example: 'The cat vanished into thin air.', source: 'Alice in Wonderland' },
      { term: 'dreary', type: 'word', gloss: 'sombrio / monótono / deprimente', example: 'The world felt dreary without colour.', source: 'Alice in Wonderland' },
      { term: 'to behead', type: 'word', gloss: 'decapitar / cortar a cabeça', example: 'The Queen ordered to behead everyone.', source: 'Alice in Wonderland' },
      { term: 'executioner', type: 'word', gloss: 'carrasco / executor', example: 'The executioner arrived with his axe.', source: 'Alice in Wonderland' },
    ],
    chapters: [
      { title: 'Chapter 1: Advice from a Caterpillar', body: 'Alice wandered through the forest until she came upon a large mushroom. On top of it sat a blue Caterpillar, smoking a hookah. He looked at Alice with sleepy eyes.\n\n"Who are you?" asked the Caterpillar.\n\nAlice replied, "I — I hardly know, sir. I\'ve changed so many times today."\n\nThe Caterpillar told her: "One side of the mushroom makes you grow taller; the other side makes you grow shorter." Alice carefully broke off pieces from each side.\n\nWhen she ate from the right side, her neck grew as long as a snake. A pigeon attacked her, shouting "Serpent!" Alice ate from the left side and shrank to just three inches. She managed to find the right balance and returned to her normal size.' },
      { title: 'Chapter 2: The Cheshire Cat', body: 'Alice continued walking and encountered the Cheshire Cat, who was sitting in a tree with a very wide grin. The cat could appear and disappear at will, leaving only its grin floating in the air.\n\n"Would you tell me, please, which way I ought to go from here?" asked Alice.\n\n"That depends a good deal on where you want to get to," said the Cat.\n\n"I don\'t much care where —" said Alice.\n\n"Then it doesn\'t matter which way you go," said the Cat.\n\nThe Cat told her about the Mad Hatter and the March Hare, then disappeared, beginning with the end of its tail and ending with the grin, which remained for some time after the rest had gone.' },
      { title: 'Chapter 3: The Queen\'s Croquet Ground', body: 'Alice arrived at the Queen\'s garden, where the roses were painted red by frantic playing cards. The Queen of Hearts was a fierce woman who shouted "Off with their heads!" at every small mistake.\n\nThe Queen invited Alice to play croquet. But the game was absurd: the balls were live hedgehogs, the mallets were flamingos, and the soldiers formed the arches. Alice\'s flamingo kept twisting its head away just when she tried to hit.\n\nAt the trial, the Knave of Hearts was accused of stealing the Queen\'s tarts. "Sentence first — verdict afterwards!" shouted the Queen. Alice grew to her full size and shouted back: "You\'re nothing but a pack of cards!" The cards flew into the air and swirled around her. Then Alice woke up — it was all a dream.' },
    ],
  },

  // ── The Wonderful Wizard of Oz ────────────────────────────────────────────
  {
    id: 'c15',
    kind: 'book',
    title: 'The Wonderful Wizard of Oz (Level 1)',
    author: 'L. Frank Baum',
    minutes: '60 pp',
    level: 'A2',
    match: 91,
    art: '#D4A24C',
    why: 'Aventura americana clássica. Vocabulário concreto e repetitivo.',
    tags: ['classic', 'adventure', 'graded-reader'],
    vocabulary: [
      { term: 'tornado', type: 'word', gloss: 'tornado / furacão', example: 'A tornado carried the house away.', source: 'Wizard of Oz' },
      { term: 'to wish', type: 'word', gloss: 'desejar / querer muito', example: 'I wish I could go home.', source: 'Wizard of Oz' },
      { term: 'to follow', type: 'word', gloss: 'seguir / ir atrás de', example: 'Follow the yellow brick road.', source: 'Wizard of Oz' },
      { term: 'courage', type: 'word', gloss: 'coragem', example: 'The Lion wanted courage.', source: 'Wizard of Oz' },
    ],
    chapters: [
      { title: 'Chapter 1: The Cyclone', body: 'Dorothy lived in the middle of the great Kansas prairies, with her Uncle Henry and Aunt Em. Their house was very small. Everything was grey — the grass, the house, even the faces of her uncle and aunt.\n\nOne day, a terrible cyclone came. The wind screamed and the house shook. Uncle Henry shouted: "Run for the cellar!" But before Dorothy could get there, the house was lifted into the air. It flew for many miles, high above the clouds.\n\nDorothy fell asleep in her bed. When she woke up, the house was on the ground again. She opened the door and saw a beautiful land with green fields and flowers. She was no longer in Kansas.' },
      { title: 'Chapter 2: The Munchkins', body: 'A group of little people in blue clothes came to meet Dorothy. They were the Munchkins. A good witch told Dorothy: "Welcome to the Land of Oz. Your house fell on the Wicked Witch of the East. You are a hero!"\n\nThe Good Witch gave Dorothy the Wicked Witch\'s silver shoes. "These shoes have magic powers," she said. "But I don\'t know how they work."\n\nDorothy asked: "Can you help me go back to Kansas?"\n\nThe Good Witch said: "Go to the City of Emeralds. The great Wizard Oz lives there. He can help you."\n\nDorothy put on the silver shoes and started her journey along the yellow brick road.' },
      { title: 'Chapter 3: The Scarecrow and the Tin Woodman', body: 'On the yellow brick road, Dorothy found a Scarecrow in a cornfield. It was made of sticks and old clothes. "I wish I had a brain," said the Scarecrow. "Will the Wizard give me one?"\n\n"Come with me to the Emerald City!" said Dorothy. So the Scarecrow joined her.\n\nNext, they found a Tin Woodman, made entirely of metal. He was standing in the forest, unable to move. "I had a heart once," he said sadly. "I want to ask the Wizard for a new heart."\n\nDorothy oiled his joints so he could walk again. The Tin Woodman joined them.\n\nThen a Lion appeared. He tried to scare them, but he was really afraid. "I want courage," said the Lion. So he joined them too. The four friends walked together toward the Emerald City.' },
    ],
  },

  // ── Animal Farm ────────────────────────────────────────────────────────────
  {
    id: 'c16',
    kind: 'book',
    title: 'Animal Farm',
    author: 'George Orwell',
    minutes: '72 pp',
    level: 'B2',
    match: 86,
    art: '#C0392B',
    why: 'Alegoria política com linguagem precisa. Ideal para B2.',
    tags: ['classic', 'politics', 'allegory'],
    vocabulary: [
      { term: 'rebellion', type: 'word', gloss: 'rebelião / revolta organizada', example: 'The animals planned a rebellion.', source: 'Animal Farm' },
      { term: 'tyranny', type: 'word', gloss: 'tirania / governo opressor', example: 'They fought against tyranny.', source: 'Animal Farm' },
      { term: 'principle', type: 'word', gloss: 'princípio / regra moral', example: 'The Seven Commandments were their principles.', source: 'Animal Farm' },
      { term: 'to exploit', type: 'word', gloss: 'explorar / tirar vantagem injusta', example: 'They refused to be exploited.', source: 'Animal Farm' },
      { term: 'corrupt', type: 'word', gloss: 'corrupto / moralmente podre', example: 'Power made the pigs corrupt.', source: 'Animal Farm' },
    ],
    chapters: [
      { title: 'Chapter 1: Old Major\'s Dream', body: 'Old Major, an old boar, called all the animals to a meeting in the big barn. The horses, cows, goats, sheep, dogs, and even the hens came. Only the cat was missing — she was always late.\n\nOld Major began: "Comrades, what is the life of an animal? We are born, we work, we eat a little, and then we die. Every animal here knows the cruelty of Farmer Jones. We work all day and he takes everything. But I have had a dream — a dream of a world where animals live free and happy."\n\nOld Major taught them a song called "Beasts of England." The animals sang it with great emotion. They felt hope for the first time. Old Major died three nights later. But the seeds of rebellion were planted in every animal\'s heart.' },
      { title: 'Chapter 2: The Rebellion', body: 'The pigs were the most intelligent animals. Two young pigs named Snowball and Napoleon became the leaders. They turned Old Major\'s ideas into a system called Animalism.\n\nOne day, Farmer Jones got drunk and forgot to feed the animals. They broke into the store shed and began eating. Jones and his men came with whips. The animals attacked them. Jones and his men ran away. The Rebellion had happened — and it happened more quickly than anyone had expected.\n\nThe animals took over the farm. They renamed it "Animal Farm." The Seven Commandments of Animalism were written on the wall. The most important rule was: "All animals are equal."' },
      { title: 'Chapter 3: The Windmill', body: 'The animals worked hard. The pigs were the supervisors — they never did any physical work. Boxer, the strong horse, worked harder than anyone. His motto was "I will work harder."\n\nSnowball planned to build a windmill that would bring electricity to the farm. Napoleon disagreed. One day, Napoleon called nine ferocious dogs — the puppies he had secretly raised. The dogs chased Snowball off the farm. Snowball escaped, but he never returned.\n\nNapoleon became the only leader. He announced: "Snowball was a traitor. And about the windmill — I have decided we WILL build it." The other animals did not understand. But they accepted it. After all, Napoleon was the leader now.' },
      { title: 'Chapter 4: The New Tyrants', body: 'Changes came slowly. The pigs started sleeping in beds. The commandment on the wall changed: "No animal shall sleep in a bed with sheets" — or rather, the word "with sheets" was added later, so the rule was technically not broken.\n\nBoxer noticed strange things but always said: "I will work harder." Then one day Boxer collapsed. Napoleon sent for the knacker — the horse slaughterer. The other animals believed Boxer was taken to a hospital.\n\nYears passed. The Seven Commandments became one: "All animals are equal, but some animals are more equal than others." The pigs began walking on two legs. They wore human clothes. They drank alcohol. Napoleon hosted dinner with the neighbouring farmers. The other animals looked from pig to man, and from man to pig — but they could no longer tell the difference.' },
    ],
  },

  // ── The Old Man and the Sea ────────────────────────────────────────────────
  {
    id: 'c17',
    kind: 'book',
    title: 'The Old Man and the Sea',
    author: 'Ernest Hemingway',
    minutes: '80 pp',
    level: 'B2',
    match: 84,
    art: '#2C6E91',
    why: 'Hemingway — frases curtas e poderosas. Excelente para B2+.',
    tags: ['classic', 'literature', 'adventure'],
    vocabulary: [
      { term: 'skiff', type: 'word', gloss: 'esquife / barco pequeno de pesca', example: 'He sailed his skiff far out to sea.', source: 'The Old Man and the Sea' },
      { term: 'fortune', type: 'word', gloss: 'sorte grande / fortuna', example: 'It was a fish of great fortune.', source: 'The Old Man and the Sea' },
      { term: 'to endure', type: 'word', gloss: 'suportar / aguentar / resistir', example: 'He had to endure the pain.', source: 'The Old Man and the Sea' },
      { term: 'despair', type: 'word', gloss: 'desespero / desânimo profundo', example: 'He never gave in to despair.', source: 'The Old Man and the Sea' },
      { term: 'dignity', type: 'word', gloss: 'dignidade / nobreza de caráter', example: 'He fought the fish with dignity.', source: 'The Old Man and the Sea' },
    ],
    chapters: [
      { title: 'Chapter 1: The Old Man', body: 'For eighty-four days, Santiago the old fisherman had caught nothing. He was unlucky. The other fishermen called him "salao" — the worst form of unlucky. A boy named Manolin used to fish with him, but his parents said the old man was unlucky. So the boy fished with another boat.\n\nEach evening, Santiago came back with an empty skiff. Manolin would help him carry his gear and bring him food. They talked about baseball and the great Joe DiMaggio.\n\n"I go far out," the old man said. "I will go out where the big fish are."\n\n"I wish I could go with you," said the boy.\n\n"You are with a lucky boat," said the old man. "Stay with them."' },
      { title: 'Chapter 2: The Great Fish', body: 'Before dawn on the eighty-fifth day, Santiago sailed his skiff far out into the Gulf Stream. He set his lines carefully. At noon, a great marlin took his bait. The fish was enormous — bigger than any Santiago had ever seen. It began to pull the boat.\n\nThe old man held the line against his back. The fish pulled the skiff for two days and two nights. Santiago\'s hands were cut and bleeding. His back ached. But he did not let go.\n\nHe spoke to the fish: "Fish, I love and respect you very much. But I will kill you before this day ends." He thought about DiMaggio, who played baseball even with a bone spur. "Pain does not matter to a man," he said.' },
      { title: 'Chapter 3: The Sharks', body: 'Santiago finally killed the great marlin with his harpoon. He tied it to the side of his skiff — it was longer than the boat — and sailed home. The marlin\'s blood left a trail in the water.\n\nThe first shark came. It was a huge mako. Santiago killed it with his harpoon, but the harpoon sank with the shark. More sharks came. Santiago tied his knife to an oar and fought them. The sharks tore the marlin\'s flesh. Santiago killed several, but more kept coming.\n\nBy night, the marlin was destroyed — nothing but a skeleton and a head. Santiago spat salt water from his mouth. "They beat me," he said. "They truly beat me." But in his heart, he knew: a man can be destroyed but not defeated.' },
      { title: 'Chapter 4: The Return', body: 'Santiago sailed into the harbour after midnight, exhausted beyond words. He carried his mast over his shoulder and stumbled up the beach. His hands were swollen and bleeding. He fell asleep in his hut with his face in his arms.\n\nIn the morning, the fishermen gathered around the skiff. They measured the skeleton — eighteen feet long. It was the biggest fish anyone had ever seen in those waters.\n\nManolin came to the old man\'s hut. "I am sorry I could not be with you," the boy cried. "I will fish with you again, no matter what my parents say."\n\n"I am not lucky anymore," said the old man.\n\n"To hell with luck," said the boy. "I will bring your luck."\n\nAbove all, Santiago was dreaming — dreaming of the lions he had seen on the beaches of Africa when he was young.' },
    ],
  },

  // ── The Great Gatsby ──────────────────────────────────────────────────────
  {
    id: 'c18',
    kind: 'book',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    minutes: '96 pp',
    level: 'C1',
    match: 76,
    art: '#D4AF37',
    why: 'Prosa poética e vocab sofisticado para desafiar seu C1.',
    tags: ['classic', 'american', 'literature'],
    vocabulary: [
      { term: 'extravagant', type: 'word', gloss: 'extravagante / ostentatório', example: 'Gatsby threw extravagant parties.', source: 'The Great Gatsby' },
      { term: 'elusive', type: 'word', gloss: 'elusivo / difícil de alcançar', example: 'The green light seemed elusive.', source: 'The Great Gatsby' },
      { term: 'contempt', type: 'word', gloss: 'desprezo / menosprezo', example: 'She looked at him with contempt.', source: 'The Great Gatsby' },
      { term: 'aspiration', type: 'word', gloss: 'aspiração / ambição elevada', example: 'Gatsby was driven by his aspiration.', source: 'The Great Gatsby' },
      { term: 'reckless', type: 'word', gloss: 'imprudente / sem se importar com riscos', example: 'Their love was reckless and dangerous.', source: 'The Great Gatsby' },
    ],
    chapters: [
      { title: 'Chapter 1: East Egg and West Egg', body: 'In the summer of 1922, a young man named Nick Carraway moved to New York. He rented a small house in West Egg, a less fashionable part of Long Island. Next to his house stood an enormous mansion — the home of Jay Gatsby.\n\nAcross the bay, in the more elegant East Egg, lived Nick\'s cousin Daisy and her husband Tom Buchanan — an old-money billionaire with a cruel streak. At their dinner party, Nick met Jordan Baker, a professional golfer with a cynical smile.\n\nTom received a phone call during dinner. Jordan whispered: "That\'s his woman in New York." Daisy\'s voice was full of money. Nick felt the evening was strange and disturbing. He returned home and saw Gatsby standing on his lawn, reaching out toward a single green light at the end of a dock across the bay.' },
      { title: 'Chapter 2: The Valley of Ashes', body: 'Between West Egg and New York lay the Valley of Ashes — a desolate wasteland of industrial waste. Above it, the eyes of Doctor T.J. Eckleburg stared from a giant billboard, looking down like the eyes of God.\n\nTom took Nick to meet his mistress Myrtle Wilson, the wife of a poor garage owner. They went to an apartment in New York for a party. Myrtle put on an expensive dress and acted as if she were rich. The more she drank, the more vulgar she became. She repeated Daisy\'s name just to provoke Tom. Tom broke her nose with the back of his hand.\n\nNick left drunk and disgusted. "They were careless people," he thought later. "Tom and Daisy — they smashed up things and retreated back into their money."' },
      { title: 'Chapter 3: Gatsby\'s Parties', body: 'Every weekend, Gatsby\'s mansion came alive. Hundreds of guests swam in his pool, danced in his gardens, and drank his champagne. Nobody knew who Gatsby really was. Rumours flew: he was a German spy, a war hero, a bootlegger, a murderer.\n\nNick was invited. The party was overwhelming — orchestras, dancing, laughter from every corner. Nick finally met Gatsby — a man with a magnetic smile who called everyone "old sport." Gatsby seemed different from the other guests. There was a romantic intensity about him, a quality of hope that Nick had never seen in anyone else.\n\nJordan took Nick aside. "Gatsby wants to see you tomorrow," she said. "He has something to ask you."' },
      { title: 'Chapter 4: The Green Light', body: 'Gatsby drove Nick to New York in his cream-coloured Rolls-Royce. He told Nick the story of his life — a story that sounded too extraordinary to be true.\n\nThen Jordan told Nick the truth: Gatsby had met Daisy five years ago, before the war. He had fallen deeply in love with her. But he was poor and she married Tom. Gatsby bought his mansion specifically to be across the bay from Daisy. The green light was at the end of her dock. He threw his parties hoping she would one day come.\n\n"Can you arrange for Gatsby to meet Daisy at your house?" Jordan asked.\n\nNick agreed. When the day came, Gatsby was so nervous he nearly ran away. Then Daisy arrived. For the first minute or two, there was only awkward silence. Then they talked. The clock on Nick\'s mantel was broken; Gatsby had broken it. "We\'ve met before," said Gatsby. Their love rekindled like a fire that had never truly died.' },
    ],
  },

  // ── O. Henry — The Gift of the Magi ──────────────────────────────────────
  {
    id: 'c19',
    kind: 'book',
    title: 'The Gift of the Magi',
    author: 'O. Henry',
    minutes: '18 pp',
    level: 'B2',
    match: 88,
    art: '#A86B3C',
    why: 'Conto curto com vocabulário rico e desfecho emocionante.',
    tags: ['classic', 'short-story', 'american'],
    vocabulary: [
      { term: 'sacrifice', type: 'word', gloss: 'sacrifício / abrir mão de algo importante', example: 'She made a great sacrifice for love.', source: 'The Gift of the Magi' },
      { term: 'to possess', type: 'word', gloss: 'possuir / ter (formal)', example: 'Her hair was the finest thing she possessed.', source: 'The Gift of the Magi' },
      { term: 'pride', type: 'word', gloss: 'orgulho', example: 'He was too proud to show his disappointment.', source: 'The Gift of the Magi' },
      { term: 'to cherish', type: 'word', gloss: 'estimar / valorizar profundamente', example: 'She cherished her hair above all.', source: 'The Gift of the Magi' },
    ],
    chapters: [
      { title: 'The Story', body: 'It was Christmas Eve. Della had only one dollar and eighty-seven cents to buy her husband Jim a present. She had saved every penny for months. Their apartment was cheap and small — twenty dollars a week. The mail box was broken and the door could not close properly.\n\nDella cried. She looked out the window at the grey street. Then she looked in the mirror. Her hair was beautiful — it fell like a river of silk past her knees. In a moment of desperate love, she went outside and sold her hair to a wig maker for twenty dollars.\n\nNow she searched for the perfect gift: a platinum chain for Jim\'s gold watch — the only treasure he owned. She found it for twenty-one dollars and ran home.\n\nWhen Jim arrived, he stared at Della without expression. "Don\'t look at me like that," she said. "I sold my hair because I love you."\n\nJim held out a package. "I sold my watch to buy you combs for your hair," he said.\n\nThey sat down and laughed and cried together. The gifts were now useless. But they owned something greater: the wisdom of true love, like the Magi who brought gifts to the Christ child.' },
    ],
  },
];

export const SHADOW_TRANSCRIPT: TranscriptToken[] = [
  { w:'So', t:0.0 },
  { w:'the', t:0.18, flag:'schwa' },
  { w:'thing', t:0.42, flag:'stress' },
  { w:'is', t:0.7 },
  { w:',', t:0.9, punct:true },
  { w:'when', t:1.0 },
  { w:'you', t:1.18, flag:'reduce' },
  { w:'start', t:1.4, flag:'stress' },
  { w:'learning', t:1.85, flag:'stress' },
  { w:'a', t:2.25, flag:'schwa' },
  { w:'new', t:2.4 },
  { w:'language', t:2.65, flag:'stress' },
  { w:',', t:3.05, punct:true },
  { w:'you', t:3.2, flag:'reduce' },
  { w:'gotta', t:3.4, flag:'reduce' },
  { w:'focus', t:3.75, flag:'stress' },
  { w:'on', t:4.05, flag:'schwa' },
  { w:'the', t:4.18, flag:'schwa' },
  { w:'sounds', t:4.35, flag:'stress' },
  { w:',', t:4.7, punct:true },
  { w:'not', t:4.85 },
  { w:'the', t:5.05, flag:'schwa' },
  { w:'spelling', t:5.22, flag:'stress' },
  { w:'.', t:5.6, punct:true },
];

export const SRS_DECK: SRSCard[] = [
  { id:1, front:'to pull off', back:'conseguir executar com sucesso (algo difícil)', example:'He pulled off the deal at the last minute.', phon:'/pʊl ɒf/', level:'learning' },
  { id:2, front:'upbeat', back:'animado, otimista, alto-astral', example:'She has such an upbeat personality.', phon:'/ˈʌp.biːt/', level:'mature' },
  { id:3, front:'to wrap up', back:'finalizar, concluir', example:"Let's wrap up this meeting.", phon:'/ræp ʌp/', level:'due' },
  { id:4, front:'a stretch', back:'um exagero, uma forçação', example:'Calling it the best is a stretch.', phon:'/strɛtʃ/', level:'learning' },
  { id:5, front:'to chip in', back:'contribuir, dar uma ajuda (dinheiro/esforço)', example:'Everyone chipped in for the gift.', phon:'/tʃɪp ɪn/', level:'new' },
];

export const ZIPF_TOP_500: ZipfWord[] = [
  { rank: 1,   word: 'the',      type: 'word',  gloss: 'artigo definido — o, a, os, as',                          example: 'The book is on the table.' },
  { rank: 2,   word: 'be',       type: 'word',  gloss: 'ser ou estar (verbo auxiliar)',                            example: 'She will be here soon.' },
  { rank: 3,   word: 'to',       type: 'word',  gloss: 'para; partícula de infinitivo',                            example: 'I want to learn English.' },
  { rank: 4,   word: 'of',       type: 'word',  gloss: 'de (preposição de posse/relação)',                         example: 'A cup of coffee.' },
  { rank: 5,   word: 'and',      type: 'word',  gloss: 'e (conjunção aditiva)',                                    example: 'cats and dogs' },
  { rank: 6,   word: 'a',        type: 'word',  gloss: 'artigo indefinido — um, uma',                              example: 'I saw a dog.' },
  { rank: 7,   word: 'in',       type: 'word',  gloss: 'em, dentro de (preposição de lugar/tempo)',                example: 'She lives in Brazil.' },
  { rank: 8,   word: 'that',     type: 'word',  gloss: 'que; esse/essa; aquele/aquela',                            example: 'I think that it\'s true.' },
  { rank: 9,   word: 'have',     type: 'word',  gloss: 'ter; possuir; auxiliar de perfeito',                       example: 'I have finished my work.' },
  { rank: 10,  word: 'it',       type: 'word',  gloss: 'pronome neutro — isso, ele, ela (objetos/ideias)',         example: 'It is raining.' },
  { rank: 11,  word: 'for',      type: 'word',  gloss: 'para; por; durante (preposição)',                          example: 'I\'ve been here for two hours.' },
  { rank: 12,  word: 'not',      type: 'word',  gloss: 'não (negação)',                                            example: 'I do not agree.' },
  { rank: 13,  word: 'on',       type: 'word',  gloss: 'sobre, em cima de; em (preposição)',                       example: 'Put it on the table.' },
  { rank: 14,  word: 'with',     type: 'word',  gloss: 'com (preposição de companhia/instrumento)',                example: 'She came with her friend.' },
  { rank: 15,  word: 'he',       type: 'word',  gloss: 'ele (pronome sujeito masculino)',                          example: 'He is my brother.' },
  { rank: 16,  word: 'as',       type: 'word',  gloss: 'como; enquanto; tão…quanto',                               example: 'As a teacher, she inspires many.' },
  { rank: 17,  word: 'you',      type: 'word',  gloss: 'você; vocês (pronome)',                                    example: 'You are doing great.' },
  { rank: 18,  word: 'do',       type: 'word',  gloss: 'fazer; auxiliar de negação/pergunta',                      example: 'Do you speak English?' },
  { rank: 19,  word: 'at',       type: 'word',  gloss: 'em, às (preposição de lugar/hora específica)',             example: 'I\'ll meet you at 5pm.' },
  { rank: 20,  word: 'this',     type: 'word',  gloss: 'este, esta, isso (demonstrativo próximo)',                 example: 'This is my favorite book.' },
  { rank: 21,  word: 'but',      type: 'word',  gloss: 'mas, porém (conjunção adversativa)',                       example: 'I tried, but I failed.' },
  { rank: 22,  word: 'his',      type: 'word',  gloss: 'dele, seu/sua (possessivo masculino)',                     example: 'That\'s his car.' },
  { rank: 23,  word: 'by',       type: 'word',  gloss: 'por; ao lado de; até (preposição)',                        example: 'The book was written by her.' },
  { rank: 24,  word: 'from',     type: 'word',  gloss: 'de; desde; a partir de (preposição de origem)',            example: 'She\'s from Japan.' },
  { rank: 25,  word: 'they',     type: 'word',  gloss: 'eles, elas (pronome plural)',                              example: 'They are coming tomorrow.' },
  { rank: 26,  word: 'we',       type: 'word',  gloss: 'nós (pronome)',                                            example: 'We should talk.' },
  { rank: 27,  word: 'say',      type: 'word',  gloss: 'dizer, falar',                                             example: 'What did you say?' },
  { rank: 28,  word: 'her',      type: 'word',  gloss: 'ela (objeto); dela (possessivo feminino)',                  example: 'I called her yesterday.' },
  { rank: 29,  word: 'she',      type: 'word',  gloss: 'ela (pronome sujeito feminino)',                            example: 'She knows the answer.' },
  { rank: 30,  word: 'or',       type: 'word',  gloss: 'ou (conjunção alternativa)',                               example: 'Coffee or tea?' },
  { rank: 31,  word: 'an',       type: 'word',  gloss: 'artigo indefinido antes de vogal — um, uma',              example: 'I have an idea.' },
  { rank: 32,  word: 'will',     type: 'word',  gloss: 'auxiliar de futuro; vontade',                              example: 'I will call you later.' },
  { rank: 33,  word: 'my',       type: 'word',  gloss: 'meu, minha (possessivo)',                                  example: 'My name is Ana.' },
  { rank: 34,  word: 'one',      type: 'word',  gloss: 'um (numeral); alguém (pronome genérico)',                  example: 'One must be careful.' },
  { rank: 35,  word: 'all',      type: 'word',  gloss: 'todo, todos, tudo',                                        example: 'All the students passed.' },
  { rank: 36,  word: 'would',    type: 'word',  gloss: 'auxiliar condicional/passado de will',                     example: 'I would love to come.' },
  { rank: 37,  word: 'there',    type: 'word',  gloss: 'lá; há/existe (there is/are)',                             example: 'There is a problem.' },
  { rank: 38,  word: 'their',    type: 'word',  gloss: 'deles, delas (possessivo plural)',                         example: 'Their house is big.' },
  { rank: 39,  word: 'what',     type: 'word',  gloss: 'o que; que (interrogativo/relativo)',                      example: 'What do you mean?' },
  { rank: 40,  word: 'so',       type: 'word',  gloss: 'então; tão; portanto',                                     example: 'So, what happened?' },
  { rank: 41,  word: 'up',       type: 'word',  gloss: 'para cima; completamente (partícula verbal)',              example: 'Pick it up.' },
  { rank: 42,  word: 'out',      type: 'word',  gloss: 'para fora; fora (partícula/adv)',                          example: 'Get out of here.' },
  { rank: 43,  word: 'if',       type: 'word',  gloss: 'se (conjunção condicional)',                               example: 'If you need help, call me.' },
  { rank: 44,  word: 'about',    type: 'word',  gloss: 'sobre; acerca de; mais ou menos',                          example: 'Tell me about yourself.' },
  { rank: 45,  word: 'who',      type: 'word',  gloss: 'quem (interrogativo/relativo)',                             example: 'Who are you?' },
  { rank: 46,  word: 'get',      type: 'word',  gloss: 'pegar; obter; ficar; entender',                            example: 'I get what you mean.' },
  { rank: 47,  word: 'which',    type: 'word',  gloss: 'qual; que; o qual (relativo)',                              example: 'Which one do you prefer?' },
  { rank: 48,  word: 'go',       type: 'word',  gloss: 'ir; funcionar; acontecer',                                 example: 'Let\'s go!' },
  { rank: 49,  word: 'me',       type: 'word',  gloss: 'me, mim (pronome objeto)',                                  example: 'Call me.' },
  { rank: 50,  word: 'when',     type: 'word',  gloss: 'quando (interrogativo/conjunção)',                          example: 'When does it start?' },
  { rank: 51,  word: 'make',     type: 'word',  gloss: 'fazer; produzir; causar',                                   example: 'Make it happen.' },
  { rank: 52,  word: 'can',      type: 'word',  gloss: 'poder; ser capaz de (verbo modal)',                         example: 'I can help you.' },
  { rank: 53,  word: 'like',     type: 'word',  gloss: 'gostar de; como (semelhante)',                              example: 'I like this song.' },
  { rank: 54,  word: 'time',     type: 'word',  gloss: 'tempo; hora; vez',                                         example: 'What time is it?' },
  { rank: 55,  word: 'no',       type: 'word',  gloss: 'não; nenhum(a)',                                           example: 'There is no time.' },
  { rank: 56,  word: 'just',     type: 'word',  gloss: 'apenas; exatamente; recentemente',                         example: 'I just arrived.' },
  { rank: 57,  word: 'him',      type: 'word',  gloss: 'ele (pronome objeto)',                                     example: 'Give it to him.' },
  { rank: 58,  word: 'know',     type: 'word',  gloss: 'saber; conhecer',                                          example: 'I know the answer.' },
  { rank: 59,  word: 'take',     type: 'word',  gloss: 'pegar; levar; tirar; tomar',                               example: 'Take a seat.' },
  { rank: 60,  word: 'people',   type: 'word',  gloss: 'pessoas; povo',                                            example: 'People are talking.' },
  { rank: 61,  word: 'into',     type: 'word',  gloss: 'para dentro de; em',                                       example: 'Go into the room.' },
  { rank: 62,  word: 'year',     type: 'word',  gloss: 'ano',                                                       example: 'Next year will be better.' },
  { rank: 63,  word: 'your',     type: 'word',  gloss: 'seu(sua); de você (possessivo)',                           example: 'Your phone is ringing.' },
  { rank: 64,  word: 'good',     type: 'word',  gloss: 'bom; bom (qualidade)',                                     example: 'That\'s a good idea.' },
  { rank: 65,  word: 'some',     type: 'word',  gloss: 'algum; alguns; um pouco de',                               example: 'I need some help.' },
  { rank: 66,  word: 'could',    type: 'word',  gloss: 'podia; conseguia (passado de can)',                        example: 'I could try.' },
  { rank: 67,  word: 'them',     type: 'word',  gloss: 'eles/elas (pronome objeto)',                                example: 'Tell them the truth.' },
  { rank: 68,  word: 'see',      type: 'word',  gloss: 'ver; entender; encontrar',                                 example: 'I see what you mean.' },
  { rank: 69,  word: 'other',    type: 'word',  gloss: 'outro; outra; outros',                                     example: 'The other one is better.' },
  { rank: 70,  word: 'than',     type: 'word',  gloss: 'do que (comparação)',                                       example: 'She is taller than me.' },
  { rank: 71,  word: 'then',     type: 'word',  gloss: 'então; depois; em seguida',                                example: 'First this, then that.' },
  { rank: 72,  word: 'now',      type: 'word',  gloss: 'agora; já',                                                example: 'Do it now.' },
  { rank: 73,  word: 'look',     type: 'word',  gloss: 'olhar; parecer',                                           example: 'Look at that!' },
  { rank: 74,  word: 'only',     type: 'word',  gloss: 'somente; apenas; único',                                    example: 'Only one left.' },
  { rank: 75,  word: 'come',     type: 'word',  gloss: 'vir; chegar',                                              example: 'Come here, please.' },
  { rank: 76,  word: 'its',      type: 'word',  gloss: 'dele/dela (neutro possessivo)',                             example: 'The dog wagged its tail.' },
  { rank: 77,  word: 'over',     type: 'word',  gloss: 'sobre; acima; por cima de',                                example: 'Jump over the fence.' },
  { rank: 78,  word: 'think',    type: 'word',  gloss: 'pensar; achar',                                            example: 'I think you are right.' },
  { rank: 79,  word: 'also',     type: 'word',  gloss: 'também; além disso',                                       example: 'I also like coffee.' },
  { rank: 80,  word: 'back',     type: 'word',  gloss: 'de volta; costas; atrás',                                  example: 'Come back soon.' },
  { rank: 81,  word: 'after',    type: 'word',  gloss: 'depois de; após',                                          example: 'After the rain, sun.' },
  { rank: 82,  word: 'use',      type: 'word',  gloss: 'usar; utilizar',                                           example: 'Use your imagination.' },
  { rank: 83,  word: 'two',      type: 'word',  gloss: 'dois (numeral)',                                           example: 'Two cups of tea.' },
  { rank: 84,  word: 'how',      type: 'word',  gloss: 'como (interrogativo de modo)',                             example: 'How are you?' },
  { rank: 85,  word: 'our',      type: 'word',  gloss: 'nosso; nossa (possessivo)',                                example: 'Our house is big.' },
  { rank: 86,  word: 'work',     type: 'word',  gloss: 'trabalhar; funcionar; trabalho',                           example: 'I work from home.' },
  { rank: 87,  word: 'first',    type: 'word',  gloss: 'primeiro; em primeiro lugar',                              example: 'First impressions matter.' },
  { rank: 88,  word: 'well',     type: 'word',  gloss: 'bem; bom (advérbio/adjetivo)',                             example: 'She sings well.' },
  { rank: 89,  word: 'way',      type: 'word',  gloss: 'caminho; jeito; maneira',                                  example: 'Find a way out.' },
  { rank: 90,  word: 'even',     type: 'word',  gloss: 'mesmo; até (advérbio de ênfase)',                          example: 'Even he knows that.' },
  { rank: 91,  word: 'new',      type: 'word',  gloss: 'novo; nova',                                               example: 'I need a new phone.' },
  { rank: 92,  word: 'want',     type: 'word',  gloss: 'querer; desejar',                                          example: 'I want to learn.' },
  { rank: 93,  word: 'because',  type: 'word',  gloss: 'porque (conjunção causal)',                                example: 'I stayed because it rained.' },
  { rank: 94,  word: 'any',      type: 'word',  gloss: 'qualquer; algum (em perguntas/negativas)',                 example: 'Any questions?' },
  { rank: 95,  word: 'these',    type: 'word',  gloss: 'estes; estas (plural de this)',                            example: 'These are mine.' },
  { rank: 96,  word: 'give',     type: 'word',  gloss: 'dar; fornecer',                                            example: 'Give me a chance.' },
  { rank: 97,  word: 'day',      type: 'word',  gloss: 'dia',                                                      example: 'Have a nice day.' },
  { rank: 98,  word: 'most',     type: 'word',  gloss: 'mais; a maioria de',                                       example: 'Most people agree.' },
  { rank: 99,  word: 'tell',     type: 'word',  gloss: 'dizer; contar (a alguém)',                                 example: 'Tell me a story.' },
  { rank: 100, word: 'too',      type: 'word',  gloss: 'também; demais; excessivamente',                           example: 'This is too much.' },
];

export const CONNECTED_SPEECH: ConnectedSpeechItem[] = [
  // ── BASIC ──────────────────────────────────────────────────────────────────

  // Linking — consoante final liga à vogal inicial da próxima palavra
  { phenomenon: 'linking', full: 'pick it up',    connected: 'pickitup',    phon: '/ˈpɪk.ɪ.dʌp/',    example: 'Can you pick it up?',         tip: 'O /k/ de "pick" liga ao /ɪ/ de "it" — sem pausa entre as palavras',  tier: 'basic' },
  { phenomenon: 'linking', full: 'turn it off',   connected: 'turnit off',  phon: '/ˈtɜː.nɪ.dɒf/',   example: 'Turn it off, please.',        tip: 'O /n/ de "turn" e o /ɪ/ de "it" se fundem em uma sílaba só',          tier: 'basic' },
  { phenomenon: 'linking', full: 'an apple',      connected: 'an napple',   phon: '/ə.ˈnæp.əl/',     example: 'I want an apple.',            tip: '"an" antes de vogal: o /n/ vira onset da sílaba seguinte',              tier: 'basic' },
  { phenomenon: 'linking', full: 'not at all',    connected: 'notatall',    phon: '/ˌnɒ.tə.ˈtɔːl/',  example: 'Not at all, no worries.',     tip: 'Três palavras viram um bloco fonético contínuo',                        tier: 'basic' },

  // Intrusion — som "fantasma" aparece entre vogais
  { phenomenon: 'intrusion', full: 'the idea of',  connected: 'the idear of', phon: '/ðə.aɪ.ˈdɪər.əv/', example: 'The idea of it scares me.',   tip: '/r/ intrusivo entre vogal e outra vogal (comum no inglês britânico)',  tier: 'basic' },
  { phenomenon: 'intrusion', full: 'go out',        connected: 'gow out',      phon: '/ˈɡəʊ.waʊt/',     example: "Let's go out tonight.",      tip: '/w/ aparece entre vogal arredondada /əʊ/ e outra vogal',               tier: 'basic' },
  { phenomenon: 'intrusion', full: 'I asked',       connected: 'I yasked',     phon: '/aɪ.ˈjɑːskt/',    example: 'I asked her directly.',       tip: '/j/ intrusivo conecta /aɪ/ à vogal de "asked"',                        tier: 'basic' },

  // Assimilation — um som muda por influência do vizinho
  { phenomenon: 'assimilation', full: 'did you',    connected: 'didja',       phon: '/ˈdɪ.dʒə/',       example: 'Did you see that?',           tip: '/d/ + /j/ → /dʒ/ (como em "jeans"). Acontece automaticamente na fala rápida',  tier: 'basic' },
  { phenomenon: 'assimilation', full: 'would you',  connected: 'wouldja',     phon: '/ˈwʊ.dʒə/',       example: 'Would you like some?',        tip: '/d/ + /j/ → /dʒ/ sempre que "you" segue uma palavra com /d/ final',    tier: 'basic' },
  { phenomenon: 'assimilation', full: 'meet you',   connected: 'meetcha',     phon: '/ˈmiː.tʃə/',      example: 'Nice to meet you!',           tip: '/t/ + /j/ → /tʃ/ (como em "cheese"). Clássico "nice to meetcha"',      tier: 'basic' },

  // Elision — som desaparece completamente
  { phenomenon: 'elision', full: 'next day',    connected: 'nex\u200Bday',  phon: '/ˈnɛks.deɪ/',      example: 'See you next day.',          tip: 'O /t/ some antes de consoante. "next" → /nɛks/',                       tier: 'basic' },
  { phenomenon: 'elision', full: 'last time',   connected: 'las\u200Btime', phon: '/ˈlæs.taɪm/',      example: 'Last time I was here...',    tip: 'O /t/ de "last" não é pronunciado antes de outro /t/',                 tier: 'basic' },
  { phenomenon: 'elision', full: 'mostly',      connected: 'mosly',         phon: '/ˈməʊs.li/',        example: "It's mostly fine.",          tip: 'O /t/ interno some em grupos consonantais /stl/',                      tier: 'basic' },
  { phenomenon: 'elision', full: 'facts',       connected: 'facs',          phon: '/fæks/',            example: 'Just the facts.',            tip: 'Em clusters como /kts/, o /t/ médio desaparece',                       tier: 'basic' },

  // ── INTERMEDIATE ────────────────────────────────────────────────────────────

  // Linking
  { phenomenon: 'linking', full: 'come on',      connected: 'comon',       phon: '/kəˈmɒn/',       example: 'Come on, let\'s go!',             tip: '"come" + "on" viram uma sílaba só: /kəˈmɒn/',                        tier: 'intermediate' },
  { phenomenon: 'linking', full: 'get on',       connected: 'geton',       phon: '/ˈɡe.tɒn/',      example: 'Get on the bus here.',            tip: 'O /t/ de "get" liga ao /ɒ/ de "on"',                                 tier: 'intermediate' },
  { phenomenon: 'linking', full: 'what is it',   connected: 'whatizit',    phon: '/ˈwɒ.tɪ.zɪt/',   example: 'What is it?',                     tip: 'Três palavras curtas viram um bloco — "what" + "is" + "it"',          tier: 'intermediate' },
  { phenomenon: 'linking', full: 'some of us',   connected: 'somofus',     phon: '/səˈmɒ.vəs/',    example: 'Some of us agree.',               tip: 'O /v/ de "of" liga ao /ə/ de "us"',                                  tier: 'intermediate' },

  // Intrusion
  { phenomenon: 'intrusion', full: 'law and order', connected: 'lawrandorder', phon: '/ˈlɔː.rənd.ˈɔː.də/', example: 'We need law and order.',    tip: '/r/ intrusivo entre "law" e "and" (RP britânico)',                   tier: 'intermediate' },
  { phenomenon: 'intrusion', full: 'saw it',        connected: 'sawrit',        phon: '/ˈsɔː.rɪt/',          example: 'I saw it yesterday.',           tip: '/r/ intrusivo entre "saw" e "it" — mesmo sem R na escrita',          tier: 'intermediate' },
  { phenomenon: 'intrusion', full: 'too easy',      connected: 'toow easy',     phon: '/ˈtuː.wiː.zi/',       example: 'This test is too easy.',        tip: '/w/ intrusivo entre "too" e "easy"',                                tier: 'intermediate' },

  // Assimilation
  { phenomenon: 'assimilation', full: 'what do you', connected: 'whaddaya',    phon: '/ˈwɒ.də.jə/',      example: 'What do you think?',            tip: 'Tripla redução: "what+do+you" fundidos em um único bloco',            tier: 'intermediate' },
  { phenomenon: 'assimilation', full: 'don\'t you',  connected: 'doncha',       phon: '/ˈdəʊn.tʃə/',     example: 'Don\'t you know?',              tip: '/t/ + /j/ → /tʃ/ — "don\'t you" vira "doncha"',                     tier: 'intermediate' },
  { phenomenon: 'assimilation', full: 'won\'t you',  connected: 'woncha',       phon: '/ˈwəʊn.tʃə/',     example: 'Won\'t you join us?',            tip: '/t/ + /j/ → /tʃ/ — mesmo padrão de "doncha"',                       tier: 'intermediate' },
  { phenomenon: 'assimilation', full: 'could you',   connected: 'couldja',      phon: '/ˈkʊ.dʒə/',       example: 'Could you help me?',             tip: '/d/ + /j/ → /dʒ/ — "could you" vira "couldja"',                     tier: 'intermediate' },

  // Elision
  { phenomenon: 'elision', full: 'soft drink',   connected: 'sof\u200Bdrink',  phon: '/ˈsɒf.drɪŋk/',   example: 'I want a soft drink.',           tip: 'O /t/ de "soft" desaparece antes de /d/',                            tier: 'intermediate' },
  { phenomenon: 'elision', full: 'old man',      connected: 'ol\u200Bman',     phon: '/ˈəʊl.mæn/',      example: 'The old man sat down.',           tip: 'O /d/ de "old" desaparece antes de /m/',                             tier: 'intermediate' },
  { phenomenon: 'elision', full: 'friends',      connected: 'frien\u200Bs',    phon: '/frenz/',          example: 'My friends are coming.',          tip: 'O /d/ em "friends" desaparece — o cluster /ndz/ reduz para /nz/',    tier: 'intermediate' },
  { phenomenon: 'elision', full: 'hands',        connected: 'han\u200Bs',      phon: '/hænz/',           example: 'Wash your hands.',                tip: 'O /d/ de "hands" desaparece antes do /z/ do plural',                 tier: 'intermediate' },

  // ── ADVANCED ──────────────────────────────────────────────────────────────

  // Linking
  { phenomenon: 'linking', full: 'kind of a',    connected: 'kindofa',     phon: '/ˈkaɪn.də.və/',   example: 'It\'s kind of a long story.',     tip: '"kind of a" vira "kindova" — /v/ de ligação entre "of" e "a"',       tier: 'advanced' },
  { phenomenon: 'linking', full: 'once upon a',  connected: 'oncepona',    phon: '/ˈwʌn.sə.pə.nə/', example: 'Once upon a time...',             tip: 'Linking múltiplo em 4 palavras consecutivas',                        tier: 'advanced' },
  { phenomenon: 'linking', full: 'in an hour',   connected: 'inanor',      phon: '/ɪ.nə.ˈnaʊ.ə/',   example: 'I\'ll be back in an hour.',        tip: 'Ligação dupla: "in" + "an" + "hour" — com /r/ intrusivo no final',  tier: 'advanced' },
  { phenomenon: 'linking', full: 'first of all',  connected: 'firstofall',  phon: '/ˈfɜː.stə.vɔːl/', example: 'First of all, thank you.',         tip: 'Quatro palavras fundidas em sequência contínua',                     tier: 'advanced' },

  // Intrusion
  { phenomenon: 'intrusion', full: 'media event',   connected: 'mediawevent',  phon: '/ˈmiː.di.jə.wɪ.vent/', example: 'The launch was a media event.',  tip: '/j/ + /w/ dupla intrusão entre vogais em sequência',                tier: 'advanced' },
  { phenomenon: 'intrusion', full: 'he asked',      connected: 'he yasked',     phon: '/hiː.ˈjɑːskt/',         example: 'He asked a question.',            tip: '/j/ intrusivo entre /iː/ e /ɑː/ — mesmo padrão de "I asked"',       tier: 'advanced' },
  { phenomenon: 'intrusion', full: 'you are',       connected: 'youware',       phon: '/juː.ˈwɑːr/',          example: 'You are welcome.',                tip: '/w/ intrusivo entre "you" e "are" na fala rápida',                  tier: 'advanced' },

  // Assimilation
  { phenomenon: 'assimilation', full: 'got you',      connected: 'gotcha',     phon: '/ˈɡɒ.tʃə/',      example: 'I got you a gift.',           tip: '/t/ + /j/ → /tʃ/ — "got you" vira "gotcha"',                       tier: 'advanced' },
  { phenomenon: 'assimilation', full: 'bet you',      connected: 'betcha',     phon: '/ˈbe.tʃə/',      example: 'Bet you can\'t do it.',        tip: '/t/ + /j/ → /tʃ/ — redução casual comum',                          tier: 'advanced' },
  { phenomenon: 'assimilation', full: 'didn\'t you',  connected: 'didncha',    phon: '/ˈdɪd.n.tʃə/',   example: 'Didn\'t you hear?',            tip: 'Tripla: "did" + "n\'t" + "you" → /ˈdɪd.n.tʃə/',                    tier: 'advanced' },
  { phenomenon: 'assimilation', full: 'ten pins',     connected: 'tem pins',   phon: '/tem.ˈpɪnz/',    example: 'Ten pins knocked over.',       tip: 'Assimilação nasal: /n/ antes de /p/ vira /m/ — "tem pins"',         tier: 'advanced' },

  // Elision
  { phenomenon: 'elision', full: 'last night',   connected: 'las\u200Bnight',  phon: '/ˈlæs.naɪt/',      example: 'Last night was great.',          tip: 'Dupla elisão: /t/ some em "last" e "night" — /læs.naɪt/',           tier: 'advanced' },
  { phenomenon: 'elision', full: 'text message', connected: 'tex\u200Bmessage', phon: '/ˈteks.me.sɪdʒ/',  example: 'Send me a text message.',         tip: 'O /t/ de "text" desaparece entre /ks/ e /m/',                       tier: 'advanced' },
  { phenomenon: 'elision', full: 'kept quiet',   connected: 'kep\u200Bquiet',  phon: '/ˈkep.kwaɪ.ət/',   example: 'He kept quiet about it.',          tip: 'O /t/ de "kept" desaparece antes de /k/',                           tier: 'advanced' },
  { phenomenon: 'elision', full: 'grandma',      connected: 'gramma',          phon: '/ˈɡræ.mə/',         example: 'My grandma lives nearby.',         tip: 'Elisão histórica: /d/ entre /n/ e /m/ some completamente',          tier: 'advanced' },
];

export const SCHWA_WORDS: SchwaWord[] = [
  // Basic
  { word:'banana', ipa:'/bəˈnænə/', schwas:[0,2], tier:'basic' },
  { word:'about', ipa:'/əˈbaʊt/', schwas:[0], tier:'basic' },
  { word:'problem', ipa:'/ˈprɒbləm/', schwas:[1], tier:'basic' },
  { word:'family', ipa:'/ˈfæməli/', schwas:[1], tier:'basic' },
  { word:'comfortable', ipa:'/ˈkʌmftəbəl/', schwas:[1,2], tier:'basic' },

  // Intermediate — function words with schwa
  { word:'for', ipa:'/fə/', schwas:[0], tier:'intermediate' },
  { word:'of', ipa:'/əv/', schwas:[0], tier:'intermediate' },
  { word:'to', ipa:'/tə/', schwas:[0], tier:'intermediate' },
  { word:'a', ipa:'/ə/', schwas:[0], tier:'intermediate' },
  { word:'the', ipa:'/ðə/', schwas:[0], tier:'intermediate' },
  { word:'some', ipa:'/səm/', schwas:[0], tier:'intermediate' },
  { word:'than', ipa:'/ðən/', schwas:[0], tier:'intermediate' },

  // Advanced — suffixes and polysyllabic words
  { word:'information', ipa:'/ˌɪn.fəˈmeɪ.ʃən/', schwas:[1,3], tier:'advanced' },
  { word:'pronunciation', ipa:'/prəˌnʌn.siˈeɪ.ʃən/', schwas:[0,4], tier:'advanced' },
  { word:'comfortable', ipa:'/ˈkʌm.fər.tə.bəl/', schwas:[1,2,3], tier:'advanced' },
  { word:'dictionary', ipa:'/ˈdɪk.ʃən.er.i/', schwas:[1], tier:'advanced' },
  { word:'extraordinary', ipa:'/ɪkˈstrɔːr.dɪ.ner.i/', schwas:[0], tier:'advanced' },
  { word:'responsibility', ipa:'/rɪˌspɒn.sɪˈbɪl.ɪ.ti/', schwas:[1,3], tier:'advanced' },
  { word:'vegetable', ipa:'/ˈvedʒ.tə.bəl/', schwas:[1,2], tier:'advanced' },
];

export const REDUCTIONS: Reduction[] = [
  // Basic
  { full:'want to', reduced:'wanna', phon:'/ˈwɒn.ə/', tier:'basic' },
  { full:'going to', reduced:'gonna', phon:'/ˈɡʌn.ə/', tier:'basic' },
  { full:'got to', reduced:'gotta', phon:'/ˈɡɒt.ə/', tier:'basic' },
  { full:'kind of', reduced:'kinda', phon:'/ˈkaɪn.də/', tier:'basic' },
  { full:'out of', reduced:'outta', phon:'/ˈaʊ.də/', tier:'basic' },
  { full:'let me', reduced:'lemme', phon:'/ˈlɛm.i/', tier:'basic' },

  // Intermediate
  { full:'sort of', reduced:'sorta', phon:'/ˈsɔːr.tə/', tier:'intermediate' },
  { full:'have to', reduced:'hafta', phon:'/ˈhæf.tə/', tier:'intermediate' },
  { full:'has to', reduced:'hasta', phon:'/ˈhæs.tə/', tier:'intermediate' },
  { full:'don\'t know', reduced:'dunno', phon:'/dəˈnəʊ/', tier:'intermediate' },
  { full:'I suppose', reduced:'s\'pose', phon:'/spəʊz/', tier:'intermediate' },
  { full:'what is', reduced:'what\'s', phon:'/wɒts/', tier:'intermediate' },
  { full:'give me', reduced:'gimme', phon:'/ˈɡɪm.i/', tier:'intermediate' },
  { full:'come on', reduced:'c\'mon', phon:'/kəˈmɒn/', tier:'intermediate' },

  // Advanced
  { full:'would you', reduced:'wouldja', phon:'/ˈwʊ.dʒə/', tier:'advanced' },
  { full:'could you', reduced:'couldja', phon:'/ˈkʊ.dʒə/', tier:'advanced' },
  { full:'don\'t you', reduced:'doncha', phon:'/ˈdəʊn.tʃə/', tier:'advanced' },
  { full:'what do you', reduced:'whaddaya', phon:'/ˈwɒ.də.jə/', tier:'advanced' },
  { full:'what do', reduced:'whaddya', phon:'/ˈwɒ.djə/', tier:'advanced' },
  { full:'what are you', reduced:'whatcha', phon:'/ˈwɒ.tʃə/', tier:'advanced' },
  { full:'should have', reduced:'shoulda', phon:'/ˈʃʊ.də/', tier:'advanced' },
  { full:'could have', reduced:'coulda', phon:'/ˈkʊ.də/', tier:'advanced' },
  { full:'would have', reduced:'woulda', phon:'/ˈwʊ.də/', tier:'advanced' },
  { full:'not yet', reduced:'notchett', phon:'/ˌnɒˈtʃet/', tier:'advanced' },
];

export type Profile = {
  name: string;
  level: string;
  cefrPct: number;
  streak: number;
  bestStreak: number;
  totalWords: number;
  matureWords: number;
  zipfCoverage: number;
  weeklyMinutes: number[];
  pillars: { name: string; pct: number; c: string }[];
};

export const PROFILE: Profile = {
  name: 'Diego',
  level: 'B1+',
  cefrPct: 64,
  streak: 23,
  bestStreak: 41,
  totalWords: 1247,
  matureWords: 892,
  zipfCoverage: 73,
  weeklyMinutes: [22, 35, 18, 42, 28, 51, 38],
  pillars: [
    { name:'Vocabulary', pct:78, c:'#2D5A3D' },
    { name:'Pronunciation', pct:54, c:'#3D7B8C' },
    { name:'Listening', pct:71, c:'#D4A24C' },
    { name:'Collocations', pct:48, c:'#E8704C' },
  ],
};

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'news-l1-01',
    title: 'A New School Opens in the City',
    level: 1,
    topic: 'Education',
    date: '2026-04-20',
    text: 'A new school opened in the city last week. The school has 500 students. The students are happy. The teachers are happy too. The school has new computers and a big library. Parents say it is a great place to learn.',
    vocabulary: [
      { term: 'opened', type: 'word', gloss: 'abriu (passado de open)', example: 'The new school opened last week.', source: 'News · Level 1' },
      { term: 'library', type: 'word', gloss: 'biblioteca', example: 'The school has a big library.', source: 'News · Level 1' },
      { term: 'parents', type: 'word', gloss: 'pais (pai e mãe)', example: 'Parents say it is a great place.', source: 'News · Level 1' },
      { term: 'great place to learn', type: 'phrase', gloss: 'ótimo lugar para aprender', example: 'It is a great place to learn.', source: 'News · Level 1' },
    ],
  },
  {
    id: 'news-l1-02',
    title: 'Scientists Find Water on Mars',
    level: 1,
    topic: 'Science',
    date: '2026-04-15',
    text: 'Scientists say they found water on Mars. The water is under the ground. It is very cold there. Mars is far from Earth. People cannot live on Mars now. But scientists want to learn more about it.',
    vocabulary: [
      { term: 'scientists', type: 'word', gloss: 'cientistas', example: 'Scientists found water on Mars.', source: 'News · Level 1' },
      { term: 'under the ground', type: 'phrase', gloss: 'embaixo da terra / subterrâneo', example: 'The water is under the ground.', source: 'News · Level 1' },
      { term: 'far from', type: 'collocation', gloss: 'longe de', example: 'Mars is far from Earth.', source: 'News · Level 1' },
      { term: 'learn more about', type: 'chunk', gloss: 'aprender mais sobre', example: 'Scientists want to learn more about it.', source: 'News · Level 1', function: 'clarifying' },
    ],
  },
  {
    id: 'news-l1-03',
    title: 'Dogs Help People Feel Better',
    level: 1,
    topic: 'Health',
    date: '2026-04-10',
    text: 'A new study says dogs help people feel better. When you are sad, a dog can make you happy. Doctors say people with dogs are healthier. Dogs are good for your heart. Many hospitals now have dogs for patients.',
    vocabulary: [
      { term: 'study', type: 'word', gloss: 'estudo (pesquisa científica)', example: 'A new study says dogs help people.', source: 'News · Level 1' },
      { term: 'feel better', type: 'phrase', gloss: 'sentir-se melhor', example: 'Dogs help people feel better.', source: 'News · Level 1' },
      { term: 'healthier', type: 'word', gloss: 'mais saudável (comparativo de healthy)', example: 'People with dogs are healthier.', source: 'News · Level 1' },
      { term: 'patients', type: 'word', gloss: 'pacientes (hospital)', example: 'Hospitals have dogs for patients.', source: 'News · Level 1' },
    ],
  },
  {
    id: 'news-l2-01',
    title: 'Teenagers Spend Too Much Time on Phones',
    level: 2,
    topic: 'Technology',
    date: '2026-04-18',
    text: 'A recent survey found that teenagers spend an average of seven hours a day on their smartphones. Experts are concerned about the impact on mental health and sleep quality. Some schools have introduced phone bans during lessons, which has led to improved concentration and better academic results.',
    vocabulary: [
      { term: 'survey', type: 'word', gloss: 'pesquisa/enquete (coleta de dados)', example: 'A recent survey found that teenagers...', source: 'News · Level 2' },
      { term: 'are concerned about', type: 'chunk', gloss: 'estão preocupados com', example: 'Experts are concerned about the impact.', source: 'News · Level 2', function: 'reacting' },
      { term: 'phone ban', type: 'collocation', gloss: 'proibição de celulares', example: 'Some schools introduced phone bans.', source: 'News · Level 2' },
      { term: 'led to', type: 'phrase', gloss: 'resultou em / levou a', example: 'The ban led to improved concentration.', source: 'News · Level 2' },
      { term: 'academic results', type: 'collocation', gloss: 'resultados acadêmicos / desempenho escolar', example: 'Students showed better academic results.', source: 'News · Level 2' },
    ],
  },
  {
    id: 'news-l2-02',
    title: 'Electric Cars Are Becoming More Popular',
    level: 2,
    topic: 'Technology',
    date: '2026-04-12',
    text: 'Sales of electric vehicles have increased by 35% this year, according to industry data. Many governments are offering tax incentives to encourage people to switch from petrol cars. However, critics point out that charging infrastructure is still insufficient in rural areas, making the transition challenging for many drivers.',
    vocabulary: [
      { term: 'tax incentives', type: 'collocation', gloss: 'incentivos fiscais / benefícios tributários', example: 'Governments offer tax incentives.', source: 'News · Level 2' },
      { term: 'charging infrastructure', type: 'collocation', gloss: 'infraestrutura de recarga (elétrica)', example: 'Charging infrastructure is insufficient.', source: 'News · Level 2' },
      { term: 'point out', type: 'phrase', gloss: 'apontar / ressaltar', example: 'Critics point out the challenges.', source: 'News · Level 2' },
      { term: 'rural areas', type: 'collocation', gloss: 'áreas rurais / interior', example: 'Infrastructure is lacking in rural areas.', source: 'News · Level 2' },
      { term: 'make the transition', type: 'chunk', gloss: 'fazer a transição', example: 'The transition is challenging for drivers.', source: 'News · Level 2', function: 'transitioning' },
    ],
  },
  {
    id: 'news-l2-03',
    title: 'Coffee Prices Hit Record High',
    level: 2,
    topic: 'World',
    date: '2026-04-08',
    text: 'Global coffee prices have reached their highest level in 50 years due to poor harvests in Brazil and Vietnam, which together account for over half of the world\'s supply. Retailers are warning consumers to expect higher prices at cafés and supermarkets. Some economists believe prices could remain elevated for at least two years.',
    vocabulary: [
      { term: 'hit a record high', type: 'phrase', gloss: 'atingir um recorde histórico', example: 'Coffee prices hit a record high.', source: 'News · Level 2' },
      { term: 'poor harvest', type: 'collocation', gloss: 'safra ruim / colheita fraca', example: 'Poor harvests caused price increases.', source: 'News · Level 2' },
      { term: 'account for', type: 'phrase', gloss: 'representar / corresponder a (porcentagem/parte)', example: 'They account for half of the supply.', source: 'News · Level 2' },
      { term: 'elevated', type: 'word', gloss: 'elevado / alto (formal)', example: 'Prices could remain elevated.', source: 'News · Level 2' },
      { term: 'at least', type: 'phrase', gloss: 'pelo menos / no mínimo', example: 'For at least two years.', source: 'News · Level 2' },
    ],
  },
  {
    id: 'news-l3-01',
    title: 'Artificial Intelligence Reshaping the Job Market',
    level: 3,
    topic: 'Technology',
    date: '2026-04-22',
    text: 'A landmark report by the World Economic Forum predicts that AI and automation will displace 85 million jobs globally by 2025, while simultaneously creating 97 million new roles. The disparity lies in skills: routine cognitive tasks are increasingly vulnerable to automation, whereas positions requiring emotional intelligence, creative problem-solving, and complex human interaction are proving more resilient. Critics argue the transition will disproportionately affect lower-income workers who lack access to retraining programmes.',
    vocabulary: [
      { term: 'landmark report', type: 'collocation', gloss: 'relatório histórico / estudo marcante', example: 'A landmark report predicts major changes.', source: 'News · Level 3' },
      { term: 'displace', type: 'word', gloss: 'deslocar / substituir (empregos)', example: 'AI will displace millions of jobs.', source: 'News · Level 3' },
      { term: 'simultaneously', type: 'word', gloss: 'simultaneamente / ao mesmo tempo', example: 'Jobs are lost and created simultaneously.', source: 'News · Level 3' },
      { term: 'vulnerable to', type: 'collocation', gloss: 'vulnerável a / suscetível a', example: 'Routine tasks are vulnerable to automation.', source: 'News · Level 3' },
      { term: 'disproportionately affect', type: 'collocation', gloss: 'afetar desproporcionalmente', example: 'Changes disproportionately affect low-income workers.', source: 'News · Level 3' },
      { term: 'retraining programmes', type: 'collocation', gloss: 'programas de requalificação profissional', example: 'Workers lack access to retraining programmes.', source: 'News · Level 3' },
    ],
  },
  {
    id: 'news-l3-02',
    title: 'Microplastics Found in Human Blood',
    level: 3,
    topic: 'Health',
    date: '2026-04-14',
    text: 'Researchers have detected microplastics in human blood for the first time, raising profound concerns about long-term health implications. The study, published in Environment International, analysed samples from 22 anonymous donors and found plastic particles in 77% of them. While the full ramifications remain unclear, preliminary evidence suggests microplastics may trigger inflammatory responses and accumulate in organs over time. Scientists are calling for urgent regulatory action to curb plastic pollution at its source.',
    vocabulary: [
      { term: 'profound concerns', type: 'collocation', gloss: 'preocupações profundas / sérias inquietações', example: 'The findings raise profound concerns.', source: 'News · Level 3' },
      { term: 'ramifications', type: 'word', gloss: 'ramificações / consequências (formal)', example: 'The full ramifications remain unclear.', source: 'News · Level 3' },
      { term: 'trigger', type: 'word', gloss: 'desencadear / disparar (um processo)', example: 'Microplastics may trigger inflammation.', source: 'News · Level 3' },
      { term: 'accumulate', type: 'word', gloss: 'acumular-se / se depositar ao longo do tempo', example: 'Plastics accumulate in organs.', source: 'News · Level 3' },
      { term: 'curb', type: 'word', gloss: 'conter / frear / limitar (formal)', example: 'Scientists call to curb plastic pollution.', source: 'News · Level 3' },
      { term: 'calling for', type: 'chunk', gloss: 'reivindicando / pedindo / exigindo (ação)', example: 'Scientists are calling for urgent action.', source: 'News · Level 3', function: 'emphasizing' },
    ],
  },
  {
    id: 'news-l3-03',
    title: 'Remote Work Permanently Reshaping Urban Planning',
    level: 3,
    topic: 'World',
    date: '2026-04-05',
    text: 'The sustained shift towards remote and hybrid work arrangements is fundamentally altering the dynamics of urban centres. Once-thriving business districts are grappling with persistently high office vacancy rates, prompting city authorities to explore adaptive reuse strategies — converting commercial spaces into residential units and mixed-use developments. Economists warn this structural transformation could erode municipal tax revenues, while urban planners see an opportunity to create more liveable, people-centred cities.',
    vocabulary: [
      { term: 'grappling with', type: 'chunk', gloss: 'lidando com / enfrentando (desafio persistente)', example: 'Districts are grappling with high vacancy.', source: 'News · Level 3', function: 'storytelling' },
      { term: 'adaptive reuse', type: 'collocation', gloss: 'reuso adaptativo (converter edifícios para novos usos)', example: 'Cities explore adaptive reuse strategies.', source: 'News · Level 3' },
      { term: 'erode', type: 'word', gloss: 'erodir / desgastar / reduzir gradualmente', example: 'Changes could erode tax revenues.', source: 'News · Level 3' },
      { term: 'municipal', type: 'word', gloss: 'municipal / da prefeitura', example: 'Municipal tax revenues could fall.', source: 'News · Level 3' },
      { term: 'people-centred', type: 'collocation', gloss: 'centrado nas pessoas / humanizado', example: 'Creating more people-centred cities.', source: 'News · Level 3' },
      { term: 'vacancy rate', type: 'collocation', gloss: 'taxa de vacância / ocupação vaga', example: 'High office vacancy rates persist.', source: 'News · Level 3' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // Real News (Level 4 — authentic, intermediate+)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    id: 'news-real-01',
    title: 'Global Temperatures Reach Record High as El Niño Intensifies',
    level: 4,
    topic: 'Climate',
    source: 'BBC News',
    date: '2026-04-28',
    text: 'Global average temperatures have reached their highest level since records began, driven by a combination of climate change and a strengthening El Niño pattern, according to data released by the World Meteorological Organization. Scientists warn that the coming months could bring unprecedented heatwaves to multiple continents, with southern Europe, Southeast Asia, and parts of South America expected to be particularly affected. "We are entering uncharted territory," said Dr. Elena Marchetti, the WMO\'s lead climate scientist. "The likelihood of exceeding 1.5°C of warming above pre-industrial levels for at least one calendar year is now greater than 60%." The findings have intensified calls for accelerated emissions reductions ahead of the upcoming COP summit in November.',
    vocabulary: [
      { term: 'intensify', type: 'word', gloss: 'intensificar-se / ficar mais forte', example: 'The El Niño pattern continues to intensify.', source: 'BBC News' },
      { term: 'unprecedented', type: 'word', gloss: 'sem precedentes / nunca visto antes', example: 'Unprecedented heatwaves are expected.', source: 'BBC News' },
      { term: 'uncharted territory', type: 'phrase', gloss: 'território desconhecido / situação nova', example: 'We are entering uncharted territory.', source: 'BBC News', function: 'storytelling' },
      { term: 'exceed', type: 'word', gloss: 'exceder / ultrapassar (um limite)', example: 'Temperatures may exceed 1.5°C.', source: 'BBC News' },
      { term: 'intensified calls for', type: 'chunk', gloss: 'reivindicações intensificadas por', example: 'The findings intensified calls for action.', source: 'BBC News', function: 'emphasizing' },
    ],
  },
  {
    id: 'news-real-02',
    title: 'NHS Launches AI-Powered Triage System Across London Hospitals',
    level: 4,
    topic: 'Technology',
    source: 'The Guardian',
    date: '2026-04-25',
    text: 'The National Health Service has deployed an artificial intelligence system across six London hospitals that can prioritise emergency department patients based on clinical urgency. The system, developed in collaboration with DeepMind and trained on over five million anonymised patient records, analyses symptoms entered by triage nurses and recommends a severity score within seconds. Early results from a twelve-month pilot at St Thomas\' Hospital showed a 23% reduction in waiting times for high-urgency patients. "This isn\'t about replacing doctors," said Dr. Sarah Chen, clinical lead for the project. "It\'s about giving them the information they need faster so they can make better decisions." Critics have raised concerns about algorithmic bias and data privacy, prompting the NHS to commission an independent ethics review.',
    vocabulary: [
      { term: 'triage', type: 'word', gloss: 'triagem / classificação de prioridade médica', example: 'The AI system performs triage automatically.', source: 'The Guardian' },
      { term: 'clinical urgency', type: 'collocation', gloss: 'urgência clínica / gravidade médica', example: 'Patients are scored by clinical urgency.', source: 'The Guardian' },
      { term: 'pilot', type: 'word', gloss: 'projeto-piloto / teste inicial', example: 'A twelve-month pilot was conducted.', source: 'The Guardian' },
      { term: 'algorithmic bias', type: 'collocation', gloss: 'viés algorítmico / preconceito em IA', example: 'Critics raised concerns about algorithmic bias.', source: 'The Guardian' },
      { term: 'ethics review', type: 'collocation', gloss: 'revisão ética / auditoria de conduta moral', example: 'An independent ethics review was commissioned.', source: 'The Guardian' },
    ],
  },
  {
    id: 'news-real-03',
    title: 'OPEC+ Shock Production Cut Sends Oil Prices Surging',
    level: 4,
    topic: 'Economy',
    source: 'Reuters',
    date: '2026-04-22',
    text: 'Oil prices surged more than 8% on Monday after OPEC+ unexpectedly announced a collective production cut of 1.5 million barrels per day, the largest reduction in over two years. Brent crude climbed above $92 per barrel, its highest level since October, before settling at $89.70. The decision caught markets off guard and has reignited concerns about global inflationary pressures. Analysts at Goldman Sachs revised their year-end forecast upward, warning that sustained higher energy costs could delay central bank rate cuts. "This is a calculated move to maximise revenue," said energy analyst Maria Torres. "But it comes at a time when the global economy can least afford supply constraints." The White House said it was "closely monitoring" the situation and would consider all options to protect American consumers.',
    vocabulary: [
      { term: 'surge', type: 'word', gloss: 'disparar / aumentar subitamente e com força', example: 'Oil prices surged more than 8%.', source: 'Reuters' },
      { term: 'caught off guard', type: 'phrase', gloss: 'pegar desprevenido / surpreender', example: 'The decision caught markets off guard.', source: 'Reuters', function: 'reacting' },
      { term: 'reignite concerns', type: 'collocation', gloss: 'reacender preocupações', example: 'The cuts reignited concerns about inflation.', source: 'Reuters' },
      { term: 'constraint', type: 'word', gloss: 'restrição / limitação', example: 'Supply constraints hurt the economy.', source: 'Reuters' },
      { term: 'closely monitoring', type: 'chunk', gloss: 'monitorando de perto', example: 'The White House is closely monitoring the situation.', source: 'Reuters' },
    ],
  },
  {
    id: 'news-real-04',
    title: 'NASA\'s Europa Clipper Begins Journey to Search for Life on Icy Moon',
    level: 4,
    topic: 'Science',
    source: 'NPR',
    date: '2026-04-18',
    text: 'NASA\'s Europa Clipper spacecraft successfully launched from Kennedy Space Center on Thursday, beginning a six-year journey to Jupiter\'s moon Europa — one of the most promising candidates for harbouring extraterrestrial life in our solar system. The $5.2 billion mission will conduct nearly 50 close flybys of Europa, which is believed to contain a vast liquid water ocean beneath its icy crust, potentially holding twice the volume of water found in all of Earth\'s oceans combined. "Europa represents our best chance of finding a second example of life in the universe within our lifetime," said Dr. Linda Spilker, the mission\'s project scientist. The spacecraft carries nine scientific instruments including ice-penetrating radar, a thermal emission spectrometer, and a magnetometer to map the moon\'s internal structure.',
    vocabulary: [
      { term: 'harbour', type: 'word', gloss: 'abrigar / conter em seu interior (figurativo)', example: 'Europa may harbour extraterrestrial life.', source: 'NPR' },
      { term: 'extraterrestrial', type: 'word', gloss: 'extraterrestre / de fora da Terra', example: 'The search for extraterrestrial life.', source: 'NPR' },
      { term: 'flyby', type: 'word', gloss: 'sobrevoo rasante de aproximação', example: 'The probe will conduct 50 flybys.', source: 'NPR' },
      { term: 'crust', type: 'word', gloss: 'crosta / camada externa sólida', example: 'An icy crust covers the ocean.', source: 'NPR' },
      { term: 'promising candidate', type: 'collocation', gloss: 'candidato promissor / opção com grande potencial', example: 'Europa is the most promising candidate.', source: 'NPR' },
    ],
  },
  {
    id: 'news-real-05',
    title: 'Portugal Generates 95% of Electricity from Renewables in Record Quarter',
    level: 4,
    topic: 'Energy',
    source: 'BBC News',
    date: '2026-04-14',
    text: 'Portugal has set a new clean energy milestone, generating 95% of its electricity from renewable sources in the first quarter of 2026, according to data from REN, the country\'s grid operator. The achievement was driven by a combination of hydroelectric, wind, and solar power, with record rainfall in the winter months replenishing dam reservoirs that had reached critically low levels during the previous year\'s drought. "Portugal has demonstrated that a rapid transition to renewable energy is not only possible but economically viable," said Energy Minister Maria da Graça Carvalho. The country aims to reach 100% renewable electricity generation by 2030, a target that analysts now consider achievable ahead of schedule. Several other European nations, including Denmark and Austria, are on track to reach similar milestones within the next two years.',
    vocabulary: [
      { term: 'milestone', type: 'word', gloss: 'marco / conquista importante', example: 'A new clean energy milestone was set.', source: 'BBC News' },
      { term: 'grid operator', type: 'collocation', gloss: 'operador da rede elétrica', example: 'Data from the grid operator confirmed it.', source: 'BBC News' },
      { term: 'replenish', type: 'word', gloss: 'reabastecer / encher novamente', example: 'Rain replenished the dam reservoirs.', source: 'BBC News' },
      { term: 'economically viable', type: 'collocation', gloss: 'economicamente viável', example: 'Renewables are economically viable.', source: 'BBC News' },
      { term: 'ahead of schedule', type: 'phrase', gloss: 'antes do previsto / adiantado', example: 'The target may be reached ahead of schedule.', source: 'BBC News' },
    ],
  },
  {
    id: 'news-real-06',
    title: 'Gene Therapy Breakthrough Offers Hope for Sickle Cell Patients Worldwide',
    level: 4,
    topic: 'Health',
    source: 'The Guardian',
    date: '2026-04-10',
    text: 'A landmark gene therapy treatment for sickle cell disease has shown a 97% success rate in a global clinical trial involving 145 patients across nine countries, researchers announced at the International Haematology Congress in Vienna. The therapy, which uses CRISPR-Cas9 technology to modify patients\' own blood stem cells, effectively eliminated painful vaso-occlusive crises — the hallmark symptom of the disease — in all but four participants over a two-year follow-up period. "This is not just a treatment; it is a functional cure for a disease that affects millions worldwide," said Dr. Adebayo Ogunlesi, the trial\'s lead investigator. The World Health Organization estimates that sickle cell disease affects approximately 20 million people globally, with the highest prevalence in sub-Saharan Africa, where access to advanced treatments has historically been extremely limited.',
    vocabulary: [
      { term: 'breakthrough', type: 'word', gloss: 'avanço revolucionário / descoberta transformadora', example: 'A landmark breakthrough in gene therapy.', source: 'The Guardian' },
      { term: 'trial', type: 'word', gloss: 'ensaio / teste clínico', example: 'A global clinical trial showed 97% success.', source: 'The Guardian' },
      { term: 'functional cure', type: 'collocation', gloss: 'cura funcional (elimina sintomas mas não a causa)', example: 'It represents a functional cure.', source: 'The Guardian' },
      { term: 'prevalence', type: 'word', gloss: 'prevalência / taxa de ocorrência', example: 'Highest prevalence in sub-Saharan Africa.', source: 'The Guardian' },
      { term: 'hallmark symptom', type: 'collocation', gloss: 'sintoma característico / marca registrada', example: 'Painful crises are the hallmark symptom.', source: 'The Guardian' },
    ],
  },
  {
    id: 'news-real-07',
    title: 'Japan Introduces Four-Day Work Week for Public Sector Employees',
    level: 4,
    topic: 'World',
    source: 'Reuters',
    date: '2026-04-06',
    text: 'Japan\'s government has announced that approximately 600,000 public sector employees across Tokyo and Osaka will transition to a four-day work week starting in September, in the country\'s most ambitious work reform initiative in decades. The policy, which maintains full salaries despite the reduced hours, aims to address Japan\'s chronic overwork culture — a phenomenon so entrenched it has its own term, "karoshi," meaning death from overwork. "Productivity is not measured by hours spent at a desk but by outcomes delivered," said Chief Cabinet Secretary Yoshimasa Hayashi. Early adopters of similar policies in the private sector have reported a 34% increase in employee satisfaction and a 12% improvement in productivity. Critics caution that the policy may not be feasible in all industries, particularly in healthcare and education, where staffing shortages remain acute.',
    vocabulary: [
      { term: 'transition to', type: 'chunk', gloss: 'fazer a transição para / mudar para', example: 'Employees will transition to a four-day week.', source: 'Reuters', function: 'transitioning' },
      { term: 'chronic', type: 'word', gloss: 'crônico / persistente e problemático', example: 'Japan\'s chronic overwork culture.', source: 'Reuters' },
      { term: 'entrenched', type: 'word', gloss: 'enraizado / profundamente estabelecido', example: 'A deeply entrenched cultural problem.', source: 'Reuters' },
      { term: 'feasible', type: 'word', gloss: 'viável / factível / possível de implementar', example: 'The policy may not be feasible everywhere.', source: 'Reuters' },
      { term: 'acute', type: 'word', gloss: 'agudo / grave / intenso (problema)', example: 'Staffing shortages remain acute.', source: 'Reuters' },
    ],
  },
  {
    id: 'news-real-08',
    title: 'Deep Sea Mining Debate Intensifies as New Deposits Discovered in Pacific',
    level: 4,
    topic: 'Environment',
    source: 'The Guardian',
    date: '2026-04-02',
    text: 'The discovery of vast polymetallic nodule fields in the Clarion-Clipperton Zone of the Pacific Ocean has reignited the contentious debate over deep sea mining, with mining companies arguing the deposits are essential for the green energy transition while environmental groups warn of potentially irreversible damage to marine ecosystems. The newly mapped deposits contain significant concentrations of manganese, cobalt, nickel, and copper — all critical components in electric vehicle batteries and renewable energy infrastructure. "We face a fundamental choice: destroy one ecosystem to supposedly save another," argued Dr. Helen Mbeki, a marine biologist at the University of Cape Town. The International Seabed Authority is under increasing pressure to finalise mining regulations, with several countries calling for a moratorium until comprehensive environmental impact assessments are conducted.',
    vocabulary: [
      { term: 'contentious', type: 'word', gloss: 'controverso / que gera discórdia', example: 'A contentious debate over mining.', source: 'The Guardian' },
      { term: 'irreversible', type: 'word', gloss: 'irreversível / que não pode ser desfeito', example: 'Potentially irreversible damage to ecosystems.', source: 'The Guardian' },
      { term: 'moratorium', type: 'word', gloss: 'moratória / suspensão temporária', example: 'Countries called for a moratorium.', source: 'The Guardian' },
      { term: 'environmental impact assessment', type: 'collocation', gloss: 'avaliação de impacto ambiental', example: 'Comprehensive assessments must be conducted.', source: 'The Guardian' },
      { term: 'critical components', type: 'collocation', gloss: 'componentes críticos / essenciais', example: 'Critical components for EV batteries.', source: 'The Guardian' },
    ],
  },
];

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // ── LEVEL 1 (A1/A2) ──────────────────────────────────────────────────────────
  {
    id: 'g1-1',
    level: 'A1',
    lessonNumber: 1,
    minWords: 500,
    title: 'To be',
    description: 'O pilar do inglês. Aprenda a usar am, is, are para identidade e estado.',
    url: 'https://www.grammarinlevels.com/level1/lesson-1/',
    difficultyTags: ['essential', 'verbs'],
    content: {
      title: 'To Be (Am, Is, Are)',
      body: 'O verbo "to be" significa ser ou estar. É a base da gramática inglesa.\n\nFormas:\nI am / I\'m\nYou are / You\'re\nHe/She/It is / He\'s\nWe/They are / They\'re',
      examples: ['I am a teacher.', 'She is tired.', 'They are my friends.', 'It is sunny today.', 'Are you ready?']
    }
  },
  { 
    id: 'g1-2',  
    level: 'A1', 
    lessonNumber: 2,  
    minWords: 500, 
    title: 'Present simple', 
    description: 'Fale sobre sua rotina e fatos gerais usando o presente.', 
    url: 'https://www.grammarinlevels.com/level1/lesson-2/', 
    difficultyTags: ['routine', 'tenses'],
    content: {
      title: 'Present Simple',
      body: 'Usado para fatos, hábitos e coisas que são geralmente verdadeiras.',
      examples: ['I work every day.', 'He plays football on Saturdays.', 'We don\'t like winter.', 'Does she speak English?', 'The sun rises in the east.']
    }
  },
  { 
    id: 'g1-3',  
    level: 'A1', 
    lessonNumber: 3,  
    minWords: 500, 
    title: 'Can', 
    description: 'Expresse habilidades e permissões de forma simples.', 
    url: 'https://www.grammarinlevels.com/level1/lesson-3/', 
    difficultyTags: ['ability', 'modal'],
    content: {
      title: 'Can',
      body: 'Usado para expressar habilidade ou possibilidade.',
      examples: ['I can swim very well.', 'She can\'t come to the party.', 'Can you help me?', 'Birds can fly.', 'He can speak three languages.']
    }
  },
  { 
    id: 'g1-4',  
    level: 'A1', 
    lessonNumber: 4,  
    minWords: 500, 
    title: 'Plural', 
    description: 'Como transformar palavras no plural e as exceções comuns.', 
    url: 'https://www.grammarinlevels.com/level1/lesson-4/', 
    difficultyTags: ['nouns', 'basics'],
    content: {
      title: 'Plural',
      body: 'Usado quando há mais de um objeto.',
      examples: ['I have two cats.', 'There are many boxes in the room.', 'The children are playing.', 'We visited three cities.', 'Those men are doctors.']
    }
  },
  { 
    id: 'g1-5',  
    level: 'A1', 
    lessonNumber: 5,  
    minWords: 500, 
    title: 'A, the', 
    description: 'Domine o uso de artigos definidos e indefinidos.', 
    url: 'https://www.grammarinlevels.com/level1/lesson-5/', 
    difficultyTags: ['articles', 'grammar'],
    content: {
      title: 'A, The',
      body: 'Artigos usados antes de substantivos para indicar se são gerais ou específicos.',
      examples: ['I saw a movie yesterday.', 'The movie was very long.', 'She is eating an apple.', 'The sun is hot.', 'Open the door, please.']
    }
  },
{
    id: 'g1-6', level: 'A1', lessonNumber: 6, minWords: 500,
    title: 'To go', description: 'O verbo de movimento mais importante e suas preposições.', url: 'https://www.grammarinlevels.com/level1/lesson-6/', difficultyTags: ['movement', 'verbs'],
    content: { title: 'To Go', body: 'O verbo GO é usado para movimento. Tem muitos usos e expressões.\n\nFormas:\nI go / You go / She goes (3ª pessoa: +s)\nPassado: went\n\nExpressões comuns:\n• go to + lugar: go to school, go to work, go to the gym\n• go + gerúndio: go swimming, go shopping, go running\n• go home / go abroad / go out', examples: ["I go to school by bus.", "She goes to the gym every morning.", "Let's go to the park!", "We go shopping on Saturdays.", "He went home early yesterday."] }
  },
  {
    id: 'g1-7', level: 'A1', lessonNumber: 7, minWords: 500,
    title: 'Present continuous', description: 'Descreva ações que estão acontecendo agora.', url: 'https://www.grammarinlevels.com/level1/lesson-7/', difficultyTags: ['ongoing', 'tenses'],
    content: { title: 'Present Continuous', body: 'O Present Continuous descreve ações que estão acontecendo AGORA.\n\nEstrutura: sujeito + am/is/are + verbo-ING\n\nI am → I\'m\nYou/We/They are → You\'re / We\'re\nHe/She/It is → He\'s / She\'s\n\nQuando usar:\n• Ação em andamento agora: "She is reading."\n• Plano futuro já marcado: "We are meeting at 6pm."\n\nNão use com verbos de estado: know, like, love, want, have (posse)', examples: ["I am studying English right now.", "She is cooking dinner.", "They are playing football outside.", "Look! It is raining!", "We are not watching TV — we are working."] }
  },
  {
    id: 'g1-8', level: 'A1', lessonNumber: 8, minWords: 500,
    title: 'Me (object pronouns)', description: 'Aprenda a usar pronomes objeto para quem recebe a ação.', url: 'https://www.grammarinlevels.com/level1/lesson-8/', difficultyTags: ['pronouns', 'syntax'],
    content: { title: 'Object Pronouns', body: 'Os PRONOMES OBJETO recebem a ação do verbo. Aparecem depois do verbo ou preposição.\n\nSujeito → Objeto:\nI → me\nYou → you\nHe → him\nShe → her\nIt → it\nWe → us\nThey → them\n\nExemplo:\n"She called me." (me = objeto)\n"I love her." (her = objeto)', examples: ["Can you help me?", "She loves him very much.", "Tell her the news.", "We called them yesterday.", "Give it to us, please."] }
  },
  {
    id: 'g1-9', level: 'A1', lessonNumber: 9, minWords: 500,
    title: 'Go + activity', description: 'Expressões comuns e atividades com o verbo Go.', url: 'https://www.grammarinlevels.com/level1/lesson-9/', difficultyTags: ['directions', 'verbs'],
    content: { title: 'Go + Activity (Gerund)', body: 'O verbo GO com atividades de lazer usa o gerúndio: GO + VERBO-ING\n\nAtividades comuns:\n• go swimming — ir nadar\n• go shopping — fazer compras\n• go running — correr\n• go fishing — pescar\n• go dancing — dançar\n• go hiking — caminhar na natureza\n• go camping — acampar\n\nUsado especialmente para esportes e atividades de lazer ao ar livre.', examples: ["I go swimming on weekends.", "Let's go shopping tomorrow.", "She goes jogging every morning.", "They went skiing last winter.", "Do you want to go dancing tonight?"] }
  },
  {
    id: 'g1-10', level: 'A1', lessonNumber: 10, minWords: 500,
    title: 'Must', description: 'Como expressar obrigações e necessidades fortes.', url: 'https://www.grammarinlevels.com/level1/lesson-10/', difficultyTags: ['obligation', 'modal'],
    content: { title: "Must / Mustn't", body: 'MUST expressa obrigação forte — vem do próprio falante.\n\nForma: must + verbo base (sem TO)\n\nMUST → obrigação: "You must wear a seatbelt."\nMUST NOT (mustn\'t) → proibição: "You mustn\'t smoke here."\n\nDiferença importante:\n• MUST: obrigação pessoal/interna\n• HAVE TO: obrigação externa (regra, lei)\n• MUSTN\'T: proibição\n• DON\'T HAVE TO: não é necessário (mas é permitido)', examples: ["You must wear a seatbelt.", "I must call my mother today.", "You mustn't smoke in here.", "Students must be on time.", "We must finish the report by Friday."] }
  },
  {
    id: 'g1-11', level: 'A2', lessonNumber: 11, minWords: 500,
    title: 'Faster (comparatives)', description: 'Compare coisas e pessoas usando adjetivos curtos.', url: 'https://www.grammarinlevels.com/level1/lesson-11/', difficultyTags: ['comparatives', 'adjectives'],
    content: { title: 'Comparative Adjectives', body: 'Os COMPARATIVOS comparam duas coisas.\n\nAdjetivos curtos (1-2 sílabas): + ER ... than\n• fast → faster\n• big → bigger (dobra a consoante)\n• nice → nicer (tira o -e)\n• happy → happier (troca -y por -ier)\n\nAdjetivos longos (3+ sílabas): more ... than\n• expensive → more expensive\n• beautiful → more beautiful\n\nExceções irregulares:\n• good → better\n• bad → worse\n• far → further', examples: ["She is taller than her brother.", "This car is faster than mine.", "My phone is more expensive than yours.", "Is math harder than English?", "His new house is much bigger than the old one."] }
  },
  {
    id: 'g1-12', level: 'A2', lessonNumber: 12, minWords: 500,
    title: 'There is / There are', description: 'Indique a existência de algo no singular ou plural.', url: 'https://www.grammarinlevels.com/level1/lesson-12/', difficultyTags: ['existence', 'syntax'],
    content: { title: 'There Is / There Are', body: 'THERE IS / THERE ARE indicam existência ou localização de algo.\n\nThere IS + singular\nThere ARE + plural\nThere ISN\'T + singular (negativa)\nThere AREN\'T + plural (negativa)\nIS THERE? / ARE THERE? (pergunta)\n\nUsado para:\n• Dizer que algo existe: "There is a bank nearby."\n• Descrever um lugar: "There are five rooms in the house."\n\nDica: O verbo concorda com o substantivo após "there".', examples: ["There is a supermarket near here.", "There are twenty students in the class.", "Is there a hospital in this town?", "There isn't any milk in the fridge.", "Are there any good restaurants nearby?"] }
  },
  {
    id: 'g1-13', level: 'A2', lessonNumber: 13, minWords: 500,
    title: 'Fastest (superlatives)', description: 'Destaque o melhor ou maior em um grupo com superlativos.', url: 'https://www.grammarinlevels.com/level1/lesson-13/', difficultyTags: ['superlatives', 'adjectives'],
    content: { title: 'Superlative Adjectives', body: 'Os SUPERLATIVOS indicam o extremo dentro de um grupo.\n\nAdjetivos curtos: the + adjetivo + EST\n• fast → the fastest\n• tall → the tallest\n• big → the biggest\n• happy → the happiest\n\nAdjetivos longos: the most + adjetivo\n• expensive → the most expensive\n• interesting → the most interesting\n\nExceções irregulares:\n• good → the best\n• bad → the worst\n• far → the furthest\n\nSempre use THE antes do superlativo!', examples: ["She is the tallest student in the class.", "This is the most beautiful city I have seen.", "He is the best player on the team.", "July is the hottest month here.", "What is the most expensive car in the world?"] }
  },
  {
    id: 'g1-14', level: 'A2', lessonNumber: 14, minWords: 500,
    title: 'Negative sentences', description: 'Como dizer "não" corretamente em diferentes tempos.', url: 'https://www.grammarinlevels.com/level1/lesson-14/', difficultyTags: ['negation', 'syntax'],
    content: { title: 'Negative Sentences', body: 'Para fazer frases NEGATIVAS, usamos auxiliares + NOT.\n\nPresente simples:\n• I/You/We/They → DON\'T (do not)\n• He/She/It → DOESN\'T (does not)\n\nPassado simples:\n• Todos → DIDN\'T (did not)\n\nCom modais:\n• can → can\'t / cannot\n• must → mustn\'t\n• will → won\'t\n• should → shouldn\'t\n\nDica: Depois do auxiliar negativo, o verbo volta para a forma BASE (sem -s, sem -ed).', examples: ["I don't like coffee.", "She doesn't work on Sundays.", "We didn't go to the party.", "He can't swim.", "They won't be there tomorrow."] }
  },
  {
    id: 'g1-15', level: 'A2', lessonNumber: 15, minWords: 500,
    title: 'Nobody / Nothing', description: 'Uso de pronomes negativos como Nobody, Nothing e Nowhere.', url: 'https://www.grammarinlevels.com/level1/lesson-15/', difficultyTags: ['pronouns', 'negation'],
    content: { title: 'Negative Pronouns', body: 'Os PRONOMES NEGATIVOS em inglês já têm sentido negativo — não use NOT com eles.\n\nNOBODY / NO ONE = ninguém\nNOTHING = nada\nNOWHERE = em nenhum lugar\nNEVER = nunca\n\nERRO COMUM — Double negative:\n✗ I don\'t know nobody.\n✓ I know nobody.\n✓ I don\'t know anybody.\n\nCom NOT, use: anybody, anything, anywhere, ever', examples: ["Nobody came to the party.", "I have nothing to say.", "She goes nowhere without her phone.", "There is nothing in the fridge.", "Nobody knows the answer to that question."] }
  },
  {
    id: 'g1-16', level: 'A2', lessonNumber: 16, minWords: 500,
    title: 'Questions', description: 'Domine a inversão e auxiliares para fazer perguntas.', url: 'https://www.grammarinlevels.com/level1/lesson-16/', difficultyTags: ['questions', 'syntax'],
    content: { title: 'Asking Questions', body: 'Para fazer PERGUNTAS em inglês, usamos inversão com auxiliar.\n\nPresente simples:\nDo/Does + sujeito + verbo?\n• "Do you speak English?"\n• "Does she live here?"\n\nPassado: Did + sujeito + verbo?\n• "Did you see that?"\n\nCom verbo TO BE: inverte diretamente\n• "Are you ready?"\n\nPerguntas com WH:\nWhat / Who / Where / When / Why / How\n→ WH-word + auxiliar + sujeito + verbo?', examples: ["Do you speak English?", "Where does she work?", "What time does the film start?", "Did you enjoy the party?", "Why are you late today?"] }
  },
  {
    id: 'g1-17', level: 'A2', lessonNumber: 17, minWords: 500,
    title: 'Many / Much', description: 'Contáveis vs Incontáveis: saiba qual usar para quantidade.', url: 'https://www.grammarinlevels.com/level1/lesson-17/', difficultyTags: ['quantifiers', 'nouns'],
    content: { title: 'Many vs Much', body: 'MANY e MUCH indicam grande quantidade.\n\nMANY + substantivos CONTÁVEIS (têm plural):\n• many books, many people, many cars, many ideas\n\nMUCH + substantivos INCONTÁVEIS (sem plural):\n• much water, much time, much money, much information\n\nDica: Em frases afirmativas, prefira "a lot of" (funciona com ambos):\n✓ "I have a lot of money."\n✓ "I have a lot of books."\n\nA LOT OF: informal, afirmativas\nMANY / MUCH: perguntas, negativos, formal', examples: ["How many students are in the class?", "I don't have much time left.", "There aren't many good options.", "She drinks too much coffee.", "How many languages do you speak?"] }
  },
  {
    id: 'g1-18', level: 'A2', lessonNumber: 18, minWords: 500,
    title: "Somebody's (possessive)", description: 'O apóstrofo possessivo e posse em pronomes.', url: 'https://www.grammarinlevels.com/level1/lesson-18/', difficultyTags: ['possession', 'grammar'],
    content: { title: "Possessive 's", body: 'Em inglês, mostramos POSSE com apóstrofo + S.\n\nSingular: nome + \'s\n• Maria\'s book = o livro da Maria\n• John\'s car = o carro do John\n\nPlural regular (termina em -s): só apóstrofo\n• the students\' books = os livros dos estudantes\n\nPlural irregular (não termina em -s): + \'s\n• the children\'s room\n• the men\'s team\n\nATENÇÃO:\n• Its (sem apóstrofo) = possessivo neutro\n• It\'s (com apóstrofo) = it is', examples: ["That is Maria's bag.", "My brother's car is red.", "The teacher's desk is at the front.", "This is the women's bathroom.", "I love my dog's friendly eyes."] }
  },
  {
    id: 'g1-19', level: 'A2', lessonNumber: 19, minWords: 500,
    title: "Contractions (I'm)", description: 'Como soar natural usando contrações na fala.', url: 'https://www.grammarinlevels.com/level1/lesson-19/', difficultyTags: ['speaking', 'fluency'],
    content: { title: 'Contractions', body: 'As CONTRAÇÕES são formas reduzidas usadas na fala informal. Tornam o inglês mais natural.\n\nVerbo TO BE:\nI am → I\'m | You are → You\'re | He is → He\'s\nShe is → She\'s | We are → We\'re | They are → They\'re\n\nNEGATIVAS:\nis not → isn\'t | are not → aren\'t\ndo not → don\'t | does not → doesn\'t\ndid not → didn\'t | cannot → can\'t\nwill not → won\'t | would not → wouldn\'t\nhave not → haven\'t | has not → hasn\'t', examples: ["I'm from Brazil.", "She's a doctor.", "We're going to the cinema.", "He isn't here right now.", "They don't speak Spanish."] }
  },
  {
    id: 'g1-20', level: 'A2', lessonNumber: 20, minWords: 500,
    title: 'In, on, at (place & time)', description: 'O guia definitivo para preposições de tempo e lugar.', url: 'https://www.grammarinlevels.com/level1/lesson-20/', difficultyTags: ['prepositions', 'basics'],
    content: { title: 'In, On, At — Place & Time', body: 'AT: ponto específico\n• Lugar: at the bus stop, at school, at home, at the airport\n• Hora: at 5pm, at midnight, at noon\n\nIN: dentro de / dentro de um período\n• Lugar: in the room, in Brazil, in the city\n• Tempo: in January, in 2024, in the morning, in the summer\n\nON: superfície / dias\n• Lugar: on the table, on the wall, on the bus\n• Tempo: on Monday, on 5th April, on my birthday\n\nMacete: AT (ponto) → ON (linha/dia) → IN (área/período)', examples: ["I'll meet you at the station.", "She lives in London.", "The book is on the shelf.", "The meeting is at 3pm.", "We go to church on Sundays."] }
  },
  {
    id: 'g1-21', level: 'A2', lessonNumber: 21, minWords: 500,
    title: 'For, since, ago', description: 'Preposições específicas para duração e períodos.', url: 'https://www.grammarinlevels.com/level1/lesson-21/', difficultyTags: ['prepositions', 'time'],
    content: { title: 'For, Since, Ago, In', body: 'FOR: duração de tempo\n• for 3 hours, for a week, for years\n• "I waited for 20 minutes."\n\nSINCE: ponto de início (até agora)\n• since 2020, since Monday, since I was young\n• Sempre com Present Perfect: "I have lived here since 2018."\n\nAGO: tempo que passou\n• 5 minutes ago, a year ago\n• Usado com Past Simple: "She left an hour ago."\n\nIN: tempo no futuro\n• in 10 minutes, in a week\n• "The train leaves in 5 minutes."', examples: ["I have lived here for 5 years.", "She left an hour ago.", "We moved here in 2018.", "I haven't seen him since last week.", "The flight arrives in two hours."] }
  },

// ── LEVEL 2 (B1/B2) ──────────────────────────────────────────────────────────
  {
    id: 'g2-1', level: 'B1', lessonNumber: 1, minWords: 1000,
    title: 'I was (past of to be)', description: 'Fale sobre estados e identidades no passado.', url: 'https://www.grammarinlevels.com/level2/lesson-1/', difficultyTags: ['past', 'verbs'],
    content: { title: 'Was / Were (Past of To Be)', body: 'O verbo TO BE no passado simples tem duas formas:\n\nWAS: I / He / She / It\nWERE: You / We / They\n\nAFIRMATIVA: I was tired. / They were late.\nNEGATIVA: I wasn\'t happy. / We weren\'t ready.\nPERGUNTA: Was she there? / Were they at home?\n\nUso: Para descrever estados, situações e identidades no passado. Frequente em narrativas.', examples: ["I was very tired yesterday.", "She was a teacher before.", "We were at the beach last week.", "The weather was perfect.", "Were you at the party last night?"] }
  },
  {
    id: 'g2-2', level: 'B1', lessonNumber: 2, minWords: 1000,
    title: 'Past simple', description: 'Narre eventos concluídos no passado com verbos regulares e irregulares.', url: 'https://www.grammarinlevels.com/level2/lesson-2/', difficultyTags: ['storytelling', 'tenses'],
    content: { title: 'Past Simple', body: 'O PAST SIMPLE descreve ações completadas no passado.\n\nVERBOS REGULARES: + ED\n• work → worked | play → played | live → lived\n\nVERBOS IRREGULARES: forma própria\n• go → went | come → came | see → saw\n• have → had | get → got | make → made\n• say → said | know → knew | think → thought\n\nNEGATIVA: didn\'t + verbo base\nPERGUNTA: Did + sujeito + verbo base?\n\nDica: "Did" já marca o passado — o verbo principal volta à forma base.', examples: ["I worked late last night.", "She went to Paris last summer.", "We watched a great film yesterday.", "Did you enjoy the concert?", "He didn't come to the meeting."] }
  },
  {
    id: 'g2-3', level: 'B1', lessonNumber: 3, minWords: 1000,
    title: 'Could', description: 'Habilidades no passado e pedidos educados.', url: 'https://www.grammarinlevels.com/level2/lesson-3/', difficultyTags: ['politeness', 'modal'],
    content: { title: 'Could', body: 'COULD é o passado de CAN. Tem três usos principais.\n\n1. Habilidade no passado:\n• "I could swim when I was 5." (sabia nadar)\n• "She couldn\'t drive before." (não sabia)\n\n2. Pedidos educados (mais formal que can):\n• "Could you help me?"\n• "Could I have the menu, please?"\n\n3. Possibilidade (menos certo que can):\n• "It could rain later." (talvez chova)', examples: ["Could you close the window, please?", "When I was young, I could run very fast.", "She couldn't speak English when she arrived.", "Could I have a glass of water?", "That could be the answer."] }
  },
  {
    id: 'g2-4', level: 'B1', lessonNumber: 4, minWords: 1000,
    title: 'Had to', description: 'Como expressar obrigações que você teve no passado.', url: 'https://www.grammarinlevels.com/level2/lesson-4/', difficultyTags: ['obligation', 'past'],
    content: { title: 'Had To (Past Obligation)', body: 'HAD TO é o passado de HAVE TO — obrigações que existiam no passado.\n\nHAD TO: era obrigado a (no passado)\nDIDN\'T HAVE TO: não precisava (sem obrigação)\n\nComparando:\n• MUST: obrigação no presente/futuro (interna)\n• HAD TO: obrigação no passado\n• MUSTN\'T: proibição\n• DIDN\'T HAVE TO: ausência de obrigação\n  (não é proibição — só não era necessário!)', examples: ["I had to work late yesterday.", "She had to take the bus because her car broke down.", "We didn't have to pay for the tickets.", "Did he have to study all weekend?", "They had to wait for two hours."] }
  },
  {
    id: 'g2-5', level: 'B1', lessonNumber: 5, minWords: 1000,
    title: 'Future simple (will)', description: 'Previsões, promessas e decisões instantâneas com Will.', url: 'https://www.grammarinlevels.com/level2/lesson-5/', difficultyTags: ['future', 'tenses'],
    content: { title: 'Future Simple — Will', body: 'WILL é usado para o futuro em vários contextos.\n\nDecisões espontâneas (no momento):\n• "I\'ll have the pasta." (decidindo agora)\n\nPrevisões e opiniões:\n• "It will rain tomorrow." / "I think she\'ll pass."\n\nPromessas e ofertas:\n• "I\'ll help you with that."\n\nFORMA: sujeito + will + verbo base\nCONTRAÇÃO: I\'ll, she\'ll, they\'ll\nNEGATIVA: won\'t (will not)\nPERGUNTA: Will + sujeito + verbo?', examples: ["I will call you tomorrow.", "She won't be at the meeting.", "Will you help me, please?", "I think it will be a great trip.", "Don't worry, I'll fix it."] }
  },
  {
    id: 'g2-6', level: 'B1', lessonNumber: 6, minWords: 1000,
    title: 'Past continuous', description: 'Descreva o cenário e ações em andamento no passado.', url: 'https://www.grammarinlevels.com/level2/lesson-6/', difficultyTags: ['ongoing', 'past'],
    content: { title: 'Past Continuous', body: 'O PAST CONTINUOUS descreve ações em andamento num momento específico do passado.\n\nESTRUTURA: was/were + verbo-ING\n\nUsos principais:\n1. Ação em andamento quando outra aconteceu:\n   "I was sleeping when the phone rang."\n   (was sleeping = ação contínua; rang = ação súbita)\n\n2. Cenário/contexto de uma história:\n   "The sun was shining and birds were singing."\n\n3. Duas ações simultâneas no passado:\n   "She was cooking while he was reading."', examples: ["I was watching TV when she called.", "What were you doing at 8pm yesterday?", "They were playing football when it started to rain.", "While I was working, my phone died.", "She was studying all evening."] }
  },
  {
    id: 'g2-7', level: 'B1', lessonNumber: 7, minWords: 1000,
    title: 'Some / Any', description: 'Regras para frases afirmativas, negativas e perguntas.', url: 'https://www.grammarinlevels.com/level2/lesson-7/', difficultyTags: ['quantifiers', 'grammar'],
    content: { title: 'Some vs Any', body: 'SOME e ANY indicam quantidade indefinida.\n\nSOME: usado em frases AFIRMATIVAS\n• "There is some milk in the fridge."\n• Também em ofertas e pedidos educados:\n  "Would you like some coffee?"\n\nANY: usado em frases NEGATIVAS e PERGUNTAS\n• "There isn\'t any sugar."\n• "Do you have any questions?"\n\nDica extra: ANY em afirmativas = qualquer\n• "You can choose any book you like."', examples: ["I have some questions for you.", "Is there any coffee left?", "I don't have any money.", "Would you like some cake?", "She didn't know anyone at the party."] }
  },
  {
    id: 'g2-8', level: 'B1', lessonNumber: 8, minWords: 1000,
    title: 'Would like', description: 'A forma padrão para desejos e ofertas em contextos sociais.', url: 'https://www.grammarinlevels.com/level2/lesson-8/', difficultyTags: ['social', 'politeness'],
    content: { title: 'Would Like', body: 'WOULD LIKE é a forma educada e formal de expressar desejo.\n\nESTRUTURA:\n• would like + substantivo: "I\'d like a coffee."\n• would like + to + verbo: "I\'d like to speak to the manager."\n\nCONTRAÇÕES:\nI would → I\'d | She would → She\'d | We would → We\'d\n\nPara oferecer: Would you like...?\nPara pedir: I\'d like... please\n\nUSO: Mais formal que "I want". Ideal em restaurantes, lojas, situações formais.', examples: ["I'd like a table for two, please.", "Would you like some more tea?", "She'd like to visit Japan someday.", "We'd like to make a reservation.", "Would you like me to help?"] }
  },
  {
    id: 'g2-9', level: 'B1', lessonNumber: 9, minWords: 1000,
    title: 'Passive voice', description: 'Foque na ação e não em quem a fez (Voz Passiva).', url: 'https://www.grammarinlevels.com/level2/lesson-9/', difficultyTags: ['syntax', 'formal'],
    content: { title: 'Passive Voice', body: 'A VOZ PASSIVA foca na ação — não em quem a fez.\n\nATIVA: The chef cooks the food. (foco no chef)\nPASSIVA: The food is cooked. (foco na comida)\n\nESTRUTURA: sujeito + TO BE (tempo correto) + PAST PARTICIPLE\n\nPresente: is/are + past participle\nPassado: was/were + past participle\nFuturo: will be + past participle\n\nBY + agente: para indicar quem fez\n"The book was written by Hemingway."\n\nUsado quando: quem fez é desconhecido, irrelevante ou óbvio.', examples: ["English is spoken around the world.", "The Mona Lisa was painted by Leonardo da Vinci.", "This car was made in Japan.", "The meeting will be held on Friday.", "My wallet was stolen yesterday."] }
  },
  {
    id: 'g2-10', level: 'B1', lessonNumber: 10, minWords: 1000,
    title: 'Gerund (playing)', description: 'Quando usar o Gerúndio após verbos e preposições.', url: 'https://www.grammarinlevels.com/level2/lesson-10/', difficultyTags: ['gerund', 'verbs'],
    content: { title: 'Gerund (Verb + ING)', body: 'O GERÚNDIO (verbo + ING) funciona como substantivo.\n\nApós esses verbos, use GERÚNDIO:\nenjoy, love, like, hate, finish, stop, avoid, suggest,\nmind, miss, keep, consider, practice\n• "I enjoy swimming." / "She stopped smoking."\n\nApós PREPOSIÇÕES, use GERÚNDIO:\ninterested in, good at, tired of, fond of, instead of\n• "He is good at cooking."\n\nGerúndio como SUJEITO:\n• "Swimming is good for you."\n• "Learning English takes time."', examples: ["I enjoy reading in the evenings.", "She stopped working at 6pm.", "Are you interested in learning more?", "He is very good at cooking.", "Swimming every day is great for health."] }
  },
  {
    id: 'g2-11', level: 'B2', lessonNumber: 11, minWords: 1000,
    title: 'Reflexive pronouns (myself)', description: 'Pronomes reflexivos: quando a ação volta para o sujeito.', url: 'https://www.grammarinlevels.com/level2/lesson-11/', difficultyTags: ['pronouns', 'grammar'],
    content: { title: 'Reflexive Pronouns', body: 'Os PRONOMES REFLEXIVOS são usados quando o sujeito e o objeto da frase são a mesma pessoa.\n\nI → myself\nYou → yourself / yourselves\nHe → himself\nShe → herself\nIt → itself\nWe → ourselves\nThey → themselves\n\nUSO 1 - Ação reflexiva: "She hurt herself."\nUSO 2 - Ênfase (sem ajuda): "He did it himself."\nBy + reflexivo = sozinho: "I live by myself."', examples: ["She cut herself while cooking.", "He made this table himself.", "Be careful, you might hurt yourself.", "We enjoyed ourselves at the party.", "I prefer to work by myself."] }
  },
  {
    id: 'g2-12', level: 'B2', lessonNumber: 12, minWords: 1000,
    title: 'There was / There were', description: 'Existência no passado (singular e plural).', url: 'https://www.grammarinlevels.com/level2/lesson-12/', difficultyTags: ['past', 'syntax'],
    content: { title: 'There Was / There Were', body: 'THERE WAS / THERE WERE são o passado de THERE IS / THERE ARE.\n\nTHERE WAS + singular\nTHERE WERE + plural\nTHERE WASN\'T / WEREN\'T = negativa\nWAS THERE / WERE THERE? = pergunta\n\nUSADO PARA:\n• Existência no passado: "There was a cinema here."\n• Descrever cenários históricos: "There were many people at the event."\n• Início de narrativas: "Once upon a time, there was a..."', examples: ["There was a big storm last night.", "There were hundreds of people at the concert.", "Was there a problem with the order?", "There weren't any taxis available.", "There was nothing I could do."] }
  },
  {
    id: 'g2-13', level: 'B2', lessonNumber: 13, minWords: 1000,
    title: 'Relative clauses (who, which)', description: 'Conecte frases e dê mais informações sobre pessoas e objetos.', url: 'https://www.grammarinlevels.com/level2/lesson-13/', difficultyTags: ['relative', 'syntax'],
    content: { title: 'Relative Clauses', body: 'As ORAÇÕES RELATIVAS conectam informações usando pronomes relativos.\n\nWHO: para pessoas\n• "The man who called is my boss."\n\nWHICH: para coisas e animais\n• "The book which I bought is excellent."\n\nTHAT: pode substituir who ou which\n• "The car that I want is expensive."\n\nWHERE: para lugares\n• "The restaurant where we met is closed now."\n\nWHOSE: posse\n• "The student whose essay won is here."', examples: ["The woman who helped me was very kind.", "This is the film which won the Oscar.", "I love the city where I grew up.", "The dog that bit me was big.", "She is the teacher who taught me Spanish."] }
  },
  {
    id: 'g2-14', level: 'B2', lessonNumber: 14, minWords: 1000,
    title: 'Advanced negation', description: 'Negação com modais e tempos perfeitos.', url: 'https://www.grammarinlevels.com/level2/lesson-14/', difficultyTags: ['negation', 'advanced'],
    content: { title: 'Advanced Negative Sentences', body: 'NEGAÇÃO AVANÇADA com modais e tempos perfeitos.\n\nMODAIS NEGATIVOS:\n• couldn\'t — não conseguia/pôde\n• shouldn\'t — não devia\n• wouldn\'t — não iria / não faria\n• mustn\'t — é proibido\n• needn\'t — não é necessário (formal)\n\nPRESENT PERFECT NEGATIVO:\n• haven\'t / hasn\'t + past participle\n• "I haven\'t finished yet."\n\nDOUBLE NEGATIVE: evite!\n✗ I can\'t do nothing about it.\n✓ I can\'t do anything about it.', examples: ["She shouldn't work so hard.", "I couldn't understand what he said.", "We haven't decided yet.", "You mustn't tell anyone.", "He wouldn't listen to my advice."] }
  },
  {
    id: 'g2-15', level: 'B2', lessonNumber: 15, minWords: 1000,
    title: 'Tag questions & indirect questions', description: 'Tag questions e perguntas indiretas mais naturais.', url: 'https://www.grammarinlevels.com/level2/lesson-15/', difficultyTags: ['questions', 'fluency'],
    content: { title: 'Tag Questions & Indirect Questions', body: 'TAG QUESTIONS: perguntas de confirmação no final da frase.\n• Frase positiva + tag negativa: "She is smart, isn\'t she?"\n• Frase negativa + tag positiva: "He didn\'t call, did he?"\n• Tom de confirmação: entonação descendente ↘\n• Tom de dúvida: entonação ascendente ↗\n\nPERGUNTAS INDIRETAS: mais educadas, sem inversão\n• Direto: "Where is the bank?"\n• Indireto: "Could you tell me where the bank is?"\n• Observe: a ordem sujeito+verbo NÃO inverte!', examples: ["It's a beautiful day, isn't it?", "You don't like coffee, do you?", "Could you tell me where the nearest hospital is?", "Do you know what time the train leaves?", "She passed the exam, didn't she?"] }
  },
  {
    id: 'g2-16', level: 'B2', lessonNumber: 16, minWords: 1000,
    title: 'Phrasal verbs', description: 'Entenda a lógica por trás dos verbos com partículas.', url: 'https://www.grammarinlevels.com/level2/lesson-16/', difficultyTags: ['vocabulary', 'idiomatic'],
    content: { title: 'Phrasal Verbs', body: 'PHRASAL VERBS são verbos + partícula(s) com novo significado.\n\nSEPARÁVEIS: o objeto pode ir no meio\n• turn off the TV = turn the TV off\n• put on your shoes = put your shoes on\n\nINSEPARÁVEIS: não separa\n• look after the children (✗ look the children after)\n• run into an old friend\n\nMais comuns:\n• give up (desistir) | find out (descobrir)\n• take off (decolar) | look for (procurar)\n• put up with (tolerar) | come up with (inventar)', examples: ["Can you turn off the lights?", "She gave up smoking last year.", "We ran into an old friend at the mall.", "Find out what time it opens.", "He looked after his sister while their parents were away."] }
  },
  {
    id: 'g2-17', level: 'B2', lessonNumber: 17, minWords: 1000,
    title: 'Have got', description: 'A alternativa britânica e informal para o verbo Have.', url: 'https://www.grammarinlevels.com/level2/lesson-17/', difficultyTags: ['possession', 'british'],
    content: { title: 'Have Got', body: 'HAVE GOT é uma alternativa informal ao verbo HAVE, especialmente no inglês britânico.\n\nHAVE = HAVE GOT (mesmo significado de posse)\n• I have a dog. = I\'ve got a dog.\n• Do you have time? = Have you got time?\n\nFormas:\nAfirmativa: have/has + got\nNegativa: haven\'t/hasn\'t + got\nPergunta: Have/Has + sujeito + got?\n\nNOTA: Have got é do PRESENTE.\nPara o passado, use HAD (sem got):\n"When I was young, I had a bicycle."', examples: ["I've got three brothers.", "She hasn't got much time.", "Have you got a pen I can borrow?", "He's got a really nice apartment.", "We've got no choice."] }
  },
  {
    id: 'g2-18', level: 'B2', lessonNumber: 18, minWords: 1000,
    title: 'If / When (conditionals)', description: 'Condicionais: fale sobre possibilidades e planos futuros.', url: 'https://www.grammarinlevels.com/level2/lesson-18/', difficultyTags: ['conditionals', 'syntax'],
    content: { title: 'If vs When — First Conditional', body: 'IF e WHEN para falar do futuro.\n\nIF (se — condição incerta):\n• If + present simple → will + verb\n• "If it rains, I will stay home."\n• (talvez chova, talvez não)\n\nWHEN (quando — evento certo):\n• When + present simple → will + verb\n• "When I finish work, I will call you."\n• (vou terminar o trabalho com certeza)\n\nDICA IMPORTANTE: Mesmo falando do futuro, use PRESENT SIMPLE depois de if/when — nunca will!', examples: ["If I pass the exam, I will celebrate.", "When you arrive, call me.", "I will buy a car if I get that job.", "When it gets dark, we will leave.", "If she calls, tell her I'm busy."] }
  },
  {
    id: 'g2-19', level: 'B2', lessonNumber: 19, minWords: 1000,
    title: 'Subject questions', description: 'Aprenda a fazer perguntas sobre o sujeito da frase.', url: 'https://www.grammarinlevels.com/level2/lesson-19/', difficultyTags: ['syntax', 'questions'],
    content: { title: 'Subject Questions', body: 'PERGUNTAS SOBRE O SUJEITO — quando a pergunta é sobre quem fez a ação.\n\nPergunta normal (sobre o OBJETO):\n• "Who did you call?" → You called WHO?\n→ Usa auxiliar DID\n\nPergunta sobre o SUJEITO:\n• "Who called you?" → WHO called you?\n→ NÃO usa auxiliar!\n\nRegra: Se o WH-word substitui o SUJEITO, sem inversão e sem auxiliar.\n• What happens next? (✓)\n• Who knows the answer? (✓)\n• Which team won? (✓)', examples: ["Who called you last night?", "What happened at the party?", "Who knows the answer to this question?", "Which team won the match?", "What caused the accident?"] }
  },
  {
    id: 'g2-20', level: 'B2', lessonNumber: 20, minWords: 1000,
    title: 'Get + adjective', description: 'O uso versátil de Get para mudanças de estado.', url: 'https://www.grammarinlevels.com/level2/lesson-20/', difficultyTags: ['verbs', 'fluency'],
    content: { title: 'Get + Adjective (Change of State)', body: 'GET + ADJETIVO indica mudança de estado (ficar, tornar-se).\n\nMuito comum na fala natural:\n• get better (melhorar) / get worse (piorar)\n• get tired (ficar cansado) / get bored (entediar-se)\n• get married (casar-se) / get divorced (divorciar-se)\n• get lost (perder-se) / get ready (preparar-se)\n• get dressed (vestir-se) / get upset (ficar irritado)\n• get cold / hot / dark / late\n\nGET + substantivo = receber/obter:\n• get a job, get a letter, get permission', examples: ["She is getting better after the surgery.", "I always get lost in this city.", "Get ready! We are leaving in 5 minutes.", "He got angry when he heard the news.", "Don't worry, you'll get used to it."] }
  },
  {
    id: 'g2-21', level: 'B2', lessonNumber: 21, minWords: 1000,
    title: 'This one / That one', description: 'Como usar pronomes demonstrativos para evitar repetição.', url: 'https://www.grammarinlevels.com/level2/lesson-21/', difficultyTags: ['pronouns', 'fluency'],
    content: { title: 'Demonstrative Pronouns', body: 'PRONOMES DEMONSTRATIVOS substituem o substantivo para evitar repetição.\n\nPRÓXIMO:\nThis (singular) → This one\nThese (plural) → These ones\n\nDISTANTE:\nThat (singular) → That one\nThose (plural) → Those ones\n\nExemplos:\n"I like this dress." → "I like this one."\n"Which car?" → "That one over there."\n\nDica: "One" é adicionado quando nos referimos a algo já mencionado para evitar repetição.', examples: ["Which bag do you prefer — this one or that one?", "I don't want these ones. Can I see those ones?", "This is my favorite. That is my sister's.", "Which shoes are yours? — These ones.", "Can I try that one in the window?"] }
  },


// ── LEVEL 3 (C1/C2) ──────────────────────────────────────────────────────────
  {
    id: 'g3-1', level: 'C1', lessonNumber: 1, minWords: 2000,
    title: 'Going to', description: 'Planos concretos e intenções para o futuro.', url: 'https://www.grammarinlevels.com/level3/lesson-1/', difficultyTags: ['future', 'intentions'],
    content: { title: 'Going To (Future Plans)', body: 'GOING TO é usado para planos e intenções já decididos, ou previsões com evidência.\n\nESTRUTURA: am/is/are + going to + verbo base\n\nINTENÇÕES (plano já decidido antes):\n• "I\'m going to study medicine." (já decidi)\n\nPREVISÕES com EVIDÊNCIAS VISÍVEIS:\n• "Look at those clouds! It\'s going to rain!"\n\nDiferença do WILL:\n• WILL: decisão espontânea / previsão geral sem evidência\n• GOING TO: plano prévio / evidência visível agora', examples: ["I'm going to start a new course next month.", "Look at those dark clouds — it's going to rain!", "She's going to have a baby.", "Are you going to apply for that job?", "We're not going to make it in time."] }
  },
  {
    id: 'g3-2', level: 'C1', lessonNumber: 2, minWords: 2000,
    title: 'Could, should, would', description: 'Domine conselhos, hipóteses e possibilidades.', url: 'https://www.grammarinlevels.com/level3/lesson-2/', difficultyTags: ['advice', 'hypothetical'],
    content: { title: 'Could, Should, Would', body: 'MODAIS AVANÇADOS para conselhos, hipóteses e possibilidades.\n\nSHOULD: conselho ou expectativa\n• "You should see a doctor." (conselho)\n• "The bus should arrive soon." (expectativa)\n\nCOULD: possibilidade / sugestão\n• "You could try a different approach." (sugestão)\n• "It could be dangerous." (possibilidade)\n\nWOULD: hipótese / desejo\n• "I would love to travel." (desejo)\n• "What would you do?" (hipótese)', examples: ["You should apologize to her.", "We could go to the new restaurant tonight.", "I would quit my job if I won the lottery.", "She should be here by now.", "Could you please be quiet?"] }
  },
  {
    id: 'g3-3', level: 'C1', lessonNumber: 3, minWords: 2000,
    title: 'Present perfect', description: 'Conecte o passado ao presente sem especificar quando.', url: 'https://www.grammarinlevels.com/level3/lesson-3/', difficultyTags: ['experience', 'tenses'],
    content: { title: 'Present Perfect', body: 'O PRESENT PERFECT conecta o passado ao presente — sem especificar quando.\n\nESTRUTURA: have/has + PAST PARTICIPLE\n\nUSOS:\n1. Experiência de vida (alguma vez?):\n   "I have visited Japan." (sem dizer quando)\n2. Ação recente com resultado agora:\n   "I have lost my keys." (ainda perdido)\n3. Com EVER, NEVER, ALREADY, YET, JUST:\n   "Have you ever tried sushi?"\n\nDIFERENÇA CHAVE:\n• Present Perfect → SEM quando especificado\n• Past Simple → COM quando especificado\n  "I visited Japan in 2019." (past simple)', examples: ["Have you ever tried Indian food?", "She has just arrived.", "I haven't finished yet.", "He has lived here since 2010.", "We have already seen this film."] }
  },
  {
    id: 'g3-4', level: 'C1', lessonNumber: 4, minWords: 2000,
    title: 'Present perfect continuous', description: 'Foque na duração de uma ação que começou no passado.', url: 'https://www.grammarinlevels.com/level3/lesson-4/', difficultyTags: ['duration', 'tenses'],
    content: { title: 'Present Perfect Continuous', body: 'O PRESENT PERFECT CONTINUOUS enfatiza a DURAÇÃO de uma ação que começou no passado e continua agora.\n\nESTRUTURA: have/has + been + verbo-ING\n\nUSADO COM: for, since, all day/morning/week\n\nDIFERENÇA DO PRESENT PERFECT SIMPLES:\n• Simples → foco no resultado:\n  "I have read 3 books."\n• Contínuo → foco na duração:\n  "I have been reading all day."\n\nResultado visível:\n"You look tired. Have you been working out?"', examples: ["I have been studying English for 3 years.", "How long have you been waiting?", "She has been working here since January.", "They have been arguing all morning.", "I'm tired because I've been running."] }
  },
  {
    id: 'g3-5', level: 'C1', lessonNumber: 5, minWords: 2000,
    title: 'Past perfect', description: 'O "passado do passado": coloque eventos em ordem cronológica.', url: 'https://www.grammarinlevels.com/level3/lesson-5/', difficultyTags: ['advanced', 'tenses'],
    content: { title: 'Past Perfect', body: 'O PAST PERFECT descreve uma ação que aconteceu ANTES de outra ação no passado.\n\nESTRUTURA: had + PAST PARTICIPLE\n\nLinha do tempo: A → B (ambas no passado)\n→ A usa Past Perfect: had + pp\n→ B usa Past Simple\n\n"When I arrived, she had already left."\n(Ela saiu → depois eu cheguei)\n\nUsado também com:\n• because: "I was tired because I had not slept."\n• before/after/when/by the time:\n  "After he had eaten, he went to sleep."', examples: ["By the time I arrived, the party had already finished.", "She had never seen snow before she moved to Canada.", "He forgot that he had left his keys at home.", "We had already eaten when the food arrived.", "The film had started before we found our seats."] }
  },
  {
    id: 'g3-6', level: 'C1', lessonNumber: 6, minWords: 2000,
    title: 'I want you to win', description: 'Estruturas de objeto + infinitivo para expressar desejos sobre outros.', url: 'https://www.grammarinlevels.com/level3/lesson-6/', difficultyTags: ['syntax', 'verb-patterns'],
    content: { title: 'Verb + Object + Infinitive', body: 'VERBO + OBJETO + TO + INFINITIVO: você expressa o que quer que outra pessoa faça.\n\nVerbos comuns:\nwant, need, would like, expect, ask, tell, allow, encourage\n• "I want you to come." (quero que venha)\n• "She asked me to help." (pediu que ajudasse)\n• "He told us to wait." (disse para esperar)\n\nEXCEÇÕES — sem TO:\nMAKE e LET: "She made me laugh." / "Let them go."\nHELP: pode usar com ou sem to:\n"Help me (to) carry this."', examples: ["I want you to be honest with me.", "She asked me to call her back.", "He told the children to go to bed.", "Would you like me to help?", "My boss expects me to arrive on time."] }
  },
  {
    id: 'g3-7', level: 'C1', lessonNumber: 7, minWords: 2000,
    title: 'Gonna, wanna, gotta', description: 'Entenda as reduções que os nativos usam o tempo todo.', url: 'https://www.grammarinlevels.com/level3/lesson-7/', difficultyTags: ['informal', 'fluency'],
    content: { title: 'Informal Reductions', body: 'REDUÇÕES INFORMAIS: formas contraídas da fala natural nativa.\n\nGONNA = going to\n• "I\'m gonna call you later."\n\nWANNA = want to\n• "I wanna go home."\n\nGOTTA = have got to / have to\n• "I\'ve gotta finish this work."\n\nKINDA = kind of | DUNNO = don\'t know\nYEAH = yes | GONNA = going to\n\nIMPORTANTE: Use APENAS em situações muito informais (conversa casual, mensagens com amigos). Evite em:\n• Escrita formal | Emails profissionais | Entrevistas', examples: ["I'm gonna be late — sorry!", "Do you wanna grab lunch later?", "I've gotta call my mom.", "I kinda like this song.", "I dunno what happened."] }
  },
  {
    id: 'g3-8', level: 'C1', lessonNumber: 8, minWords: 2000,
    title: 'Let, make, help (causatives)', description: 'Causativos: como dizer que alguém fez algo acontecer.', url: 'https://www.grammarinlevels.com/level3/lesson-8/', difficultyTags: ['causative', 'verbs'],
    content: { title: 'Causative Verbs', body: 'CAUSATIVOS: verbos que expressam que você causa outra pessoa a fazer algo.\n\nMAKE + objeto + verbo (sem TO): obrigar / causar involuntário\n• "The film made me cry."\n• "He made them work overtime."\n\nLET + objeto + verbo (sem TO): permitir\n• "She let me borrow her car."\n\nHELP + objeto + (to) verbo: ajudar\n• "Can you help me (to) carry this?"\n\nHAVE + objeto + past participle: mandar fazer\n• "I had my hair cut." / "She had the car fixed."', examples: ["The news made me feel sad.", "She let her children stay up late.", "Can you help me move this furniture?", "He had his car repaired.", "Don't let him talk to you like that."] }
  },
  {
    id: 'g3-9', level: 'C1', lessonNumber: 9, minWords: 2000,
    title: "May, might, mustn't", description: 'Probabilidades futuras e proibições categóricas.', url: 'https://www.grammarinlevels.com/level3/lesson-9/', difficultyTags: ['probability', 'modal'],
    content: { title: "May, Might, Must, Mustn't", body: 'PROBABILIDADE FUTURA e PROIBIÇÕES.\n\nMAY (50-60% provável):\n• "She may call tonight." (talvez ligue)\n• "I may be wrong." (posso estar errado)\n\nMIGHT (30-40% — menos certo que may):\n• "It might rain." (talvez chova)\n\nMUST: certeza baseada em dedução lógica\n• "He must be tired." (com certeza está)\n• "She must know the answer."\n\nMUST NOT / MUSTN\'T: proibição forte\n• "You mustn\'t smoke here." (é proibido!)\n• "You mustn\'t tell anyone."', examples: ["She may be late — I'm not sure.", "It might snow tomorrow.", "He must be very smart to solve that.", "You mustn't use your phone during the exam.", "They might not come to the party."] }
  },
  {
    id: 'g3-10', level: 'C1', lessonNumber: 10, minWords: 2000,
    title: 'Prepositions of place', description: 'Nuances avançadas de preposições de lugar.', url: 'https://www.grammarinlevels.com/level3/lesson-10/', difficultyTags: ['prepositions', 'advanced'],
    content: { title: 'Advanced Prepositions of Place', body: 'PREPOSIÇÕES DE LUGAR avançadas e suas nuances.\n\nIN vs ON vs AT (revisão):\n• in: espaço fechado / dentro (in the box, in Spain)\n• on: superfície / transporte público (on the table, on the bus)\n• at: ponto específico (at the corner, at the airport)\n\nAVANÇADAS:\n• above/below: acima/abaixo (sem contato)\n• over/under: acima/abaixo (com movimento ou cobertura)\n• between: entre dois elementos\n• among: entre vários / misturado com\n• opposite: em frente / defronte\n• beside/next to: ao lado', examples: ["The cat is hiding under the bed.", "There's a pharmacy between the bank and the supermarket.", "She lives opposite the park.", "The picture is hanging above the fireplace.", "Sit next to me."] }
  },
  {
    id: 'g3-11', level: 'C2', lessonNumber: 11, minWords: 2000,
    title: 'Prepositions of time', description: 'Uso avançado de preposições em contextos temporais complexos.', url: 'https://www.grammarinlevels.com/level3/lesson-11/', difficultyTags: ['prepositions', 'time'],
    content: { title: 'Advanced Prepositions of Time', body: 'PREPOSIÇÕES DE TEMPO avançadas.\n\nBY: no máximo até / prazo limite\n• "I\'ll be there by 8pm." (até as 8, possivelmente antes)\n• "Finish it by Friday." (no máximo sexta)\n\nUNTIL/TILL: durante todo o tempo / até (duração)\n• "I work until 6pm." (do início até às 6)\n\nDURING: durante (dentro de um período)\n• "I fell asleep during the film."\n\nWITHIN: dentro de (prazo a partir de agora)\n• "I\'ll reply within 24 hours."\n\nBY vs UNTIL: BY = prazo máximo | UNTIL = duração contínua', examples: ["Can you finish this by Monday?", "I study until midnight sometimes.", "She slept during the whole flight.", "We will contact you within 3 business days.", "By the time he arrived, it was all over."] }
  },
  {
    id: 'g3-12', level: 'C2', lessonNumber: 12, minWords: 2000,
    title: 'Could have done (modal perfect)', description: 'Arrependimentos e hipóteses sobre o passado (Modal Perfect).', url: 'https://www.grammarinlevels.com/level3/lesson-12/', difficultyTags: ['regret', 'advanced'],
    content: { title: 'Modal Perfect (Past)', body: 'MODAL + HAVE + PAST PARTICIPLE para hipóteses sobre o passado.\n\nCOULD HAVE: possibilidade que não aconteceu\n• "I could have helped but I didn\'t know."\n• "She could have been a doctor."\n\nSHOULD HAVE: arrependimento / obrigação não cumprida\n• "I should have called her." (mas não liguei)\n• "You shouldn\'t have said that." (foi errado)\n\nWOULD HAVE: o que teria acontecido em situação hipotética\n• "I would have helped if I had known."\n\nMIGHT HAVE: possibilidade no passado\n• "He might have misunderstood."', examples: ["I should have studied more for the exam.", "She could have told me about the change.", "You shouldn't have spent so much money.", "They would have come if they'd been invited.", "He might have misunderstood what I said."] }
  },
  {
    id: 'g3-13', level: 'C2', lessonNumber: 13, minWords: 2000,
    title: 'If (third conditional)', description: 'Third Conditional e situações puramente imaginárias.', url: 'https://www.grammarinlevels.com/level3/lesson-13/', difficultyTags: ['conditionals', 'advanced'],
    content: { title: 'Third Conditional', body: 'O TERCEIRO CONDICIONAL fala de situações IMAGINÁRIAS no PASSADO.\nO que teria acontecido se algo tivesse sido diferente?\n\nESTRUTURA:\nIF + had + past participle → would have + past participle\n\n"If I had studied, I would have passed."\n(Não estudei → não passei — imaginando o contrário)\n\n"If she hadn\'t been late, she would have got the job."\n(Foi tarde → não conseguiu o emprego)\n\nComparação dos condicionais:\n• 1º: possível futuro → "If it rains, I\'ll stay home."\n• 2º: imaginário presente → "If I were rich, I would travel."\n• 3º: imaginário passado → "If I had been rich, I would have traveled."', examples: ["If I had known, I would have told you.", "She wouldn't have left if he had asked her to stay.", "If we had left earlier, we wouldn't have missed the train.", "Would you have taken the job if they had offered more?", "If I hadn't met you, my life would have been very different."] }
  },
  {
    id: 'g3-14', level: 'C2', lessonNumber: 14, minWords: 2000,
    title: 'Advanced phrasal verbs', description: 'Phrasal verbs inseparáveis e com três palavras.', url: 'https://www.grammarinlevels.com/level3/lesson-14/', difficultyTags: ['vocabulary', 'advanced'],
    content: { title: 'Advanced Phrasal Verbs', body: 'PHRASAL VERBS AVANÇADOS: inseparáveis e de três partes.\n\nINSEPARÁVEIS — o objeto NUNCA vai no meio:\n• look after = cuidar de\n• come across = deparar-se com / encontrar por acaso\n• run into = encontrar (pessoa) por acaso\n• look into = investigar\n\nDE TRÊS PARTES (sempre inseparáveis):\n• look forward to = aguardar ansiosamente\n• put up with = tolerar / aguentar\n• come up with = inventar / ter uma ideia\n• keep up with = acompanhar o ritmo de\n• cut down on = reduzir / diminuir o consumo', examples: ["I really look forward to seeing you again.", "She can't put up with his attitude anymore.", "How did you come up with that idea?", "It's hard to keep up with all the new technology.", "You should cut down on sugar."] }
  },
  {
    id: 'g3-15', level: 'C2', lessonNumber: 15, minWords: 2000,
    title: 'Zero relative pronoun', description: 'Omissão de pronomes relativos para fala mais rápida.', url: 'https://www.grammarinlevels.com/level3/lesson-15/', difficultyTags: ['syntax', 'fluency'],
    content: { title: 'Zero Relative Pronoun', body: 'OMISSÃO DO PRONOME RELATIVO: em inglês informal, o pronome relativo pode ser omitido quando NÃO é o sujeito da oração relativa.\n\nCOM pronome relativo (formal):\n• "The book THAT I bought is great."\n• "The woman WHO he married is a doctor."\n\nSEM pronome relativo (informal/natural):\n• "The book I bought is great."\n• "The woman he married is a doctor."\n\nNOTA: Quando o pronome relativo É o sujeito, não pode ser omitido:\n• "The man WHO called was angry." (WHO não pode omitir)', examples: ["The film I saw last night was amazing.", "That's the restaurant we love.", "Is that the woman you told me about?", "Here's the book I mentioned.", "The person she married is very kind."] }
  },
  {
    id: 'g3-16', level: 'C2', lessonNumber: 16, minWords: 2000,
    title: 'Where are you from?', description: 'Preposições "penduradas" no final de perguntas.', url: 'https://www.grammarinlevels.com/level3/lesson-16/', difficultyTags: ['syntax', 'questions'],
    content: { title: 'Prepositions at the End', body: 'PREPOSIÇÕES NO FINAL: em inglês natural, é comum terminar perguntas com preposição.\n\nFORMAL (preposição no início):\n• "From where are you?" (muito raro/artificial)\n\nNATURAL / INFORMAL:\n• "Where are you from?" ✓\n• "Who are you talking to?" ✓\n• "What are you looking at?" ✓\n\nExemplos do cotidiano:\n• What are you waiting for?\n• Who did you buy it for?\n• Which hotel are you staying at?\n• What kind of music are you into?', examples: ["Where are you from?", "Who are you talking to?", "What are you looking for?", "Which company do you work for?", "What kind of music are you into?"] }
  },
  {
    id: 'g3-17', level: 'C2', lessonNumber: 17, minWords: 2000,
    title: 'Defining vs non-defining clauses', description: 'Defining vs Non-defining relative clauses.', url: 'https://www.grammarinlevels.com/level3/lesson-17/', difficultyTags: ['relative', 'advanced'],
    content: { title: 'Relative Clauses: Defining vs Non-defining', body: 'DEFINING (Especificadoras): identifica de qual pessoa/coisa se fala. SEM vírgulas.\n• "The man who called is my boss."\n• Sem essa oração, não sabemos de quem se fala.\n• Pode usar THAT, WHO ou WHICH.\n\nNON-DEFINING (Explicativas): adiciona informação extra. COM vírgulas.\n• "My boss, who is from Ireland, called me."\n• A oração pode ser removida sem perder o sentido principal.\n• NUNCA use THAT em non-defining! Use WHO, WHICH ou WHERE.\n\nDica: Se puder remover a oração e a frase ainda fizer sentido → non-defining.', examples: ["The book that I recommend is a classic.", "My sister, who lives in Paris, is visiting next week.", "This is the café where I had my first date.", "The report, which took months to write, was rejected.", "He is the only person that I trust completely."] }
  },
  {
    id: 'g3-18', level: 'C2', lessonNumber: 18, minWords: 2000,
    title: 'Noun clauses', description: 'Noun clauses como objeto de verbos de pensamento.', url: 'https://www.grammarinlevels.com/level3/lesson-18/', difficultyTags: ['syntax', 'advanced'],
    content: { title: 'Noun Clauses', body: 'NOUN CLAUSES (Orações Substantivas): funcionam como substantivo na frase.\n\nESTRUTURA: that / if / whether / wh-word + sujeito + verbo\n\nCOMO OBJETO de verbos de pensamento/comunicação:\nknow, think, believe, understand, say, wonder, realize\n• "I know THAT she is right."\n• "She didn\'t say WHERE she was going."\n\nCOM PERGUNTAS INDIRETAS:\n• "I wonder WHY he left."\n• "Do you know WHEN it starts?"\n\nIMPORTANTE: Depois da wh-word, a ordem é sujeito + verbo (sem inversão!)', examples: ["I know why she was upset.", "Do you understand what I mean?", "She told me that she would be late.", "I wonder whether he got my message.", "I don't know what happened next."] }
  },
  {
    id: 'g3-19', level: 'C2', lessonNumber: 19, minWords: 2000,
    title: 'Used to', description: 'Compare seus hábitos antigos com o presente.', url: 'https://www.grammarinlevels.com/level3/lesson-19/', difficultyTags: ['habits', 'past'],
    content: { title: 'Used To', body: 'USED TO descreve hábitos ou estados do passado que NÃO continuam no presente.\n\nESTRUTURA:\nAfirmativa: used to + verbo base\nNegativa: didn\'t use to + verbo base\nPergunta: Did you use to + verbo base?\n\nHÁBITO PASSADO (não mais):\n• "I used to smoke." (antes fumava, agora não)\n• "We used to live in the countryside."\n\nDIFERENÇA DE WOULD:\n• Would: hábito passado (ação repetida, não estado)\n• Used to: hábito OU estado passado\n✓ "She used to be shy." (estado — correto)\n✗ "She would be shy." (estado — errado)', examples: ["I used to play tennis when I was younger.", "She didn't use to like vegetables.", "We used to meet every Friday for coffee.", "Did you use to live near here?", "He used to work as a pilot."] }
  },
  {
    id: 'g3-20', level: 'C2', lessonNumber: 20, minWords: 2000,
    title: 'Review — Advanced Grammar', description: 'Revisão geral dos pontos cruciais do nível avançado.', url: 'https://www.grammarinlevels.com/level3/lesson-20/', difficultyTags: ['review', 'advanced'],
    content: { title: 'Advanced Grammar Review', body: 'REVISÃO GERAL dos pontos cruciais do nível avançado (C1/C2).\n\nTEMPOS VERBAIS AVANÇADOS:\n• Present Perfect vs Past Simple (quando vs experiência)\n• Past Perfect para sequência temporal (o mais-que-perfeito)\n• Present Perfect Continuous para duração em andamento\n\nMODAIS AVANÇADOS:\n• Could/Should/Would + have + pp (hipóteses passadas)\n• May/Might (probabilidade futura: 30-60%)\n• Must/Can\'t (dedução lógica no presente)\n\nESTRUTURAS COMPLEXAS:\n• Condicionais 1º, 2º e 3º\n• Relative clauses defining vs non-defining\n• Noun clauses e perguntas indiretas\n• Used to vs Would para hábitos passados', examples: ["If I had worked harder, I would have passed.", "I've been studying English for five years and I've come a long way.", "The person who taught me the most was my first teacher.", "I wonder whether I'll ever be fluent.", "By this time next year, I will have finished my degree."] }
  },

];