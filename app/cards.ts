export type DeckId = 'teacher' | 'junior' | 'elementary';

export type ScenarioCard = {
  id: string;
  deck: DeckId;
  title: string;
  situation: string;
  question: string;
  ethics: string[];
  level: '入門' | '進階' | '挑戰';
  prompts?: string[];
};

export const deckLabels: Record<DeckId, string> = {
  teacher: '教師體驗版',
  junior: '國中版',
  elementary: '國小版',
};

export const cards: ScenarioCard[] = [
  {
    id: 'T1', deck: 'teacher', level: '進階', title: 'AI 改的分數比較嚴',
    situation: '你用 AI 工具輔助批改班上 30 份程式作業，發現 AI 給的分數普遍比你原本想給的嚴格，尤其對「邏輯正確但寫法不夠簡潔」的作業扣分較多。',
    question: '你會採用 AI 的分數，還是照自己原本的標準改？',
    ethics: ['執行監督以檢核 AI 產出', '責任歸屬'],
    prompts: ['AI 的一致性是否等於公平？', '「簡潔」是不是這次學習最重要的評分標準？', '若 AI 只負責初評，教師應如何複核並承擔最終責任？'],
  },
  {
    id: 'T2', deck: 'teacher', level: '進階', title: '學生用 AI 寫完整支程式交作業',
    situation: '批改作業時，你發現有學生交的程式碼風格與平常上課表現落差很大，懷疑是用 AI 生成後直接繳交，但沒有直接證據。',
    question: '你會怎麼處理？直接扣分、找學生談，還是先觀察？',
    ethics: ['責任歸屬', '校園 AI 使用規範'],
    prompts: ['若班上還沒有明確的 AI 使用公約，依據什麼標準認定違規？', '能否透過口頭複核，讓學生證明自己理解程式邏輯？', '這是否正好是全班共構 AI 使用公約的契機？'],
  },
  {
    id: 'T3', deck: 'teacher', level: '進階', title: 'AI 推薦的教材其實不適合班上',
    situation: '你用 AI 依單元主題快速產出一份差異化練習，看起來很專業，但你發現裡面有一題的情境設定，對班上一位特殊需求學生來說可能造成困擾。',
    question: '你會整份直接用、整份不用，還是修改後再用？',
    ethics: ['辨識 AI 風險與安全防範', '包容性'],
    prompts: ['看起來專業是否代表適合每一位學生？', '教師掌握了哪些 AI 不知道的班級脈絡？', '能否邀請學生一起檢查「AI 教材可能忽略了誰」？'],
  },
  {
    id: 'T4', deck: 'teacher', level: '挑戰', title: '家長用 AI 生成投訴信',
    situation: '一位家長寄來一封措辭嚴厲、條理分明的投訴信，內容感覺像是用 AI 協助生成，其中部分描述與實際狀況有落差。',
    question: '你會如何回應這封信？',
    ethics: ['辨識 AI 風險與安全防範', '錯假訊息'],
    prompts: ['用 AI 寫信是否代表內容一定失真？', '回應時應先處理事實落差，還是先承接對方的情緒？', '若同樣情境發生在學生之間，處理方式會改變嗎？'],
  },
  {
    id: 'T5', deck: 'teacher', level: '挑戰', title: '要不要把學生作業上傳給商用 AI 批改',
    situation: '某個免費 AI 工具批改作文特別方便好用，但你不確定它的隱私條款是否會保留、再利用學生上傳的作業內容。',
    question: '你會使用這個工具嗎？需要先做什麼？',
    ethics: ['保護個資與 AI 數據隱私', '數位主權'],
    prompts: ['「好用」與「合規」分別需要確認什麼？', '是否已有較適合教育場域使用的工具？', '若必須使用，有哪些去識別化與資料最小化做法？'],
  },
  {
    id: 'T6', deck: 'teacher', level: '挑戰', title: '同事過度依賴 AI 備課',
    situation: '你發現同領域的一位同事最近教案幾乎全部由 AI 生成，幾乎沒有修改就直接上課，你感覺教學品質有下滑的跡象。',
    question: '這是你該介入的事嗎？如果要說，怎麼說？',
    ethics: ['AI 促進教師專業發展', '共學者角色'],
    prompts: ['教師之間作為 AI 倫理共學者，具體可以做什麼？', '直接提醒與共備檢核，哪一種方式較容易被接受？', '如果被提醒的人是自己，希望對方怎麼說？'],
  },
  {
    id: 'J1', deck: 'junior', level: '入門', title: '整支程式都是 AI 寫的',
    situation: '小宇這次的程式作業完全用 AI 生成，自己只改了變數名稱就直接繳交，而且成績還不錯。',
    question: '這樣算是「自己的作業」嗎？', ethics: ['學術誠信', '責任歸屬'],
  },
  {
    id: 'J2', deck: 'junior', level: '入門', title: '分組報告忘記標註 AI 協助',
    situation: '小組報告有一部分內容是請 AI 幫忙生成的，但小組討論時大家都忘了在報告上註明是 AI 協助完成。',
    question: '這樣有沒有問題？如果被發現，算是誠信瑕疵嗎？', ethics: ['學術誠信', '透明性'],
  },
  {
    id: 'J3', deck: 'junior', level: '進階', title: 'AI 批改比較嚴格',
    situation: '老師用 AI 輔助批改同學互評作業，某位同學發現 AI 給自己的分數比同學互評的分數低很多，覺得不公平。',
    question: '如果你是這位同學，你會怎麼反應？如果你是老師，你會怎麼處理這個爭議？', ethics: ['公平性', '執行監督以檢核 AI 產出'],
  },
  {
    id: 'J4', deck: 'junior', level: '挑戰', title: '學習歷程資料被拿去做別的事',
    situation: '你發現學校的線上學習平台，把大家的作答紀錄與學習速度整理成報表，分享給了平台合作的校外單位做研究。',
    question: '這樣可以嗎？學校需要先做什麼？', ethics: ['保護個資與 AI 數據隱私'],
  },
  {
    id: 'J5', deck: 'junior', level: '入門', title: 'AI 給的除錯建議是錯的',
    situation: '小美的程式一直跑不出正確結果，她把程式碼貼給 AI，AI 很有自信地說「問題在第 10 行」，但小美改了之後還是錯的，後來才發現 AI 講的根本是錯的。',
    question: '如果小美一開始就直接照 AI 的話修改、沒有自己檢查，可能會發生什麼事？', ethics: ['辨識 AI 風險與安全防範', '幻覺'],
  },
  {
    id: 'J6', deck: 'junior', level: '進階', title: 'AI 生成的圖片有刻板印象',
    situation: '小組用 AI 生成「工程師」的插圖要放進簡報，結果 AI 生成的圖片幾乎清一色都是同一種樣貌的人物。',
    question: '這個現象是怎麼發生的？小組要不要換一張圖？', ethics: ['演算法偏見'],
  },
  {
    id: 'J7', deck: 'junior', level: '進階', title: '用 AI 寫的訊息影響同學',
    situation: '有人用 AI 幫忙寫了一段「爆料訊息」，內容部分誇大，在班群組流傳，讓被提到的同學很難過。',
    question: '這件事跟「用 AI 寫程式作業交差」相比，哪個影響比較大？為什麼？', ethics: ['錯假訊息', '責任歸屬'],
  },
  {
    id: 'J8', deck: 'junior', level: '挑戰', title: '老師公告違規名單，同學覺得不公平',
    situation: '老師依 AI 偵測結果，公告了一份「疑似用 AI 代寫作業」的名單，其中一位同學覺得自己是冤枉的，想申訴卻不知道找誰。',
    question: '班上如果要有一套處理方式，應該包含哪些步驟？', ethics: ['校園 AI 使用規範', '申訴機制'],
  },
  {
    id: 'J9', deck: 'junior', level: '入門', title: '把同學照片上傳給 AI 辨識',
    situation: '有人為了好玩，把同學的照片上傳到一個 AI 工具，測試「AI 猜你幾歲、猜你個性」。',
    question: '這樣做可能有什麼風險？當事人知道嗎？', ethics: ['保護個資與 AI 數據隱私'],
  },
  {
    id: 'J10', deck: 'junior', level: '挑戰', title: '比賽作品是 AI 生成的',
    situation: '學校科展徵件，有一組同學的作品發想與大部分內容都是 AI 生成，只有簡報是自己做的。',
    question: '這樣算符合參賽資格嗎？如果你是評審，你會怎麼看待這件事？', ethics: ['學術誠信', '創造轉型'],
  },
  {
    id: 'E1', deck: 'elementary', level: '入門', title: '請 AI 幫忙寫心得',
    situation: '小安不想寫閱讀心得，就請 AI 幫他寫了一篇，直接抄下來交給老師。',
    question: '這樣做，跟自己認真寫有什麼不一樣？', ethics: ['學術誠信'],
  },
  {
    id: 'E2', deck: 'elementary', level: '入門', title: 'AI 畫的圖算是我的作品嗎',
    situation: '美術課要交一幅畫，小晴用 AI 畫圖工具生成了一張很漂亮的圖，直接印出來交作業。',
    question: '這張圖可以說是「小晴的作品」嗎？', ethics: ['學術誠信', '創作歸屬'],
  },
  {
    id: 'E3', deck: 'elementary', level: '進階', title: 'AI 玩具會記住我說的話嗎',
    situation: '小宇家裡有一個會聊天的 AI 玩具，他常常跟玩具說學校發生的事，包括同學的名字和秘密。',
    question: '這些話會被誰知道？小宇需要注意什麼？', ethics: ['保護個資與 AI 數據隱私'],
  },
  {
    id: 'E4', deck: 'elementary', level: '入門', title: 'AI 說的都是對的嗎',
    situation: '小美問 AI「這個數學題怎麼算」，AI 給了一個看起來很有道理的答案，但其實算錯了，小美沒有檢查就直接抄上去。',
    question: '如果不檢查 AI 的答案，可能會發生什麼事？', ethics: ['辨識 AI 風險與安全防範', '幻覺'],
  },
  {
    id: 'E5', deck: 'elementary', level: '進階', title: '一直看到類似的影片',
    situation: '小傑很喜歡看某一種類型的影片，AI 推薦系統就一直推給他類似的內容，讓他覺得全世界的人都喜歡一樣的東西。',
    question: '這樣有什麼可能的影響？', ethics: ['覺察 AI 的世界並產生好奇心'],
  },
  {
    id: 'E6', deck: 'elementary', level: '入門', title: '借同學帳號登入 AI 工具',
    situation: '小華想用某個 AI 工具，但自己沒有帳號，就跟同學借帳號密碼登入，順便看到了同學之前的聊天紀錄。',
    question: '這樣做可能會有什麼問題？', ethics: ['保護個資與 AI 數據隱私'],
  },
  {
    id: 'E7', deck: 'elementary', level: '進階', title: 'AI 幫忙判斷遊戲輸贏公不公平',
    situation: '下課玩的一個班級小遊戲，改用 AI 程式自動計分，但有同學覺得 AI 算的分數怪怪的，好像哪裡不對。',
    question: '遇到這種狀況，可以怎麼確認公不公平？', ethics: ['辨識 AI 風險與安全防範', '公平性'],
  },
  {
    id: 'E8', deck: 'elementary', level: '進階', title: 'AI 寫的道歉訊息算不算真心',
    situation: '小安跟同學吵架後，請 AI 幫忙寫了一段道歉訊息傳給對方，對方後來知道是 AI 寫的，覺得有點奇怪。',
    question: '用 AI 表達感受，跟自己親口說，有什麼不一樣？', ethics: ['以人為中心的思維'],
  },
];

export const generalPrompts = [
  '這個決定會影響哪些人？每個人的感受或權益一樣嗎？',
  '我們需要查證哪些資訊，才不會只相信 AI 看起來很有自信的答案？',
  '有沒有比「完全禁止」或「完全接受」更兼顧各方的做法？',
];

export function cardsForDeck(deck: DeckId) {
  return cards.filter((card) => card.deck === deck);
}
