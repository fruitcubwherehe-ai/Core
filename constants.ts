
import { ColorTheme } from './types';
import { 
  Circle, 
  Shield, 
  ShieldCheck, 
  Award, 
  Trophy, 
  Gem, 
  Crown,
  Zap
} from 'lucide-react';

export const RANKS = [
  "Unranked",
  "Bronze III", "Bronze II", "Bronze I",
  "Silver III", "Silver II", "Silver I",
  "Gold III", "Gold II", "Gold I",
  "Platinum III", "Platinum II", "Platinum I",
  "Diamond III", "Diamond II", "Diamond I",
  "Elite"
];

export const RANK_ICONS: Record<string, any> = {
  "Unranked": Circle, "Bronze": Shield, "Silver": ShieldCheck, "Gold": Award, "Platinum": Trophy, "Diamond": Gem, "Elite": Crown
};

export const RANK_COLORS: Record<string, string> = {
  "Unranked": "#444444", "Bronze": "#804A00", "Silver": "#C0C0C0", "Gold": "#FFD700", "Platinum": "#00FFFF", "Diamond": "#E0B0FF", "Elite": "#FFFFFF"
};

export const getRankData = (rankName: string) => {
  const base = rankName === "Elite" ? "Elite" : rankName.split(' ')[0];
  return { color: RANK_COLORS[base] || RANK_COLORS["Unranked"], Icon: RANK_ICONS[base] || RANK_ICONS["Unranked"] };
};

export const INITIAL_THEMES: ColorTheme[] = [
  { id: 'red', name: 'REDCHAIN RED', hex: '#FF0000', cost: 0, unlocked: true },
  { id: 'purple', name: 'NEON PURPLE', hex: '#A855F7', cost: 5000, unlocked: false },
  { id: 'blue', name: 'LIGHT BLUE', hex: '#3B82F6', cost: 7500, unlocked: false },
  { id: 'deepblue', name: 'DEEP BLUE', hex: '#1E40AF', cost: 10000, unlocked: false },
  { id: 'emerald', name: 'STOIC EMERALD', hex: '#10B981', cost: 15000, unlocked: false },
  { id: 'orange', name: 'VALOR ORANGE', hex: '#F97316', cost: 12500, unlocked: false },
  { id: 'yellow', name: 'CORE YELLOW', hex: '#EAB308', cost: 15000, unlocked: false },
  { id: 'rose', name: 'CYBER ROSE', hex: '#FB7185', cost: 20000, unlocked: false },
  { id: 'void', name: 'GOLDEN VOID', hex: '#FFD700', cost: 50000, unlocked: false },
  { id: 'frozen', name: 'FROZEN GHOST', hex: '#E0F2FE', cost: 30000, unlocked: false },
  { id: 'phantom', name: 'PHANTOM GREY', hex: '#4B5563', cost: 25000, unlocked: false },
  { id: 'toxic', name: 'TOXIC MINT', hex: '#2DD4BF', cost: 18000, unlocked: false },
];

export const POINTS_PER_COMPLETION = 500;
export const XP_PER_RANK = 1000;
export const MISS_PENALTY = 500;
export const RESET_STRING = "i am sure i want to reset all the progress and i know that this is unchaingable";

