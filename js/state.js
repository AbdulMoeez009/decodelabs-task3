export const appState = {
  currentView: 'overview',
  currentFilter: 'all'
};

export const searchPlaceholders = {
  overview: 'Search holdings…',
  holdings: 'Search all holdings…',
  transactions: 'Search transactions…',
  watchlist: 'Search watchlist & coins…',
  profile: 'Search profile…',
  settings: 'Search settings…'
};

export const coinData = {
  BTC: { name:'Bitcoin', icon:'₿', amount:'0.842 BTC', price:'$61,204', value:'$51,534', change:'▲ 2.14%', up:true },
  ETH: { name:'Ethereum', icon:'Ξ', amount:'6.15 ETH', price:'$3,412', value:'$20,984', change:'▲ 12.4%', up:true },
  SOL: { name:'Solana', icon:'◎', amount:'142 SOL', price:'$148.20', value:'$21,044', change:'▼ 3.02%', up:false },
  DOGE: { name:'Dogecoin', icon:'Ð', amount:'18,420 DOGE', price:'$0.184', value:'$3,389', change:'▼ 1.15%', up:false },
  ADA: { name:'Cardano', icon:'Ⓝ', amount:'2,140 ADA', price:'$0.61', value:'$1,305', change:'▲ 5.8%', up:true },
  LTC: { name:'Litecoin', icon:'Ł', amount:'9.4 LTC', price:'$92.10', value:'$866', change:'▼ 0.6%', up:false },
  MATIC: { name:'Polygon', icon:'◆', amount:'3,020 MATIC', price:'$0.72', value:'$2,174', change:'▲ 1.9%', up:true }
};

export const watchIcons = { XRP:'✕', BNB:'Ⓑ', TRX:'Ⓣ', UNI:'Ⓤ', ATOM:'Ⓐ', XLM:'✳', NEAR:'Ⓝ' };

export const realizedTrades = [
  { coin:'SOL', name:'Solana', icon:'◎', date:'Aug 12, 2026', proceeds:'$5,928', gain:812, gainLabel:'+$812' },
  { coin:'DOGE', name:'Dogecoin', icon:'Ð', date:'Aug 8, 2026', proceeds:'$368', gain:-204, gainLabel:'−$204' },
  { coin:'BTC', name:'Bitcoin', icon:'₿', date:'Jul 22, 2026', proceeds:'$6,400', gain:6400, gainLabel:'+$6,400' },
  { coin:'ETH', name:'Ethereum', icon:'Ξ', date:'May 30, 2026', proceeds:'$7,200', gain:7200, gainLabel:'+$7,200' }
];