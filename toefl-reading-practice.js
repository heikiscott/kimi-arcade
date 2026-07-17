const PAGE_COUNT = 47;
const PAGE_DIR = "assets/toefl-reading-intermediate-1";

const pageNotes = {
  1: "封面：Master TOEFL Junior Intermediate 1",
  2: "目录：阅读题型和单元安排",
  3: "TOEFL Junior Test 结构说明",
  15: "Unit 1：Main Idea Questions",
  21: "Unit 1 Practice Test：e-mail",
  22: "Unit 1 Practice Test：golden touch story",
  23: "Unit 1 Practice Test：languages in the U.S.A.",
  24: "Unit 1 Practice Test：pencils passage",
  34: "Unit 1 Practice Test：dogs passage",
  40: "Detail Question 例题：NOT mentioned",
  44: "Detail Question passage：summer camps"
};

const questionBank = [
  {
    page: 2,
    type: "Contents",
    prompt: "According to the contents page, which unit teaches Main Idea Questions?",
    choices: ["Unit 1", "Unit 2", "Unit 5", "Review Test 1"],
    answer: "A",
    explain: "目录里 Unit 1 是 Main Idea Questions。"
  },
  {
    page: 3,
    type: "Test Structure",
    prompt: "How many minutes are given for Reading Comprehension in the TOEFL Junior structure page?",
    choices: ["25 minutes", "35 minutes", "50 minutes", "110 minutes"],
    answer: "C",
    explain: "第 3 页表格中 Reading Comprehension 的时间是 50 minutes。"
  },
  {
    page: 15,
    type: "Main Idea",
    prompt: "The book says a Main Idea question asks you to understand what?",
    choices: ["Only one new word", "The general subject of the reading", "The author's name", "The exact page number"],
    answer: "B",
    explain: "Main Idea 要抓整篇阅读的 general subject。"
  },
  {
    page: 21,
    type: "Main Idea",
    prompt: "What would be the best title for the e-mail on the page?",
    choices: ["A Letter of Thanks", "My Stay at the Hospital", "An E-mail to You and Melanie", "Why I Am Not at School Today"],
    answer: "A",
    explain: "邮件主要是在感谢别人送花和写卡片。"
  },
  {
    page: 22,
    type: "Main Idea",
    prompt: "What would be the best title for the king story?",
    choices: ["All That Glitters Is Not Gold", "The Man with a Golden Touch", "Be Careful What You Wish for", "Every Cloud Has a Silver Lining"],
    answer: "C",
    explain: "故事重点是国王得到愿望后后悔，最合适的主旨是要小心许愿。"
  },
  {
    page: 23,
    type: "Main Idea",
    prompt: "What is the main topic of the passage about the U.S.A.?",
    choices: ["The languages of the U.S.A.", "English speaking in the U.S.A.", "Spanish speaking populations", "Americans who speak Spanish"],
    answer: "A",
    explain: "文章讲美国的主要语言，包含英语、西班牙语和其他语言。"
  },
  {
    page: 24,
    type: "Main Idea",
    prompt: "Which title best summarizes the main idea of the pencils passage?",
    choices: ["Graphite Discoveries", "The History of Pencils", "Pencils around the World", "The Inventors of the Pencil"],
    answer: "B",
    explain: "文章按历史顺序讲铅笔怎么演变。"
  },
  {
    page: 34,
    type: "Main Idea",
    prompt: "What is the passage about dogs mostly about?",
    choices: ["Training dogs", "Dogs' shapes and sizes", "The domestication of dogs", "Similarities between dogs and wolves"],
    answer: "C",
    explain: "文章核心是狗从狼被人类驯化后的变化。"
  },
  {
    page: 34,
    type: "Detail",
    prompt: "What is a major difference between a dog and a wolf?",
    choices: ["Wolves are bigger.", "Dogs are usually brown.", "Dogs are more easily trained.", "Wolves need to eat more food."],
    answer: "C",
    explain: "文中说 today's dogs are much easier to train than wild wolves。"
  },
  {
    page: 34,
    type: "Detail",
    prompt: "Why do so many different varieties of dogs exist?",
    choices: ["Dogs began working as hunters.", "Wolves naturally evolved into dogs.", "Many types of wolves started breeding.", "Humans developed their particular qualities."],
    answer: "D",
    explain: "文中提到 humans selectively bred dogs for traits。"
  },
  {
    page: 40,
    type: "Detail",
    prompt: "Which of the following is NOT mentioned in the letter example?",
    choices: ["The boy being sick with the flu", "The boy needing his homework", "It being the boy's turn to feed the fish", "The boy needing a ride to school on Monday"],
    answer: "D",
    explain: "例题解释说 A、B、C 都有证据，D 没有提到。"
  },
  {
    page: 44,
    type: "Detail",
    prompt: "In the summer camps passage, what do children learn at camp?",
    choices: ["Only how to study for tests", "Many sports and survival skills", "How to build airports", "Only how to ride buses"],
    answer: "B",
    explain: "文中提到 swim, sail, canoe, snorkel 和 survival in nature。"
  }
];