export const HARD_HITTING_QUOTES = [
  "Discipline is doing what needs to be done, even if you don't want to do it.",
  "You cannot fail if you do not quit.",
  "Pain is temporary. Quitting lasts forever.",
  "The soul becomes dyed with the color of its thoughts.",
  "How long are you going to wait before you demand the best for yourself?",
  "He who has a why to live can bear almost any how.",
  "Excellence is not an act, but a habit.",
  "Your mind is for having ideas, not holding them.",
  "Do not pray for an easy life, pray for the strength to endure a difficult one.",
  "The impediment to action advances action. What stands in the way becomes the way.",
  "Waste no more time arguing about what a good man should be. Be one.",
  "Everything can be taken from a man but one thing: the last of the human freedoms—to choose one’s attitude in any given set of circumstances.",
  "Suffering is the true test of life.",
  "A man who conquers himself is greater than one who conquers a city.",
  "Difficulties strengthen the mind, as labor does the body.",
  "Self-control is strength. Right thought is mastery. Calmness is power.",
  "The only person you are destined to become is the person you decide to be.",
  "Action is the foundational key to all success.",
  "The man who moves a mountain begins by carrying away small stones.",
  "Motivation gets you going, but discipline keeps you growing.",
  "Average is the enemy.",
  "Suffer the pain of discipline or suffer the pain of regret.",
  "Winners do what losers don't want to do.",
  "Your potential is infinite, your time is not.",
  "Look in the mirror. That's your only competition.",
  "Every action you take is a vote for the person you wish to become.",
  "Amateurs wait for inspiration. Professionals get to work.",
  "Quiet the mind, and the soul will speak.",
  "Greatness is found in the struggle.",
  "Only the disciplined are truly free.",
  "Don't stop when you're tired. Stop when you're done.",
  "If it were easy, everyone would do it.",
  "The secret of getting ahead is getting started.",
  "Don't wish it were easier, wish you were better.",
  "The best way to predict the future is to create it.",
  "It is not death that a man should fear, but he should fear never beginning to live.",
  "You are what you do, not what you say you'll do.",
  "Mastery requires patience.",
  "Stay hungry, stay foolish.",
  "Strength does not come from winning. Your struggles develop your strengths.",
  "Character is what you do when no one is looking.",
  "Work hard in silence, let your success be your noise.",
  "Success is stumbling from failure to failure with no loss of enthusiasm.",
  "The obstacle is the path.",
  "Small wins every day lead to massive results.",
  "Your life is the result of your choices.",
  "Today I will do what others won't, so tomorrow I can do what others can't.",
  "Success is the sum of small efforts, repeated day-in and day-out.",
  "Focus on the process, not the outcome.",
  "Consistency is the playground of greatness.",
  "There is no growth in the comfort zone.",
  "If you want something you've never had, you must be willing to do something you've never done.",
  "Discipline is the bridge between goals and accomplishment.",
  "The only way to do great work is to love what you do.",
  "Keep going. Everything you need will come to you at the perfect time.",
  "Be obsessed or be average.",
  "The harder the conflict, the more glorious the triumph.",
  "Your habits will either make you or break you.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "Do one thing every day that scares you.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "The purpose of life is a life of purpose.",
  "Strive for progress, not perfection.",
  "Everything you've ever wanted is on the other side of fear.",
  "Hard work beats talent when talent doesn't work hard.",
  "You don't have to be great to start, but you have to start to be great.",
  "What you do today can improve all your tomorrows.",
  "The future depends on what you do today.",
  "Act as if what you do makes a difference. It does.",
  "Success is getting what you want. Happiness is wanting what you get.",
  "Never give up on a dream just because of the time it will take to accomplish it.",
  "Your dream doesn't have an expiration date. Take a deep breath and try again.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Success seems to be largely a matter of hanging on after others have let go.",
  "If you can dream it, you can do it.",
  "The power of imagination makes us infinite.",
  "Quality is not an act, it is a habit.",
  "Our greatest weakness lies in giving up.",
  "Start where you are. Use what you have. Do what you can.",
  "Infuse your life with action. Don't wait for it to happen.",
  "You miss 100% of the shots you don't take.",
  "Failure is simply the opportunity to begin again, this time more intelligently.",
  "Success is not in what you have, but who you are.",
  "Do what you can, with what you have, where you are.",
  "The road to success is always under construction.",
  "Don't count the days, make the days count.",
  "The difference between who you are and who you want to be is what you do.",
  "Opportunities don't happen. You create them.",
  "Life is 10% what happens to us and 90% how we react to it.",
  "To handle yourself, use your head; to handle others, use your heart.",
  "It always seems impossible until it's done.",
  "Hardships often prepare ordinary people for an extraordinary destiny.",
  "Dream big and dare to fail.",
  "The starting point of all achievement is desire.",
  "Success is not how high you have climbed, but how you make a positive difference to the world.",
  "Knowing is not enough; we must apply. Willing is not enough; we must do.",
  "Courage is grace under pressure.",
  "The discipline of desire is the background of character.",
  "A river cuts through rock, not because of its power, but because of its persistence."
];
