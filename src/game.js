export function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function createGame(catalog) {
  return { questions: shuffle(catalog), index: 0, responses: [], screen: 'question', reviewIndex: 0 };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case 'answer':
      if (state.screen !== 'question' || state.responses.length > state.index) return state;
      return { ...state, responses: [...state.responses, action.choice] };
    case 'next':
      if (state.screen !== 'question' || state.responses.length <= state.index) return state;
      return state.index + 1 === state.questions.length
        ? { ...state, screen: 'result' }
        : { ...state, index: state.index + 1 };
    case 'review':
      return { ...state, screen: 'review', reviewIndex: 0 };
    case 'reviewStep':
      return { ...state, reviewIndex: Math.max(0, Math.min(state.questions.length - 1, state.reviewIndex + action.step)) };
    case 'result':
      return { ...state, screen: 'result' };
    case 'restart':
      return createGame(action.catalog);
    default:
      return state;
  }
}

export function getScore({ questions, responses }) {
  return responses.reduce((score, choice, index) => score + Number(choice === questions[index].real), 0);
}