const sentenceBank = [
  {
    page: 21,
    en: "I got the flowers you sent to me, so I'm sending you this e-mail to tell you how thankful I am.",
    cn: "我收到了你送给我的花，所以我写这封电子邮件告诉你我有多么感谢你。",
    keywords: ["flowers", "sent", "e-mail", "thankful"],
    words: ["thankful"],
    phrases: ["send an e-mail", "tell you how thankful I am"]
  },
  {
    page: 21,
    en: "Being in the hospital is so boring.",
    cn: "待在医院里真无聊。",
    keywords: ["hospital", "boring"],
    words: ["boring"],
    phrases: ["in the hospital"]
  },
  {
    page: 21,
    en: "When I got your flowers, it cheered me up right away.",
    cn: "当我收到你的花时，它马上让我开心起来。",
    keywords: ["flowers", "cheered", "right away"],
    words: ["cheer"],
    phrases: ["cheer me up", "right away"]
  },
  {
    page: 21,
    en: "I wish I'd never gone on that school snowboarding trip.",
    cn: "我真希望自己从来没有参加那次学校滑雪板旅行。",
    keywords: ["wish", "never", "school", "snowboarding trip"],
    words: ["snowboarding"],
    phrases: ["go on a trip", "snowboarding trip"]
  },
  {
    page: 22,
    en: "The king wished everything he touched would turn into gold.",
    cn: "国王许愿，希望他碰到的一切都会变成金子。",
    keywords: ["king", "wished", "touched", "gold"],
    words: ["wish", "touch"],
    phrases: ["turn into gold"]
  },
  {
    page: 22,
    en: "Once the wish was granted, the king touched an apple.",
    cn: "愿望一被实现，国王就碰了一个苹果。",
    keywords: ["wish", "granted", "king", "apple"],
    words: ["grant"],
    phrases: ["once the wish was granted"]
  },
  {
    page: 22,
    en: "Instantly, she was turned into gold.",
    cn: "一瞬间，她被变成了金子。",
    keywords: ["instantly", "turned", "gold"],
    words: ["instantly"],
    phrases: ["turn into"]
  },
  {
    page: 23,
    en: "English is the primary language, or first language, used in the U.S.A.",
    cn: "英语是在美国使用的主要语言，也就是第一语言。",
    keywords: ["English", "primary language", "first language", "U.S.A."],
    words: ["primary"],
    phrases: ["primary language", "first language"]
  },
  {
    page: 23,
    en: "Knowing Spanish is very helpful to Americans who want to work with Spanish speakers.",
    cn: "对于想和说西班牙语的人一起工作的美国人来说，懂西班牙语很有帮助。",
    keywords: ["Spanish", "helpful", "Americans", "work"],
    words: ["helpful"],
    phrases: ["work with Spanish speakers"]
  },
  {
    page: 24,
    en: "Pencils are writing instruments made from graphite surrounded by a casing.",
    cn: "铅笔是由石墨和外壳组成的书写工具。",
    keywords: ["pencils", "writing instruments", "graphite", "casing"],
    words: ["graphite", "casing"],
    phrases: ["writing instruments", "made from"]
  },
  {
    page: 24,
    en: "Graphite can easily be erased from a sheet of paper.",
    cn: "石墨可以很容易地从一张纸上被擦掉。",
    keywords: ["graphite", "erased", "paper"],
    words: ["erase"],
    phrases: ["a sheet of paper"]
  },
  {
    page: 34,
    en: "The dog was the first animal to be domesticated.",
    cn: "狗是第一种被驯化的动物。",
    keywords: ["dog", "first animal", "domesticated"],
    words: ["domesticated"],
    phrases: ["the first animal to be domesticated"]
  },
  {
    page: 34,
    en: "Humans have selectively bred dogs for traits that they believed were good.",
    cn: "人类按照他们认为好的特征，有选择地培育狗。",
    keywords: ["humans", "selectively bred", "dogs", "traits"],
    words: ["selectively", "traits"],
    phrases: ["selectively bred", "bred dogs for traits"]
  },
  {
    page: 34,
    en: "Today's dogs are much easier to train than wild wolves.",
    cn: "现在的狗比野生狼更容易训练。",
    keywords: ["dogs", "easier", "train", "wolves"],
    words: ["train"],
    phrases: ["easier to train than"]
  },
  {
    page: 44,
    en: "Some summer camps have themes.",
    cn: "有些夏令营有主题。",
    keywords: ["summer camps", "themes"],
    words: ["theme"],
    phrases: ["summer camps"]
  },
  {
    page: 44,
    en: "They also learn many sports and learn about surviving in nature.",
    cn: "他们还会学习许多运动，并学习如何在大自然中生存。",
    keywords: ["sports", "surviving", "nature"],
    words: ["survive"],
    phrases: ["surviving in nature"]
  },
  {
    page: 44,
    en: "These different colored teams compete against each other in various events.",
    cn: "这些不同颜色的队伍会在各种活动中互相比赛。",
    keywords: ["teams", "compete", "various events"],
    words: ["compete", "various"],
    phrases: ["compete against each other"]
  }
];

const readingTexts = {
  2: {
    title: "Contents - Reading Comprehension",
    paragraphs: [
      "Introduction to the TOEFL Junior Test",
      "Overview of Reading Comprehension",
      "Official Examinee Score Report",
      "Diagnostic Test",
      "Unit 1 Main Idea Questions",
      "Unit 2 Detail Questions",
      "Unit 3 Vocabulary Questions",
      "Unit 4 Pronoun Referent Questions",
      "Review Test 1",
      "Unit 5 Author's Purpose Questions",
      "Unit 6 Inference Questions",
      "Unit 7 Rhetorical Structure Questions",
      "Review Test 2",
      "Actual Test"
    ]
  },
  3: {
    title: "The Structure of the TOEFL Junior Test",
    paragraphs: [
      "Total 126 Questions = 3 Sections x 42 Questions.",
      "Time Given = 110 Minutes.",
      "The TOEFL Junior is a paper-based test.",
      "The test has three sections: Listening Comprehension, Language Form and Meaning, and Reading Comprehension.",
      "Reading Comprehension has 42 questions and 50 minutes. The possible score is 200 to 300.",
      "The Reading Comprehension section checks whether students can understand written English in school and everyday situations."
    ]
  },
  15: {
    title: "Unit 1 - Main Idea Questions",
    paragraphs: [
      "A Main Idea question asks you for the main topic of a passage. Your job is to show you understand the general subject of the reading.",
      "Reading Main Idea questions start like this: What is the best title for the story? What would be the best or most suitable headline for the article?",
      "They may also ask: Which title best summarizes the main idea of the passage? What title is best for the passage? What is the passage mostly about?",
      "When you answer a Main Idea question, do not choose an answer that is only one small detail. Choose the answer that covers the whole passage."
    ]
  },
  21: {
    title: "Practice Test - E-mail",
    type: "letter",
    paragraphs: [
      "Dear Dixie,",
      "I got the flowers you sent to me, so I'm sending you this e-mail to tell you how thankful I am. Being in the hospital is so boring. I have been very sad and lonely since my operation. Sometimes I see my family, but they are very busy with school and work. So, when I got your flowers, it cheered me up right away. I know I will only be in here for another week, but I miss you and the rest of our friends a lot.",
      "I wish I'd never gone on that school snowboarding trip. Then, I could still be at school with you guys. Can you thank Mary and Hannah for writing in the card for me, please? Their messages were really cute. Thanks again for everything, and I hope I can see you all soon.",
      "Love,",
      "Melanie"
    ]
  },
  22: {
    title: "Practice Test - The Golden Touch",
    paragraphs: [
      "A very long time ago, there lived a great king. The king was kind to everyone he met. He was good to his people and helped those in need. One day, the king found a man who was lost in the forest. The king knew the forest well, so he helped the man get back to his home. As luck would have it, the man was the servant of a very powerful wizard.",
      "To thank the king, the wizard gave him one wish. The king wished everything he touched would turn into gold. The wizard asked, \"Are you sure you want that wish?\" The king said yes. Once the wish was granted, the king touched an apple. Poof! The apple became gold.",
      "Weeks passed, and the king grew very rich. He thought he was the happiest king alive. One day, the king's daughter came to visit him. She had married a prince from a far away country. She missed her father so much that she jumped into his arms when she saw him. Forgetting all about his golden touch, the king hugged his daughter back. Instantly, she was turned into gold.",
      "Right away he ran into the forest to find the wizard. After hours of searching, the king found the wizard and begged him for help. The wizard looked at the king with sad eyes. He said, \"I asked if you were sure. I cannot take the wish back.\" The king felt terrible. He had changed his only child into a golden statue. For the rest of his life, he turned things into gold but always knew all the gold in the world would never make him as happy as his loving daughter had."
    ]
  },
  23: {
    title: "Practice Test - Languages in the U.S.A.",
    paragraphs: [
      "In many countries around the world, people learn to speak at least two different languages. In the United States of America, people are expected to learn English and sometimes choose to learn Spanish.",
      "English is the primary language, or first language, used in the U.S.A. Over 81 percent of the population speaks English. That is over 250 million people. Furthermore, up to 96 percent of American citizens claim they can speak English well or very well. English is the language that is used in schools and on television. It is widely used all over the U.S.A.",
      "The less popular language is Spanish. About 12 percent of Americans speak Spanish fluently. The large number of Spanish speakers means the U.S.A. has the fifth largest Spanish speaking population in the world. You may think 37 million people is a lot less than 250 million, but remember that the U.S.A. borders Mexico, a Spanish speaking country. Knowing Spanish is very helpful to Americans who want to work with Spanish speakers or travel into South America.",
      "While many other languages like French, Chinese, and Italian are spoken in America, English and Spanish are the primary languages. If you plan on visiting, it is probably best to brush up on your English first. If you can also speak Spanish, your visit will be even better!"
    ]
  },
  24: {
    title: "Practice Test - The History of Pencils",
    paragraphs: [
      "Pencils are writing instruments made from graphite surrounded by a casing. Many students use pencils in school because the graphite can easily be erased from a sheet of paper. Pencils, however, have not always been the way they are today.",
      "Sometime during the 1500s, a lot of graphite was discovered in England. The English found that the graphite could make gray marks and used it to mark their sheep. Soon they realized that graphite could also be used to write on paper. Since graphite is soft and easily broken, they covered it with sheepskin or wrapped it in string.",
      "It was the Italians who thought of putting graphite inside of a wooden casing. An Italian carpenter couple, named Simonio and Lyndiana Bernacotti, originally created a wooden pencil so that they could mark wood while they were working. These pencils were flat and much different from the pencils we have today. Then, an American, named Ebenezer Wood, came up with the modern wooden casing. This casing is a hexagon or octagon. In 1858, erasers would be attached to pencils.",
      "At first, it was believed that only solid graphite could be used for pencils, but the only solid graphite supply is in England. People eventually understood that they could use impure graphite mixed with clay. Also, the original wooden pencil casings were always made from red cedar. When the supply of red cedar started to run out, people realized they could use another kind of cedar as well."
    ]
  },
  34: {
    title: "Practice Test - Dogs",
    paragraphs: [
      "Many people have dogs for pets, but did you know that the dog was the first animal to be domesticated? That means it was the first animal to be kept and cared for by humans. Dogs have been kept as workers, hunters, and friends for much of human history.",
      "Dogs were originally gray wolves, but domestication gradually changed this. Humans have selectively bred dogs for traits that they believed were good. That's how many varieties of dogs came to exist today.",
      "Dogs come in many shapes and sizes. Dogs also have different kinds of coats. Some of them have long hair, while others have short. This hair can come in many different colors and patterns. Dogs also have different skills. Some varieties are good at hunting wild animals, while others are good at herding cattle or protecting people.",
      "Because dogs are closely related to wolves, it might seem like they would be violent. Although some dogs are violent, 15,000 years of domestication has made most dogs friendly to humans. Today's dogs are much easier to train than wild wolves. They respond well to human training: learning to sit, roll over, and even participate in dog shows. Training dogs is a practice that has been improved for many, many years."
    ]
  },
  40: {
    title: "Detail Question Example - NOT Mentioned",
    paragraphs: [
      "Some detail questions ask what is not mentioned in a reading passage. Read the question carefully before you choose.",
      "Which of the following is NOT mentioned in this letter?",
      "(A) The boy being sick with the flu.",
      "(B) The boy needing his homework.",
      "(C) It being the boy's turn to feed the fish.",
      "(D) The boy needing a ride to school on Monday.",
      "The answer is hidden while you are doing the quiz. Submit your choice on the right side to see the explanation."
    ]
  },
  44: {
    title: "Practice Test - Summer Camps",
    paragraphs: [
      "Many American children spend part of their summer at summer camps. Some of these camps are day camps, but many are places where children stay overnight for one week or more. At some camps, the campers sleep in tents. At others, the campers sleep in cabins. Some camps are all boys or all girls, while some are co-ed. Some summer camps have themes. Children can attend a week of horseback riding, drama, or sports camp. The most common summer camps, however, are general camps on a lake.",
      "Americans believe that sending their children to summer camp will help them gain independence and make friends. At camp, they learn to swim, sail, canoe, and snorkel in the water. They also learn many sports and learn about surviving in nature. Some camps create organized events such as a color war. During a color war, the camp is divided into different colors. These different colored teams compete against each other in various events. It's usually very exciting for the campers and staff.",
      "Children that have gone to camp repeatedly say that it was one of the best experiences of their lives. Even though some campers get homesick, they usually go to camp for more than one summer. Many return year after year and keep their camp friends for a very long time."
    ]
  }
};

const glossary = {
  thankful: "感谢的，感激的",
  hospital: "医院",
  boring: "无聊的",
  operation: "手术",
  lonely: "孤单的",
  cheered: "使开心，使振作",
  snowboarding: "滑雪板运动",
  trip: "旅行",
  wizard: "巫师",
  wish: "愿望；许愿",
  touched: "触碰",
  gold: "金子",
  granted: "被准许，被实现",
  instantly: "立刻，马上",
  statue: "雕像",
  primary: "主要的，第一的",
  language: "语言",
  population: "人口",
  fluently: "流利地",
  borders: "与……接壤",
  helpful: "有帮助的",
  instruments: "工具，器具",
  graphite: "石墨",
  casing: "外壳",
  erased: "擦掉",
  discovered: "发现",
  wrapped: "包裹",
  carpenter: "木匠",
  hexagon: "六边形",
  octagon: "八边形",
  attached: "附上，连接",
  impure: "不纯的",
  domesticated: "被驯化的",
  selectively: "有选择地",
  bred: "培育",
  traits: "特征",
  varieties: "种类",
  herding: "放牧，赶群",
  cattle: "牛",
  violent: "暴力的",
  train: "训练",
  camps: "营地，夏令营",
  overnight: "过夜",
  cabins: "小屋",
  themes: "主题",
  independence: "独立",
  canoe: "划独木舟",
  snorkel: "浮潜",
  surviving: "生存",
  compete: "竞争，比赛",
  various: "各种各样的",
  homesick: "想家的"
};

const STORAGE_KEY = "toefl-reading-weak-book-v1";

const els = {
  pageImage: document.querySelector("#pageImage"),
  pageInput: document.querySelector("#pageInput"),
  prevPage: document.querySelector("#prevPage"),
  nextPage: document.querySelector("#nextPage"),
  textMode: document.querySelector("#textMode"),
  imageMode: document.querySelector("#imageMode"),
  maskToggle: document.querySelector("#maskToggle"),
  bookStage: document.querySelector("#bookStage"),
  textStage: document.querySelector("#textStage"),
  textTitle: document.querySelector("#textTitle"),
  textContent: document.querySelector("#textContent"),
  wordPop: document.querySelector("#wordPop"),
  wordText: document.querySelector("#wordText"),
  wordMeaning: document.querySelector("#wordMeaning"),
  collectClickedWord: document.querySelector("#collectClickedWord"),
  sourceNote: document.querySelector("#sourceNote"),
  zoomIn: document.querySelector("#zoomIn"),
  zoomOut: document.querySelector("#zoomOut"),
  timer: document.querySelector("#timer"),
  startExam: document.querySelector("#startExam"),
  wrongOnly: document.querySelector("#wrongOnly"),
  resetExam: document.querySelector("#resetExam"),
  progressText: document.querySelector("#progressText"),
  scoreText: document.querySelector("#scoreText"),
  wrongText: document.querySelector("#wrongText"),
  questionType: document.querySelector("#questionType"),
  questionText: document.querySelector("#questionText"),
  choices: document.querySelector("#choices"),
  submitAnswer: document.querySelector("#submitAnswer"),
  nextQuestion: document.querySelector("#nextQuestion"),
  feedback: document.querySelector("#feedback"),
  answerSheet: document.querySelector("#answerSheet"),
  sentenceMeta: document.querySelector("#sentenceMeta"),
  sentenceEn: document.querySelector("#sentenceEn"),
  sentenceCn: document.querySelector("#sentenceCn"),
  retellInput: document.querySelector("#retellInput"),
  startRecord: document.querySelector("#startRecord"),
  stopRecord: document.querySelector("#stopRecord"),
  checkVoiceText: document.querySelector("#checkVoiceText"),
  voiceStatus: document.querySelector("#voiceStatus"),
  voiceTranscript: document.querySelector("#voiceTranscript"),
  voiceScore: document.querySelector("#voiceScore"),
  voiceFeedback: document.querySelector("#voiceFeedback"),
  prevSentence: document.querySelector("#prevSentence"),
  showTranslation: document.querySelector("#showTranslation"),
  checkRetell: document.querySelector("#checkRetell"),
  nextSentence: document.querySelector("#nextSentence"),
  retellFeedback: document.querySelector("#retellFeedback"),
  collectWord: document.querySelector("#collectWord"),
  collectPhrase: document.querySelector("#collectPhrase"),
  collectSentence: document.querySelector("#collectSentence"),
  customType: document.querySelector("#customType"),
  customText: document.querySelector("#customText"),
  addCustom: document.querySelector("#addCustom"),
  weakList: document.querySelector("#weakList"),
  weakTabs: document.querySelectorAll("[data-weak-tab]"),
  drillPrompt: document.querySelector("#drillPrompt"),
  drillInput: document.querySelector("#drillInput"),
  checkDrill: document.querySelector("#checkDrill"),
  masterItem: document.querySelector("#masterItem"),
  drillFeedback: document.querySelector("#drillFeedback")
};

let page = 21;
let zoom = 1;
let activeQuestions = [...questionBank];
let index = 0;
let selected = "";
let answers = Array(questionBank.length).fill(null);
let checked = Array(questionBank.length).fill(false);
let wrongIndexes = [];
let secondsLeft = 30 * 60;
let timerId = null;
let sentenceIndex = 0;
let weakTab = "word";
let activeWeakId = "";
let weakBook = loadWeakBook();
let useTextMode = true;
let clickedWord = "";
let recognition = null;
let recognizing = false;
let speechStopTimer = null;

const cnKeywordHints = new Map([
  [0, ["收到", "花", "邮件", "感谢"]],
  [1, ["医院", "无聊"]],
  [2, ["收到", "花", "马上", "开心"]],
  [3, ["希望", "没有", "学校", "滑雪板", "旅行"]],
  [4, ["国王", "许愿", "碰到", "金子"]],
  [5, ["愿望", "实现", "国王", "苹果"]],
  [6, ["一瞬间", "变成", "金子"]],
  [7, ["英语", "美国", "主要语言", "第一语言"]],
  [8, ["西班牙语", "有帮助", "美国人", "工作"]],
  [9, ["铅笔", "石墨", "外壳", "书写工具"]],
  [10, ["石墨", "容易", "纸", "擦掉"]],
  [11, ["狗", "第一种", "驯化", "动物"]],
  [12, ["人类", "选择", "培育", "特征"]],
  [13, ["现在", "狗", "狼", "容易", "训练"]],
  [14, ["夏令营", "主题"]],
  [15, ["学习", "运动", "自然", "生存"]],
  [16, ["队伍", "颜色", "比赛", "活动"]]
]);

function pageSrc(n) {
  return `${PAGE_DIR}/page-${String(n).padStart(2, "0")}.jpg`;
}

function setPage(nextPage) {
  page = Math.max(1, Math.min(PAGE_COUNT, Number(nextPage) || 1));
  els.pageInput.value = page;
  els.pageImage.src = pageSrc(page);
  els.sourceNote.textContent = `正在看第 ${page} 页：${pageNotes[page] || "原书扫描页"}`;
  renderTextPage();
  updateReaderMode();
}

function setZoom(nextZoom) {
  zoom = Math.max(0.75, Math.min(1.65, nextZoom));
  els.bookStage.style.setProperty("--page-width", `${Math.round(860 * zoom)}px`);
}

function formatTime(value) {
  const m = Math.floor(value / 60);
  const s = value % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function loadWeakBook() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      word: Array.isArray(parsed.word) ? parsed.word : [],
      phrase: Array.isArray(parsed.phrase) ? parsed.phrase : [],
      sentence: Array.isArray(parsed.sentence) ? parsed.sentence : []
    };
  } catch {
    return { word: [], phrase: [], sentence: [] };
  }
}

function saveWeakBook() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(weakBook));
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordMeaning(word) {
  const key = normalizeText(word).split(" ")[0];
  return glossary[key] || "还没有收进小词典，可以先收进单词本。";
}

function tokenToHtml(token) {
  if (/^[A-Za-z][A-Za-z'-]*$/.test(token)) {
    const clean = token.replace(/^'+|'+$/g, "");
    return `<button class="click-word" data-word="${escapeHtml(clean)}" type="button">${escapeHtml(token)}</button>`;
  }
  return escapeHtml(token);
}

function paragraphToHtml(text) {
  return String(text).split(/([A-Za-z][A-Za-z'-]*|[^A-Za-z]+)/g).filter(Boolean).map(tokenToHtml).join("");
}

function renderTextPage() {
  const reading = readingTexts[page];
  if (!reading) {
    els.textTitle.textContent = `第 ${page} 页暂未提取成文本`;
    els.textContent.innerHTML = `
      <div class="text-passage">
        <p>这一页还没有可点击文本。你可以切到“原图模式”查看扫描页。</p>
        <p>已经提取成文本的练习页包括：2、3、15、21、22、23、24、34、40、44。</p>
      </div>
    `;
    return;
  }
  els.textTitle.textContent = reading.title;
  els.textContent.innerHTML = `
    <div class="text-passage">
      ${reading.paragraphs.map((paragraph, i) => `<p class="${reading.type === "letter" && (i === 0 || i >= reading.paragraphs.length - 2) ? "letter-line" : ""}">${paragraphToHtml(paragraph)}</p>`).join("")}
    </div>
  `;
}

function updateReaderMode() {
  const hasText = Boolean(readingTexts[page]);
  const showText = useTextMode && hasText;
  els.textStage.classList.toggle("hidden-stage", !showText);
  els.bookStage.classList.toggle("hidden-stage", showText);
  els.textMode.classList.toggle("active", showText);
  els.imageMode.classList.toggle("active", !showText);
  els.maskToggle.disabled = showText;
  els.zoomIn.disabled = showText;
  els.zoomOut.disabled = showText;
  if (useTextMode && !hasText) {
    els.sourceNote.textContent = `第 ${page} 页还没有提取文本，已显示原图扫描页。`;
  }
}

function newWeakItem(type, text, source = "", translation = "") {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    text: String(text || "").trim(),
    source,
    translation,
    wrongCount: 1,
    createdAt: Date.now()
  };
}

function addWeakItem(type, text, source = "", translation = "") {
  const clean = String(text || "").trim();
  if (!clean) return;
  const existing = weakBook[type].find((item) => normalizeText(item.text) === normalizeText(clean));
  if (existing) {
    existing.wrongCount += 1;
    existing.source = source || existing.source;
    existing.translation = translation || existing.translation;
  } else {
    weakBook[type].unshift(newWeakItem(type, clean, source, translation));
  }
  saveWeakBook();
  renderWeakBook();
}

function currentSentence() {
  return sentenceBank[sentenceIndex] || sentenceBank[0];
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function annotatedEnglish(item, terms = []) {
  let html = escapeHtml(item.en);
  terms
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
    .forEach((term) => {
      const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi");
      html = html.replace(pattern, "<mark>$&</mark>");
    });
  return html;
}

function translationKeywords() {
  return cnKeywordHints.get(sentenceIndex) || [];
}

function gradeTranslation(rawText) {
  const item = currentSentence();
  const typed = normalizeText(rawText);
  const required = translationKeywords();
  const matched = required.filter((keyword) => typed.includes(normalizeText(keyword)));
  const missed = required.filter((keyword) => !typed.includes(normalizeText(keyword)));
  const score = required.length ? Math.round((matched.length / required.length) * 100) : 0;
  return { item, typed, required, matched, missed, score };
}

function showTranslationGrade(result, source = "打字") {
  const highlightTerms = result.score >= 75 ? [] : result.item.keywords;
  els.sentenceEn.innerHTML = annotatedEnglish(result.item, highlightTerms);
  els.voiceScore.textContent = `正确率 ${result.score}%`;
  if (result.score >= 75) {
    const message = `${source}翻译不错，抓住了 ${result.matched.length}/${result.required.length} 个中文要点。`;
    els.retellFeedback.textContent = message;
    els.voiceFeedback.textContent = message;
    return;
  }
  addWeakItem("sentence", result.item.en, `Page ${result.item.page}`, result.item.cn);
  result.item.words.slice(0, 2).forEach((word) => addWeakItem("word", word, `Page ${result.item.page}`));
  result.item.phrases.slice(0, 1).forEach((phrase) => addWeakItem("phrase", phrase, `Page ${result.item.page}`));
  const missedText = result.missed.length ? `漏掉了：${result.missed.join("、")}。` : "意思还不够完整。";
  const message = `${source}翻译还不稳，${missedText}我已经把英文重点标黄，并收进练习本。`;
  els.retellFeedback.textContent = message;
  els.voiceFeedback.textContent = message;
}

function renderSentence(syncPage = false) {
  const item = currentSentence();
  els.sentenceMeta.textContent = `Page ${item.page} · 第 ${sentenceIndex + 1} / ${sentenceBank.length} 句`;
  els.sentenceEn.innerHTML = annotatedEnglish(item);
  els.sentenceCn.textContent = item.cn;
  els.sentenceCn.classList.add("hidden");
  els.showTranslation.textContent = "看翻译";
  els.retellInput.value = "";
  els.voiceTranscript.textContent = "录音后，这里会出现你说出的中文翻译。";
  els.voiceScore.textContent = "正确率 --";
  setVoiceStatus(recognitionSupported() ? "可以录音" : "需要 HTTP/Chrome", recognitionSupported() ? "ready" : "");
  els.voiceFeedback.textContent = recognitionSupported()
    ? "点“开始录音翻译”，说出中文意思。"
    : `当前打开方式可能不支持语音识别。可以用 ${preferredHttpUrl()} 打开，或先打字检查。`;
  els.retellFeedback.textContent = "先读英文，再用中文说出或写出意思。";
  if (syncPage) setPage(item.page);
}

function checkRetell() {
  const raw = els.retellInput.value.trim();
  if (!raw) {
    els.retellFeedback.textContent = "先写一点中文意思，再检查。";
    return;
  }
  showTranslationGrade(gradeTranslation(raw), "打字");
}

function collectFromSentence(type) {
  const item = currentSentence();
  if (type === "word") {
    item.words.forEach((word) => addWeakItem("word", word, `Page ${item.page}`));
    els.retellFeedback.textContent = "这句里的重点单词已收进练习本。";
  } else if (type === "phrase") {
    item.phrases.forEach((phrase) => addWeakItem("phrase", phrase, `Page ${item.page}`));
    els.retellFeedback.textContent = "这句里的重点词组已收进练习本。";
  } else {
    addWeakItem("sentence", item.en, `Page ${item.page}`, item.cn);
    els.retellFeedback.textContent = "整句已收进练习本。";
  }
}

function renderWeakBook() {
  const list = weakBook[weakTab] || [];
  els.weakTabs.forEach((button) => button.classList.toggle("active", button.dataset.weakTab === weakTab));
  if (!list.length) {
    els.weakList.innerHTML = `<div class="weak-empty">这里还没有内容。不会的单词、词组、句子会出现在这里。</div>`;
    return;
  }
  els.weakList.innerHTML = list.map((item) => `
    <div class="weak-item">
      <div>
        <strong>${escapeHtml(item.text)}</strong>
        <span>${escapeHtml(item.source || "手动加入")} · 练习 ${item.wrongCount} 次</span>
      </div>
      <button data-drill="${item.id}" type="button">练</button>
    </div>
  `).join("");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function findWeakItem(id = activeWeakId) {
  return weakBook[weakTab].find((item) => item.id === id) || null;
}

function startWeakDrill(id) {
  activeWeakId = id;
  const item = findWeakItem(id);
  if (!item) return;
  els.drillPrompt.textContent = weakTab === "sentence"
    ? `翻译/复述：${item.text}`
    : `默写意思或造句：${item.text}`;
  els.drillInput.value = "";
  els.drillFeedback.textContent = item.translation ? `提示：这条有中文翻译，检查后会显示。` : "写完点检查。";
}

function checkWeakDrill() {
  const item = findWeakItem();
  if (!item) {
    els.drillFeedback.textContent = "先点练习本里的一条内容。";
    return;
  }
  const typed = normalizeText(els.drillInput.value);
  if (!typed) {
    els.drillFeedback.textContent = "先写答案，再检查。";
    return;
  }
  const target = normalizeText(`${item.text} ${item.translation || ""}`);
  const typedParts = typed.split(" ").filter(Boolean);
  const hit = typedParts.filter((part) => target.includes(part)).length;
  item.wrongCount += 1;
  saveWeakBook();
  renderWeakBook();
  if (hit >= Math.max(1, Math.min(3, typedParts.length))) {
    els.drillFeedback.textContent = item.translation ? `可以！参考翻译：${item.translation}` : "可以！这条再练几次就稳了。";
  } else {
    els.drillFeedback.textContent = item.translation ? `还要再练。参考翻译：${item.translation}` : `还要再练。你可以换一种说法再写一次。`;
  }
}

function masterWeakItem() {
  const item = findWeakItem();
  if (!item) {
    els.drillFeedback.textContent = "先选一条内容。";
    return;
  }
  weakBook[weakTab] = weakBook[weakTab].filter((entry) => entry.id !== item.id);
  activeWeakId = "";
  saveWeakBook();
  renderWeakBook();
  els.drillPrompt.textContent = "这条已经移出练习本。";
  els.drillInput.value = "";
  els.drillFeedback.textContent = "真稳，下一条。";
}

function recognitionSupported() {
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function preferredHttpUrl() {
  return "http://127.0.0.1:8092/toefl-reading-practice.html";
}

function setVoiceStatus(text, state = "") {
  els.voiceStatus.textContent = text;
  els.voiceStatus.classList.toggle("listening", state === "listening");
  els.voiceStatus.classList.toggle("ready", state === "ready");
}

function setupRecognition() {
  if (!recognitionSupported()) {
    els.stopRecord.disabled = true;
    setVoiceStatus("需要 HTTP/Chrome");
    els.voiceFeedback.textContent = `这个打开方式暂时不能直接识别录音。请用 ${preferredHttpUrl()} 打开，或者先打字后点“检查文字翻译”。`;
    return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "zh-CN";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.addEventListener("start", () => {
    recognizing = true;
    els.startRecord.disabled = true;
    els.stopRecord.disabled = false;
    setVoiceStatus("正在听", "listening");
    els.voiceTranscript.textContent = "正在听你说中文翻译...";
    els.voiceFeedback.textContent = "说完后点“停止录音”，或者等它自动结束。";
    clearTimeout(speechStopTimer);
    speechStopTimer = setTimeout(() => stopVoiceTranslation(), 12000);
  });

  recognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join("");
    els.voiceTranscript.textContent = transcript || "正在识别...";
    els.retellInput.value = transcript;
    if (transcript.trim()) setVoiceStatus("已听到文字", "ready");
  });

  recognition.addEventListener("error", (event) => {
    recognizing = false;
    clearTimeout(speechStopTimer);
    els.startRecord.disabled = false;
    els.stopRecord.disabled = true;
    setVoiceStatus("录音失败");
    const reasonMap = {
      "not-allowed": "麦克风权限被拒绝了。请允许麦克风，或者用文字检查。",
      "no-speech": "没有听到声音。再点一次开始录音，然后靠近一点说。",
      network: "浏览器语音识别服务没连上。可以先用文字检查。",
      "audio-capture": "没有找到麦克风。可以先用文字检查。"
    };
    els.voiceFeedback.textContent = reasonMap[event.error] || `录音没有成功：${event.error || "浏览器没有给到声音"}。可以先打字检查。`;
  });

  recognition.addEventListener("end", () => {
    recognizing = false;
    clearTimeout(speechStopTimer);
    els.startRecord.disabled = false;
    els.stopRecord.disabled = true;
    if (els.retellInput.value.trim()) {
      setVoiceStatus("已判分", "ready");
      showTranslationGrade(gradeTranslation(els.retellInput.value), "录音");
    } else {
      setVoiceStatus("没听到");
      els.voiceFeedback.textContent = "这次没有识别到文字，可以再按一次录音。";
    }
  });

  els.stopRecord.disabled = true;
  setVoiceStatus("可以录音", "ready");
}

function startVoiceTranslation() {
  if (!recognition) {
    setVoiceStatus("不能直接录音");
    els.voiceFeedback.textContent = `现在这个 file:// 打开方式通常不能用麦克风识别。请改用 ${preferredHttpUrl()} 打开；也可以先打字后点“检查文字翻译”。`;
    return;
  }
  try {
    els.retellInput.value = "";
    els.voiceTranscript.textContent = "准备录音...";
    els.sentenceEn.innerHTML = annotatedEnglish(currentSentence());
    recognition.start();
  } catch {
    els.voiceFeedback.textContent = "录音已经在进行，先说完或点停止录音。";
  }
}

function stopVoiceTranslation() {
  if (recognition && recognizing) recognition.stop();
}

function checkVoiceText() {
  const raw = els.retellInput.value.trim();
  if (!raw) {
    els.voiceFeedback.textContent = "先录音，或者在上面的框里写中文翻译，再检查。";
    return;
  }
  setVoiceStatus("已判分", "ready");
  showTranslationGrade(gradeTranslation(raw), "文字");
}

function startTimer() {
  clearInterval(timerId);
  timerId = setInterval(() => {
    secondsLeft = Math.max(0, secondsLeft - 1);
    els.timer.textContent = formatTime(secondsLeft);
    if (secondsLeft === 0) {
      clearInterval(timerId);
      els.feedback.textContent = "时间到！可以点“重来”再练一次，或者继续错题重做。";
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerId);
  secondsLeft = 30 * 60;
  els.timer.textContent = formatTime(secondsLeft);
}

function currentQuestion() {
  return activeQuestions[index] || activeQuestions[0];
}

function renderQuestion() {
  const q = currentQuestion();
  selected = answers[index] || "";
  setPage(q.page);
  els.questionType.textContent = q.type;
  els.questionText.textContent = q.prompt;
  els.choices.innerHTML = q.choices.map((choice, i) => {
    const letter = "ABCD"[i];
    const classes = ["choice"];
    if (selected === letter) classes.push("selected");
    if (checked[index] && q.answer === letter) classes.push("correct");
    if (checked[index] && selected === letter && selected !== q.answer) classes.push("wrong");
    return `<button class="${classes.join(" ")}" data-choice="${letter}" type="button"><b>${letter}</b><span>${choice}</span></button>`;
  }).join("");
  els.progressText.textContent = `${Math.min(index + 1, activeQuestions.length)} / ${activeQuestions.length}`;
  renderAnswerSheet();
  if (!checked[index]) {
    els.feedback.textContent = "先看左边提取出来的文本，提交答案后才会显示解析。想核对原扫描页可以点“原图模式”。";
  }
}

function renderAnswerSheet() {
  els.answerSheet.innerHTML = activeQuestions.map((q, i) => {
    const originalIndex = questionBank.indexOf(q);
    const classes = ["bubble"];
    if (answers[i]) classes.push("done");
    if (wrongIndexes.includes(originalIndex)) classes.push("bad");
    return `<button class="${classes.join(" ")}" data-jump="${i}" type="button">${i + 1}${answers[i] ? answers[i] : ""}</button>`;
  }).join("");
  const score = checked.reduce((total, ok, i) => ok && answers[i] === activeQuestions[i].answer ? total + 1 : total, 0);
  els.scoreText.textContent = score;
  els.wrongText.textContent = wrongIndexes.length;
}

function submitAnswer() {
  const q = currentQuestion();
  if (!selected) {
    els.feedback.textContent = "先选 A、B、C 或 D，再提交。";
    return;
  }
  answers[index] = selected;
  checked[index] = true;
  const originalIndex = questionBank.indexOf(q);
  if (selected === q.answer) {
    wrongIndexes = wrongIndexes.filter((item) => item !== originalIndex);
    els.feedback.textContent = `答对了！${q.explain}`;
  } else {
    if (!wrongIndexes.includes(originalIndex)) wrongIndexes.push(originalIndex);
    addWeakItem("sentence", q.prompt, `错题：Page ${q.page}`, q.explain);
    els.feedback.textContent = `这题不对，正确答案是 ${q.answer}。${q.explain}`;
  }
  renderQuestion();
}

function nextQuestion() {
  index = (index + 1) % activeQuestions.length;
  renderQuestion();
}

function resetExam(useWrongOnly = false) {
  activeQuestions = useWrongOnly && wrongIndexes.length
    ? wrongIndexes.map((i) => questionBank[i])
    : [...questionBank];
  index = 0;
  answers = Array(activeQuestions.length).fill(null);
  checked = Array(activeQuestions.length).fill(false);
  selected = "";
  resetTimer();
  renderQuestion();
  els.feedback.textContent = useWrongOnly && activeQuestions.length ? "现在只练错题。" : "模拟练习已重置。点“开始模拟”会开始计时。";
}

els.prevPage.addEventListener("click", () => setPage(page - 1));
els.nextPage.addEventListener("click", () => setPage(page + 1));
els.pageInput.addEventListener("change", () => setPage(els.pageInput.value));
els.textMode.addEventListener("click", () => {
  useTextMode = true;
  updateReaderMode();
});
els.imageMode.addEventListener("click", () => {
  useTextMode = false;
  updateReaderMode();
});
els.maskToggle.addEventListener("click", () => {
  els.bookStage.classList.toggle("masked");
  els.maskToggle.textContent = els.bookStage.classList.contains("masked") ? "取消遮挡" : "遮住答案区";
});
els.zoomIn.addEventListener("click", () => setZoom(zoom + 0.12));
els.zoomOut.addEventListener("click", () => setZoom(zoom - 0.12));
els.startExam.addEventListener("click", () => {
  startTimer();
  els.feedback.textContent = "计时开始。先遮住答案区，然后按顺序作答。";
});
els.wrongOnly.addEventListener("click", () => resetExam(true));
els.resetExam.addEventListener("click", () => resetExam(false));
els.submitAnswer.addEventListener("click", submitAnswer);
els.nextQuestion.addEventListener("click", nextQuestion);
els.choices.addEventListener("click", (event) => {
  const button = event.target.closest("[data-choice]");
  if (!button) return;
  selected = button.dataset.choice;
  answers[index] = selected;
  renderQuestion();
});
els.answerSheet.addEventListener("click", (event) => {
  const button = event.target.closest("[data-jump]");
  if (!button) return;
  index = Number(button.dataset.jump);
  renderQuestion();
});
els.textContent.addEventListener("click", (event) => {
  const button = event.target.closest("[data-word]");
  if (!button) return;
  document.querySelectorAll(".click-word.active").forEach((word) => word.classList.remove("active"));
  button.classList.add("active");
  clickedWord = button.dataset.word;
  els.wordText.textContent = clickedWord;
  els.wordMeaning.textContent = wordMeaning(clickedWord);
  els.wordPop.classList.add("visible");
});
els.collectClickedWord.addEventListener("click", () => {
  if (!clickedWord) return;
  addWeakItem("word", clickedWord, `Page ${page}`, wordMeaning(clickedWord));
});
els.prevSentence.addEventListener("click", () => {
  sentenceIndex = (sentenceIndex - 1 + sentenceBank.length) % sentenceBank.length;
  renderSentence(true);
});
els.nextSentence.addEventListener("click", () => {
  sentenceIndex = (sentenceIndex + 1) % sentenceBank.length;
  renderSentence(true);
});
els.showTranslation.addEventListener("click", () => {
  els.sentenceCn.classList.toggle("hidden");
  els.showTranslation.textContent = els.sentenceCn.classList.contains("hidden") ? "看翻译" : "藏翻译";
});
els.checkRetell.addEventListener("click", checkRetell);
els.startRecord.addEventListener("click", startVoiceTranslation);
els.stopRecord.addEventListener("click", stopVoiceTranslation);
els.checkVoiceText.addEventListener("click", checkVoiceText);
els.collectWord.addEventListener("click", () => collectFromSentence("word"));
els.collectPhrase.addEventListener("click", () => collectFromSentence("phrase"));
els.collectSentence.addEventListener("click", () => collectFromSentence("sentence"));
els.addCustom.addEventListener("click", () => {
  addWeakItem(els.customType.value, els.customText.value, "手动加入");
  els.customText.value = "";
});
els.weakTabs.forEach((button) => {
  button.addEventListener("click", () => {
    weakTab = button.dataset.weakTab;
    activeWeakId = "";
    els.drillPrompt.textContent = "点一个不会的内容开始练。";
    els.drillInput.value = "";
    els.drillFeedback.textContent = "";
    renderWeakBook();
  });
});
els.weakList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-drill]");
  if (!button) return;
  startWeakDrill(button.dataset.drill);
});
els.checkDrill.addEventListener("click", checkWeakDrill);
els.masterItem.addEventListener("click", masterWeakItem);

setZoom(1);
resetTimer();
setupRecognition();
renderQuestion();
renderSentence();
renderWeakBook();
